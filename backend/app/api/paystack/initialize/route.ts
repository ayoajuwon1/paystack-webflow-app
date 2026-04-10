import { NextRequest } from "next/server";
import { getDb, schema } from "@/app/lib/db";
import { eq } from "drizzle-orm";
import { decrypt } from "@/app/lib/crypto";
import { initializeTransaction } from "@/app/lib/paystack/transactions";
import { corsResponse, jsonWithCors } from "@/app/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return corsResponse(req.headers.get("origin"));
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");

  try {
    const body = await req.json();
    const { siteId, amount, email, currency, channels, plan, subaccount, split_code, metadata } =
      body;

    if (!siteId || !email) {
      return jsonWithCors({ error: "Missing required fields" }, origin, 400);
    }

    // Look up merchant
    const merchant = await getDb()
      .select()
      .from(schema.merchants)
      .where(eq(schema.merchants.webflowSiteId, siteId))
      .limit(1);

    if (merchant.length === 0) {
      return jsonWithCors({ error: "Merchant not found" }, origin, 404);
    }

    const m = merchant[0];
    if (!m.paystackSecretKey) {
      return jsonWithCors({ error: "Paystack not configured" }, origin, 400);
    }

    const secretKey = decrypt(m.paystackSecretKey);

    // Initialize transaction with Paystack
    const result = await initializeTransaction(secretKey, {
      amount,
      email,
      currency: currency || "NGN",
      channels,
      plan: plan || undefined,
      subaccount: subaccount || undefined,
      split_code: split_code || undefined,
      metadata: {
        ...metadata,
        site_id: siteId, // Critical for webhook routing
      },
    });

    // Store pending transaction
    await getDb().insert(schema.transactions).values({
      merchantId: m.id,
      reference: result.reference,
      amount: amount || 0,
      currency: currency || "NGN",
      email,
      status: "pending",
      metadata: { site_id: siteId, ...metadata },
    });

    return jsonWithCors(
      {
        access_code: result.access_code,
        reference: result.reference,
        authorization_url: result.authorization_url,
      },
      origin
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return jsonWithCors({ error: message }, origin, 500);
  }
}
