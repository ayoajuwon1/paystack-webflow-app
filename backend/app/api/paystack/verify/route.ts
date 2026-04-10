import { NextRequest } from "next/server";
import { getDb, schema } from "@/app/lib/db";
import { eq } from "drizzle-orm";
import { decrypt } from "@/app/lib/crypto";
import { verifyTransaction } from "@/app/lib/paystack/transactions";
import { corsResponse, jsonWithCors } from "@/app/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return corsResponse(req.headers.get("origin"));
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");
  const reference = req.nextUrl.searchParams.get("reference");
  const siteId = req.nextUrl.searchParams.get("siteId");

  if (!reference || !siteId) {
    return jsonWithCors({ error: "Missing reference or siteId" }, origin, 400);
  }

  try {
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
    const result = await verifyTransaction(secretKey, reference);

    // Update transaction in DB
    await getDb()
      .update(schema.transactions)
      .set({
        status: result.status === "success" ? "success" : "failed",
        channel: result.channel,
        paidAt: result.paid_at ? new Date(result.paid_at) : null,
      })
      .where(eq(schema.transactions.reference, reference));

    return jsonWithCors(
      {
        status: result.status,
        reference: result.reference,
        amount: result.amount,
        currency: result.currency,
        channel: result.channel,
      },
      origin
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    return jsonWithCors({ error: message }, origin, 500);
  }
}
