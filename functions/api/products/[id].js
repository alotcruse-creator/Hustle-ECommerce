import { requireAdmin, json, corsOptions } from "../../_shared/auth.js";
import { getProducts, saveProducts } from "../../_shared/store.js";

export async function onRequestOptions() {
  return corsOptions();
}

export async function onRequestGet(context) {
  const { env, params } = context;
  const products = await getProducts(env);
  const product = products.find((p) => p.id === params.id);
  if (!product) return json({ error: "Not found" }, 404);
  return json({ product });
}

export async function onRequestPut(context) {
  const { request, env, params } = context;
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const products = await getProducts(env);
  const idx = products.findIndex((p) => p.id === params.id);
  if (idx === -1) return json({ error: "Not found" }, 404);

  const prev = products[idx];
  products[idx] = {
    ...prev,
    ...body,
    id: prev.id,
    price: body.price != null ? Number(body.price) : prev.price,
    compareAt:
      body.compareAt === "" || body.compareAt == null
        ? body.compareAt === ""
          ? null
          : prev.compareAt
        : Number(body.compareAt),
    details: normalizeList(body.details, prev.details),
    sizes: normalizeList(body.sizes, prev.sizes, true),
    images: normalizeList(body.images, prev.images),
    featured: body.featured != null ? Boolean(body.featured) : prev.featured,
    active: body.active != null ? Boolean(body.active) : prev.active,
  };

  await saveProducts(env, products);
  return json({ ok: true, product: products[idx] });
}

export async function onRequestDelete(context) {
  const { env, params, request } = context;
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  const products = await getProducts(env);
  const next = products.filter((p) => p.id !== params.id);
  if (next.length === products.length) return json({ error: "Not found" }, 404);

  await saveProducts(env, next);
  return json({ ok: true });
}

function normalizeList(val, fallback, commaOk = false) {
  if (val == null) return fallback || [];
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === "string") {
    const sep = commaOk ? /[,\n]/ : /\n/;
    return val
      .split(sep)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return fallback || [];
}
