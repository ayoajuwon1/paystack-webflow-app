import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/app/lib/db";
import { eq } from "drizzle-orm";

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

  const subs = await getDb()
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.merchantId, merchant[0].id));

  return NextResponse.json(subs);
}
