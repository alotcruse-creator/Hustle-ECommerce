import { DEFAULT_PRODUCTS, DEFAULT_SETTINGS, KEYS } from "./defaults.js";

export async function getProducts(env) {
  if (!env.HUSTLE_DATA) return structuredClone(DEFAULT_PRODUCTS);
  const raw = await env.HUSTLE_DATA.get(KEYS.products, "json");
  if (!raw || !Array.isArray(raw) || raw.length === 0) {
    return structuredClone(DEFAULT_PRODUCTS);
  }
  return raw;
}

export async function saveProducts(env, products) {
  await env.HUSTLE_DATA.put(KEYS.products, JSON.stringify(products));
  return products;
}

export async function getSettings(env) {
  if (!env.HUSTLE_DATA) return structuredClone(DEFAULT_SETTINGS);
  const raw = await env.HUSTLE_DATA.get(KEYS.settings, "json");
  if (!raw) return structuredClone(DEFAULT_SETTINGS);
  return deepMerge(structuredClone(DEFAULT_SETTINGS), raw);
}

export async function saveSettings(env, settings) {
  await env.HUSTLE_DATA.put(KEYS.settings, JSON.stringify(settings));
  return settings;
}

function deepMerge(base, over) {
  for (const k of Object.keys(over || {})) {
    if (
      over[k] &&
      typeof over[k] === "object" &&
      !Array.isArray(over[k]) &&
      base[k] &&
      typeof base[k] === "object"
    ) {
      base[k] = deepMerge(base[k], over[k]);
    } else {
      base[k] = over[k];
    }
  }
  return base;
}

export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);
}

export function newId(name, color) {
  const base = slugify(`${name}-${color || Date.now()}`);
  return base || `product-${Date.now()}`;
}
