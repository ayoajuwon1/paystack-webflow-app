import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/app/lib/db";
import { eq } from "drizzle-orm";
import { decrypt } from "@/app/lib/crypto";
import { verifyWebhookSignature, type WebhookEvent } from "@/app/lib/paystack/webhook";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  let event: WebhookEvent;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Extract siteId from metadata for merchant lookup
  const siteId = event.data?.metadata?.site_id as string | undefined;
  if (!siteId) {
    console.error("Webhook missing site_id in metadata");
    return NextResponse.json({ error: "Missing site_id" }, { status: 400 });
  }

  // Look up merchant and verify signature
  const merchant = await getDb()
    .select()
    .from(schema.merchants)
    .where(eq(schema.merchants.webflowSiteId, siteId))
    .limit(1);

  if (merchant.length === 0) {
    return NextResponse.json({ error: "Unknown merchant" }, { status: 404 });
  }

  const m = merchant[0];
  if (!m.paystackSecretKey) {
    return NextResponse.json({ error: "Not configured" }, { status: 400 });
  }

  const secretKey = decrypt(m.paystackSecretKey);
  if (!verifyWebhookSignature(body, signature, secretKey)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Process events idempotently
  try {
    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(m.id, event);
        break;
      case "subscription.create":
        await handleSubscriptionCreate(m.id, event);
        break;
      case "subscription.disable":
        await handleSubscriptionDisable(event);
        break;
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }
  } catch (err) {
    console.error(`Webhook processing error: ${err}`);
  }

  return NextResponse.json({ received: true });
}

async function handleChargeSuccess(merchantId: string, event: WebhookEvent) {
  const { reference, amount, currency, channel, paid_at, customer } = event.data;
  if (!reference) return;

  // Upsert: update if exists, insert if not
  const existing = await getDb()
    .select()
    .from(schema.transactions)
    .where(eq(schema.transactions.reference, reference))
    .limit(1);

  if (existing.length > 0) {
    await getDb()
      .update(schema.transactions)
      .set({
        status: "success",
        channel: channel || null,
        paidAt: paid_at ? new Date(paid_at) : new Date(),
      })
      .where(eq(schema.transactions.reference, reference));
  } else {
    await getDb().insert(schema.transactions).values({
      merchantId,
      reference,
      amount: amount || 0,
      currency: currency || "NGN",
      email: customer?.email || "unknown",
      status: "success",
      channel: channel || null,
      paidAt: paid_at ? new Date(paid_at) : new Date(),
      metadata: event.data.metadata || {},
    });
  }
}

async function handleSubscriptionCreate(
  merchantId: string,
  event: WebhookEvent
) {
  const { subscription_code, plan, customer, next_payment_date } = event.data;
  if (!subscription_code || !plan?.plan_code) return;

  const existing = await getDb()
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.subscriptionCode, subscription_code))
    .limit(1);

  if (existing.length === 0) {
    await getDb().insert(schema.subscriptions).values({
      merchantId,
      subscriptionCode: subscription_code,
      planCode: plan.plan_code,
      customerEmail: customer?.email || "unknown",
      status: "active",
      nextPaymentDate: next_payment_date
        ? new Date(next_payment_date)
        : null,
    });
  }
}

async function handleSubscriptionDisable(event: WebhookEvent) {
  const { subscription_code } = event.data;
  if (!subscription_code) return;

  await getDb()
    .update(schema.subscriptions)
    .set({ status: "cancelled" })
    .where(eq(schema.subscriptions.subscriptionCode, subscription_code));
}
