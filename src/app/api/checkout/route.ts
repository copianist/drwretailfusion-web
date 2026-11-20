import { NextResponse } from "next/server";
import { z } from "zod";
import type Stripe from "stripe";
import { getCurrentUser } from "@/lib/auth";
import { ensureStripeCustomer } from "@/lib/customers";
import { getProduct } from "@/lib/catalog";
import { getStripe, integrationIdentifier, siteUrl, taxCode } from "@/lib/stripe";
import { prisma } from "@/lib/db";

const schema = z.object({
  items: z
    .array(z.object({ productId: z.string(), size: z.string().max(20), quantity: z.number().int().min(1).max(5) }))
    .min(1)
    .max(30),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to check out.", login: true }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Your bag is empty or invalid." }, { status: 400 });

  // Prices always come from the server-side catalog — never from the browser.
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const orderItems = [];
  for (const item of parsed.data.items) {
    const p = getProduct(item.productId);
    if (!p || !p.sizes.includes(item.size)) {
      return NextResponse.json({ error: "One of the items in your bag is no longer available." }, { status: 400 });
    }
    lineItems.push({
      quantity: item.quantity,
      price_data: {
        currency: p.currency,
        unit_amount: p.price,
        tax_behavior: "exclusive",
        product_data: {
          name: `${p.brand} — ${p.name}`,
          description: `${p.color} · Size ${item.size}`,
          tax_code: taxCode("apparel"),
          metadata: { productId: p.id, size: item.size },
        },
      },
    });
    orderItems.push({ productId: p.id, name: `${p.brand} ${p.name}`, size: item.size, quantity: item.quantity, unitAmount: p.price });
  }

  try {
    const stripe = getStripe();
    const customer = await ensureStripeCustomer(user);
    const shipping = Number(process.env.SHIPPING_FLAT_CENTS || 0);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer,
      customer_update: { address: "auto", shipping: "auto", name: "auto" },
      line_items: lineItems,
      // Stripe Tax — only collects where you have an active registration (see README).
      automatic_tax: { enabled: true },
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["US", "CA"] },
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: shipping ? "Insured express delivery" : "Complimentary insured delivery",
            type: "fixed_amount",
            fixed_amount: { amount: shipping, currency: "usd" },
            tax_behavior: "exclusive",
            delivery_estimate: { minimum: { unit: "business_day", value: 2 }, maximum: { unit: "business_day", value: 5 } },
          },
        },
      ],
      // Stripe Invoicing — a paid invoice/receipt PDF is generated for every order.
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: "Thank you for shopping with DRW Retail Fusion.",
          footer: "DRW Retail Fusion LLC · drwretailfusion.com",
          metadata: { userId: user.id },
        },
      },
      allow_promotion_codes: true,
      phone_number_collection: { enabled: true },
      client_reference_id: user.id,
      metadata: { userId: user.id },
      integration_identifier: integrationIdentifier("shop"),
      success_url: `${siteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/cart`,
    });

    await prisma.order.create({
      data: {
        userId: user.id,
        stripeSessionId: session.id,
        items: JSON.stringify(orderItems),
        amountSubtotal: session.amount_subtotal ?? 0,
        amountTotal: session.amount_total ?? 0,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout error", err);
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: `We couldn't start checkout: ${message}` }, { status: 500 });
  }
}
