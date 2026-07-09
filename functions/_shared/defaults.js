/** Seed data when KV is empty — matches launch collection */

export const DEFAULT_PRODUCTS = [
  {
    id: "oversized-tee-black",
    name: "Oversized Tee",
    color: "Black",
    price: 39.99,
    compareAt: null,
    currency: "RM",
    description:
      "Built for the gym. Styled for everyday. 230GSM pure cotton with a gold HUSTLE mark — loose fit that moves with you.",
    details: [
      "230GSM (6.78 oz/yd²)",
      "100% Ring Spun Cotton — Preshrunk",
      "Loose Fit Cutting",
      "2.5cm Rib Collar",
      "Double Needle Sleeve and Bottom Hems",
      "Label Removable",
      "Sizes Available (S – XL)",
      "Unisex Design",
      "Soft, Breathable & Comfortable",
      "Suitable for Gym & Casual Wear",
    ],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "assets/products/product-main.jpg",
      "assets/images/hero-male-black.jpg",
      "assets/images/logo-detail.jpg",
    ],
    shopeeUrl: "https://shopee.com.my/",
    featured: true,
    active: true,
    badge: "Bestseller",
    category: "tees",
    sortOrder: 1,
  },
  {
    id: "oversized-tee-white",
    name: "Oversized Tee",
    color: "White",
    price: 39.99,
    compareAt: null,
    currency: "RM",
    description:
      "Same premium build. Clean gold logo. Oversized cut for training and everyday wear.",
    details: [
      "230GSM (6.78 oz/yd²)",
      "100% Ring Spun Cotton — Preshrunk",
      "Loose Fit Cutting",
      "2.5cm Rib Collar",
      "Double Needle Sleeve and Bottom Hems",
      "Label Removable",
      "Sizes Available (S – XL)",
      "Unisex Design",
      "Soft, Breathable & Comfortable",
      "Suitable for Gym & Casual Wear",
    ],
    sizes: ["S", "M", "L", "XL"],
    images: [
      "assets/products/product-main.jpg",
      "assets/images/lifestyle-female-white.jpg",
      "assets/images/logo-detail.jpg",
    ],
    shopeeUrl: "https://shopee.com.my/",
    featured: true,
    active: true,
    badge: "",
    category: "tees",
    sortOrder: 2,
  },
];

export const DEFAULT_SETTINGS = {
  store: {
    shopeeUrl: "https://shopee.com.my/",
    brand: "HUSTLE",
    tagline: "Hustle Hard. Live Easy.",
  },
  bundle: {
    enabled: true,
    title: "Buy Black & White as a Pair",
    subtitle: "Complete the set. Train in black. Live in white.",
    price: 71.98,
    compareAt: 79.98,
    percentOff: 10,
    save: 8,
    shopeeUrl: "https://shopee.com.my/",
  },
  content: {
    heroTag: "New Brand. New Mentality.",
    heroTitle: "HUSTLE HARD.",
    heroSubtitle: "LIVE EASY.",
    heroBody:
      "Built for more than just the gym. Premium oversized tees engineered for the grind — and the lifestyle that follows.",
    aboutTitle: "MORE THAN JUST THE GYM",
    aboutBody:
      "HUSTLE started with a simple belief: the clothes you wear when you train should feel as intentional as the work you put in. We’re a local Malaysian brand building premium gym-to-street wear for people who refuse to half-ass anything.",
    manifesto: "HUSTLE EVERYDAY. BUILT DIFFERENT.",
  },
  sizeChart: {
    note: "Measurements may vary ±5% from actual product. All measurements are presented in inches.",
    rows: [
      { size: "S", chest: '37"', length: '25.5"', sleeve: '7.5"' },
      { size: "M", chest: '39.5"', length: '26"', sleeve: '8"' },
      { size: "L", chest: '42"', length: '27.5"', sleeve: '8"' },
      { size: "XL", chest: '44"', length: '28.5"', sleeve: '8.5"' },
    ],
  },
};

export const KEYS = {
  products: "products",
  settings: "settings",
};
