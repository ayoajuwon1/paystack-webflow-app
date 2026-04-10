import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "./db";
import { eq } from "drizzle-orm";
import { decrypt } from "./crypto";

export interface AuthContext {
  merchantId: string;
  siteId: string;
  webflowToken: string;
}

export async function authenticateRequest(
  req: NextRequest
): Promise<AuthContext | NextResponse> {
  const siteId = req.headers.get("x-site-id");
  if (!siteId) {
    return NextResponse.json({ error: "Missing x-site-id header" }, { status: 401 });
  }

  const merchant = await getDb()
    .select()
    .from(schema.merchants)
    .where(eq(schema.merchants.webflowSiteId, siteId))
    .limit(1);

  if (merchant.length === 0) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  const m = merchant[0];
  let webflowToken: string;
  try {
    webflowToken = decrypt(m.webflowAccessToken);
  } catch {
    return NextResponse.json({ error: "Invalid merchant credentials" }, { status: 500 });
  }

  return {
    merchantId: m.id,
    siteId: m.webflowSiteId,
    webflowToken,
  };
}

export function getPaystackSecretKey(encryptedKey: string | null): string {
  if (!encryptedKey) throw new Error("Paystack secret key not configured");
  return decrypt(encryptedKey);
}
