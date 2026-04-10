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
  | "payment_page";

export interface PaystackConfig {
  publicKey: string;
  isTestMode: boolean;
}

export interface PaymentButtonConfig {
  id: string;
  paymentType: PaymentType;
  label: string;
  amount: number; // in smallest currency unit (kobo for NGN)
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
