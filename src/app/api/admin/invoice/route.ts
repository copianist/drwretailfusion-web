import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getStripe, taxCode } from "@/lib/stripe";
import { ensureStripeCustomer } from "@/lib/customers";

const schema = z.object({
  consultationId: z.string(),
  amountCents: z.number().int().min(100).max(5_000_000).optional(),
  description: z.string().trim().max(300).optional(),
});

const STYLING_PRODUCT_ID = "drw_styling_consultation";

/** Stripe Invoicing: bill a client for a styling consultation (sent by email, pay online). */
export async function POST(req: Request) {
  const admin = await getCurrentUser();
  if (!admin || !isAdmin(admin.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const c = await prisma.consultation.findUnique({ where: { id: parsed.data.consultationId }, include: { user: true } });
  if (!c) return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
  if (c.stripeInvoiceId) return NextResponse.json({ error: "Already invoiced", url: c.invoiceUrl }, { status: 409 });

  const amount = parsed.data.amountCents ?? Number(process.env.STYLING_CONSULTATION_CENTS || 25000);
  const stripe = getStripe();

  try {
    // Customer: reuse the account's Stripe customer, or create one for guests.
    let customerId: string;
    if (c.user) customerId = await ensureStripeCustomer(c.user);
    else {
      const existing = await stripe.customers.list({ email: c.email, limit: 1 });
      customerId = existing.data[0]?.id ?? (await stripe.customers.create({ email: c.email, name: c.name })).id;
    }

    // One reusable Product for consultations (carries the tax code for Stripe Tax).
    try {
      await stripe.products.retrieve(STYLING_PRODUCT_ID);
    } catch {
      await stripe.products.create({ id: STYLING_PRODUCT_ID, name: "One-on-one styling consultation", tax_code: taxCode("styling") });
    }

    const invoice = await stripe.invoices.create(
      {
        customer: customerId,
        collection_method: "send_invoice",
        days_until_due: 7,
        automatic_tax: { enabled: true },
        description: parsed.data.description || `Styling consultation — ${c.preferredDate}`,
        footer: "DRW Retail Fusion LLC · drwretailfusion.com",
        metadata: { consultationId: c.id },
      },
      { idempotencyKey: `consult-invoice-${c.id}` }
    );
    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      price_data: { currency: "usd", product: STYLING_PRODUCT_ID, unit_amount: amount, tax_behavior: "exclusive" },
      description: `One-on-one styling consultation (${c.preferredDate})`,
    });
    const finalized = await stripe.invoices.finalizeInvoice(invoice.id!);
    await stripe.invoices.sendInvoice(finalized.id!);

    await prisma.consultation.update({
      where: { id: c.id },
      data: { status: "invoiced", stripeInvoiceId: finalized.id, invoiceUrl: finalized.hosted_invoice_url, amount },
    });
    return NextResponse.json({ ok: true, url: finalized.hosted_invoice_url });
  } catch (err) {
    console.error("invoice error", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Invoice failed" }, { status: 500 });
  }
}
