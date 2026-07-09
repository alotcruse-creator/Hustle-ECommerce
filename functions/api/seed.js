import { requireAdmin, json, corsOptions } from "../_shared/auth.js";
import { DEFAULT_PRODUCTS, DEFAULT_SETTINGS, KEYS } from "../_shared/defaults.js";

export async function onRequestOptions() {
  return corsOptions();
}

/** Admin only: reset catalog + settings to launch defaults */
export async function onRequestPost(context) {
  const { request, env } = context;
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  await env.HUSTLE_DATA.put(KEYS.products, JSON.stringify(DEFAULT_PRODUCTS));
  await env.HUSTLE_DATA.put(KEYS.settings, JSON.stringify(DEFAULT_SETTINGS));
  return json({
    ok: true,
    message: "Reset to default products & settings",
    products: DEFAULT_PRODUCTS.length,
  });
}
