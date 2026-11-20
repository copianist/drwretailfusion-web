import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Fulfillment happens HERE, not on the success page. Handles:
 *  - checkout.session.completed / async_payment_succeeded (paid orders)
 *  - checkout.session.async_payment_failed / expired
 *  - invoice.paid / invoice.voided (styling consultation invoices)
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        if (session.payment_status !== "unpaid") await fulfillOrder(stripe, session.id);
        break;
      }
      case "checkout.session.async_payment_failed":
        await prisma.order.updateMany({ where: { stripeSessionId: event.data.object.id }, data: { status: "failed" } });
        break;
      case "checkout.session.expired":
        await prisma.order.updateMany({ where: { stripeSessionId: event.data.object.id, status: "pending" }, data: { status: "expired" } });
        break;
      case "invoice.paid": {
        const inv = event.data.object;
        if (inv.id) await prisma.consultation.updateMany({ where: { stripeInvoiceId: inv.id }, data: { status: "paid" } });
        break;
      }
      case "invoice.voided": {
        const inv = event.data.object;
        if (inv.id) await prisma.consultation.updateMany({ where: { stripeInvoiceId: inv.id }, data: { status: "void" } });
        break;
      }
    }
  } catch (err) {
    console.error(`Error handling ${event.type}`, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 }); // Stripe will retry
  }
  return NextResponse.json({ received: true });
}

async function fulfillOrder(stripe: Stripe, sessionId: string) {
  // Re-fetch so we always act on the latest state (idempotent: safe if the event repeats).
  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["invoice"] });
  if (session.payment_status === "unpaid") return;

  const invoice = session.invoice && typeof session.invoice !== "string" ? session.invoice : null;
  const ship = session.collected_information?.shipping_details;
  const addr = ship?.address;

  const data = {
    status: "paid",
    currency: session.currency ?? "usd",
    amountSubtotal: session.amount_subtotal ?? 0,
    amountTax: session.total_details?.amount_tax ?? 0,
    amountShipping: session.total_details?.amount_shipping ?? 0,
    amountTotal: session.amount_total ?? 0,
    invoiceId: invoice?.id ?? null,
    invoiceUrl: invoice?.hosted_invoice_url ?? null,
    invoicePdf: invoice?.invoice_pdf ?? null,
    shippingName: ship?.name ?? null,
    shippingAddress: addr
      ? [addr.line1, addr.line2, `${addr.city ?? ""}, ${addr.state ?? ""} ${addr.postal_code ?? ""}`, addr.country].filter(Boolean).join("\n")
      : null,
  };

  const existing = await prisma.order.findUnique({ where: { stripeSessionId: session.id } });
  if (existing) {
    if (existing.status === "paid" && existing.invoiceUrl) return; // already fulfilled
    await prisma.order.update({ where: { id: existing.id }, data });
  } else {
    const lines = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
    await prisma.order.create({
      data: {
        ...data,
        stripeSessionId: session.id,
        userId: session.metadata?.userId ?? null,
        items: JSON.stringify(lines.data.map((l) => ({ name: l.description, quantity: l.quantity, unitAmount: l.price?.unit_amount ?? 0 }))),
      },
    });
  }
  // TODO(fulfillment): notify the warehouse / stylist and send a confirmation email here.
}
