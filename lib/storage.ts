// ============================================================
//  Adapter penyimpanan.
//  - Jika ENV Upstash diset  -> simpan ke Redis (Vercel/Netlify).
//  - Jika tidak              -> simpan ke file data/config.json
//                               (cocok untuk dev lokal / server Node).
// ============================================================
import { Redis } from "@upstash/redis";

const KEY = "efm:config:v2";
// Upstash yang dipasang lewat Vercel Marketplace / Storage memakai nama
// KV_REST_API_*, sedangkan yang disalin manual dari console Upstash memakai
// UPSTASH_REDIS_REST_*. Keduanya diterima.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

export const storageMode: "redis" | "file" = redis ? "redis" : "file";

// diekspor supaya lib/auth.ts (rate limiting login) bisa memakai koneksi
// Redis yang sama, tanpa membuat koneksi baru
export { redis };

export async function storageGet(): Promise<unknown | null> {
  if (redis) {
    return (await redis.get(KEY)) ?? null;
  }
  const fs = await import("fs");
  const path = await import("path");
  const file = path.join(process.cwd(), "data", "config.json");
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return null;
  }
}

export async function storageSet(value: unknown): Promise<void> {
  if (redis) {
    await redis.set(KEY, value);
    return;
  }
  const fs = await import("fs");
  const path = await import("path");
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "config.json"), JSON.stringify(value, null, 2), "utf-8");
}
