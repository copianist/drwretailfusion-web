import data from "@/data/products.json";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandOrigin: string;
  category: string;
  gender: string;
  price: number; // cents
  currency: string;
  color: string;
  colorHex: string;
  altColors: { name: string; hex: string }[];
  material: string;
  sizes: string[];
  art: string;
  description: string;
  details: string[];
  featured: boolean;
  newArrival: boolean;
  stock: number;
};

export const products = data as Product[];
const byId = new Map(products.map((p) => [p.id, p]));
const bySlug = new Map(products.map((p) => [p.slug, p]));

export const getProduct = (id: string) => byId.get(id);
export const getProductBySlug = (slug: string) => bySlug.get(slug);
export const categories = Array.from(new Set(products.map((p) => p.category)));
export const brands = Array.from(new Set(products.map((p) => p.brand))).sort();
export const genders = ["Women", "Men", "Unisex"];

export type ShopQuery = {
  q?: string;
  category?: string;
  brand?: string;
  gender?: string;
  min?: string;
  max?: string;
  sort?: string;
  page?: string;
};

export const PAGE_SIZE = 24;

export function searchProducts(query: ShopQuery) {
  const q = query.q?.trim().toLowerCase();
  const min = query.min ? Number(query.min) * 100 : 0;
  const max = query.max ? Number(query.max) * 100 : Infinity;
  let list = products.filter(
    (p) =>
      (!q || `${p.name} ${p.brand} ${p.category} ${p.color} ${p.material}`.toLowerCase().includes(q)) &&
      (!query.category || p.category === query.category) &&
      (!query.brand || p.brand === query.brand) &&
      (!query.gender || p.gender === query.gender) &&
      p.price >= min &&
      p.price <= max
  );
  switch (query.sort) {
    case "price-asc": list = [...list].sort((a, b) => a.price - b.price); break;
    case "price-desc": list = [...list].sort((a, b) => b.price - a.price); break;
    case "new": list = [...list].sort((a, b) => Number(b.newArrival) - Number(a.newArrival)); break;
    case "name": list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
  }
  const page = Math.max(1, Number(query.page) || 1);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  return { total: list.length, page, pages, items: list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) };
}

export const formatPrice = (cents: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase(), maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
