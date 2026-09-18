// ============================================================
//  Adapter penyimpanan.
//  - Jika ENV Upstash diset  -> simpan ke Redis (Vercel/Netlify).
//  - Jika tidak              -> simpan ke file data/config.json
//                               (cocok untuk dev lokal / server Node).
// ============================================================
import { Redis } from "@upstash/redis";

const KEY = "efm:config:v2";
const hasRedis = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);
const redis = hasRedis ? Redis.fromEnv() : null;

export const storageMode: "redis" | "file" = redis ? "redis" : "file";

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
