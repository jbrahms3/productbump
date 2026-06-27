import Link from "next/link";

export default function Hero({ threshold = 50 }: { threshold?: number }) {
  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-center">

          {/* Left: headline + CTAs */}
          <div className="lg:col-span-1">
            <h1 className="text-4xl font-extrabold leading-tight text-gray-900">
              Discover tomorrow&apos;s{" "}
              <span className="text-brand-500">favorite products</span>{" "}
              today
            </h1>
            <p className="mt-4 text-base text-gray-500 leading-relaxed">
              Every product here is ranked by real paying subscribers — not clicks or upvotes.
              Once a product hits 50, it makes room for the next one.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/submit" className="btn-primary py-2.5 px-5 text-sm">
                Submit your product
              </Link>
              <Link href="/how-it-works" className="btn-secondary py-2.5 px-5 text-sm gap-2">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                How it works
              </Link>
            </div>
          </div>

          {/* Center: Journey card */}
          <div className="flex justify-center">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm w-full max-w-sm">
              <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">The Journey</p>
              <div className="flex items-center justify-between gap-1">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-2xl">🚀</div>
                  <p className="text-xs font-semibold text-gray-700">Get 0</p>
                  <p className="text-xs text-gray-400">new subscribers</p>
                </div>
                <div className="flex flex-1 items-center px-1">
                  <div className="h-px flex-1 border-t-2 border-dashed border-gray-300" />
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl">📈</div>
                  <p className="text-xs font-semibold text-gray-700">Reach {threshold}</p>
                  <p className="text-xs text-gray-400">new subscribers</p>
                </div>
                <div className="flex flex-1 items-center px-1">
                  <div className="h-px flex-1 border-t-2 border-dashed border-gray-300" />
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-2xl">🔄</div>
                  <p className="text-xs font-semibold text-gray-700">Make room</p>
                  <p className="text-xs text-gray-400">Next product in</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: rocket illustration */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative select-none">
              <span className="absolute -top-6 left-4 text-xl text-yellow-400 animate-pulse">✦</span>
              <span className="absolute top-6 -right-4 text-sm text-blue-400 animate-pulse" style={{animationDelay:"0.3s"}}>✦</span>
              <span className="absolute bottom-6 -left-4 text-xs text-purple-400 animate-pulse" style={{animationDelay:"0.6s"}}>✦</span>
              <span className="absolute -bottom-4 right-6 text-lg text-brand-400 animate-pulse" style={{animationDelay:"0.9s"}}>✦</span>
              <div className="text-[120px] leading-none drop-shadow-lg" style={{transform:"rotate(-15deg)"}}>🚀</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
