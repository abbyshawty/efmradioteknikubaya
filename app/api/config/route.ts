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
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan konfigurasi." }, { status: 500 });
  }
}
