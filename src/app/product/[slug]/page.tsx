import Link from "next/link";
import { notFound } from "next/navigation";
import ProductArt from "@/components/ProductArt";
import ProductCard from "@/components/ProductCard";
import AddToBag from "@/components/AddToBag";
import { formatPrice, getProductBySlug, products } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProductBySlug((await params).slug);
  return p ? { title: `${p.brand} ${p.name}`, description: p.description } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProductBySlug((await params).slug);
  if (!p) notFound();
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  return (
    <div className="wrap section">
      <nav className="crumbs muted small">
        <Link href="/shop">Shop</Link> / <Link href={`/shop?category=${encodeURIComponent(p.category)}`}>{p.category}</Link> / {p.name}
      </nav>
      <div className="pdp">
        <div className="pdp-art"><ProductArt art={p.art} color={p.colorHex} label={`${p.name} in ${p.color}`} /></div>
        <div className="pdp-info">
          <div className="brand">{p.brand} · {p.brandOrigin}</div>
          <h1>{p.name}</h1>
          <div className="pdp-price">{formatPrice(p.price)}</div>
          <p className="muted small">Sales tax calculated at checkout.</p>
          <div className="row small"><span className="swatch" style={{ background: p.colorHex }} /> {p.color} · {p.gender}</div>
          <AddToBag productId={p.id} sizes={p.sizes} stock={p.stock} />
          <p>{p.description}</p>
          <ul className="details">{p.details.map((d) => <li key={d}>{d}</li>)}</ul>
          <div className="note">
            Not sure about fit? <Link href="/styling">Book a styling consultation</Link> and your stylist will advise before you buy.
          </div>
        </div>
      </div>
      <h2>You may also like</h2>
      <div className="grid">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
    </div>
  );
}
