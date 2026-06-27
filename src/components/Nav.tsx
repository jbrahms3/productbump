"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/how-it-works", label: "How It Works" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 mr-2">
          <span className="text-2xl">🚀</span>
          <span className="text-xl font-bold tracking-tight">
            Product<span className="text-brand-500">Bump</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? "text-brand-600 relative after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-brand-500 after:rounded-full"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Search */}
        <div className="hidden lg:flex flex-1 max-w-xs items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="flex-1">Search products...</span>
          <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs text-gray-400">Ctrl K</kbd>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Notification bell */}
          <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">3</span>
          </button>

          {/* Submit button */}
          <Link href="/submit" className="btn-primary hidden sm:inline-flex">
            + Submit Product
          </Link>

          {/* Avatar */}
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 ring-2 ring-white shadow-sm" />
        </div>
      </div>
    </header>
  );
}
