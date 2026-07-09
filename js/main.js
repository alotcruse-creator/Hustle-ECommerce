/**
 * HUSTLE — Site interactions
 */
(function () {
  "use strict";

  const cfg = window.HUSTLE_CONFIG || {};
  const shopee = cfg.shopee || {};

  /* ── Nav scroll + mobile menu ─────────────────────────────── */
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", links.classList.contains("open"));
    });
    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => links.classList.remove("open"));
    });
  }

  /* ── Active nav link ──────────────────────────────────────── */
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a[data-page]").forEach((a) => {
    if (a.getAttribute("data-page") === path || (path === "" && a.getAttribute("data-page") === "index.html")) {
      a.classList.add("active");
    }
  });

  /* ── Shopee outbound links ────────────────────────────────── */
  function bindShopee(selector, url) {
    document.querySelectorAll(selector).forEach((el) => {
      if (!url) return;
      el.setAttribute("href", url);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    });
  }

  bindShopee("[data-shopee='store']", shopee.store);
  bindShopee("[data-shopee='black']", shopee.oversizedTeeBlack);
  bindShopee("[data-shopee='white']", shopee.oversizedTeeWhite);
  bindShopee("[data-shopee='bundle']", shopee.blackWhiteBundle || shopee.store);

  /* ── Shop: color / size / gallery ─────────────────────────── */
  const galleryMain = document.getElementById("gallery-main-img");
  const thumbs = document.querySelectorAll(".gallery-thumb");
  const swatches = document.querySelectorAll(".swatch");
  const sizeBtns = document.querySelectorAll(".size-btn");
  const colorLabel = document.getElementById("selected-color");
  const buyBlack = document.querySelector("[data-shopee='black']");
  const buyWhite = document.querySelector("[data-shopee='white']");

  let selectedColor = "black";

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      thumbs.forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
      const src = thumb.dataset.src || thumb.querySelector("img")?.src;
      if (galleryMain && src) {
        galleryMain.src = src;
        galleryMain.alt = thumb.dataset.alt || galleryMain.alt;
      }
    });
  });

  swatches.forEach((sw) => {
    sw.addEventListener("click", () => {
      swatches.forEach((s) => s.classList.remove("active"));
      sw.classList.add("active");
      selectedColor = sw.dataset.color || "black";
      if (colorLabel) {
        colorLabel.textContent = selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1);
      }
      // Prefer matching product gallery image if marked
      const match = document.querySelector(`.gallery-thumb[data-color="${selectedColor}"]`);
      if (match) match.click();
    });
  });

  sizeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      sizeBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Primary buy button switches Shopee target by selected colour
  const primaryBuy = document.getElementById("primary-buy");
  if (primaryBuy) {
    primaryBuy.addEventListener("click", (e) => {
      e.preventDefault();
      const url =
        selectedColor === "white"
          ? shopee.oversizedTeeWhite || shopee.store
          : shopee.oversizedTeeBlack || shopee.store;
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  /* ── Scroll reveal ────────────────────────────────────────── */
  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  /* ── Year in footer ───────────────────────────────────────── */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
