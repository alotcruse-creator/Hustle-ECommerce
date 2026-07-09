/**
 * Shop page — Gymshark-style grid, hover image swap, model shots + prices
 */
(function () {
  "use strict";

  const esc = (s) => window.HustleCards.esc(s);

  async function init() {
    await window.HustleCatalog.ready;
    const { products, settings } = window.HustleCatalog;
    if (!products.length) return;

    const grid = document.getElementById("products-grid");
    const countEl = document.getElementById("shop-count");
    const sizeBody = document.getElementById("size-chart-body");
    const sizeNote = document.getElementById("size-chart-note");
    const bundleStrip = document.getElementById("bundle-strip");

    if (countEl) {
      countEl.textContent = `${products.length} product${products.length === 1 ? "" : "s"}`;
    }

    function renderGrid(list) {
      if (!grid) return;
      grid.innerHTML = list
        .map((p) => window.HustleCards.renderCard(p, settings))
        .join("");

      grid.querySelectorAll(".gs-card").forEach((card) => {
        const open = () => {
          selectProduct(card.dataset.productId);
          document
            .getElementById("product-detail-root")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        };
        card.addEventListener("click", (e) => {
          if (e.target.closest("[data-buy], a")) return;
          open();
        });
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        });
      });
    }

    renderGrid(products);

    // Filters
    document.querySelectorAll("[data-filter]").forEach((chip) => {
      chip.addEventListener("click", () => {
        document.querySelectorAll("[data-filter]").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        const f = chip.dataset.filter;
        if (f === "all") renderGrid(products);
        else if (f === "black")
          renderGrid(products.filter((p) => /black/i.test(p.color)));
        else if (f === "white")
          renderGrid(products.filter((p) => /white/i.test(p.color)));
        else renderGrid(products.filter((p) => (p.category || "").includes(f)));
      });
    });

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

    // Bundle strip
    if (bundleStrip && settings.bundle?.enabled !== false) {
      const b = settings.bundle;
      bundleStrip.innerHTML = `
        <div>
          <h3>${esc(b.title || "Buy Black & White as a Pair")}</h3>
          <p class="muted" style="font-size:0.9rem;margin-top:0.35rem">${esc(b.subtitle || "")}</p>
        </div>
        <div class="prices">
          <span class="was">RM${Number(b.compareAt).toFixed(2)}</span>
          <span class="now">RM${Number(b.price).toFixed(2)}</span>
          <span class="product-badge bundle" style="position:static">${esc(String(b.percentOff || 10))}% OFF</span>
        </div>
        <a href="${esc(b.shopeeUrl || settings.store?.shopeeUrl || "#")}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
          Get Pair on Shopee
        </a>`;
      bundleStrip.hidden = false;
    }

    selectProduct(products[0].id);

    document.querySelectorAll("[data-shopee='store']").forEach((el) => {
      el.href = settings.store?.shopeeUrl || "https://shopee.com.my/";
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    });
  }

  function selectProduct(id) {
    const { products, settings } = window.HustleCatalog;
    const p = products.find((x) => x.id === id) || products[0];
    if (!p) return;

    const root = document.getElementById("product-detail-root");
    if (!root) return;

    const imgs = window.HustleCards.orderedImages(p);
    const money = `${p.currency || "RM"}${Number(p.price).toFixed(2)}`;

    root.innerHTML = `
      <div class="shop-layout" style="padding-top:2rem;padding-bottom:3rem">
        <div class="product-gallery">
          <div class="gallery-main gs-media ${imgs[1] ? "" : "single"}" style="aspect-ratio:3/4;position:relative">
            <img class="gs-img-primary" id="gallery-main-img" src="${esc(imgs[0])}" alt="${esc(p.name)} on model" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />
            ${
              imgs[1]
                ? `<img class="gs-img-secondary" src="${esc(imgs[1])}" alt="Alternate view" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />`
                : ""
            }
          </div>
          <p class="muted" style="font-size:0.75rem;margin-top:0.6rem;letter-spacing:0.06em;text-transform:uppercase">Hover image to switch model / product view</p>
          <div class="gallery-thumbs" style="margin-top:0.75rem">
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
          <h1>${esc(p.name)}</h1>
          <p class="product-tagline">${esc(p.description || "")}</p>
          <div class="price-block">
            <span class="current">${esc(money)}</span>
            <span class="each">${esc(p.color || "")} · ${(p.sizes || []).join(" · ")}</span>
          </div>
          <p class="swatch-label">Colour / variant</p>
          <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1.5rem">
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
          <div class="size-options">
            ${(p.sizes || ["S", "M", "L", "XL"])
              .map((s, i) => `<button class="size-btn ${i === 1 ? "active" : ""}" type="button">${esc(s)}</button>`)
              .join("")}
          </div>
          <div class="buy-actions" style="margin-top:1.5rem">
            <a href="${esc(p.shopeeUrl || settings.store?.shopeeUrl || "#")}" class="btn btn-shopee btn-lg btn-block" target="_blank" rel="noopener noreferrer">
              Buy Now on Shopee MY →
            </a>
            <p class="muted" style="font-size:0.8rem;text-align:center">Payment secured on Shopee Malaysia.</p>
          </div>
          <div class="details-list">
            <h3>PRODUCT DETAILS</h3>
            <ul>${(p.details || []).map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
          </div>
        </div>
      </div>`;

    // Hover swap on large gallery
    const media = root.querySelector(".gallery-main.gs-media");
    if (media && imgs[1]) {
      media.addEventListener("mouseenter", () => media.classList.add("is-hover"));
      media.addEventListener("mouseleave", () => media.classList.remove("is-hover"));
      // use same CSS as cards via .gs-card:hover — add class for detail
      const style = document.getElementById("gs-detail-hover-style");
      if (!style) {
        const s = document.createElement("style");
        s.id = "gs-detail-hover-style";
        s.textContent = `
          .gallery-main.gs-media:hover .gs-img-primary { opacity: 0 !important; }
          .gallery-main.gs-media:hover .gs-img-secondary { opacity: 1 !important; }
          .gallery-main.gs-media .gs-img-primary,
          .gallery-main.gs-media .gs-img-secondary { transition: opacity 0.35s ease; }
          .gallery-main.gs-media .gs-img-secondary { opacity: 0; }
        `;
        document.head.appendChild(s);
      }
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
