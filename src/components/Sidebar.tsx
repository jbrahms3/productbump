import Link from "next/link";
import { EnrichedProduct } from "./ProductCard";
import SparkLine from "./SparkLine";

interface Stats {
  totalActive: number;
  subsToday: number;
}

interface Props {
  stats: Stats;
  topMovers: EnrichedProduct[];
  almostThere: EnrichedProduct[];
}

const LOGO_COLORS = ["#1a1a2e","#16213e","#7c3aed","#0d9488","#dc2626","#d97706","#059669","#2563eb"];
function logoColor(slug: string) {
  const h = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return LOGO_COLORS[h % LOGO_COLORS.length];
}

export default function Sidebar({ stats, topMovers, almostThere }: Props) {
  return (
    <div className="flex flex-col gap-4">

      {/* Live Stats */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Live Stats</h2>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-brand-500">{stats.totalActive}</div>
            <div className="mt-0.5 text-xs text-gray-400 leading-tight">Products on homepage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-blue-500">{stats.subsToday.toLocaleString()}</div>
            <div className="mt-0.5 text-xs text-gray-400 leading-tight">New subscribers today</div>
          </div>
        </div>
      </div>

      {/* Top Movers */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold text-gray-900">Top Movers Today</h2>
        <div className="flex flex-col gap-3">
          {topMovers.map((p, i) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="flex items-center gap-3 group"
            >
              <span className="w-5 shrink-0 text-xs font-bold text-gray-400">{i + 1}</span>
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                style={{ background: logoColor(p.slug) }}
              >
                {p.name[0]}
              </div>
              <span className="flex-1 text-sm font-semibold text-gray-800 group-hover:text-brand-600 transition-colors truncate">
                {p.name}
              </span>
              <span className="text-xs font-semibold text-emerald-500 shrink-0">
                +{p.subscribersToday} today
              </span>
            </Link>
          ))}
          {topMovers.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">No activity yet today</p>
          )}
        </div>
      </div>

      {/* Almost There */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold text-gray-900">Almost at 50 🔥</h2>
        <div className="flex flex-col gap-3">
          {almostThere.map((p) => {
            const pct = Math.round((p.subscriberCount / p.bumpThreshold) * 100);
            return (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-brand-600 transition-colors truncate">
                    {p.name}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">{p.subscriberCount}/50</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: "linear-gradient(90deg, #fb923c, #f97316)",
                    }}
                  />
                </div>
              </Link>
            );
          })}
          {almostThere.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">No products close yet</p>
          )}
        </div>
      </div>

      {/* How it works callout */}
      <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🤔</span>
          <h2 className="font-bold text-amber-900">How does this work?</h2>
        </div>
        <p className="text-sm text-amber-800 leading-relaxed">
          Products are featured here until they reach 50 real paying subscribers.
          Hit the goal and your spot opens up for the next product.
        </p>
        <Link
          href="/how-it-works"
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
        >
          Learn more →
        </Link>
      </div>

      {/* Sparkline decoration */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold text-gray-900 text-sm">Subscriber Activity</h2>
        <SparkLine seed="global-activity" color="#f97316" width={240} height={48} />
        <p className="mt-2 text-xs text-gray-400">New subscribers across all products</p>
      </div>
    </div>
  );
}
