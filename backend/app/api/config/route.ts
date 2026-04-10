import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/app/lib/db";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    siteId,
    pageId,
    paymentType,
    label,
    amount,
    currency,
    planCode,
    splitCode,
    subaccountCode,
    channels,
    metadata,
    buttonStyle,
    successUrl,
  } = body;

  if (!siteId || !pageId || !paymentType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const merchant = await getDb()
    .select()
    .from(schema.merchants)
    .where(eq(schema.merchants.webflowSiteId, siteId))
    .limit(1);

  if (merchant.length === 0) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  const config = await getDb()
    .insert(schema.paymentConfigs)
    .values({
      merchantId: merchant[0].id,
      pageId,
      paymentType,
      label,
      amount,
      currency: currency || "NGN",
      planCode,
      splitCode,
      subaccountCode,
      channels,
      metadata,
      buttonStyle,
      successUrl,
    })
    .returning();

  return NextResponse.json(config[0]);
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

  if (merchant.length === 0) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  const configs = await getDb()
    .select()
    .from(schema.paymentConfigs)
    .where(
      and(
        eq(schema.paymentConfigs.merchantId, merchant[0].id),
        eq(schema.paymentConfigs.isActive, true)
      )
    );

  // Also get recent transactions
  const txns = await getDb()
    .select()
    .from(schema.transactions)
    .where(eq(schema.transactions.merchantId, merchant[0].id))
    .limit(50);

  return NextResponse.json({ configs, transactions: txns });
}
