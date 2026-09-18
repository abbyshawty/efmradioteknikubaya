// ============================================================
//  Autentikasi admin: token sesi yang ditandatangani (signed cookie)
//  + pembatasan percobaan login (rate limiting).
//
//  Kenapa begini, bukan cuma cek password tiap request:
//  - Sekali login, admin tidak perlu ketik ulang password tiap
//    klik Simpan -- sesi tersimpan di cookie HTTP-only selama
//    beberapa jam.
//  - Cookie ditandatangani (HMAC) supaya tidak bisa dipalsukan
//    tanpa tahu ADMIN_SESSION_SECRET / ADMIN_PASSWORD di server.
// ============================================================
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redis } from "./storage";

const COOKIE_NAME = "efm_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 jam

function getSecret(): string {
  // ✏️ Sebaiknya set ADMIN_SESSION_SECRET sendiri di .env.local / Vercel.
  // Kalau tidak diset, fallback ke ADMIN_PASSWORD supaya tetap jalan,
  // tapi ini kurang ideal -- dua rahasia berbeda lebih aman daripada satu.
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "insecure-fallback-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function createSessionToken(): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const nonce = randomBytes(8).toString("hex");
  const payload = `${exp}.${nonce}`;
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [expStr, nonce, sig] = parts;
  const payload = `${expStr}.${nonce}`;
  const expectedSig = sign(payload);
  if (!safeEqual(sig, expectedSig)) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  return true;
}

/** Dipakai di Server Component (app/admin/page.tsx) untuk cek sesi. */
export function hasValidAdminSession(): boolean {
  const token = cookies().get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export function setSessionCookie(res: { cookies: { set: Function } }) {
  res.cookies.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function clearSessionCookie(res: { cookies: { set: Function } }) {
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/** Cek sesi dari dalam Route Handler (app/api/**\/route.ts) lewat cookie header. */
export function verifySessionFromCookieHeader(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return verifySessionToken(match?.[1]);
}

// ------------------------------------------------------------
//  Rate limiting percobaan login: maksimal 8 kali gagal per 15
//  menit per alamat IP. Pakai Redis kalau ada (konsisten lintas
//  cold-start di Vercel); fallback ke memori proses untuk dev
//  lokal tanpa Redis (tidak sempurna, tapi cukup untuk lokal).
// ------------------------------------------------------------
const MAX_ATTEMPTS = 8;
const WINDOW_SEC = 15 * 60;
const memoryAttempts = new Map<string, { count: number; resetAt: number }>();

export async function isRateLimited(ip: string): Promise<boolean> {
  if (redis) {
    const count = await redis.get<number>(`admin:login:fail:${ip}`);
    return (count ?? 0) >= MAX_ATTEMPTS;
  }
  const entry = memoryAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    memoryAttempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export async function recordFailedAttempt(ip: string): Promise<void> {
  if (redis) {
    const key = `admin:login:fail:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, WINDOW_SEC);
    return;
  }
  const entry = memoryAttempts.get(ip);
  if (!entry || Date.now() > entry.resetAt) {
    memoryAttempts.set(ip, { count: 1, resetAt: Date.now() + WINDOW_SEC * 1000 });
  } else {
    entry.count++;
  }
}

export async function clearFailedAttempts(ip: string): Promise<void> {
  if (redis) {
    await redis.del(`admin:login:fail:${ip}`);
    return;
  }
  memoryAttempts.delete(ip);
}

export function getClientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") || "unknown";
}
