/**
 * Shop page renderer — dynamic products, size chart, bundle from API
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

  function money(p) {
    return `${esc(p.currency || "RM")}${Number(p.price).toFixed(2)}`;
  }

  async function init() {
    await window.HustleCatalog.ready;
    const { products, settings } = window.HustleCatalog;
    if (!products.length) return;

    const grid = document.getElementById("products-grid");
    const detail = document.getElementById("product-detail-root");
    const sizeBody = document.getElementById("size-chart-body");
    const sizeNote = document.getElementById("size-chart-note");
    const bundleRoot = document.getElementById("bundle-root");

    // Product cards grid
    if (grid) {
      grid.innerHTML = products
        .map(
          (p) => `
        <article class="product-card reveal visible" data-product-id="${esc(p.id)}">
          <div class="product-card-img">
            ${p.badge ? `<span class="product-badge">${esc(p.badge)}</span>` : ""}
            <img src="${esc(p.images?.[0] || "assets/products/product-main.jpg")}" alt="${esc(p.name)} ${esc(p.color)}" loading="lazy" width="600" height="800" />
          </div>
          <div class="product-card-body">
            <h3>${esc(p.name)}${p.color ? " — " + esc(p.color) : ""}</h3>
            <p class="product-meta">${esc((p.details || []).slice(0, 2).join(" · ") || "Premium gym wear")}</p>
            <div class="product-price-row">
              <div class="price">${money(p)} <small>/ each</small></div>
              <a href="${esc(p.shopeeUrl || settings.store?.shopeeUrl || "#")}" class="btn btn-shopee" target="_blank" rel="noopener noreferrer">Buy on Shopee</a>
            </div>
          </div>
        </article>`
        )
        .join("");

      grid.querySelectorAll("[data-product-id]").forEach((card) => {
        card.style.cursor = "pointer";
        card.addEventListener("click", (e) => {
          if (e.target.closest("a")) return;
          selectProduct(card.dataset.productId);
          document.getElementById("product-detail-root")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    }

    // Size chart
    if (sizeBody && settings.sizeChart?.rows) {
      sizeBody.innerHTML = settings.sizeChart.rows
        .map(
          (r) => `
        <tr>
          <td><strong style="color: var(--gold)">${esc(r.size)}</strong></td>
          <td>${esc(r.chest)}</td>
          <td>${esc(r.length)}</td>
          <td>${esc(r.sleeve)}</td>
        </tr>`
        )
        .join("");
    }
    if (sizeNote && settings.sizeChart?.note) {
      sizeNote.textContent = "* " + settings.sizeChart.note;
    }

    // Bundle
    if (bundleRoot && settings.bundle?.enabled !== false) {
      const b = settings.bundle;
      bundleRoot.innerHTML = `
        <div class="bundle-card">
          <h3>${esc(b.title || "Bundle deal")}</h3>
          <p class="muted" style="font-size: 0.9rem">${esc(b.subtitle || "")}</p>
          <div class="bundle-prices">
            <span class="old">${esc(settings.store?.currency || "RM")}${Number(b.compareAt).toFixed(2)}</span>
            <span class="new">${esc("RM")}${Number(b.price).toFixed(2)}</span>
            <span class="save">${esc(String(b.percentOff || 10))}% OFF · Save RM${Number(b.save).toFixed(0)}</span>
          </div>
          <a href="${esc(b.shopeeUrl || settings.store?.shopeeUrl || "#")}" class="btn btn-primary btn-block" target="_blank" rel="noopener noreferrer">
            Get Pair Deal on Shopee
          </a>
        </div>`;
    } else if (bundleRoot) {
      bundleRoot.innerHTML = "";
    }

    // Default select first product
    selectProduct(products[0].id);

    // Wire store CTAs
    document.querySelectorAll("[data-shopee='store']").forEach((el) => {
      el.href = settings.store?.shopeeUrl || "https://shopee.com.my/";
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    });
  }

  let selectedId = null;

  function selectProduct(id) {
    const { products, settings } = window.HustleCatalog;
    const p = products.find((x) => x.id === id) || products[0];
    if (!p) return;
    selectedId = p.id;

    const root = document.getElementById("product-detail-root");
    if (!root) return;

    const imgs = p.images?.length ? p.images : ["assets/products/product-main.jpg"];
    root.innerHTML = `
      <div class="shop-layout">
        <div class="product-gallery">
          <div class="gallery-main">
            <img id="gallery-main-img" src="${esc(imgs[0])}" alt="${esc(p.name)} ${esc(p.color)}" width="800" height="800" />
          </div>
          <div class="gallery-thumbs" role="tablist">
            ${imgs
              .map(
                (src, i) => `
              <button class="gallery-thumb ${i === 0 ? "active" : ""}" type="button" data-src="${esc(src)}">
                <img src="${esc(src)}" alt="" width="120" height="120" />
              </button>`
              )
              .join("")}
          </div>
        </div>
        <div class="product-info">
          <p class="section-label">${esc(p.category || "Collection")}</p>
          <h1>${esc(p.name)}${p.color ? " — " + esc(p.color) : ""}</h1>
          <p class="product-tagline">${esc(p.description || "")}</p>
          <div class="price-block">
            <span class="current">${money(p)}</span>
            <span class="each">Each · ${(p.sizes || []).join(" · ") || "Unisex"}</span>
            ${
              p.compareAt
                ? `<span class="muted" style="text-decoration:line-through">${esc(p.currency || "RM")}${Number(p.compareAt).toFixed(2)}</span>`
                : ""
            }
          </div>
          <p class="swatch-label">Available colours / variants</p>
          <div class="variant-row" style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1.5rem">
            ${products
              .map(
                (v) => `
              <button type="button" class="size-btn ${v.id === p.id ? "active" : ""}" data-select="${esc(v.id)}">
                ${esc(v.color || v.name)}
              </button>`
              )
              .join("")}
          </div>
          <p class="swatch-label">Size</p>
          <div class="size-options" role="group">
            ${(p.sizes || ["S", "M", "L", "XL"])
              .map(
                (s, i) =>
                  `<button class="size-btn ${i === 1 ? "active" : ""}" type="button">${esc(s)}</button>`
              )
              .join("")}
          </div>
          <div class="buy-actions" style="margin-top:1.5rem">
            <a href="${esc(p.shopeeUrl || settings.store?.shopeeUrl || "#")}" class="btn btn-shopee btn-lg btn-block" target="_blank" rel="noopener noreferrer" id="primary-buy">
              Buy Now on Shopee MY →
            </a>
            <p class="muted" style="font-size: 0.8rem; text-align: center">
              You’ll complete payment &amp; shipping on Shopee Malaysia. No card details on this site.
            </p>
          </div>
          <div id="bundle-root"></div>
          <div class="details-list">
            <h3>PRODUCT DETAILS</h3>
            <ul>
              ${(p.details || []).map((d) => `<li>${esc(d)}</li>`).join("")}
            </ul>
          </div>
        </div>
      </div>`;

    // Re-render bundle inside detail
    const bundleRoot = document.getElementById("bundle-root");
    if (bundleRoot && settings.bundle?.enabled !== false) {
      const b = settings.bundle;
      bundleRoot.innerHTML = `
        <div class="bundle-card">
          <h3>${esc(b.title || "Bundle deal")}</h3>
          <p class="muted" style="font-size: 0.9rem">${esc(b.subtitle || "")}</p>
          <div class="bundle-prices">
            <span class="old">RM${Number(b.compareAt).toFixed(2)}</span>
            <span class="new">RM${Number(b.price).toFixed(2)}</span>
            <span class="save">${esc(String(b.percentOff || 10))}% OFF · Save RM${Number(b.save).toFixed(0)}</span>
          </div>
          <a href="${esc(b.shopeeUrl || settings.store?.shopeeUrl || "#")}" class="btn btn-primary btn-block" target="_blank" rel="noopener noreferrer">
            Get Pair Deal on Shopee
          </a>
        </div>`;
    }

    root.querySelectorAll(".gallery-thumb").forEach((thumb) => {
      thumb.addEventListener("click", () => {
        root.querySelectorAll(".gallery-thumb").forEach((t) => t.classList.remove("active"));
        thumb.classList.add("active");
        const main = document.getElementById("gallery-main-img");
        if (main) main.src = thumb.dataset.src;
      });
    });

    root.querySelectorAll("[data-select]").forEach((btn) => {
      btn.addEventListener("click", () => selectProduct(btn.dataset.select));
    });

    root.querySelectorAll(".size-options .size-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.querySelectorAll(".size-options .size-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
