"use client";
import { useCart } from "./CartProvider";
export default function CartCount() {
  const { count } = useCart();
  return <span className="badge" aria-label={`${count} items in bag`}>{count}</span>;
}
