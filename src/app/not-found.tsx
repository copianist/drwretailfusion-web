import Link from "next/link";
export default function NotFound() {
  return (
    <div className="wrap section narrow center">
      <h1>Page not found</h1>
      <Link href="/shop" className="btn primary">Back to the shop</Link>
    </div>
  );
}
