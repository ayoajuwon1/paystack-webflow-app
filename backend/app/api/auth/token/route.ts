import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/app/lib/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { siteId, userId } = body;

  if (!siteId || !userId) {
    return NextResponse.json(
      { error: "Missing siteId or userId" },
      { status: 400 }
    );
  }

  // Update the merchant's siteId if they authenticated with a placeholder
  const merchant = await getDb()
    .select()
    .from(schema.merchants)
    .where(eq(schema.merchants.webflowUserId, userId))
    .limit(1);

  if (merchant.length === 0) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const m = merchant[0];

  // Update siteId if it was a placeholder
  if (m.webflowSiteId.startsWith("pending_")) {
    await getDb()
      .update(schema.merchants)
      .set({ webflowSiteId: siteId, updatedAt: new Date() })
      .where(eq(schema.merchants.id, m.id));
  }

  return NextResponse.json({
    authenticated: true,
    siteId: siteId,
    hasPaystackKeys: !!m.paystackPublicKey,
  });
}
