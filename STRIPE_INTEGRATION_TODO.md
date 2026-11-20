# Stripe Integration TODO

Integration type: **Hosted Stripe Checkout**. Customers are redirected to a Stripe-hosted payment page from the **Bag** (`/cart` → "Checkout securely") or from **Buy now** on any product page.

Scenario: **A**. An existing Checkout Session call was found and only its parameters were updated:
- [src/app/api/checkout/route.ts](src/app/api/checkout/route.ts) (the only `stripe.checkout.sessions.create` call in the codebase)

## Values to Replace

None of the `sample_only` parameters use placeholders. The existing real values were kept:

| Field | Current Value | Notes |
|-------|--------------|-------|
| mode | `payment` | Correct: clothing and accessories are one-time purchases. Use `subscription` only if you add recurring products. |
| success_url | `${NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}` | Set `NEXT_PUBLIC_SITE_URL` to `https://drwretailfusion.com` in production. |
| cancel_url | `${NEXT_PUBLIC_SITE_URL}/cart` | Same as above. |
| line_items | Built server-side from the catalog with inline `price_data` | Prices come from [src/data/products.json](src/data/products.json), so no Stripe Price IDs are needed. If you later create Products/Prices in the Dashboard, switch to `{ price: "price_…" }`. |

## Configured Parameters

These parameters were configured in Checkout Studio and are already set correctly.

**Files containing these parameters:**
- [src/app/api/checkout/route.ts](src/app/api/checkout/route.ts)

| Parameter | Value |
|-----------|-------|
| ui_mode | `hosted_page` (installed `stripe` SDK is 23.2.0, which is ≥ 21.0.0) |
| billing_address_collection | `auto` |
| phone_number_collection | `{ enabled: false }` |
| automatic_tax | `{ enabled: false }` |
| allow_promotion_codes | `false` |
| submit_type | `auto` |
| integration_identifier | `hosted_web_0001` |
| origin_context | `web` |
| payment_method_collection | *omitted*: applies only to `mode: "subscription"` |

### ⚠️ Removed parameters: decide whether to re-enable

These parameters were removed because Checkout Studio doesn't configure them. Removing them turned off features the store used before. Re-add them in Checkout Studio (or in the code) if you still want them:

| Removed | Effect of removal |
|---------|-------------------|
| `automatic_tax: { enabled: true }` → now `false` | **Stripe Tax no longer calculates sales tax** on store orders. Turn it back on if you must collect tax. |
| `shipping_address_collection`, `shipping_options` | **Checkout no longer asks for a delivery address.** A physical clothing store usually needs this. |
| `invoice_creation` | No Stripe invoice/receipt PDF per order. The "View invoice" links in `/account` and `/admin` stay empty. (Consultation invoices in `/admin` still work.) |
| `customer`, `customer_update` | Sessions are no longer linked to the signed-in user's Stripe Customer. Stripe creates a guest customer instead. |
| `metadata`, `client_reference_id` | The success page no longer shows the order total (it matched on `metadata.userId`). Orders are still linked to the user through the `Order` row created at checkout. |

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set:
   - `STRIPE_SECRET_KEY`: from <https://dashboard.stripe.com/test/apikeys>. A restricted key (`rk_test_…`) is preferred.
   - `STRIPE_WEBHOOK_SECRET`: from `npm run stripe:listen` (local) or Dashboard → Workbench → Webhooks (production, endpoint `https://drwretailfusion.com/api/webhooks/stripe`)
   - `NEXT_PUBLIC_SITE_URL`, `AUTH_SECRET`, `DATABASE_URL`
   - No publishable key is needed. Hosted Checkout redirects from the server.
3. `npx prisma db push`, then `npm run dev`
4. The Stripe client is created without an explicit API version ([src/lib/stripe.ts](src/lib/stripe.ts)), so it uses the SDK default.

## Project structure (files touched)

```
src/app/api/checkout/route.ts   Checkout Session parameters (Checkout Studio config)
src/components/AddToBag.tsx     "Buy now" quick-buy button → /api/checkout
src/app/globals.css             Buy now button spacing
STRIPE_INTEGRATION_TODO.md      this file
```

## How it works

1. A shopper clicks **Checkout securely** in the bag, or **Buy now** on a product page (it must be signed in; otherwise it's sent to `/login` and returned).
2. `POST /api/checkout` validates items against the server catalog, creates the Checkout Session and a pending `Order`, and returns `session.url`.
3. The browser redirects to the Stripe-hosted page.
4. Stripe sends `checkout.session.completed` to `/api/webhooks/stripe`, which verifies the signature and marks the order **paid**. Fulfillment happens there, not on the success page.
5. The customer lands on `/checkout/success`, and the order appears in `/account` and `/admin`.

## Testing

- Card `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP → success
- `4000 0025 0000 3155` → requires 3D Secure authentication
- `4000 0000 0000 9995` → declined (insufficient funds)
- Use test-mode / sandbox keys only. Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` so orders get marked paid locally.

## Next steps

- Re-enable tax, shipping address and invoices if needed (see the table above).
- Turn on payment methods (Apple Pay, Google Pay, Link, Klarna…) in Dashboard → Settings → Payment methods.
- Add order confirmation emails and stock decrements in the webhook handler (`TODO(fulfillment)` in [src/app/api/webhooks/stripe/route.ts](src/app/api/webhooks/stripe/route.ts)).
- Replace the sample catalog with your real inventory.

## Resources

- Stripe support: <https://support.stripe.com>
- Stripe MCP: <https://docs.stripe.com/mcp>
