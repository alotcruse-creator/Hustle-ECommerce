import { requireAdmin, json, corsOptions } from "../_shared/auth.js";
import { getProducts, saveProducts, newId } from "../_shared/store.js";

export async function onRequestOptions() {
  return corsOptions();
}

/** Public: list products (active only unless ?all=1 + admin) */
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  let products = await getProducts(env);

  const wantAll = url.searchParams.get("all") === "1";
  if (wantAll) {
    const denied = await requireAdmin(request, env);
    if (denied) {
      // public fallback: active only
      products = products.filter((p) => p.active !== false);
    }
  } else {
    products = products.filter((p) => p.active !== false);
  }

  products = products.slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  return json({ products });
}

/** Admin: create product */
export async function onRequestPost(context) {
  const { request, env } = context;
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (!body.name || body.price == null) {
    return json({ error: "name and price are required" }, 400);
  }

  const products = await getProducts(env);
  const id = body.id || newId(body.name, body.color);
  if (products.some((p) => p.id === id)) {
    return json({ error: "Product id already exists" }, 409);
  }

  const product = normalizeProduct({ ...body, id });
  products.push(product);
  await saveProducts(env, products);
  return json({ ok: true, product }, 201);
}

/** Admin: replace entire catalog (bulk save / reorder) */
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

  if (!Array.isArray(body.products)) {
    return json({ error: "products array required" }, 400);
  }

  const products = body.products.map((p, i) =>
    normalizeProduct({ ...p, id: p.id || newId(p.name, p.color || i), sortOrder: p.sortOrder ?? i + 1 })
  );
  await saveProducts(env, products);
  return json({ ok: true, products });
}

function normalizeProduct(p) {
  return {
    id: String(p.id),
    name: String(p.name || "Untitled").trim(),
    color: String(p.color || "").trim(),
    price: Number(p.price) || 0,
    compareAt: p.compareAt != null && p.compareAt !== "" ? Number(p.compareAt) : null,
    currency: p.currency || "RM",
    description: String(p.description || ""),
    details: Array.isArray(p.details)
      ? p.details.map(String).filter(Boolean)
      : String(p.details || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
    sizes: Array.isArray(p.sizes)
      ? p.sizes
      : String(p.sizes || "S,M,L,XL")
          .split(/[,\n]/)
          .map((s) => s.trim())
          .filter(Boolean),
    images: Array.isArray(p.images)
      ? p.images.map(String).filter(Boolean)
      : String(p.images || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
    shopeeUrl: String(p.shopeeUrl || "https://shopee.com.my/").trim(),
    featured: Boolean(p.featured),
    active: p.active === false ? false : true,
    badge: String(p.badge || ""),
    category: String(p.category || "tees"),
    sortOrder: Number(p.sortOrder) || 0,
  };
}
