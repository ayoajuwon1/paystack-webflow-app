import { paystackRequest } from "./client";

interface CreatePlanParams {
  name: string;
  interval: string; // daily, weekly, monthly, quarterly, annually
  amount: number;
  currency?: string;
}

interface PlanResponse {
  plan_code: string;
  name: string;
  interval: string;
  amount: number;
  currency: string;
}

export async function createPlan(
  secretKey: string,
  params: CreatePlanParams
): Promise<PlanResponse> {
  return paystackRequest<PlanResponse>(
    secretKey,
    "POST",
    "/plan",
    params as unknown as Record<string, unknown>
  );
}

export async function listPlans(secretKey: string): Promise<PlanResponse[]> {
  return paystackRequest<PlanResponse[]>(secretKey, "GET", "/plan");
}

export async function disableSubscription(
  secretKey: string,
  code: string,
  token: string
): Promise<void> {
  await paystackRequest(secretKey, "POST", "/subscription/disable", {
    code,
    token,
  });
}
