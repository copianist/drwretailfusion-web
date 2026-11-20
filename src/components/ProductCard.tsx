import Link from "next/link";
import ProductArt from "./ProductArt";
import { formatPrice, type Product } from "@/lib/catalog";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/product/${p.slug}`} className="card">
      <div className="card-art">
        <ProductArt art={p.art} color={p.colorHex} label={`${p.name} in ${p.color}`} />
        {p.newArrival && <span className="tag">New</span>}
      </div>
      <div className="card-body">
        <div className="brand">{p.brand}</div>
        <div className="pname">{p.name}</div>
        <div className="meta">
          <span className="swatch" style={{ background: p.colorHex }} /> {p.color}
          <span className="price">{formatPrice(p.price)}</span>
        </div>
      </div>
    </Link>
  );
}
