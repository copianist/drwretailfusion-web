import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductArt from "@/components/ProductArt";
import { products, categories } from "@/lib/catalog";

export default function Home() {
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const fresh = products.filter((p) => p.newArrival).slice(0, 4);
  return (
    <>
      <section className="hero">
        <div className="wrap hero-inner">
          <div>
            <p className="eyebrow">Clothing · Accessories · Styling</p>
            <h1>Retail, fused with personal style.</h1>
            <p className="lede">
              DRW Retail Fusion LLC pairs a curated clothing and accessories collection with one-on-one styling
              consultations — so every order fits your life, not just your size.
            </p>
            <div className="row">
              <Link href="/shop" className="btn primary">Shop the collection</Link>
              <Link href="/styling" className="btn">Book a stylist</Link>
            </div>
          </div>
          <div className="hero-art">
            {featured.slice(0, 3).map((p) => (
              <ProductArt key={p.id} art={p.art} color={p.colorHex} label={p.name} />
            ))}
          </div>
        </div>
      </section>

      <section className="wrap section">
        <h2>Shop by category</h2>
        <div className="cats">
          {categories.map((c) => {
            const sample = products.find((p) => p.category === c)!;
            return (
              <Link key={c} href={`/shop?category=${encodeURIComponent(c)}`} className="cat">
                <ProductArt art={sample.art} color={sample.colorHex} label={c} />
                <span>{c}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head"><h2>Stylist picks</h2><Link href="/shop">View all 300 pieces →</Link></div>
        <div className="grid">{featured.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      <section className="band">
        <div className="wrap band-inner">
          <div>
            <h2>Every order, fitted to your life.</h2>
            <p>Book a one-on-one consultation. Your stylist builds a wardrobe plan, checks fit after delivery and arranges alterations.</p>
          </div>
          <Link href="/styling" className="btn light">Book a consultation</Link>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head"><h2>New arrivals</h2><Link href="/shop?sort=new">See more →</Link></div>
        <div className="grid">{fresh.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>
    </>
  );
}
