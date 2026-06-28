import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import StripeKeyForm from "@/components/StripeKeyForm";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ productId?: string }>;
}

export default async function ConnectStripePage({ searchParams }: Props) {
  const { productId } = await searchParams;
  if (!productId) notFound();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) notFound();

  // Deep link to Stripe's restricted-key creation page with the name and the two
  // permissions we need pre-selected. The `permissions[]` params are best-effort
  // (undocumented by Stripe) — if they're ignored, the maker can still tick the
  // boxes manually using the instructions below.
  const stripeKeyUrl =
    "https://dashboard.stripe.com/apikeys/create?name=ProductBump" +
    "&permissions[]=rak_charge_read" +
    "&permissions[]=rak_webhook_write";

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="card p-8">
        <div className="mb-6 text-center">
          <div className="text-4xl mb-3">🔗</div>
          <h1 className="text-2xl font-bold text-gray-900">Connect Stripe</h1>
          <p className="mt-1 text-sm text-gray-500">
            Link <span className="font-semibold text-gray-800">{product.name}</span> so new revenue is counted automatically.
          </p>
        </div>

        {product.stripeConnected ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center">
            <p className="font-semibold text-green-700">✅ Stripe is connected</p>
            <p className="mt-1 text-sm text-green-600">
              {formatCurrency(product.revenueAmount)} in revenue counted so far
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
            {/* One-click key creation */}
            <a
              href={stripeKeyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-5 flex items-center justify-center gap-2 rounded-lg bg-[#635BFF] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5851e6]"
            >
              Create your key on Stripe
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">What this opens</p>
              <p className="text-sm text-gray-600 mb-3">
                The button opens Stripe&apos;s restricted-key page with the name and required permissions pre-selected. Just confirm these two are set to the right access, then click <span className="font-medium">Create key</span>:
              </p>
              <ul className="flex flex-col gap-1.5 text-sm">
                <li className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-gray-200 px-1.5 py-0.5 rounded">Charges</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium text-gray-700">Read</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-gray-200 px-1.5 py-0.5 rounded">Webhook Endpoints</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium text-gray-700">Write</span>
                </li>
              </ul>
              <p className="mt-3 text-sm text-gray-600">
                Then copy the key (starts with <span className="font-mono text-xs bg-gray-200 px-1 py-0.5 rounded">rk_</span>) and paste it below.
              </p>
            </div>

            <StripeKeyForm productId={productId} />

            <p className="mt-4 text-center text-xs text-gray-400">
              We use this key only to read charges and register a webhook.<br />
              We never charge customers or modify your Stripe settings.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
