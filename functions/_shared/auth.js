/**
 * Simple HMAC token auth for admin API.
 * Token format: base64url(payload).base64url(signature)
 * payload = { exp: unix_ms, sub: "admin" }
 */

function b64url(buf) {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const bin = atob(str);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmacSign(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return b64url(sig);
}

export async function createToken(secret, ttlMs = 7 * 24 * 60 * 60 * 1000) {
  const payload = JSON.stringify({ sub: "admin", exp: Date.now() + ttlMs });
  const payloadB64 = b64url(new TextEncoder().encode(payload));
  const sig = await hmacSign(secret, payloadB64);
  return `${payloadB64}.${sig}`;
}

export async function verifyToken(secret, token) {
  if (!token || !secret) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, sig] = parts;
  const expected = await hmacSign(secret, payloadB64);
  if (sig !== expected) return false;
  try {
    const json = new TextDecoder().decode(b64urlDecode(payloadB64));
    const data = JSON.parse(json);
    if (data.exp < Date.now()) return false;
    return data.sub === "admin";
  } catch {
    return false;
  }
}

export function getBearer(request) {
  const h = request.headers.get("Authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

export async function requireAdmin(request, env) {
  const secret = env.ADMIN_SECRET || env.ADMIN_PASSWORD || "hustle-dev-secret";
  const token = getBearer(request);
  if (!(await verifyToken(secret, token))) {
    return json({ error: "Unauthorized" }, 401);
  }
  return null;
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      ...extraHeaders,
    },
  });
}

export function corsOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
}
