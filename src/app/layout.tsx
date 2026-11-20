import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import CartCount from "@/components/CartCount";
import LogoutButton from "@/components/LogoutButton";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { categories } from "@/lib/catalog";

export const metadata: Metadata = {
  title: { default: "DRW Retail Fusion — Retail, fused with personal style", template: "%s · DRW Retail Fusion" },
  description:
    "DRW Retail Fusion LLC pairs a curated clothing and accessories collection with one-on-one styling consultations — so every order fits your life, not just your size.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://drwretailfusion.com"),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <div className="topbar">Complimentary insured delivery · Free styling fit-check with every order</div>
          <header className="header">
            <div className="wrap header-inner">
              <Link href="/" className="logo">DRW<span>Retail Fusion</span></Link>
              <nav className="nav">
                <Link href="/shop">Shop all</Link>
                {categories.slice(0, 5).map((c) => (
                  <Link key={c} href={`/shop?category=${encodeURIComponent(c)}`} className="hide-sm">{c}</Link>
                ))}
                <Link href="/styling">Styling</Link>
              </nav>
              <div className="actions">
                {user ? (
                  <>
                    {isAdmin(user.email) && <Link href="/admin">Admin</Link>}
                    <Link href="/account">{user.name.split(" ")[0]}</Link>
                    <LogoutButton />
                  </>
                ) : (
                  <Link href="/login">Sign in</Link>
                )}
                <Link href="/cart" className="bag">Bag <CartCount /></Link>
              </div>
            </div>
          </header>
          <main>{children}</main>
          <footer className="footer">
            <div className="wrap footer-inner">
              <div>
                <div className="logo">DRW<span>Retail Fusion</span></div>
                <p className="muted">Clothing · Accessories · Styling</p>
              </div>
              <div>
                <h4>Shop</h4>
                {categories.map((c) => (<Link key={c} href={`/shop?category=${encodeURIComponent(c)}`}>{c}</Link>))}
              </div>
              <div>
                <h4>Service</h4>
                <Link href="/styling">Book a styling consultation</Link>
                <Link href="/account">Orders & invoices</Link>
                <Link href="/policies">Shipping, returns & privacy</Link>
              </div>
            </div>
            <div className="wrap muted small copyright">© {new Date().getFullYear()} DRW Retail Fusion LLC. Payments secured by Stripe.</div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
