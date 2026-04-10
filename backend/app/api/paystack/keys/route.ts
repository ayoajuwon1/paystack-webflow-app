import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/app/lib/db";
import { eq } from "drizzle-orm";
import { encrypt } from "@/app/lib/crypto";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { siteId, publicKey, secretKey } = body;

  if (!siteId || !publicKey || !secretKey) {
    return NextResponse.json(
      { error: "Missing siteId, publicKey, or secretKey" },
      { status: 400 }
    );
  }

  // Validate key format
  if (!/^pk_(test|live)_[a-zA-Z0-9]+$/.test(publicKey)) {
    return NextResponse.json({ error: "Invalid public key format" }, { status: 400 });
  }
  if (!/^sk_(test|live)_[a-zA-Z0-9]+$/.test(secretKey)) {
    return NextResponse.json({ error: "Invalid secret key format" }, { status: 400 });
  }

  const isLive = publicKey.startsWith("pk_live_");
  const encryptedSecret = encrypt(secretKey);

  const merchant = await getDb()
    .select()
    .from(schema.merchants)
    .where(eq(schema.merchants.webflowSiteId, siteId))
    .limit(1);

  if (merchant.length === 0) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  await getDb()
    .update(schema.merchants)
    .set({
      paystackPublicKey: publicKey,
      paystackSecretKey: encryptedSecret,
      isLive,
      updatedAt: new Date(),
    })
    .where(eq(schema.merchants.id, merchant[0].id));

  return NextResponse.json({ success: true, isLive });
}

export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get("siteId");
  if (!siteId) {
    return NextResponse.json({ error: "Missing siteId" }, { status: 400 });
  }

  const merchant = await getDb()
    .select({
      publicKey: schema.merchants.paystackPublicKey,
      isLive: schema.merchants.isLive,
    })
    .from(schema.merchants)
    .where(eq(schema.merchants.webflowSiteId, siteId))
    .limit(1);

  if (merchant.length === 0) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  return NextResponse.json({
    publicKey: merchant[0].publicKey,
    isLive: merchant[0].isLive,
    hasSecretKey: true,
  });
}
