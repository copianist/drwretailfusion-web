# DRW Retail Fusion — drwretailfusion.com

**Clothing · Accessories · Styling — Retail, fused with personal style.**

DRW Retail Fusion LLC pairs a curated clothing and accessories collection with one-on-one styling consultations — so every order fits your life, not just your size.

Full-stack store built with **Next.js 15 (App Router)**, **Prisma** (SQLite or MySQL) and **Stripe** (Payments, Tax and Invoicing).

## Features

| Area | What's included |
| --- | --- |
| Catalog | 300 pieces across 9 categories (outerwear, tailoring, dresses, knitwear, shirts, trousers, shoes, bags, accessories), $1,000–$1,995, with search, filters, sorting and pagination |
| Accounts | Sign up / sign in (bcrypt passwords, signed httpOnly session cookie), order history, invoice links |
| Bag | Saved in the browser; prices are always re-read from the server catalog at checkout |
| **Stripe Payments** | Stripe-hosted Checkout with dynamic payment methods (cards, Apple Pay, Google Pay, Link, …), promotion codes, shipping and phone collection |
| **Stripe Tax** | `automatic_tax` on every Checkout Session and invoice, tax-exclusive prices, configurable product tax codes |
| **Stripe Invoicing** | A paid invoice/receipt PDF is created for every order (`invoice_creation`); styling consultations are billed with emailed invoices from `/admin` |
| Webhooks | Signature-verified `/api/webhooks/stripe` fulfills orders (`checkout.session.completed`, `async_payment_succeeded/failed`, `expired`, `invoice.paid`, `invoice.voided`) |
| Styling | `/styling` booking form → admin sends a Stripe invoice → client pays online |
| Admin | `/admin` (emails listed in `ADMIN_EMAILS`): customers, revenue, paid orders with tax and ship-to address, consultation invoicing |

## Quick start (local)

```bash
npm install
cp .env.example .env        # then fill in the values (see below)
npx prisma db push          # creates the database tables
npm run dev                 # http://localhost:3000
```

In a second terminal, forward Stripe webhooks to your machine and copy the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET`:

```bash
stripe login
npm run stripe:listen
```

Test card: `4242 4242 4242 4242`, any future date, any CVC.

## Stripe setup checklist

1. **Use a sandbox while developing.** Dashboard → top-left account menu → *Sandboxes*. Copy its keys.
2. **Create a restricted key** (`rk_test_…`, safer than `sk_`): Developers → API keys → *Create restricted key* with **Write** on Checkout Sessions, Customers, Invoices, Invoice items, Products, Prices, and **Read** on Tax settings. Put it in `STRIPE_SECRET_KEY`.
3. **Turn on Stripe Tax** (Dashboard → Tax):
   - Set your **head office address** (tax status stays `pending` until you do).
   - Add a **registration** for every state/province where you must collect tax. ⚠️ Without an active registration Stripe collects **$0 tax** in that place and shows no error.
   - Choose product tax codes from <https://docs.stripe.com/tax/tax-codes> (search "clothing" and "personal services") and set `STRIPE_TAX_CODE_APPAREL` / `STRIPE_TAX_CODE_STYLING`, or set a preset tax code in Tax → Settings.
   - Verify with a test checkout to an address in a registered state. The tax line should show an amount, not "not collecting".
4. **Invoicing**: Settings → Billing → Invoices. Add your logo, brand colour and support email; turn on emailed invoices and receipts.
5. **Payment methods**: Settings → Payment methods. Turn on Apple Pay, Google Pay, Link, Klarna/Afterpay (popular for $1k+ fashion), etc. No code changes are needed.
6. **Production webhook**: Developers → Webhooks → *Add endpoint* `https://drwretailfusion.com/api/webhooks/stripe` with the events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `invoice.paid`, `invoice.voided`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
7. Before launch, work through Stripe's [go-live checklist](https://docs.stripe.com/get-started/checklist/go-live) and switch to live keys.

## Deploying on Hostinger

Hostinger's **Node.js Web Apps** (Business / Cloud plans) can deploy straight from this GitHub repo:

1. hPanel → **Websites → Add website → Node.js Apps** → *Import Git repository* → choose this repo, branch `main`.
2. Build settings: Framework **Next.js**, Node **20 or 22**, install `npm install`, build `npm run build`, start `npm start`.
3. Add environment variables (same as `.env.example`). Set `NEXT_PUBLIC_SITE_URL=https://drwretailfusion.com` and a fresh `AUTH_SECRET`.
4. Database: either keep SQLite (`DATABASE_URL="file:./prod.db"`) or, recommended, create a **MySQL database** in hPanel, change `provider = "mysql"` in `prisma/schema.prisma`, set `DATABASE_URL="mysql://USER:PASS@HOST:3306/DB"`, and run `npx prisma db push` once.
5. Point the `drwretailfusion.com` domain at the Node.js app, enable SSL, then add the production webhook (step 6 above).

> If your plan is shared/static hosting only (no Node.js), this app can't run there. Host it on a Node.js-capable plan, or on Vercel, and point the domain's DNS to it.

## Replacing the catalog

`src/data/products.json` is generated by `npm run catalog` (`scripts/generate-catalog.mjs`). The brand names are DRW house / partner labels and the artwork is generated vector art, so you can launch without third-party trademarks or photos. To sell your real inventory:

- Edit or replace `products.json` with your own items (same fields; `price` is in cents). Only list brands you're an authorised retailer for.
- To use real photos, add an `image` field and render it in `src/components/ProductCard.tsx` and the product page instead of `<ProductArt>`.

## Project structure

```
src/app/                 pages (shop, product, cart, account, styling, admin, auth)
src/app/api/checkout     creates Stripe Checkout Sessions (Tax + invoice creation)
src/app/api/webhooks/    Stripe webhook → order fulfillment
src/app/api/admin/       consultation invoices (Stripe Invoicing)
src/lib/                 stripe client, auth, db, catalog helpers
prisma/schema.prisma     User, Order, Consultation
scripts/                 catalog generator
```
