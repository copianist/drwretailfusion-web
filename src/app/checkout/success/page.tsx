import Link from "next/link";
import { getStripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/catalog";
import ClearCart from "./ClearCart";

export const metadata = { title: "Thank you" };
export const dynamic = "force-dynamic";

// Display only — orders are fulfilled by the Stripe webhook, not by this page.
export default async function Success({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  const user = await getCurrentUser();
  let total: string | null = null;
  let email: string | null = null;
  if (session_id && user) {
    try {
      const s = await getStripe().checkout.sessions.retrieve(session_id);
      if (s.metadata?.userId === user.id) {
        total = formatPrice(s.amount_total ?? 0, s.currency ?? "usd");
        email = s.customer_details?.email ?? null;
      }
    } catch {}
  }
  return (
    <div className="wrap section narrow center">
      <ClearCart />
      <p className="eyebrow">Order confirmed</p>
      <h1>Thank you{user ? `, ${user.name.split(" ")[0]}` : ""}.</h1>
      <p>
        {total ? <>Your payment of <strong>{total}</strong> was received. </> : null}
        {email ? <>A receipt and invoice are on their way to {email}. </> : null}
        Your stylist will reach out to schedule a complimentary fit check once your order arrives.
      </p>
      <div className="row center">
        <Link href="/account" className="btn primary">View orders & invoices</Link>
        <Link href="/shop" className="btn">Continue shopping</Link>
      </div>
    </div>
  );
}
