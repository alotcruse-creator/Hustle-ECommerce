/**
 * Home — Gymshark-style product rail with model hover swap
 */
(function () {
  "use strict";

  const esc = (s) => (window.HustleCards ? window.HustleCards.esc(s) : s);

  async function init() {
    await window.HustleCatalog.ready;
    const { products, settings } = window.HustleCatalog;
    const c = settings.content || {};

    const setText = (sel, val) => {
      const el = document.querySelector(sel);
      if (el && val) el.textContent = val;
    };
    setText("[data-content='heroTag']", c.heroTag);
    setText("[data-content='heroTitle']", c.heroTitle);
    setText("[data-content='heroSubtitle']", c.heroSubtitle);
    setText("[data-content='heroBody']", c.heroBody);

    // Featured rail (Gymshark-style)
    const mount = document.getElementById("featured-products");
    if (mount && products.length && window.HustleCards) {
      const featured = products.filter((p) => p.featured);
      const list = (featured.length ? featured : products).slice(0, 8);

      // Replace parent featured-grid with rail layout if needed
      const section = mount.closest(".section") || mount.parentElement;
      mount.className = "product-rail";
      mount.id = "featured-products";
      mount.innerHTML = list
        .map((p) => window.HustleCards.renderCard(p, settings))
        .join("");

      // Wire clicks to shop
      mount.querySelectorAll(".gs-card").forEach((card) => {
        card.addEventListener("click", (e) => {
          if (e.target.closest("[data-buy], a")) return;
          window.location.href = "shop.html";
        });
      });
    }

    // Bundle strip on home
    const bundleMount = document.getElementById("home-bundle");
    if (bundleMount && settings.bundle?.enabled !== false) {
      const b = settings.bundle;
      bundleMount.innerHTML = `
        <div class="bundle-strip">
          <div>
            <h3>${esc(b.title || "Black + White Pair")}</h3>
            <p class="muted" style="font-size:0.9rem;margin-top:0.35rem">${esc(b.subtitle || "")}</p>
          </div>
          <div class="prices">
            <span class="was">RM${Number(b.compareAt).toFixed(2)}</span>
            <span class="now">RM${Number(b.price).toFixed(2)}</span>
          </div>
          <a href="${esc(b.shopeeUrl || settings.store?.shopeeUrl || "shop.html")}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Shop Pair Deal</a>
        </div>`;
    }

    const priceEl = document.querySelector("[data-stat='price']");
    if (priceEl && products[0]) priceEl.textContent = `RM${Number(products[0].price).toFixed(2)}`;
    const offEl = document.querySelector("[data-stat='bundle']");
    if (offEl && settings.bundle) offEl.textContent = `${settings.bundle.percentOff || 10}% OFF`;

    document.querySelectorAll("[data-shopee='store']").forEach((el) => {
      el.href = settings.store?.shopeeUrl || "https://shopee.com.my/";
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
