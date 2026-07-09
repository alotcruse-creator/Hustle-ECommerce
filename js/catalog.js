/**
 * HUSTLE catalog loader — fetches products & settings from Cloudflare API.
 * Falls back to embedded defaults if the API is unavailable (local file://).
 */
(function () {
  "use strict";

  const FALLBACK_PRODUCTS = [
    {
      id: "oversized-tee-black",
      name: "Oversized Tee",
      color: "Black",
      price: 39.99,
      currency: "RM",
      description:
        "Built for the gym. Styled for everyday. 230GSM pure cotton with a gold HUSTLE mark.",
      details: [
        "230GSM (6.78 oz/yd²)",
        "100% Ring Spun Cotton — Preshrunk",
        "Loose Fit Cutting",
        "2.5cm Rib Collar",
        "Double Needle Sleeve and Bottom Hems",
        "Unisex Design",
        "Sizes Available (S – XL)",
      ],
      sizes: ["S", "M", "L", "XL"],
      images: [
        "assets/images/hero-male-black.jpg",
        "assets/products/product-main.jpg",
        "assets/images/logo-detail.jpg",
      ],
      shopeeUrl: "https://shopee.com.my/",
      featured: true,
      active: true,
      badge: "Bestseller",
      sortOrder: 1,
    },
    {
      id: "oversized-tee-white",
      name: "Oversized Tee",
      color: "White",
      price: 39.99,
      currency: "RM",
      description: "Same premium build. Clean gold logo. Oversized cut.",
      details: [
        "230GSM (6.78 oz/yd²)",
        "100% Ring Spun Cotton — Preshrunk",
        "Loose Fit Cutting",
        "2.5cm Rib Collar",
        "Unisex Design",
      ],
      sizes: ["S", "M", "L", "XL"],
      images: [
        "assets/images/lifestyle-female-white.jpg",
        "assets/products/product-main.jpg",
        "assets/images/lifestyle-rest.jpg",
      ],
      shopeeUrl: "https://shopee.com.my/",
      featured: true,
      active: true,
      badge: "",
      sortOrder: 2,
    },
  ];

  const FALLBACK_SETTINGS = {
    store: { shopeeUrl: "https://shopee.com.my/", brand: "HUSTLE", tagline: "Hustle Hard. Live Easy." },
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
    content: {},
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

  window.HustleCatalog = {
    products: FALLBACK_PRODUCTS,
    settings: FALLBACK_SETTINGS,
    ready: null,

    async load() {
      try {
        const [pr, sr] = await Promise.all([
          fetch("/api/products").then((r) => r.json()),
          fetch("/api/settings").then((r) => r.json()),
        ]);
        if (pr.products?.length) this.products = pr.products;
        if (sr.settings) this.settings = sr.settings;
      } catch (e) {
        console.warn("HUSTLE: using offline catalog fallback", e);
      }
      // Sync legacy config for buttons
      if (window.HUSTLE_CONFIG && this.settings) {
        window.HUSTLE_CONFIG.shopee = window.HUSTLE_CONFIG.shopee || {};
        window.HUSTLE_CONFIG.shopee.store = this.settings.store?.shopeeUrl || window.HUSTLE_CONFIG.shopee.store;
        window.HUSTLE_CONFIG.shopee.blackWhiteBundle =
          this.settings.bundle?.shopeeUrl || window.HUSTLE_CONFIG.shopee.blackWhiteBundle;
        const black = this.products.find((p) => /black/i.test(p.color));
        const white = this.products.find((p) => /white/i.test(p.color));
        if (black?.shopeeUrl) window.HUSTLE_CONFIG.shopee.oversizedTeeBlack = black.shopeeUrl;
        if (white?.shopeeUrl) window.HUSTLE_CONFIG.shopee.oversizedTeeWhite = white.shopeeUrl;
        if (this.settings.bundle) {
          window.HUSTLE_CONFIG.pricing = {
            teeEach: this.products[0]?.price ?? 39.99,
            bundleNormal: this.settings.bundle.compareAt,
            bundleDiscount: this.settings.bundle.price,
            bundleSave: this.settings.bundle.save,
            bundlePercentOff: this.settings.bundle.percentOff,
          };
        }
      }
      return this;
    },

    money(n, currency = "RM") {
      return `${currency}${Number(n).toFixed(2)}`;
    },
  };

  window.HustleCatalog.ready = window.HustleCatalog.load();
})();
