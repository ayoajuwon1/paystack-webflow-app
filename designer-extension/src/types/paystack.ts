export type PaystackCurrency = "NGN" | "GHS" | "KES" | "ZAR" | "USD";

export type PaystackChannel =
  | "card"
  | "bank"
  | "ussd"
  | "qr"
  | "mobile_money"
  | "bank_transfer"
  | "eft";

export type PaymentType =
  | "one_time"
  | "subscription"
  | "split"
  | "ecommerce"
  | "payment_page";

export interface PaystackConfig {
  publicKey: string;
  isTestMode: boolean;
}

export type AmountMode = "fixed" | "dynamic";

export interface DynamicSourceConfig {
  amountSelector: string;       // CSS selector to read price from (e.g. ".price", "[data-price]")
  amountAttribute: string;      // "textContent" or a data attribute name (e.g. "data-amount")
  amountInSmallestUnit: boolean; // true = value is already in kobo, false = value is in naira (will be x100)
  productNameSelector: string;  // selector for product name (passed as metadata)
  currencySelector: string;     // selector to read currency (optional, falls back to default)
}

export const DEFAULT_DYNAMIC_SOURCE: DynamicSourceConfig = {
  amountSelector: "[data-paystack-price]",
  amountAttribute: "textContent",
  amountInSmallestUnit: false,
  productNameSelector: "[data-paystack-product]",
  currencySelector: "",
};

export interface PaymentButtonConfig {
  id: string;
  paymentType: PaymentType;
  label: string;
  amount: number; // major currency unit (e.g. 5000 = NGN 5,000)
  amountMode: AmountMode;
  dynamicSource: DynamicSourceConfig;
  currency: PaystackCurrency;
  channels: PaystackChannel[];
  successUrl: string;
  cancelUrl: string;
  emailCollection: "prompt" | "field";
  emailFieldSelector: string;
  // Subscription
  planCode: string;
  // Split
  subaccountCode: string;
  splitCode: string;
  // Metadata
  metadata: Record<string, string>;
}

export const DEFAULT_CHANNELS: PaystackChannel[] = [
  "card",
  "bank_transfer",
];

export const CURRENCIES: { value: PaystackCurrency; label: string }[] = [
  { value: "NGN", label: "Nigerian Naira (NGN)" },
  { value: "GHS", label: "Ghanaian Cedi (GHS)" },
  { value: "KES", label: "Kenyan Shilling (KES)" },
  { value: "ZAR", label: "South African Rand (ZAR)" },
  { value: "USD", label: "US Dollar (USD)" },
];

export const ALL_CHANNELS: { value: PaystackChannel; label: string }[] = [
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "ussd", label: "USSD" },
  { value: "mobile_money", label: "Mobile Money" },
  { value: "qr", label: "QR Code" },
  { value: "bank", label: "Bank (Direct)" },
  { value: "eft", label: "EFT" },
];
