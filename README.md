# Paystack Payments for Webflow

Accept payments on your Webflow site with Paystack. Supports cards, bank transfers, USSD, mobile money, QR codes, and more.

**Open source. No middleman. Your keys, your control.**

## Why This Exists

Webflow's native payment integrations only support Stripe and PayPal — neither works well for naira transactions in Nigeria. Paystack is the dominant payment processor in Africa, but there's no Paystack integration in the Webflow Marketplace.

This app fills that gap.

## Two Modes

### Mode 1: Client-Side (Default)

Zero backend. Zero trust. Just your Paystack **public key**.

- Install the app from the Webflow Marketplace
- Enter your Paystack public key
- Configure payment buttons in the Webflow Designer
- The app injects a lightweight checkout script into your published site
- Customers pay via Paystack's popup — you verify in your Paystack Dashboard

**No server needed. No data shared with anyone.**

### Mode 2: Self-Hosted Backend

For power users who want server-side verification, webhooks, and transaction history. You deploy the open-source backend to **your own** Vercel account. Your Paystack secret key stays on your server.

Additional features:
- Server-side transaction initialization and verification
- Webhook processing with HMAC SHA512 signature verification
- Transaction history stored in your database
- Programmatic plan, subscription, and split management

## Features

| Feature | Mode 1 | Mode 2 |
|---------|--------|--------|
| One-time payments | Yes | Yes |
| Subscriptions (recurring) | Yes (paste plan code) | Yes (create from UI) |
| Split payments | Yes (paste split code) | Yes (create from UI) |
| Payment page links | Yes | Yes |
| All payment channels | Yes | Yes |
| Multi-currency (NGN, GHS, KES, ZAR, USD) | Yes | Yes |
| Inline popup checkout | Yes | Yes |
| Server-side verification | No | Yes |
| Webhooks | No | Yes |
| Transaction history | No | Yes |

## Quick Start — Mode 1

### 1. Install the App

Install from the Webflow Marketplace (or run the Designer Extension locally for development).

### 2. Get Your Paystack Public Key

1. Log in to [dashboard.paystack.com](https://dashboard.paystack.com)
2. Go to **Settings** > **API Keys & Webhooks**
3. Copy your **Public Key** (`pk_test_...` for testing, `pk_live_...` for production)

### 3. Configure a Payment

1. Open your site in the Webflow Designer
2. Launch the Paystack Payments app (press `E` to open the apps panel)
3. Enter your public key
4. Select a payment type (One-time, Subscription, or Split)
5. Configure amount, currency, channels, and success URL
6. Select a button element on your page
7. Click "Apply to Page"
8. Publish your site

### 4. Test

Visit your published site and click the payment button. In test mode (`pk_test_`), use Paystack's [test cards](https://paystack.com/docs/payments/test-payments/).

## Quick Start — Mode 2 (Self-Hosted Backend)

### 1. Clone and Deploy

```bash
git clone https://github.com/AyoAkin/paystack-webflow-app.git
cd paystack-webflow-app/backend
```

### 2. Set Up Neon Postgres

```bash
# From your Vercel project
vercel integration add neon
vercel env pull .env.local
```

### 3. Configure Environment Variables

```bash
vercel env add WEBFLOW_CLIENT_ID
vercel env add WEBFLOW_CLIENT_SECRET
vercel env add ENCRYPTION_KEY       # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
vercel env add NEXT_PUBLIC_APP_URL   # Your deployed URL
```

### 4. Run Database Migrations

```bash
npx drizzle-kit push
```

### 5. Deploy

```bash
vercel deploy --prod
```

### 6. Connect the Designer Extension

In the Webflow Designer, choose "Self-Hosted Backend" mode and enter your deployed backend URL.

## Development

### Prerequisites

- Node.js 20+
- npm 10+
- A [Webflow](https://webflow.com) account with a test site
- A [Paystack](https://paystack.com) account

### Designer Extension (Mode 1)

```bash
cd designer-extension
npm install
npm run dev
```

Open `http://localhost:1337` to see the extension UI. To test inside Webflow, you need to [register a Webflow App](https://developers.webflow.com/apps/data/docs/register-an-app) and install it on your test site.

### Backend (Mode 2)

```bash
cd backend
cp .env.example .env.local
# Fill in your environment variables
npm install
npm run dev
```

The backend runs on `http://localhost:3000`.

## Architecture

```
Webflow Designer                    Your Vercel (Mode 2)        Paystack
+-------------------+              +--------------------+     +---------+
| Designer Extension|----HTTP----->| /api/paystack/*    |---->| API     |
| (React iframe)    |              | /api/webhooks/*    |<----| Webhook |
+-------------------+              | /api/scripts/*     |     +---------+
                                   +--------------------+
Live Webflow Site                         ^
+-------------------+                     |
| Injected script   |----fetch-----------+  (Mode 2)
| + Paystack popup  |----direct---------→ Paystack CDN  (Mode 1)
+-------------------+
```

## Security

- **Mode 1**: Only the public key is used. Card data never touches any server — Paystack's popup handles everything. PCI-SAQ-A compliant.
- **Mode 2**: Secret keys are encrypted with AES-256-GCM before database storage. Webhooks are verified with HMAC SHA512. CORS is validated against registered domains.

## API Routes (Mode 2)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth` | GET | Get Webflow OAuth URL |
| `/api/auth/callback` | GET | OAuth callback |
| `/api/auth/token` | POST | Exchange/refresh tokens |
| `/api/paystack/keys` | GET/POST | Manage Paystack API keys |
| `/api/paystack/initialize` | POST | Initialize a transaction |
| `/api/paystack/verify` | GET | Verify a transaction |
| `/api/paystack/plans` | GET/POST | Manage subscription plans |
| `/api/paystack/subscriptions` | GET | List subscriptions |
| `/api/paystack/subaccounts` | GET/POST | Manage subaccounts |
| `/api/paystack/splits` | GET/POST | Manage transaction splits |
| `/api/webhooks/paystack` | POST | Receive Paystack webhooks |
| `/api/config` | GET/POST | Payment configurations |
| `/api/scripts/register` | POST | Register script to Webflow site |
| `/api/scripts/apply` | POST | Apply script to Webflow page |
| `/api/scripts/remove` | DELETE | Remove script from site |

## License

MIT
