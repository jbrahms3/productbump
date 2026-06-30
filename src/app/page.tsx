import { prisma } from "@/lib/prisma";
import Hero from "@/components/Hero";
import ProductList from "@/components/ProductList";
import Sidebar from "@/components/Sidebar";
import { EnrichedProduct } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Active products — only 8 homepage slots, assigned by the submission queue
  // (FIFO, with one random slot). Display order is still ranked by revenue.
  const products = await prisma.product.findMany({
    where: { featured: true, bumped: false },
    orderBy: [{ revenueAmount: "desc" }, { featuredAt: "desc" }],
  });

  // Today's revenue per product (sum of payment amounts)
  const todayPayments = await prisma.payment.groupBy({
    by: ["productId"],
    where: { createdAt: { gte: today } },
    _sum: { amount: true },
  });
  const todayMap = Object.fromEntries(todayPayments.map((t) => [t.productId, t._sum.amount ?? 0]));

  // Total revenue today (all products)
  const totalToday = await prisma.payment.aggregate({
    where: { createdAt: { gte: today } },
    _sum: { amount: true },
  });
  const totalRevenueToday = totalToday._sum.amount ?? 0;

  // Enrich products with today's revenue
  const enriched: EnrichedProduct[] = products.map((p) => ({
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
    randomSlot: p.randomSlot,
    featured: p.featured,
  }));

  // Top movers = most revenue today
  const topMovers = [...enriched]
    .sort((a, b) => b.revenueToday - a.revenueToday)
    .slice(0, 3);

  // Almost there = closest to goal, sorted by progress descending
  const almostThere = [...enriched]
    .sort((a, b) => b.revenueAmount / b.revenueThreshold - a.revenueAmount / a.revenueThreshold)
    .slice(0, 3);

  // Threshold to display (use the most common / first product's, default $100)
  const threshold = products[0]?.revenueThreshold ?? 10000;

  return (
    <div>
      <Hero threshold={threshold} />

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
                revenueToday: totalRevenueToday,
                threshold,
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
