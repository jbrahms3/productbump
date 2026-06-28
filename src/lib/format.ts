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
