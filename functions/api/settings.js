import { requireAdmin, json, corsOptions } from "../_shared/auth.js";
import { getSettings, saveSettings } from "../_shared/store.js";

export async function onRequestOptions() {
  return corsOptions();
}

export async function onRequestGet(context) {
  const settings = await getSettings(context.env);
  return json({ settings });
}

export async function onRequestPut(context) {
  const { request, env } = context;
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const current = await getSettings(env);
  const next = {
    store: { ...current.store, ...(body.store || {}) },
    bundle: { ...current.bundle, ...(body.bundle || {}) },
    content: { ...current.content, ...(body.content || {}) },
    sizeChart: body.sizeChart || current.sizeChart,
  };

  // coerce numbers on bundle
  if (next.bundle) {
    next.bundle.price = Number(next.bundle.price) || 0;
    next.bundle.compareAt = Number(next.bundle.compareAt) || 0;
    next.bundle.percentOff = Number(next.bundle.percentOff) || 0;
    next.bundle.save = Number(next.bundle.save) || 0;
    next.bundle.enabled = Boolean(next.bundle.enabled);
  }

  await saveSettings(env, next);
  return json({ ok: true, settings: next });
}
