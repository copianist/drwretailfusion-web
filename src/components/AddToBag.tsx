"use client";
import { useState } from "react";
import { useCart } from "./CartProvider";

export default function AddToBag({ productId, sizes, stock }: { productId: string; sizes: string[]; stock: number }) {
  const { add } = useCart();
  const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : "");
  const [added, setAdded] = useState(false);
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
      {stock > 0 && stock <= 3 && <p className="muted small">Only {stock} left</p>}
    </div>
  );
}
