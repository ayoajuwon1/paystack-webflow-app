import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const paymentTypeEnum = pgEnum("payment_type", [
  "one_time",
  "subscription",
  "split",
  "payment_page",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "success",
  "failed",
  "abandoned",
]);

export const merchants = pgTable("merchants", {
  id: uuid("id").primaryKey().defaultRandom(),
  webflowSiteId: varchar("webflow_site_id", { length: 255 }).unique().notNull(),
  webflowUserId: varchar("webflow_user_id", { length: 255 }).notNull(),
  webflowAccessToken: text("webflow_access_token").notNull(), // encrypted
  paystackPublicKey: varchar("paystack_public_key", { length: 255 }),
  paystackSecretKey: text("paystack_secret_key"), // encrypted with AES-256-GCM
  isLive: boolean("is_live").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentConfigs = pgTable("payment_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id")
    .references(() => merchants.id)
    .notNull(),
  pageId: varchar("page_id", { length: 255 }).notNull(),
  paymentType: paymentTypeEnum("payment_type").notNull(),
  label: varchar("label", { length: 255 }),
  amount: integer("amount"), // smallest currency unit
  currency: varchar("currency", { length: 3 }).default("NGN"),
  planCode: varchar("plan_code", { length: 255 }),
  splitCode: varchar("split_code", { length: 255 }),
  subaccountCode: varchar("subaccount_code", { length: 255 }),
  channels: jsonb("channels").$type<string[]>(),
  metadata: jsonb("metadata").$type<Record<string, string>>(),
  buttonStyle: jsonb("button_style").$type<Record<string, string>>(),
  successUrl: varchar("success_url", { length: 1024 }),
  scriptId: varchar("script_id", { length: 255 }),
  scriptVersion: varchar("script_version", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id")
    .references(() => merchants.id)
    .notNull(),
  configId: uuid("config_id").references(() => paymentConfigs.id),
  reference: varchar("reference", { length: 255 }).unique().notNull(),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  status: transactionStatusEnum("status").default("pending").notNull(),
  channel: varchar("channel", { length: 50 }),
  paidAt: timestamp("paid_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id")
    .references(() => merchants.id)
    .notNull(),
  subscriptionCode: varchar("subscription_code", { length: 255 }).unique().notNull(),
  planCode: varchar("plan_code", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  nextPaymentDate: timestamp("next_payment_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id")
    .references(() => merchants.id)
    .notNull(),
  planCode: varchar("plan_code", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  interval: varchar("interval", { length: 50 }).notNull(),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
