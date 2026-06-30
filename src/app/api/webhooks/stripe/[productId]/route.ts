import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

interface Params {
  params: Promise<{ productId: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  const { productId } = await params;
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.stripeWebhookSecret) {
    return NextResponse.json({ error: "Product not found or webhook not configured" }, { status: 404 });
  }

  const makerStripe = new Stripe(product.stripeRestrictedKey!, { apiVersion: "2025-02-24.acacia" });

  let event: Stripe.Event;
  try {
    event = makerStripe.webhooks.constructEvent(body, sig, product.stripeWebhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // New revenue — fires for both one-time purchases and subscription invoices
  if (event.type === "charge.succeeded") {
    const charge = event.data.object as Stripe.Charge;
    const amount = charge.amount_captured ?? charge.amount;
    if (amount <= 0) return NextResponse.json({ received: true });

    // Idempotency: skip if we've already counted this charge
    const existing = await prisma.payment.findUnique({
      where: { stripeChargeId: charge.id },
    });
    if (existing) return NextResponse.json({ received: true });

    const [updated] = await prisma.$transaction([
      prisma.product.update({
        where: { id: product.id },
        data: { revenueAmount: { increment: amount } },
      }),
      prisma.payment.create({
        data: {
          stripeChargeId: charge.id,
          amount,
          productId: product.id,
        },
      }),
    ]);

    // Bump off homepage once revenue threshold reached
    if (!updated.bumped && updated.revenueAmount >= updated.revenueThreshold) {
      await prisma.product.update({
        where: { id: product.id },
        data: { bumped: true, featured: false, bumpedAt: new Date() },
      });
    }
  }

  // Refund — back out the recorded revenue for that charge
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const payment = await prisma.payment.findUnique({
      where: { stripeChargeId: charge.id },
    });
    if (payment) {
      await prisma.$transaction([
        prisma.product.update({
          where: { id: payment.productId },
          data: { revenueAmount: { decrement: payment.amount } },
        }),
        prisma.payment.delete({ where: { stripeChargeId: charge.id } }),
      ]);
    }
  }

  return NextResponse.json({ received: true });
}
