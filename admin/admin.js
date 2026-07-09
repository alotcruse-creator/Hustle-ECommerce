/**
 * HUSTLE Admin — product, price & content manager
 */
(function () {
  "use strict";

  const TOKEN_KEY = "hustle_admin_token";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  let token = localStorage.getItem(TOKEN_KEY) || "";
  let products = [];
  let settings = null;
  let editingId = null;

  /* ── API ─────────────────────────────────────────────────── */
  async function api(path, options = {}) {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(path, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      logout(false);
      throw new Error(data.error || "Unauthorized");
    }
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  function setStatus(msg, type = "") {
    const el = $("#save-status");
    if (!el) return;
    el.textContent = msg;
    el.className = "status" + (type ? " " + type : "");
    if (msg) setTimeout(() => {
      if (el.textContent === msg) {
        el.textContent = "";
        el.className = "status";
      }
    }, 3200);
  }

  /* ── Auth ────────────────────────────────────────────────── */
  async function login(password) {
    const data = await api("/api/auth", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    token = data.token;
    localStorage.setItem(TOKEN_KEY, token);
    showApp();
    await loadAll();
  }

  function logout(redirect = true) {
    token = "";
    localStorage.removeItem(TOKEN_KEY);
    $("#app").classList.add("hidden");
    $("#login-screen").classList.remove("hidden");
    if (redirect) $("#password")?.focus();
  }

  async function checkSession() {
    if (!token) return false;
    try {
      const data = await api("/api/auth");
      return data.ok;
    } catch {
      return false;
    }
  }

  function showApp() {
    $("#login-screen").classList.add("hidden");
    $("#app").classList.remove("hidden");
  }

  /* ── Data ────────────────────────────────────────────────── */
  async function loadAll() {
    const [p, s] = await Promise.all([
      api("/api/products?all=1"),
      api("/api/settings"),
    ]);
    products = p.products || [];
    settings = s.settings;
    renderProducts();
    renderPricing();
    renderContent();
    renderSizeChart();
    renderLinks();
  }

  /* ── Views ───────────────────────────────────────────────── */
  function switchView(name) {
    $$(".nav-item").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
    $$(".view").forEach((v) => v.classList.add("hidden"));
    $(`#view-${name}`)?.classList.remove("hidden");
    const titles = {
      products: "Products",
      pricing: "Pricing & Bundle",
      content: "Page Content",
      sizechart: "Size Chart",
      links: "Shopee Links",
    };
    $("#view-title").textContent = titles[name] || name;
    $("#btn-add-product").style.display = name === "products" ? "" : "none";
  }

  /* ── Products UI ─────────────────────────────────────────── */
  function renderProducts() {
    const list = $("#product-list");
    if (!products.length) {
      list.innerHTML = `<p class="view-desc">No products yet. Click “+ Add Product”.</p>`;
      return;
    }
    list.innerHTML = products
      .slice()
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((p) => {
        const img = (p.images && p.images[0]) || "";
        return `
        <article class="product-row" data-id="${escapeAttr(p.id)}">
          <img src="${escapeAttr(img)}" alt="" onerror="this.style.opacity=0.3" />
          <div>
            <h3>${escapeHtml(p.name)}${p.color ? " — " + escapeHtml(p.color) : ""}</h3>
            <div class="meta">${escapeHtml(p.category || "tees")} · ${escapeHtml(p.id)}</div>
            <div class="badges">
              ${p.active !== false ? '<span class="pill on">Active</span>' : '<span class="pill off">Hidden</span>'}
              ${p.featured ? '<span class="pill on">Featured</span>' : ""}
              ${p.badge ? `<span class="pill">${escapeHtml(p.badge)}</span>` : ""}
            </div>
          </div>
          <div class="price">${escapeHtml(p.currency || "RM")}${Number(p.price).toFixed(2)}</div>
        </article>`;
      })
      .join("");

    list.querySelectorAll(".product-row").forEach((row) => {
      row.addEventListener("click", () => openProduct(row.dataset.id));
    });
  }

  function openProduct(id) {
    editingId = id || null;
    const p = id ? products.find((x) => x.id === id) : null;
    $("#modal-title").textContent = p ? "Edit product" : "Add product";
    $("#p-id").value = p?.id || "";
    $("#p-name").value = p?.name || "";
    $("#p-color").value = p?.color || "";
    $("#p-price").value = p?.price ?? "";
    $("#p-compare").value = p?.compareAt ?? "";
    $("#p-desc").value = p?.description || "";
    $("#p-details").value = (p?.details || []).join("\n");
    $("#p-sizes").value = (p?.sizes || ["S", "M", "L", "XL"]).join(", ");
    $("#p-badge").value = p?.badge || "";
    $("#p-images").value = (p?.images || []).join("\n");
    $("#p-shopee").value = p?.shopeeUrl || "https://shopee.com.my/";
    $("#p-category").value = p?.category || "tees";
    $("#p-sort").value = p?.sortOrder ?? products.length + 1;
    $("#p-featured").checked = Boolean(p?.featured);
    $("#p-active").checked = p ? p.active !== false : true;
    $("#btn-delete-product").style.display = p ? "" : "none";
    $("#modal").classList.remove("hidden");
  }

  function closeModal() {
    $("#modal").classList.add("hidden");
    editingId = null;
  }

  function formToProduct() {
    return {
      id: $("#p-id").value || undefined,
      name: $("#p-name").value.trim(),
      color: $("#p-color").value.trim(),
      price: Number($("#p-price").value),
      compareAt: $("#p-compare").value === "" ? null : Number($("#p-compare").value),
      description: $("#p-desc").value.trim(),
      details: $("#p-details").value,
      sizes: $("#p-sizes").value,
      badge: $("#p-badge").value.trim(),
      images: $("#p-images").value,
      shopeeUrl: $("#p-shopee").value.trim(),
      category: $("#p-category").value.trim() || "tees",
      sortOrder: Number($("#p-sort").value) || 0,
      featured: $("#p-featured").checked,
      active: $("#p-active").checked,
    };
  }

  async function saveProduct(e) {
    e.preventDefault();
    const body = formToProduct();
    try {
      if (editingId) {
        await api(`/api/products/${encodeURIComponent(editingId)}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        setStatus("Product updated", "ok");
      } else {
        await api("/api/products", { method: "POST", body: JSON.stringify(body) });
        setStatus("Product created", "ok");
      }
      closeModal();
      await loadAll();
    } catch (err) {
      setStatus(err.message, "err");
      alert(err.message);
    }
  }

  async function deleteProduct() {
    if (!editingId) return;
    if (!confirm("Delete this product permanently?")) return;
    try {
      await api(`/api/products/${encodeURIComponent(editingId)}`, { method: "DELETE" });
      setStatus("Product deleted", "ok");
      closeModal();
      await loadAll();
    } catch (err) {
      setStatus(err.message, "err");
    }
  }

  /* ── Pricing ─────────────────────────────────────────────── */
  function renderPricing() {
    const wrap = $("#price-table");
    wrap.innerHTML = products
      .map(
        (p) => `
      <div class="price-row" data-id="${escapeAttr(p.id)}">
        <div>
          <strong>${escapeHtml(p.name)}${p.color ? " — " + escapeHtml(p.color) : ""}</strong>
          <div class="meta" style="color:var(--muted);font-size:0.8rem">${escapeHtml(p.id)}</div>
        </div>
        <label>Price
          <input type="number" step="0.01" min="0" class="price-input" value="${Number(p.price)}" />
        </label>
        <label>Compare-at
          <input type="number" step="0.01" min="0" class="compare-input" value="${p.compareAt ?? ""}" placeholder="—" />
        </label>
      </div>`
      )
      .join("");

    const b = settings?.bundle || {};
    $("#bundle-enabled").checked = b.enabled !== false;
    $("#bundle-title").value = b.title || "";
    $("#bundle-subtitle").value = b.subtitle || "";
    $("#bundle-price").value = b.price ?? "";
    $("#bundle-compare").value = b.compareAt ?? "";
    $("#bundle-percent").value = b.percentOff ?? "";
    $("#bundle-save").value = b.save ?? "";
    $("#bundle-shopee").value = b.shopeeUrl || "";
  }

  async function savePricing() {
    try {
      // Update each product price from table
      const rows = $$("#price-table .price-row");
      for (const row of rows) {
        const id = row.dataset.id;
        const price = Number(row.querySelector(".price-input").value);
        const compareRaw = row.querySelector(".compare-input").value;
        const compareAt = compareRaw === "" ? null : Number(compareRaw);
        await api(`/api/products/${encodeURIComponent(id)}`, {
          method: "PUT",
          body: JSON.stringify({ price, compareAt }),
        });
      }

      await api("/api/settings", {
        method: "PUT",
        body: JSON.stringify({
          bundle: {
            enabled: $("#bundle-enabled").checked,
            title: $("#bundle-title").value.trim(),
            subtitle: $("#bundle-subtitle").value.trim(),
            price: Number($("#bundle-price").value),
            compareAt: Number($("#bundle-compare").value),
            percentOff: Number($("#bundle-percent").value),
            save: Number($("#bundle-save").value),
            shopeeUrl: $("#bundle-shopee").value.trim(),
          },
        }),
      });

      setStatus("Pricing saved", "ok");
      await loadAll();
    } catch (err) {
      setStatus(err.message, "err");
      alert(err.message);
    }
  }

  /* ── Content ─────────────────────────────────────────────── */
  function renderContent() {
    const c = settings?.content || {};
    $("#c-heroTag").value = c.heroTag || "";
    $("#c-heroTitle").value = c.heroTitle || "";
    $("#c-heroSubtitle").value = c.heroSubtitle || "";
    $("#c-heroBody").value = c.heroBody || "";
    $("#c-aboutTitle").value = c.aboutTitle || "";
    $("#c-aboutBody").value = c.aboutBody || "";
    $("#c-manifesto").value = c.manifesto || "";
  }

  async function saveContent() {
    try {
      await api("/api/settings", {
        method: "PUT",
        body: JSON.stringify({
          content: {
            heroTag: $("#c-heroTag").value.trim(),
            heroTitle: $("#c-heroTitle").value.trim(),
            heroSubtitle: $("#c-heroSubtitle").value.trim(),
            heroBody: $("#c-heroBody").value.trim(),
            aboutTitle: $("#c-aboutTitle").value.trim(),
            aboutBody: $("#c-aboutBody").value.trim(),
            manifesto: $("#c-manifesto").value.trim(),
          },
        }),
      });
      setStatus("Content saved", "ok");
      await loadAll();
    } catch (err) {
      setStatus(err.message, "err");
    }
  }

  /* ── Size chart ──────────────────────────────────────────── */
  function renderSizeChart() {
    const rows = settings?.sizeChart?.rows || [];
    $("#size-note").value = settings?.sizeChart?.note || "";
    const wrap = $("#size-rows");
    wrap.innerHTML = rows
      .map(
        (r, i) => `
      <div class="size-row" data-i="${i}">
        <label>Size <input class="sz-size" value="${escapeAttr(r.size)}" /></label>
        <label>Chest <input class="sz-chest" value="${escapeAttr(r.chest)}" /></label>
        <label>Length <input class="sz-length" value="${escapeAttr(r.length)}" /></label>
        <label>Sleeve <input class="sz-sleeve" value="${escapeAttr(r.sleeve)}" /></label>
        <button type="button" class="btn btn-ghost sz-remove">✕</button>
      </div>`
      )
      .join("");

    wrap.querySelectorAll(".sz-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.closest(".size-row").remove();
      });
    });
  }

  function addSizeRow() {
    const wrap = $("#size-rows");
    const div = document.createElement("div");
    div.className = "size-row";
    div.innerHTML = `
      <label>Size <input class="sz-size" value="" /></label>
      <label>Chest <input class="sz-chest" value="" /></label>
      <label>Length <input class="sz-length" value="" /></label>
      <label>Sleeve <input class="sz-sleeve" value="" /></label>
      <button type="button" class="btn btn-ghost sz-remove">✕</button>`;
    div.querySelector(".sz-remove").addEventListener("click", () => div.remove());
    wrap.appendChild(div);
  }

  async function saveSizeChart() {
    try {
      const rows = $$("#size-rows .size-row").map((row) => ({
        size: row.querySelector(".sz-size").value.trim(),
        chest: row.querySelector(".sz-chest").value.trim(),
        length: row.querySelector(".sz-length").value.trim(),
        sleeve: row.querySelector(".sz-sleeve").value.trim(),
      })).filter((r) => r.size);

      await api("/api/settings", {
        method: "PUT",
        body: JSON.stringify({
          sizeChart: {
            note: $("#size-note").value.trim(),
            rows,
          },
        }),
      });
      setStatus("Size chart saved", "ok");
      await loadAll();
    } catch (err) {
      setStatus(err.message, "err");
    }
  }

  /* ── Links ───────────────────────────────────────────────── */
  function renderLinks() {
    const s = settings?.store || {};
    $("#store-brand").value = s.brand || "HUSTLE";
    $("#store-tagline").value = s.tagline || "";
    $("#store-shopee").value = s.shopeeUrl || "";
  }

  async function saveLinks() {
    try {
      await api("/api/settings", {
        method: "PUT",
        body: JSON.stringify({
          store: {
            brand: $("#store-brand").value.trim(),
            tagline: $("#store-tagline").value.trim(),
            shopeeUrl: $("#store-shopee").value.trim(),
          },
        }),
      });
      setStatus("Store links saved", "ok");
      await loadAll();
    } catch (err) {
      setStatus(err.message, "err");
    }
  }

  /* ── Utils ───────────────────────────────────────────────── */
  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  /* ── Init ────────────────────────────────────────────────── */
  async function init() {
    $("#login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const err = $("#login-error");
      err.classList.add("hidden");
      try {
        await login($("#password").value);
      } catch (ex) {
        err.textContent = ex.message || "Login failed";
        err.classList.remove("hidden");
      }
    });

    $$(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => switchView(btn.dataset.view));
    });

    $("#btn-logout").addEventListener("click", () => logout());
    $("#btn-add-product").addEventListener("click", () => openProduct(null));
    $("#product-form").addEventListener("submit", saveProduct);
    $("#btn-delete-product").addEventListener("click", deleteProduct);
    $("#btn-save-bundle").addEventListener("click", savePricing);
    $("#btn-save-content").addEventListener("click", saveContent);
    $("#btn-save-size").addEventListener("click", saveSizeChart);
    $("#btn-add-size").addEventListener("click", addSizeRow);
    $("#btn-save-links").addEventListener("click", saveLinks);

    $$("[data-close]").forEach((el) => el.addEventListener("click", closeModal));

    $("#btn-seed").addEventListener("click", async () => {
      if (!confirm("Reset ALL products and settings to launch defaults? This cannot be undone.")) return;
      try {
        await api("/api/seed", { method: "POST", body: "{}" });
        setStatus("Reset complete", "ok");
        await loadAll();
      } catch (err) {
        setStatus(err.message, "err");
      }
    });

    if (await checkSession()) {
      showApp();
      await loadAll();
    }
  }

  init();
})();
