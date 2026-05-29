const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-NG', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Nigerian Naira display, e.g. ₦4,500.00 */
export function formatNaira(amount: number): string {
  return nairaFormatter.format(amount);
}

/** Plain number with thousands separators, e.g. 4,500 */
export function formatNumber(amount: number): string {
  return numberFormatter.format(amount);
}

/** Naira without decimals for compact UI */
export function formatNairaCompact(amount: number): string {
  return `₦${formatNumber(amount)}`;
}
