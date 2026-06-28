"use client";

import { useState } from "react";
import ProductCard, { EnrichedProduct } from "./ProductCard";
import Link from "next/link";

const TABS = [
  { id: "today", label: "Today's Rising", icon: "🔥" },
  { id: "week",  label: "This Week",      icon: "🕐" },
  { id: "all",   label: "All Time",       icon: "📊" },
] as const;

const CATEGORIES = [
  "All", "AI", "Developer", "Design", "Education",
  "Finance", "Health", "Marketing", "Productivity", "Lifestyle", "Other",
];

interface Props {
  products: EnrichedProduct[];
}

export default function ProductList({ products }: Props) {
  const [tab, setTab] = useState<"today" | "week" | "all">("today");
  const [category, setCategory] = useState("All");
  const [showCatMenu, setShowCatMenu] = useState(false);

  // Client-side filtering
  const filtered = products
    .filter((p) => category === "All" || p.category === category)
    .sort((a, b) => {
      if (tab === "today") return b.revenueToday - a.revenueToday || b.revenueAmount - a.revenueAmount;
      return b.revenueAmount - a.revenueAmount;
    });

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-gray-100 bg-white p-1 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="relative">
          <button
            onClick={() => setShowCatMenu((v) => !v)}
            className="btn-secondary gap-2 text-sm"
          >
            Filter by category
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showCatMenu && (
            <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => { setCategory(c); setShowCatMenu(false); }}
                  className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
                    category === c ? "font-semibold text-brand-600" : "text-gray-700"
                  }`}
                >
                  {category === c && <span className="text-brand-500">✓</span>}
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product cards */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white py-16 text-center">
          <div className="text-4xl mb-3">🌱</div>
          <p className="font-semibold text-gray-700">No products here yet</p>
          <Link href="/submit" className="btn-primary mt-4 inline-flex">
            Submit yours
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} rank={i + 1} />
          ))}
        </div>
      )}

      {/* View all */}
      {filtered.length > 0 && (
        <div className="mt-4 rounded-xl border border-gray-100 bg-white">
          <Link
            href="/browse"
            className="flex items-center justify-center gap-2 py-4 text-sm font-semibold text-gray-500 hover:text-brand-600 transition-colors"
          >
            View all rising products →
          </Link>
        </div>
      )}
    </div>
  );
}
