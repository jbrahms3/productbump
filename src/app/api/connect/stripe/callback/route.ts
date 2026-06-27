import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const productId = searchParams.get("state");
  const errorParam = searchParams.get("error");
  const base = process.env.NEXT_PUBLIC_BASE_URL!;

  if (errorParam || !code || !productId) {
    const msg = errorParam === "access_denied" ? "You cancelled the Stripe connection." : "Stripe connection failed.";
    return NextResponse.redirect(`${base}/connect/stripe?productId=${productId}&error=${encodeURIComponent(msg)}`);
  }

  try {
    // Exchange auth code for access token
    const response = await stripe.oauth.token({ grant_type: "authorization_code", code });
    const stripeAccountId = response.stripe_user_id;

    if (!stripeAccountId) throw new Error("No account ID returned");

    await prisma.product.update({
      where: { id: productId },
      data: { stripeAccountId, stripeConnected: true },
    });

    return NextResponse.redirect(`${base}/connect/stripe?productId=${productId}&success=1`);
  } catch (err) {
    console.error("Stripe OAuth error:", err);
    return NextResponse.redirect(
      `${base}/connect/stripe?productId=${productId}&error=${encodeURIComponent("Failed to connect Stripe account.")}`
    );
  }
}
