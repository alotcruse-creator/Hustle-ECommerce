/**
 * Shared Gymshark-style product card renderer
 * Image 0 = model (default), Image 1 = hover alt
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

  function colorClass(color) {
    const c = String(color || "").toLowerCase();
    if (c.includes("white")) return "white";
    if (c.includes("black")) return "black";
    return "";
  }

  /**
   * Prefer model lifestyle shot first.
   * If first image looks like a product poster, reorder.
   */
  function orderedImages(p) {
    const imgs = (p.images || []).filter(Boolean);
    if (!imgs.length) {
      return [
        "assets/images/hero-male-black.jpg",
        "assets/products/product-main.jpg",
      ];
    }
    const isModel = (src) =>
      /hero|lifestyle|model|male|female|rest|duo|logo-detail/i.test(src);
    const models = imgs.filter(isModel);
    const others = imgs.filter((s) => !isModel(s));
    // model first, then product/alt
    const ordered = [...models, ...others];
    return ordered.length ? ordered : imgs;
  }

  function renderCard(p, settings = {}, opts = {}) {
    const imgs = orderedImages(p);
    const primary = imgs[0];
    const secondary = imgs[1] || null;
    const single = !secondary || secondary === primary;
    const store = settings.store?.shopeeUrl || "https://shopee.com.my/";
    const href = p.shopeeUrl || store;
    const price = Number(p.price).toFixed(2);
    const currency = p.currency || "RM";
    const fit =
      (p.details || []).find((d) => /fit|loose|oversized|gsm/i.test(d)) ||
      "Loose fit · 230GSM";

    return `
    <article class="gs-card" data-product-id="${esc(p.id)}" ${opts.clickable !== false ? 'role="link" tabindex="0"' : ""}>
      <div class="gs-media ${single ? "single" : ""}">
        ${p.badge ? `<span class="gs-badge gold">${esc(p.badge)}</span>` : ""}
        <img
          class="gs-img-primary"
          src="${esc(primary)}"
          alt="${esc(p.name)} ${esc(p.color)} — model wearing HUSTLE"
          width="600"
          height="800"
          loading="lazy"
        />
        ${
          secondary
            ? `<img
          class="gs-img-secondary"
          src="${esc(secondary)}"
          alt="${esc(p.name)} ${esc(p.color)} — alternate view"
          width="600"
          height="800"
          loading="lazy"
        />`
            : ""
        }
        <div class="gs-quick">
          <a class="btn" href="${esc(href)}" target="_blank" rel="noopener noreferrer" data-buy>
            Buy on Shopee · ${currency}${price}
          </a>
        </div>
      </div>
      <div class="gs-info">
        <span class="gs-fit">${esc(fit)}</span>
        <h3>${esc(p.name)}</h3>
        <span class="gs-color">${esc(p.color || "")}</span>
        <div class="gs-price ${p.compareAt ? "sale" : ""}">
          ${currency}${price}
          ${
            p.compareAt
              ? `<span class="was">${currency}${Number(p.compareAt).toFixed(2)}</span>`
              : ""
          }
        </div>
        ${
          p.color
            ? `<div class="gs-swatches" aria-hidden="true">
          <span class="gs-swatch-dot ${colorClass(p.color)}"></span>
        </div>`
            : ""
        }
      </div>
    </article>`;
  }

  window.HustleCards = { renderCard, orderedImages, esc };
})();
