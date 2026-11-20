import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/catalog";
import BookingForm from "./BookingForm";

export const metadata = { title: "Styling consultations" };

export default async function Styling() {
  const user = await getCurrentUser();
  const price = Number(process.env.STYLING_CONSULTATION_CENTS || 25000);
  return (
    <div className="wrap section">
      <div className="split">
        <div>
          <p className="eyebrow">One-on-one styling</p>
          <h1>Dressed for your life, not just your size.</h1>
          <p className="lede">A 60-minute session — in person or by video — with a DRW stylist. We review your wardrobe, lifestyle and fit, then build a shortlist from the collection.</p>
          <ul className="details">
            <li>Wardrobe audit and colour analysis</li>
            <li>Personal fit profile saved to your account</li>
            <li>Curated shortlist with alterations advice</li>
            <li>Complimentary post-delivery fit check</li>
          </ul>
          <p><strong>{formatPrice(price)}</strong> per session. After you request a time, your stylist confirms and sends a secure Stripe invoice to pay online.</p>
        </div>
        <BookingForm defaultName={user?.name} defaultEmail={user?.email} />
      </div>
    </div>
  );
}
