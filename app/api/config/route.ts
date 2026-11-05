import { NextRequest, NextResponse } from "next/server";
import { readConfig, writeConfig, type SiteConfig } from "@/lib/config";
import { storageMode } from "@/lib/storage";
import { verifySessionFromCookieHeader } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Field yang TIDAK boleh dikirim ke browser pengunjung biasa.
 *  sheetWebhookUrl khususnya: kalau bocor ke publik, siapa pun bisa
 *  kirim data langsung ke Google Sheets tanpa lewat form situs. */
function toPublicConfig(config: SiteConfig): Omit<SiteConfig, "sheetWebhookUrl"> {
  const { sheetWebhookUrl, ...publicConfig } = config;
  return publicConfig;
}

// GET: konfigurasi publik (dipakai halaman utama). Tidak berisi field rahasia.
export async function GET() {
  const config = await readConfig();
  return NextResponse.json(toPublicConfig(config));
}

// POST: update konfigurasi. Butuh sesi admin yang valid (login lewat /admin dulu).
export async function POST(req: NextRequest) {
  const authed = verifySessionFromCookieHeader(req.headers.get("cookie"));
  if (!authed) {
    return NextResponse.json({ error: "Sesi admin tidak valid. Silakan login ulang." }, { status: 401 });
  }

  let patch: Record<string, unknown>;
  try {
    patch = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  try {
    const saved = await writeConfig(patch as Partial<SiteConfig>);
    return NextResponse.json({ ok: true, config: saved, storage: storageMode });
  } catch (err: any) {
    console.error("[config] gagal menyimpan:", err);
    // Pesan ini hanya sampai ke admin yang sudah login, jadi aman memberi
    // alasan yang jelas supaya masalahnya bisa langsung dibereskan.
    let reason: string;
    if (storageMode === "file" && process.env.VERCEL) {
      reason =
        "Upstash Redis belum terbaca di server (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN, " +
        "atau KV_REST_API_URL / KV_REST_API_TOKEN). " +
        "Vercel tidak bisa menyimpan ke file lokal -- isi kedua variabel itu di Settings > Environment Variables lalu redeploy.";
    } else if (storageMode === "redis") {
      reason = `Redis menolak penyimpanan: ${err?.message || err}. Pastikan token Upstash bukan token read-only.`;
    } else {
      reason = err?.message || String(err);
    }
    return NextResponse.json({ error: `Gagal menyimpan konfigurasi. ${reason}` }, { status: 500 });
  }
}
