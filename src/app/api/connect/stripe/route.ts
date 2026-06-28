import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const { productId, restrictedKey } = await req.json();

  if (!productId || !restrictedKey) {
    return NextResponse.json({ error: "Missing productId or restrictedKey" }, { status: 400 });
  }

  if (!restrictedKey.startsWith("rk_")) {
    return NextResponse.json(
      { error: "That doesn't look like a restricted key — it should start with rk_live_ or rk_test_" },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const makerStripe = new Stripe(restrictedKey, { apiVersion: "2025-02-24.acacia" });

  // Validate the key has charge read access
  try {
    await makerStripe.charges.list({ limit: 1 });
  } catch (err: unknown) {
    const message = err instanceof Stripe.errors.StripeError ? err.message : "Invalid API key";
    return NextResponse.json({ error: `Key validation failed: ${message}` }, { status: 400 });
  }

  // Delete existing webhook endpoint if re-connecting
  if (product.stripeWebhookEndpointId && product.stripeRestrictedKey) {
    try {
      const oldStripe = new Stripe(product.stripeRestrictedKey, { apiVersion: "2025-02-24.acacia" });
      await oldStripe.webhookEndpoints.del(product.stripeWebhookEndpointId);
    } catch {
      // Ignore — old key may be invalid or endpoint already deleted
    }
  }

  // Register a webhook endpoint on the maker's Stripe account
  const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/stripe/${productId}`;
  let endpoint: Stripe.WebhookEndpoint;
  try {
    endpoint = await makerStripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: ["charge.succeeded", "charge.refunded"],
    });
  } catch (err: unknown) {
    let message = err instanceof Stripe.errors.StripeError ? err.message : "Failed to register webhook";
    if (err instanceof Stripe.errors.StripePermissionError) {
      message = "This key can't create webhooks. Make sure 'Webhook Endpoints' is set to Write when creating the restricted key.";
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      stripeRestrictedKey: restrictedKey,
      stripeWebhookSecret: endpoint.secret,
      stripeWebhookEndpointId: endpoint.id,
      stripeConnected: true,
    },
  });

  return NextResponse.json({ ok: true });
}
