import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import StripeKeyForm from "@/components/StripeKeyForm";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ productId?: string }>;
}

export default async function ConnectStripePage({ searchParams }: Props) {
  const { productId } = await searchParams;
  if (!productId) notFound();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="card p-8">
        <div className="mb-6 text-center">
          <div className="text-4xl mb-3">🔗</div>
          <h1 className="text-2xl font-bold text-gray-900">Connect Stripe</h1>
          <p className="mt-1 text-sm text-gray-500">
            Link <span className="font-semibold text-gray-800">{product.name}</span> so new subscribers are counted automatically.
          </p>
        </div>

        {product.stripeConnected ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center">
            <p className="font-semibold text-green-700">✅ Stripe is connected</p>
            <p className="mt-1 text-sm text-green-600">
              {product.subscriberCount} subscriber{product.subscriberCount !== 1 ? "s" : ""} counted so far
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a href={`/products/${product.slug}`} className="btn-primary justify-center">
                View product →
              </a>
              <StripeKeyForm productId={productId} reconnect />
            </div>
          </div>
        ) : (
          <>
            {/* How to get the key */}
            <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">How to get your key</p>
              <ol className="flex flex-col gap-2.5 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="font-bold text-brand-500 shrink-0">1.</span>
                  Go to <span className="font-medium">stripe.com/dashboard</span> → Developers → API keys
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-brand-500 shrink-0">2.</span>
                  Click <span className="font-medium">Create restricted key</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-brand-500 shrink-0">3.</span>
                  Give it a name (e.g. "ProductBump") and set <span className="font-mono text-xs bg-gray-200 px-1 py-0.5 rounded">Subscriptions</span> to <span className="font-medium">Read</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-brand-500 shrink-0">4.</span>
                  Copy the key (starts with <span className="font-mono text-xs bg-gray-200 px-1 py-0.5 rounded">rk_</span>) and paste it below
                </li>
              </ol>
            </div>

            <StripeKeyForm productId={productId} />

            <p className="mt-4 text-center text-xs text-gray-400">
              We use this key only to register a webhook on your account.<br />
              We never charge customers or modify your Stripe settings.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
