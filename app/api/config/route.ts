import { NextRequest, NextResponse } from "next/server";
import { readConfig, writeConfig } from "@/lib/config";
import { storageMode } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET: konfigurasi publik (dipakai halaman utama & prefill admin)
export async function GET() {
  const config = await readConfig();
  return NextResponse.json(config);
}

// POST: update konfigurasi (butuh password admin)
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD belum diset di server (lihat .env.local)." },
      { status: 500 }
    );
  }
  if ((body.password ?? "") !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Password admin salah." }, { status: 401 });
  }

  const { password, ...patch } = body;
  void password;

  try {
    const saved = await writeConfig(patch as Record<string, unknown>);
    return NextResponse.json({ ok: true, config: saved, storage: storageMode });
  } catch (e) {
    return NextResponse.json({ error: "Gagal menyimpan konfigurasi." }, { status: 500 });
  }
}
