import { createHmac } from "crypto";

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secretKey: string
): boolean {
  const hash = createHmac("sha512", secretKey).update(body).digest("hex");
  return hash === signature;
}

export interface WebhookEvent {
  event: string;
  data: {
    id: number;
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
    channel?: string;
    paid_at?: string;
    customer?: { email: string };
    metadata?: Record<string, unknown>;
    subscription_code?: string;
    plan?: { plan_code: string };
    email_token?: string;
    next_payment_date?: string;
  };
}
