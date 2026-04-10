import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/app/lib/db";
import { eq } from "drizzle-orm";
import { decrypt } from "@/app/lib/crypto";
import { createSplit, listSplits } from "@/app/lib/paystack/splits";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { siteId, name, type, currency, subaccounts, bearer_type } = body;

  if (!siteId || !name || !type || !currency || !subaccounts) {
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
    const result = await createSplit(secretKey, {
      name,
      type,
      currency,
      subaccounts,
      bearer_type,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
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
    const results = await listSplits(secretKey);
    return NextResponse.json(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
