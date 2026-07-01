import { auth } from "@clerk/nextjs/server";
import { UserProfile } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";
import { getQueuePosition } from "@/lib/queue";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { userId } = await auth();
  if (!userId) return null; // middleware already redirects unauthenticated visitors

  const products = await prisma.product.findMany({
    where: { makerUserId: userId },
    orderBy: { createdAt: "desc" },
  });

  const withStatus = await Promise.all(
    products.map(async (p) => {
      const queued = !p.featured && !p.bumped;
      const queuePosition = queued ? await getQueuePosition(p.createdAt) : null;
      return { ...p, queuePosition };
    })
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My account</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        {/* Products */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-700">
              My products {products.length > 0 && <span className="text-gray-400">({products.length})</span>}
            </h2>
          </div>

          {withStatus.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-gray-400">You haven&apos;t submitted a product yet.</p>
              <Link href="/submit" className="btn-primary mt-4 inline-flex text-sm">
                + Submit a product
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {withStatus.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                    {p.logoUrl ? (
                      <Image src={p.logoUrl} alt={p.name} fill className="object-contain p-1" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg">🚀</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">{p.name}</p>
                    <p className="truncate text-xs text-gray-400">{p.tagline}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {p.bumped ? (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                        ✓ Bumped
                      </span>
                    ) : p.featured ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-200">
                        {formatCurrencyCompact(p.revenueAmount)} raised
                      </span>
                    ) : (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 ring-1 ring-blue-200">
                        🕓 #{p.queuePosition} in queue
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="card overflow-hidden p-6">
          <h2 className="mb-3 font-semibold text-gray-700">Overview</h2>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Products submitted</span>
              <span className="font-semibold text-gray-900">{products.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Currently featured</span>
              <span className="font-semibold text-gray-900">{products.filter((p) => p.featured).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Bumped off</span>
              <span className="font-semibold text-gray-900">{products.filter((p) => p.bumped).length}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-gray-500">Total revenue</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(products.reduce((sum, p) => sum + p.revenueAmount, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account settings */}
      <div className="card mt-6 overflow-hidden p-2">
        <UserProfile routing="hash" />
      </div>
    </div>
  );
}
