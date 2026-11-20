import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { brands, categories, genders, searchProducts, type ShopQuery } from "@/lib/catalog";

export const metadata = { title: "Shop" };

export default async function Shop({ searchParams }: { searchParams: Promise<ShopQuery> }) {
  const query = await searchParams;
  const { items, total, page, pages } = searchProducts(query);
  const link = (patch: Partial<ShopQuery>) => {
    const sp = new URLSearchParams();
    Object.entries({ ...query, ...patch }).forEach(([k, v]) => v && sp.set(k, String(v)));
    return `/shop?${sp.toString()}`;
  };
  return (
    <div className="wrap section">
      <h1>{query.category || "All pieces"}</h1>
      <form className="filters" method="get">
        <input name="q" placeholder="Search brand, item, colour…" defaultValue={query.q} aria-label="Search" />
        <select name="category" defaultValue={query.category ?? ""} aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select name="gender" defaultValue={query.gender ?? ""} aria-label="Department">
          <option value="">All departments</option>
          {genders.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select name="brand" defaultValue={query.brand ?? ""} aria-label="Brand">
          <option value="">All brands</option>
          {brands.map((b) => <option key={b}>{b}</option>)}
        </select>
        <select name="max" defaultValue={query.max ?? ""} aria-label="Max price">
          <option value="">Any price</option>
          <option value="1250">Up to $1,250</option>
          <option value="1500">Up to $1,500</option>
          <option value="1750">Up to $1,750</option>
        </select>
        <select name="sort" defaultValue={query.sort ?? ""} aria-label="Sort">
          <option value="">Featured</option>
          <option value="new">New arrivals</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name">Name</option>
        </select>
        <button className="btn primary" type="submit">Apply</button>
        <Link href="/shop" className="btn">Reset</Link>
      </form>
      <p className="muted">{total} pieces</p>
      {items.length ? (
        <div className="grid">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      ) : (
        <p>No pieces match those filters. <Link href="/shop">Clear filters</Link></p>
      )}
      {pages > 1 && (
        <nav className="pager" aria-label="Pages">
          {page > 1 && <Link href={link({ page: String(page - 1) })}>← Prev</Link>}
          <span>Page {page} of {pages}</span>
          {page < pages && <Link href={link({ page: String(page + 1) })}>Next →</Link>}
        </nav>
      )}
    </div>
  );
}
