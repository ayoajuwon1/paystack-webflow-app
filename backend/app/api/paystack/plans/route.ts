import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/app/lib/db";
import { eq } from "drizzle-orm";
import { decrypt } from "@/app/lib/crypto";
import { createPlan, listPlans } from "@/app/lib/paystack/plans";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { siteId, name, interval, amount, currency } = body;

  if (!siteId || !name || !interval || !amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const merchant = await getDb()
    .select()
    .from(schema.merchants)
    .where(eq(schema.merchants.webflowSiteId, siteId))
    .limit(1);

  if (merchant.length === 0 || !merchant[0].paystackSecretKey) {
    return NextResponse.json({ error: "Merchant not configured" }, { status: 404 });
  }

  try {
    const secretKey = decrypt(merchant[0].paystackSecretKey);
    const plan = await createPlan(secretKey, {
      name,
      interval,
      amount,
      currency: currency || "NGN",
    });

    // Store in DB
    await getDb().insert(schema.plans).values({
      merchantId: merchant[0].id,
      planCode: plan.plan_code,
      name: plan.name,
      interval: plan.interval,
      amount: plan.amount,
      currency: plan.currency,
    });

    return NextResponse.json(plan);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create plan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get("siteId");
  if (!siteId) {
    return NextResponse.json({ error: "Missing siteId" }, { status: 400 });
  }

  const merchant = await getDb()
    .select()
    .from(schema.merchants)
    .where(eq(schema.merchants.webflowSiteId, siteId))
    .limit(1);

  if (merchant.length === 0 || !merchant[0].paystackSecretKey) {
    return NextResponse.json({ error: "Merchant not configured" }, { status: 404 });
  }

  try {
    const secretKey = decrypt(merchant[0].paystackSecretKey);
    const plans = await listPlans(secretKey);
    return NextResponse.json(plans);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list plans";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
