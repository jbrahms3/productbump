import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

async function checkAndBump(product: { id: string; subscriberCount: number; bumpThreshold: number; bumped: boolean }) {
  if (!product.bumped && product.subscriberCount >= product.bumpThreshold) {
    await prisma.product.update({
      where: { id: product.id },
      data: { bumped: true, featured: false, bumpedAt: new Date() },
    });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "customer.subscription.created") {
    const subscription = event.data.object as Stripe.Subscription;
    const connectedAccountId = event.account; // set on Connect events

    if (!connectedAccountId) {
      return NextResponse.json({ received: true });
    }

    // Find which product this Stripe account belongs to
    const product = await prisma.product.findFirst({
      where: { stripeAccountId: connectedAccountId, stripeConnected: true },
    });

    if (!product) {
      return NextResponse.json({ received: true });
    }

    // Idempotency: skip if we've already counted this subscription
    const existing = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (existing) {
      return NextResponse.json({ received: true });
    }

    // Record the subscription and increment count
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

    // Check if this product should be bumped
    await checkAndBump(updated);
  }

  if (event.type === "customer.subscription.deleted") {
    // Optionally decrement on cancellation — comment out if you prefer to keep counts
    const subscription = event.data.object as Stripe.Subscription;
    const connectedAccountId = event.account;

    if (!connectedAccountId) return NextResponse.json({ received: true });

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
