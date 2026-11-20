import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

/** Returns a single StripeClient instance (never the deprecated global key pattern). */
export function getStripe(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.endsWith("...")) {
    throw new Error("STRIPE_SECRET_KEY is not set. Add your sandbox key (rk_test_… or sk_test_…) to .env");
  }
  client = new Stripe(key, {
    appInfo: { name: "DRW Retail Fusion", url: "https://drwretailfusion.com" },
  });
  return client;
}

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/** Tag Checkout Sessions so flows can be compared in the Dashboard. */
export function integrationIdentifier(flow: string) {
  const letters = Array.from({ length: 8 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join("");
  return `drw_${flow}_${letters}`;
}

export const taxCode = (kind: "apparel" | "styling") => {
  const v = kind === "apparel" ? process.env.STRIPE_TAX_CODE_APPAREL : process.env.STRIPE_TAX_CODE_STYLING;
  return v && v.startsWith("txcd_") ? v : undefined;
};
