"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import ProductArt from "@/components/ProductArt";

type Lite = { id: string; slug: string; name: string; brand: string; price: number; color: string; colorHex: string; art: string };
const fmt = (c: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(c / 100);

export default function CartView({ products, signedIn }: { products: Lite[]; signedIn: boolean }) {
  const { items, update, remove } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const map = new Map(products.map((p) => [p.id, p]));
  const lines = items.map((i) => ({ ...i, p: map.get(i.productId) })).filter((l) => l.p);
  const subtotal = lines.reduce((s, l) => s + l.p!.price * l.quantity, 0);

  async function checkout() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: lines.map(({ productId, size, quantity }) => ({ productId, size, quantity })) }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.url) window.location.href = data.url;
    else if (data.login) window.location.href = "/login?next=/cart";
    else { setError(data.error || "Checkout failed"); setBusy(false); }
  }

  if (!lines.length)
    return (
      <div className="wrap section narrow center">
        <h1>Your bag is empty</h1>
        <p className="muted">Discover 300 curated pieces from our partner ateliers.</p>
        <Link href="/shop" className="btn primary">Start shopping</Link>
      </div>
    );

  return (
    <div className="wrap section">
      <h1>Your bag</h1>
      <div className="cart">
        <div>
          {lines.map(({ p, size, quantity }) => (
            <div className="line" key={`${p!.id}-${size}`}>
              <Link href={`/product/${p!.slug}`} className="line-art"><ProductArt art={p!.art} color={p!.colorHex} label={p!.name} /></Link>
              <div className="line-info">
                <div className="brand">{p!.brand}</div>
                <Link href={`/product/${p!.slug}`} className="pname">{p!.name}</Link>
                <div className="muted small">{p!.color} · Size {size}</div>
                <div className="row">
                  <label className="small">Qty{" "}
                    <select value={quantity} onChange={(e) => update(p!.id, size, Number(e.target.value))}>
                      {[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}
                    </select>
                  </label>
                  <button className="linklike small" onClick={() => remove(p!.id, size)}>Remove</button>
                </div>
              </div>
              <div className="line-price">{fmt(p!.price * quantity)}</div>
            </div>
          ))}
        </div>
        <aside className="summary">
          <h3>Order summary</h3>
          <div className="sumrow"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
          <div className="sumrow muted"><span>Delivery</span><span>At checkout</span></div>
          <div className="sumrow muted"><span>Sales tax</span><span>At checkout</span></div>
          <button className="btn primary wide" onClick={checkout} disabled={busy}>
            {busy ? "Opening secure checkout…" : signedIn ? "Checkout securely" : "Sign in to checkout"}
          </button>
          {error && <p className="error">{error}</p>}
          <p className="muted small">Payments processed by Stripe. An itemised invoice is emailed with every order.</p>
        </aside>
      </div>
    </div>
  );
}
