"use client";
import { useState } from "react";
import { useCart } from "./CartProvider";

export default function AddToBag({ productId, sizes, stock }: { productId: string; sizes: string[]; stock: number }) {
  const { add } = useCart();
  const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : "");
  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="addtobag">
      <div className="label">Size</div>
      <div className="sizes">
        {sizes.map((s) => (
          <button key={s} type="button" className={`size ${size === s ? "on" : ""}`} onClick={() => setSize(s)} aria-pressed={size === s}>
            {s}
          </button>
        ))}
      </div>
      <button
        className="btn primary wide"
        disabled={!size || stock < 1}
        onClick={() => {
          add({ productId, size, quantity: 1 });
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
        }}
      >
        {stock < 1 ? "Sold out" : !size ? "Select a size" : added ? "Added to bag ✓" : "Add to bag"}
      </button>
      <button
        className="btn wide buynow"
        disabled={!size || stock < 1 || buying}
        onClick={async () => {
          setBuying(true);
          setError("");
          const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: [{ productId, size, quantity: 1 }] }),
          });
          const data = await res.json().catch(() => ({}));
          if (data.url) window.location.href = data.url; // Stripe-hosted Checkout
          else if (data.login) window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
          else { setError(data.error || "Checkout failed"); setBuying(false); }
        }}
      >
        {buying ? "Opening secure checkout…" : "Buy now"}
      </button>
      {error && <p className="error small">{error}</p>}
      {stock > 0 && stock <= 3 && <p className="muted small">Only {stock} left</p>}
    </div>
  );
}
