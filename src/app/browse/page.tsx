import { prisma } from "@/lib/prisma";
import ProductCard, { EnrichedProduct } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const products = await prisma.product.findMany({
    where: { bumped: false },
  });

  const todayPayments = await prisma.payment.groupBy({
    by: ["productId"],
    where: { createdAt: { gte: today } },
    _sum: { amount: true },
  });
  const todayMap = Object.fromEntries(todayPayments.map((t) => [t.productId, t._sum.amount ?? 0]));

  // Featured products rank by revenue; queued products rank by submission order (FIFO)
  const featured = products
    .filter((p) => p.featured)
    .sort((a, b) => b.revenueAmount - a.revenueAmount);
  const queued = products
    .filter((p) => !p.featured)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const ordered = [...featured, ...queued];

  const enriched: EnrichedProduct[] = ordered.map((p, i) => ({
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    slug: p.slug,
    category: p.category,
    logoUrl: p.logoUrl,
    revenueAmount: p.revenueAmount,
    revenueThreshold: p.revenueThreshold,
    stripeConnected: p.stripeConnected,
    revenueToday: todayMap[p.id] ?? 0,
    rankDelta: todayMap[p.id] ?? 0,
    featured: p.featured,
    randomSlot: p.randomSlot,
    queuePosition: p.featured ? undefined : i - featured.length + 1,
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All products</h1>
        <p className="mt-1 text-sm text-gray-500">{products.length} products currently rising</p>
      </div>
      <div className="flex flex-col gap-3">
        {enriched.map((p, i) => (
          <ProductCard key={p.id} product={p} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}
