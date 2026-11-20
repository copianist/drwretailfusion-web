import { products } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import CartView from "./CartView";

export const metadata = { title: "Your bag" };

export default async function CartPage() {
  const user = await getCurrentUser();
  const lite = products.map(({ id, slug, name, brand, price, color, colorHex, art }) => ({ id, slug, name, brand, price, color, colorHex, art }));
  return <CartView products={lite} signedIn={!!user} />;
}
