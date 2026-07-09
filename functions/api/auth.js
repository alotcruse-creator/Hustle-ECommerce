import { createToken, json, corsOptions } from "../_shared/auth.js";

export async function onRequestOptions() {
  return corsOptions();
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const password = body.password || "";
  const expected = env.ADMIN_PASSWORD || "hustle-admin-2026";

  if (password !== expected) {
    return json({ error: "Invalid password" }, 401);
  }

  const secret = env.ADMIN_SECRET || env.ADMIN_PASSWORD || "hustle-dev-secret";
  const token = await createToken(secret);
  return json({ ok: true, token, expiresInDays: 7 });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const { verifyToken, getBearer } = await import("../_shared/auth.js");
  const secret = env.ADMIN_SECRET || env.ADMIN_PASSWORD || "hustle-dev-secret";
  const token = getBearer(request);
  const valid = await verifyToken(secret, token);
  return json({ ok: valid });
}
