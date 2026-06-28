import { prisma } from "@/lib/prisma";
import ProductCard, { EnrichedProduct } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const products = await prisma.product.findMany({
    where: { bumped: false },
    orderBy: [{ subscriberCount: "desc" }],
  });

  const todaySubs = await prisma.subscription.groupBy({
    by: ["productId"],
    where: { createdAt: { gte: today } },
    _count: { id: true },
  });
  const todayMap = Object.fromEntries(todaySubs.map((t) => [t.productId, t._count.id]));

  const enriched: EnrichedProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    slug: p.slug,
    category: p.category,
    logoUrl: p.logoUrl,
    subscriberCount: p.subscriberCount,
    bumpThreshold: p.bumpThreshold,
    stripeConnected: p.stripeConnected,
    subscribersToday: todayMap[p.id] ?? 0,
    rankDelta: todayMap[p.id] ?? 0,
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
