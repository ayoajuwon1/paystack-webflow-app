import { paystackRequest } from "./client";

interface InitializeParams {
  amount: number;
  email: string;
  currency?: string;
  channels?: string[];
  plan?: string;
  subaccount?: string;
  split_code?: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
}

interface InitializeResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export async function initializeTransaction(
  secretKey: string,
  params: InitializeParams
): Promise<InitializeResponse> {
  return paystackRequest<InitializeResponse>(
    secretKey,
    "POST",
    "/transaction/initialize",
    params as unknown as Record<string, unknown>
  );
}

interface VerifyResponse {
  id: number;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  channel: string;
  paid_at: string;
  customer: { email: string };
  metadata: Record<string, unknown>;
}

export async function verifyTransaction(
  secretKey: string,
  reference: string
): Promise<VerifyResponse> {
  return paystackRequest<VerifyResponse>(
    secretKey,
    "GET",
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
}
