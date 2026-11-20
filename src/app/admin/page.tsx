import { notFound } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/catalog";
import InvoiceButton from "./InvoiceButton";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function Admin() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.email)) notFound();
  const [orders, consultations, users] = await Promise.all([
    prisma.order.findMany({ where: { status: "paid" }, orderBy: { createdAt: "desc" }, take: 50, include: { user: true } }),
    prisma.consultation.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.user.count(),
  ]);
  const revenue = orders.reduce((s, o) => s + o.amountTotal, 0);
  const defaultPrice = Number(process.env.STYLING_CONSULTATION_CENTS || 25000);
  return (
    <div className="wrap section">
      <h1>Admin</h1>
      <div className="stats">
        <div><span>Customers</span><strong>{users}</strong></div>
        <div><span>Paid orders (last 50)</span><strong>{orders.length}</strong></div>
        <div><span>Revenue (last 50)</span><strong>{formatPrice(revenue)}</strong></div>
      </div>

      <h2>Consultation requests</h2>
      <table className="table">
        <thead><tr><th>Requested</th><th>Client</th><th>Preferred</th><th>Notes</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {consultations.map((c) => (
            <tr key={c.id}>
              <td>{c.createdAt.toLocaleDateString()}</td>
              <td>{c.name}<br /><span className="muted small">{c.email}</span></td>
              <td>{c.preferredDate}</td>
              <td className="small">{c.notes}</td>
              <td><span className={`status ${c.status}`}>{c.status}</span></td>
              <td>{c.status === "requested" ? <InvoiceButton id={c.id} defaultDollars={defaultPrice / 100} /> : c.invoiceUrl ? <a href={c.invoiceUrl} target="_blank" rel="noreferrer">Invoice</a> : null}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Recent paid orders</h2>
      <table className="table">
        <thead><tr><th>Date</th><th>Customer</th><th>Ship to</th><th>Tax</th><th>Total</th><th></th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.createdAt.toLocaleDateString()}</td>
              <td>{o.user?.name ?? "—"}<br /><span className="muted small">{o.user?.email}</span></td>
              <td className="small pre">{o.shippingName}{o.shippingAddress ? `\n${o.shippingAddress}` : ""}</td>
              <td>{formatPrice(o.amountTax)}</td>
              <td><strong>{formatPrice(o.amountTotal)}</strong></td>
              <td>{o.invoiceUrl && <a href={o.invoiceUrl} target="_blank" rel="noreferrer">Invoice</a>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
