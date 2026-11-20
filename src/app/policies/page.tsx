export const metadata = { title: "Shipping, returns & privacy" };
export default function Policies() {
  return (
    <div className="wrap section narrow prose">
      <h1>Shipping, returns & privacy</h1>
      <h2>Delivery</h2>
      <p>Orders ship insured within 2–5 business days to the United States and Canada. You will receive tracking by email.</p>
      <h2>Returns</h2>
      <p>Unworn items with tags attached may be returned within 14 days of delivery for a refund to the original payment method. Contact your stylist to arrange a pickup.</p>
      <h2>Sales tax</h2>
      <p>Sales tax is calculated at checkout based on your delivery address and shown on your invoice.</p>
      <h2>Privacy</h2>
      <p>We store your name, email and order history to provide your account and styling service. Card details are handled by Stripe and never touch our servers.</p>
      <p className="muted small">Review these policies with your legal advisor before going live.</p>
    </div>
  );
}
