/**
 * Home page — featured products + hero content from API
 */
(function () {
  "use strict";

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function init() {
    await window.HustleCatalog.ready;
    const { products, settings } = window.HustleCatalog;
    const c = settings.content || {};

    // Hero copy
    const setText = (sel, val) => {
      const el = document.querySelector(sel);
      if (el && val) el.textContent = val;
    };
    setText("[data-content='heroTag']", c.heroTag);
    setText("[data-content='heroTitle']", c.heroTitle);
    setText("[data-content='heroSubtitle']", c.heroSubtitle);
    setText("[data-content='heroBody']", c.heroBody);

    // Featured products
    const mount = document.getElementById("featured-products");
    if (mount && products.length) {
      const featured = products.filter((p) => p.featured).slice(0, 6);
      const list = featured.length ? featured : products.slice(0, 4);
      const primary = list[0];
      const rest = list.slice(1);

      mount.innerHTML = `
        <article class="product-card reveal visible">
          <div class="product-card-img">
            ${primary.badge ? `<span class="product-badge">${esc(primary.badge)}</span>` : ""}
            <img src="${esc(primary.images?.[0] || "assets/images/hero-male-black.jpg")}" alt="${esc(primary.name)} ${esc(primary.color)}" width="800" height="1067" loading="lazy" />
          </div>
          <div class="product-card-body">
            <h3>${esc(primary.name)}${primary.color ? " — " + esc(primary.color).toUpperCase() : ""}</h3>
            <p class="product-meta">${esc((primary.details || []).slice(0, 3).join(" · "))}</p>
            <div class="product-price-row">
              <div class="price">RM${Number(primary.price).toFixed(2)} <small>/ each</small></div>
              <a href="${esc(primary.shopeeUrl || settings.store?.shopeeUrl || "#")}" class="btn btn-shopee" target="_blank" rel="noopener noreferrer">Buy on Shopee</a>
            </div>
          </div>
        </article>
        <div class="featured-side">
          ${rest
            .map(
              (p) => `
            <article class="product-card reveal visible">
              <div class="product-card-img">
                <img src="${esc(p.images?.[0] || "assets/images/lifestyle-female-white.jpg")}" alt="${esc(p.name)}" width="800" height="500" loading="lazy" />
              </div>
              <div class="product-card-body">
                <h3>${esc(p.name)}${p.color ? " — " + esc(p.color).toUpperCase() : ""}</h3>
                <p class="product-meta">${esc(p.description || "").slice(0, 80)}</p>
                <div class="product-price-row">
                  <div class="price">RM${Number(p.price).toFixed(2)} <small>/ each</small></div>
                  <a href="${esc(p.shopeeUrl || "#")}" class="btn btn-shopee" target="_blank" rel="noopener noreferrer">Buy on Shopee</a>
                </div>
              </div>
            </article>`
            )
            .join("")}
          ${
            settings.bundle?.enabled !== false
              ? `
            <article class="product-card reveal visible">
              <div class="product-card-body" style="padding: 2rem">
                <span class="product-badge bundle" style="position: static; display: inline-block; margin-bottom: 1rem">Pair Deal</span>
                <h3>${esc(settings.bundle.title || "BUNDLE")}</h3>
                <p class="product-meta" style="margin-bottom: 0.75rem">${esc(settings.bundle.subtitle || "")}</p>
                <div class="product-price-row">
                  <div>
                    <div class="price">RM${Number(settings.bundle.price).toFixed(2)}</div>
                    <span class="muted" style="font-size: 0.8rem; text-decoration: line-through">RM${Number(settings.bundle.compareAt).toFixed(2)}</span>
                    <span style="color: var(--gold); font-size: 0.75rem; font-weight: 700; margin-left: 0.5rem">SAVE RM${Number(settings.bundle.save).toFixed(0)}</span>
                  </div>
                  <a href="${esc(settings.bundle.shopeeUrl || settings.store?.shopeeUrl || "#")}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Get the Pair</a>
                </div>
              </div>
            </article>`
              : ""
          }
        </div>`;
    }

    // Stats from first product / bundle
    const priceEl = document.querySelector("[data-stat='price']");
    if (priceEl && products[0]) priceEl.textContent = `RM${Number(products[0].price).toFixed(2)}`;
    const offEl = document.querySelector("[data-stat='bundle']");
    if (offEl && settings.bundle) offEl.textContent = `${settings.bundle.percentOff || 10}% OFF`;

    // Store links
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
