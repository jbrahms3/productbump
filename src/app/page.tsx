import { prisma } from "@/lib/prisma";
import Hero from "@/components/Hero";
import ProductList from "@/components/ProductList";
import Sidebar from "@/components/Sidebar";
import { EnrichedProduct } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Active products
  const products = await prisma.product.findMany({
    where: { bumped: false },
    orderBy: [{ subscriberCount: "desc" }, { featuredAt: "desc" }],
    take: 20,
  });

  // Today's subscription counts per product
  const todaySubs = await prisma.subscription.groupBy({
    by: ["productId"],
    where: { createdAt: { gte: today } },
    _count: { id: true },
  });
  const todayMap = Object.fromEntries(todaySubs.map((t) => [t.productId, t._count.id]));

  // Total subs today (all products)
  const totalSubsToday = await prisma.subscription.count({
    where: { createdAt: { gte: today } },
  });

  // Enrich products with today's count
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

  // Top movers = highest today subs
  const topMovers = [...enriched]
    .sort((a, b) => b.subscribersToday - a.subscribersToday)
    .slice(0, 3);

  // Almost there = closest to 50, sorted by progress descending
  const almostThere = [...enriched]
    .sort((a, b) => b.subscriberCount / b.bumpThreshold - a.subscriberCount / a.bumpThreshold)
    .slice(0, 3);

  return (
    <div>
      <Hero threshold={50} />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex gap-7">
          {/* Product list */}
          <div className="flex-1 min-w-0">
            <ProductList products={enriched} />
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-72 xl:w-80 shrink-0">
            <Sidebar
              stats={{
                totalActive: products.length,
                subsToday: totalSubsToday,
              }}
              topMovers={topMovers}
              almostThere={almostThere}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
