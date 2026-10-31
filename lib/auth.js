import crypto from "crypto";

// Session admin signée (HMAC) — cookie httpOnly, expiration 7 jours.
const COOKIE = "galerie_admin";
const MAX_AGE = 7 * 24 * 3600;

function secret() {
  return process.env.SESSION_SECRET || "dev-secret-a-remplacer";
}

function sign(payload) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function makeToken() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `admin.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, exp, sig] = parts;
  const payload = `${role}.${exp}`;
  const expected = sign(payload);
  if (sig.length !== expected.length) return false;
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  } catch { return false; }
  return Number(exp) > Math.floor(Date.now() / 1000);
}

export function checkPassword(pwd) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || !pwd) return false;
  const a = Buffer.from(pwd), b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function sessionCookie(token) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export function clearCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export async function isAuthed(req) {
  const token = req.cookies?.get(COOKIE)?.value;
  return verifyToken(token);
}
