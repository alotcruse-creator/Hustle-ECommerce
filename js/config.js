/**
 * HUSTLE — Store Configuration
 * Replace SHOPEE URLs with your official Shopee Malaysia product/store links.
 * All "Buy" CTAs open these URLs in a new tab — no on-site payment handling.
 */
window.HUSTLE_CONFIG = {
  brand: "HUSTLE",
  tagline: "Hustle Hard. Live Easy.",
  currency: "RM",

  // ─── Shopee Malaysia outbound links ───────────────────────────
  // TODO: Replace with your real Shopee MY product & store URLs
  shopee: {
    store: "https://shopee.com.my/", // Official HUSTLE storefront
    oversizedTeeBlack: "https://shopee.com.my/", // Black Oversized Tee product
    oversizedTeeWhite: "https://shopee.com.my/", // White Oversized Tee product
    blackWhiteBundle: "https://shopee.com.my/", // Bundle / pair listing (if separate)
  },

  pricing: {
    teeEach: 39.99,
    bundleNormal: 79.98,
    bundleDiscount: 71.98,
    bundleSave: 8.0,
    bundlePercentOff: 10,
  },
};
