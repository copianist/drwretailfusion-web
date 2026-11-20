// Generates src/data/products.json — 300 curated pieces priced $1,000–$2,000.
// Deterministic (seeded) so the catalog is stable between runs.
// Brand names are DRW house / partner labels. Replace with the real
// inventory you stock (see README "Replacing the catalog").
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let seed = 20261120;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (a) => a[Math.floor(rand() * a.length)];
const pickN = (a, n) => [...a].sort(() => rand() - 0.5).slice(0, n);

const BRANDS = [
  { name: "Maison Verrier", origin: "Paris" },
  { name: "Aldric & Vane", origin: "London" },
  { name: "Castellane Atelier", origin: "Milan" },
  { name: "Nordhaven", origin: "Copenhagen" },
  { name: "Sable Row", origin: "New York" },
  { name: "Orsoline", origin: "Florence" },
  { name: "Kiyomi Studio", origin: "Tokyo" },
  { name: "Hartwell & Lowe", origin: "Savile Row" },
  { name: "Lumière Noire", origin: "Paris" },
  { name: "DRW Signature", origin: "DRW Retail Fusion" },
];

const COLORS = [
  { name: "Onyx", hex: "#1c1c1e" }, { name: "Ivory", hex: "#efe9dd" },
  { name: "Camel", hex: "#b88a56" }, { name: "Navy", hex: "#1f2b47" },
  { name: "Burgundy", hex: "#6b1f2c" }, { name: "Forest", hex: "#2f4a3a" },
  { name: "Slate", hex: "#5b6470" }, { name: "Blush", hex: "#d9a9a0" },
  { name: "Cognac", hex: "#8a4b26" }, { name: "Sand", hex: "#cdb994" },
  { name: "Charcoal", hex: "#3a3a3d" }, { name: "Olive", hex: "#5d5a34" },
  { name: "Cobalt", hex: "#2846a0" }, { name: "Taupe", hex: "#8b7d70" },
];

const APPAREL_W = ["XS", "S", "M", "L", "XL"];
const APPAREL_M = ["S", "M", "L", "XL", "XXL"];
const TAILOR_M = ["36R", "38R", "40R", "42R", "44R", "46R"];
const SHOES_W = ["36", "37", "38", "39", "40", "41"];
const SHOES_M = ["40", "41", "42", "43", "44", "45", "46"];
const ONE = ["One Size"];

// category -> list of { type (art), names[], materials[], gender, sizes }
const CATEGORIES = {
  Outerwear: [
    { art: "coat", gender: "Women", sizes: APPAREL_W, names: ["Double-Face Wrap Coat", "Belted Trench Coat", "Cocoon Cashmere Coat", "Shearling-Collar Car Coat", "Longline Overcoat"], materials: ["double-face cashmere", "water-repellent cotton gabardine", "virgin wool & cashmere", "Italian alpaca blend"] },
    { art: "coat", gender: "Men", sizes: APPAREL_M, names: ["Chesterfield Overcoat", "Polo Coat", "Waxed Field Jacket", "Suede Bomber", "Quilted Down Parka"], materials: ["Loro-weight cashmere", "camel hair", "waxed Egyptian cotton", "lamb suede", "goose down & technical nylon"] },
  ],
  Tailoring: [
    { art: "blazer", gender: "Men", sizes: TAILOR_M, names: ["Two-Button Suit", "Double-Breasted Suit", "Unstructured Travel Blazer", "Shawl-Lapel Tuxedo Jacket", "Hopsack Sport Coat"], materials: ["Super 130s wool", "wool-silk-linen", "mohair blend", "silk-faced barathea"] },
    { art: "blazer", gender: "Women", sizes: APPAREL_W, names: ["Sculpted Tuxedo Blazer", "Oversized Boyfriend Blazer", "Tailored Pantsuit", "Cropped Spencer Jacket"], materials: ["grain de poudre wool", "crepe wool", "stretch silk-wool"] },
  ],
  Dresses: [
    { art: "dress", gender: "Women", sizes: APPAREL_W, names: ["Bias-Cut Slip Dress", "Draped Jersey Gown", "Pleated Midi Dress", "Wrap Dress", "Column Evening Gown", "Corseted Cocktail Dress"], materials: ["silk charmeuse", "silk georgette", "matte crepe", "plissé chiffon", "lace & silk"] },
  ],
  Knitwear: [
    { art: "sweater", gender: "Unisex", sizes: APPAREL_M, names: ["Cable-Knit Crewneck", "Ribbed Turtleneck", "Cashmere Cardigan", "Zip-Neck Polo Sweater", "Fisherman Sweater"], materials: ["Mongolian cashmere", "baby alpaca", "merino-cashmere", "vicuña-blend"] },
  ],
  Shirts: [
    { art: "shirt", gender: "Men", sizes: APPAREL_M, names: ["Silk Camp-Collar Shirt", "Cashmere Overshirt", "Pleat-Front Tuxedo Shirt", "Suede Overshirt"], materials: ["washed silk", "brushed cashmere", "Sea Island cotton", "goat suede"] },
    { art: "shirt", gender: "Women", sizes: APPAREL_W, names: ["Pussy-Bow Blouse", "Oversized Silk Shirt", "Ruffle-Yoke Blouse"], materials: ["silk crêpe de chine", "silk twill", "cotton voile & lace"] },
  ],
  Trousers: [
    { art: "trousers", gender: "Women", sizes: APPAREL_W, names: ["Wide-Leg Pleated Trouser", "Leather Straight-Leg Pant", "Silk Palazzo Pant"], materials: ["wool crepe", "lambskin leather", "silk satin"] },
    { art: "trousers", gender: "Men", sizes: APPAREL_M, names: ["Pleated Flannel Trouser", "Cashmere Jogger", "Gurkha-Waist Trouser"], materials: ["Italian flannel", "double-knit cashmere", "high-twist wool"] },
  ],
  Shoes: [
    { art: "shoe", gender: "Women", sizes: SHOES_W, names: ["Pointed Leather Pump", "Knee-High Riding Boot", "Strappy Satin Sandal", "Chelsea Ankle Boot"], materials: ["calfskin", "patent leather", "duchesse satin", "suede"] },
    { art: "shoe", gender: "Men", sizes: SHOES_M, names: ["Whole-Cut Oxford", "Penny Loafer", "Double-Monk Strap", "Suede Chelsea Boot", "Leather Low-Top Sneaker"], materials: ["box calf", "museum calf", "cordovan", "suede", "nappa leather"] },
  ],
  Bags: [
    { art: "bag", gender: "Women", sizes: ONE, names: ["Structured Top-Handle Bag", "Quilted Shoulder Bag", "Croc-Embossed Tote", "Mini Bucket Bag"], materials: ["grained calfskin", "quilted lambskin", "croc-embossed leather", "nappa leather"] },
    { art: "bag", gender: "Men", sizes: ONE, names: ["Leather Weekender", "Slim Briefcase", "Canvas & Leather Holdall"], materials: ["full-grain leather", "saffiano leather", "waxed canvas & bridle leather"] },
  ],
  Accessories: [
    { art: "scarf", gender: "Unisex", sizes: ONE, names: ["Cashmere Stole", "Silk Twill Scarf", "Fringed Wool Wrap"], materials: ["cashmere", "silk twill", "cashmere-silk"] },
    { art: "belt", gender: "Unisex", sizes: ["75", "80", "85", "90", "95", "100"], names: ["Reversible Leather Belt", "Signature Buckle Belt"], materials: ["calfskin with palladium buckle", "lizard-embossed leather"] },
    { art: "sunglasses", gender: "Unisex", sizes: ONE, names: ["Acetate Aviator Sunglasses", "Titanium Round Sunglasses", "Cat-Eye Sunglasses"], materials: ["handmade Italian acetate", "Japanese titanium"] },
  ],
};

