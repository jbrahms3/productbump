import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
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

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, product.stripeWebhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "customer.subscription.created") {
    const subscription = event.data.object as Stripe.Subscription;

    // Idempotency: skip if already counted
    const existing = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (existing) return NextResponse.json({ received: true });

    const [updated] = await prisma.$transaction([
      prisma.product.update({
        where: { id: product.id },
        data: { subscriberCount: { increment: 1 } },
      }),
      prisma.subscription.create({
        data: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id,
          productId: product.id,
        },
      }),
    ]);

    // Bump off homepage once threshold reached
    if (!updated.bumped && updated.subscriberCount >= updated.bumpThreshold) {
      await prisma.product.update({
        where: { id: product.id },
        data: { bumped: true, featured: false, bumpedAt: new Date() },
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const sub = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (sub) {
      await prisma.$transaction([
        prisma.product.update({
          where: { id: sub.productId },
          data: { subscriberCount: { decrement: 1 } },
        }),
        prisma.subscription.delete({ where: { stripeSubscriptionId: subscription.id } }),
      ]);
    }
  }

  return NextResponse.json({ received: true });
}
