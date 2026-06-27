import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ConnectStripeButton from "@/components/ConnectStripeButton";

interface Props {
  searchParams: Promise<{ productId?: string; success?: string; error?: string }>;
}

export default async function ConnectStripePage({ searchParams }: Props) {
  const { productId, success, error } = await searchParams;

  if (!productId) notFound();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) notFound();

  const stripeOAuthUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.STRIPE_CLIENT_ID}&scope=read_write&state=${productId}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_BASE_URL + "/api/connect/stripe/callback")}`;

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="card p-8">
        <div className="mb-4 text-5xl">🔗</div>
        <h1 className="text-2xl font-bold text-gray-900">Connect Stripe</h1>
        <p className="mt-2 text-gray-500">
          Connect your Stripe account to{" "}
          <span className="font-semibold text-gray-800">{product.name}</span> so
          we can count new subscribers as verified bumps.
        </p>

        {success === "1" && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            ✅ Stripe connected! New subscribers will now update your bump count automatically.
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            ❌ {decodeURIComponent(error)}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {!product.stripeConnected ? (
            <ConnectStripeButton href={stripeOAuthUrl} />
          ) : (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              ✅ Already connected! Subscribers count: {product.subscriberCount}
            </div>
          )}
          <a href={`/products/${product.slug}`} className="btn-secondary justify-center">
            View product page →
          </a>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4 text-xs text-gray-400">
          <p>We only read new subscription events to count bumps.</p>
          <p>We never charge your customers or modify your Stripe account.</p>
        </div>
      </div>
    </div>
  );
}
