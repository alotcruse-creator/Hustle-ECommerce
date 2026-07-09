/**
 * About page content from API settings
 */
(function () {
  "use strict";

  async function init() {
    await window.HustleCatalog.ready;
    const c = window.HustleCatalog.settings?.content || {};
    const store = window.HustleCatalog.settings?.store || {};

    const set = (sel, val) => {
      const el = document.querySelector(sel);
      if (el && val) el.textContent = val;
    };

    set("[data-content='aboutTitle']", c.aboutTitle);
    set("[data-content='aboutBody']", c.aboutBody);
    set("[data-content='manifesto']", c.manifesto);

    document.querySelectorAll("[data-shopee='store']").forEach((el) => {
      el.href = store.shopeeUrl || "https://shopee.com.my/";
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
