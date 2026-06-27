import Link from "next/link";

export interface EnrichedProduct {
  id: string;
  name: string;
  tagline: string;
  slug: string;
  category: string;
  logoUrl: string | null;
  subscriberCount: number;
  bumpThreshold: number;
  stripeConnected: boolean;
  subscribersToday: number;
  rankDelta: number;
}

const CATEGORY_STYLES: Record<string, string> = {
  Productivity: "bg-blue-50 text-blue-700 ring-blue-200",
  Developer:    "bg-purple-50 text-purple-700 ring-purple-200",
  Design:       "bg-pink-50 text-pink-700 ring-pink-200",
  Finance:      "bg-green-50 text-green-700 ring-green-200",
  Health:       "bg-red-50 text-red-700 ring-red-200",
  Education:    "bg-yellow-50 text-yellow-700 ring-yellow-200",
  Marketing:    "bg-orange-50 text-orange-700 ring-orange-200",
  AI:           "bg-indigo-50 text-indigo-700 ring-indigo-200",
  Lifestyle:    "bg-teal-50 text-teal-700 ring-teal-200",
  Other:        "bg-gray-50 text-gray-600 ring-gray-200",
};

const LOGO_COLORS = [
  "#1a1a2e", "#16213e", "#7c3aed", "#0d9488",
  "#dc2626", "#d97706", "#059669", "#2563eb",
];

function logoColor(slug: string) {
  const h = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return LOGO_COLORS[h % LOGO_COLORS.length];
}

interface Props {
  product: EnrichedProduct;
  rank: number;
}

export default function ProductCard({ product, rank }: Props) {
  const catStyle = CATEGORY_STYLES[product.category] ?? CATEGORY_STYLES.Other;
  const progress = Math.min((product.subscriberCount / product.bumpThreshold) * 100, 100);
  const pct = Math.round(progress);
  const color = logoColor(product.slug);
  const initial = product.name[0].toUpperCase();

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-sm transition hover:border-gray-200 hover:shadow-md">

      {/* Rank */}
      <div className="flex w-10 shrink-0 flex-col items-center">
        <span className="text-lg font-extrabold text-gray-700">{rank}</span>
        {product.rankDelta > 0 ? (
          <span className="flex items-center text-xs font-semibold text-emerald-500">
            <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 17a1 1 0 01-1-1V6.414L5.707 9.707a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L11 6.414V16a1 1 0 01-1 1z" clipRule="evenodd" />
            </svg>
            {product.rankDelta}
          </span>
        ) : product.rankDelta < 0 ? (
          <span className="flex items-center text-xs font-semibold text-red-400">
            <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v9.586l3.293-3.293a1 1 0 011.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L9 13.586V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {Math.abs(product.rankDelta)}
          </span>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </div>

      {/* Logo */}
      <div className="relative shrink-0">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-sm"
          style={{ background: color }}
        >
          {product.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.logoUrl} alt={product.name} className="h-full w-full rounded-2xl object-contain p-1" />
          ) : (
            initial
          )}
        </div>
        {product.subscribersToday > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white ring-2 ring-white">
            +
          </span>
        )}
      </div>

      {/* Main info */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="font-bold text-gray-900 hover:text-brand-600 group-hover:text-brand-600 transition-colors"
          >
            {product.name}
          </Link>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${catStyle}`}>
            {product.category}
          </span>
          {!product.stripeConnected && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 ring-1 ring-amber-200">
              ⚡ Unverified
            </span>
          )}
        </div>

        <p className="truncate text-sm text-gray-500">{product.tagline}</p>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #fb923c, #f97316)",
              }}
            />
          </div>
          <span className="shrink-0 text-xs text-gray-400">
            {product.subscriberCount} / {product.bumpThreshold} subscribers
          </span>
          <span className="shrink-0 text-xs font-semibold text-brand-500">
            {pct}% subscribed
          </span>
        </div>
      </div>

      {/* Subscriber count pill */}
      <div className="hidden sm:flex shrink-0 flex-col items-center justify-center w-14 rounded-xl border border-gray-200 bg-white py-2 gap-0.5 shadow-sm">
        <svg className="h-4 w-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 17a1 1 0 01-1-1V6.414L5.707 9.707a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L11 6.414V16a1 1 0 01-1 1z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-bold text-gray-800 leading-none">{product.subscriberCount}</span>
        <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wide">subs</span>
      </div>
    </div>
  );
}
