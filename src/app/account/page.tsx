import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/catalog";

export const metadata = { title: "Your account" };
export const dynamic = "force-dynamic";

type Item = { name: string; size?: string; quantity: number; unitAmount: number };

export default async function Account() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const [orders, consultations] = await Promise.all([
    prisma.order.findMany({ where: { userId: user.id, status: { in: ["paid", "failed"] } }, orderBy: { createdAt: "desc" } }),
    prisma.consultation.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);
  return (
    <div className="wrap section">
      <h1>Hello, {user.name.split(" ")[0]}</h1>
      <p className="muted">{user.email}</p>

      <h2>Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet. <Link href="/shop">Browse the collection</Link></p>
      ) : (
        <div className="orders">
          {orders.map((o) => {
            const items = JSON.parse(o.items) as Item[];
            return (
              <div className="order" key={o.id}>
                <div className="order-head">
                  <div><strong>{o.createdAt.toLocaleDateString("en-US", { dateStyle: "medium" })}</strong> · <span className={`status ${o.status}`}>{o.status}</span></div>
                  <div><strong>{formatPrice(o.amountTotal, o.currency)}</strong></div>
                </div>
                <ul>{items.map((i, n) => <li key={n}>{i.quantity} × {i.name}{i.size ? ` (size ${i.size})` : ""}</li>)}</ul>
                <div className="muted small">Subtotal {formatPrice(o.amountSubtotal)} · Tax {formatPrice(o.amountTax)} · Delivery {formatPrice(o.amountShipping)}</div>
                <div className="row small">
                  {o.invoiceUrl && <a href={o.invoiceUrl} target="_blank" rel="noreferrer">View invoice</a>}
                  {o.invoicePdf && <a href={o.invoicePdf} target="_blank" rel="noreferrer">Download PDF</a>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h2>Styling consultations</h2>
      {consultations.length === 0 ? (
        <p><Link href="/styling">Book your first consultation</Link></p>
      ) : (
        <div className="orders">
          {consultations.map((c) => (
            <div className="order" key={c.id}>
              <div className="order-head">
                <div><strong>{c.preferredDate}</strong> · <span className={`status ${c.status}`}>{c.status}</span></div>
                {c.amount ? <strong>{formatPrice(c.amount)}</strong> : null}
              </div>
              {c.invoiceUrl && c.status === "invoiced" && <a href={c.invoiceUrl} target="_blank" rel="noreferrer" className="btn primary">Pay invoice</a>}
              {c.invoiceUrl && c.status === "paid" && <a href={c.invoiceUrl} target="_blank" rel="noreferrer">View paid invoice</a>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