// how many products per category (sums to 300)
const TARGET = { Outerwear: 45, Tailoring: 40, Dresses: 40, Knitwear: 35, Shirts: 30, Trousers: 25, Shoes: 35, Bags: 30, Accessories: 20 };

const slugify = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const products = [];
const seen = new Set();
let n = 1;

for (const [category, count] of Object.entries(TARGET)) {
  const groups = CATEGORIES[category];
  for (let i = 0; i < count; i++) {
    const g = groups[i % groups.length];
    let brand, base, color, name;
    do {
      brand = pick(BRANDS);
      base = pick(g.names);
      color = pick(COLORS);
      name = `${base}`;
    } while (seen.has(`${brand.name}|${base}|${color.name}`));
    seen.add(`${brand.name}|${base}|${color.name}`);
    const material = pick(g.materials);
    // $1,000–$2,000, ending in 50 or 95 for a boutique feel
    const hundreds = 10 + Math.floor(rand() * 10); // 10..19
    const tail = pick([0, 50, 95]);
    const price = Math.min(2000, hundreds * 100 + tail);
    const altColors = pickN(COLORS.filter((c) => c.name !== color.name), 2);
    const id = `drw-${String(n).padStart(3, "0")}`;
    products.push({
      id,
      slug: `${slugify(brand.name)}-${slugify(base)}-${slugify(color.name)}-${n}`,
      name,
      brand: brand.name,
      brandOrigin: brand.origin,
      category,
      gender: g.gender,
      price: price * 100, // cents
      currency: "usd",
      color: color.name,
      colorHex: color.hex,
      altColors: altColors.map((c) => ({ name: c.name, hex: c.hex })),
      material,
      sizes: g.sizes,
      art: g.art,
      description: `${base} by ${brand.name} (${brand.origin}), cut in ${material} in ${color.name.toLowerCase()}. ` +
        `Finished by hand and selected by the DRW styling team for its fit, fabric and longevity. ` +
        `Book a complimentary fit check with your stylist after purchase.`,
      details: [
        `Material: ${material}`,
        `Colour: ${color.name}`,
        `Designed in ${brand.origin}`,
        pick(["Dry clean only", "Professional leather care", "Hand wash cold, dry flat", "Specialist clean"]),
        "Complimentary alterations consultation",
      ],
      featured: rand() < 0.08,
      newArrival: rand() < 0.15,
      stock: 1 + Math.floor(rand() * 12),
    });
    n++;
  }
}

const out = join(root, "src/data/products.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(products, null, 0) + "\n");
const prices = products.map((p) => p.price / 100);
console.log(`Wrote ${products.length} products → ${out} (price $${Math.min(...prices)}–$${Math.max(...prices)})`);
