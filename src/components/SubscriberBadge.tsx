"use client";

interface Props {
  count: number;
}

export default function SubscriberBadge({ count }: Props) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-0.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 transition hover:border-brand-300 hover:bg-brand-50">
      <span className="text-lg">▲</span>
      <span className="text-sm font-bold text-gray-800">{count.toLocaleString()}</span>
      <span className="text-[10px] uppercase tracking-wide text-gray-400">subs</span>
    </div>
  );
}
