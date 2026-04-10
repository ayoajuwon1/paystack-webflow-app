import { paystackRequest } from "./client";

interface CreateSubaccountParams {
  business_name: string;
  bank_code: string;
  account_number: string;
  percentage_charge: number;
}

interface SubaccountResponse {
  subaccount_code: string;
  business_name: string;
  percentage_charge: number;
}

export async function createSubaccount(
  secretKey: string,
  params: CreateSubaccountParams
): Promise<SubaccountResponse> {
  return paystackRequest<SubaccountResponse>(
    secretKey,
    "POST",
    "/subaccount",
    params as unknown as Record<string, unknown>
  );
}

export async function listSubaccounts(
  secretKey: string
): Promise<SubaccountResponse[]> {
  return paystackRequest<SubaccountResponse[]>(
    secretKey,
    "GET",
    "/subaccount"
  );
}

interface CreateSplitParams {
  name: string;
  type: "percentage" | "flat";
  currency: string;
  subaccounts: Array<{ subaccount: string; share: number }>;
  bearer_type?: "subaccount" | "account" | "all-proportional" | "all";
}

interface SplitResponse {
  split_code: string;
  name: string;
  type: string;
  currency: string;
}

export async function createSplit(
  secretKey: string,
  params: CreateSplitParams
): Promise<SplitResponse> {
  return paystackRequest<SplitResponse>(
    secretKey,
    "POST",
    "/split",
    params as unknown as Record<string, unknown>
  );
}

export async function listSplits(secretKey: string): Promise<SplitResponse[]> {
  return paystackRequest<SplitResponse[]>(secretKey, "GET", "/split");
}
