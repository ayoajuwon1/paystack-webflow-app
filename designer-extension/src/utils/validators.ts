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
  return Number.isInteger(amount) && amount > 0;
}

export function formatAmountForDisplay(
  amountInSmallestUnit: number,
  currency: string
): string {
  const major = amountInSmallestUnit / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(major);
}
