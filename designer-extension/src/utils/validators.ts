export function isValidPublicKey(key: string): boolean {
  return /^pk_(test|live)_[a-zA-Z0-9]+$/.test(key.trim());
}

export function isTestKey(key: string): boolean {
  return key.trim().startsWith("pk_test_");
}

export function isValidUrl(url: string): boolean {
  if (!url) return true; // empty is valid (optional field)
  try {
    new URL(url, "https://example.com"); // allow relative URLs
    return true;
  } catch {
    return false;
  }
}

export function isValidAmount(amount: number): boolean {
  return amount > 0;
}

// Convert major unit (naira) to smallest unit (kobo)
export function toSmallestUnit(majorAmount: number): number {
  return Math.round(majorAmount * 100);
}

// Convert smallest unit (kobo) to major unit (naira)
export function toMajorUnit(smallestAmount: number): number {
  return smallestAmount / 100;
}

export function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format for display: takes major unit amount (naira, not kobo)
export function formatAmountForDisplay(
  amountInMajorUnit: number,
  currency: string
): string {
  return formatAmount(amountInMajorUnit, currency);
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "\u20A6",
  GHS: "GH\u20B5",
  KES: "KSh",
  ZAR: "R",
  USD: "$",
};
