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

    // Parameters configured in Stripe Checkout Studio (see STRIPE_INTEGRATION_TODO.md).
    const session = await stripe.checkout.sessions.create({
      ui_mode: "hosted_page",
      mode: "payment",
      line_items: lineItems,
      billing_address_collection: "auto",
      phone_number_collection: { enabled: false },
      automatic_tax: { enabled: false },
      allow_promotion_codes: false,
      submit_type: "auto",
      integration_identifier: "hosted_web_0001",
      origin_context: "web",
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
