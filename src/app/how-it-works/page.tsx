export default function HowItWorksPage() {
  const steps = [
    {
      emoji: "📝",
      title: "Submit your product",
      description:
        "Fill out a short form with your product name, tagline, description, and website URL. It takes under 2 minutes.",
    },
    {
      emoji: "🔗",
      title: "Connect Stripe",
      description:
        "Link your Stripe account via OAuth. We use Stripe Connect to securely receive subscription events — we never touch your funds or customer data.",
    },
    {
      emoji: "📈",
      title: "Grow your subscriber count",
      description:
        "Every new paying subscriber to your product automatically increments your count on ProductBump. No fake numbers, no gaming — just real subscriber growth.",
    },
    {
      emoji: "🏆",
      title: "Make room for the next product",
      description:
        "Once you hit 50 verified new subscribers, your spot on the homepage opens up for another product. You've proven traction — now it's someone else's turn.",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900">How ProductBump works</h1>
        <p className="mt-3 text-gray-500">
          Rankings here aren&apos;t based on clicks or upvotes — they&apos;re powered entirely by real paying subscribers.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-2xl">
              {step.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Step {i + 1}</span>
              </div>
              <h2 className="mt-1 text-lg font-bold text-gray-900">{step.title}</h2>
              <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-amber-100 bg-amber-50 p-6 text-center">
        <h2 className="text-lg font-bold text-amber-900">Why 50 subscribers?</h2>
        <p className="mt-2 text-sm text-amber-800 leading-relaxed">
          Fifty real subscribers is our way of celebrating early traction and ensuring every product
          on ProductBump has proven people love it enough to pay. It&apos;s a meaningful milestone
          that filters out noise and rewards genuine product-market fit.
        </p>
      </div>
    </div>
  );
}
