/** Format an amount in cents as a clean USD string, e.g. 10000 -> "$100", 12550 -> "$125.50". */
export function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  const hasFraction = cents % 100 !== 0;
  return dollars.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  });
}

/** Compact form for tight spaces, e.g. 150000 -> "$1.5k". */
export function formatCurrencyCompact(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000) {
    return "$" + (dollars / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "k";
  }
  return formatCurrency(cents);
}

/** Relative time string, e.g. "3m ago", "2h ago", "5d ago". */
export function formatTimeAgo(date: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
