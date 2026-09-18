import { NextRequest, NextResponse } from "next/server";
import { readConfig } from "@/lib/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Payload = {
  nama?: string;
  lagu?: string;
  link?: string;
  hari?: string;
  pesan?: string;
};

const REQUIRED: (keyof Payload)[] = ["nama", "lagu", "link", "hari"];
const MAX_LEN = 500; // batas wajar per field, cegah body raksasa/spam

export async function POST(req: NextRequest) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  for (const field of REQUIRED) {
    const value = body[field];
    if (typeof value !== "string" || !value.trim()) {
      return NextResponse.json({ error: `Field ${field} wajib diisi.` }, { status: 400 });
    }
  }
  for (const key of Object.keys(body) as (keyof Payload)[]) {
    if (typeof body[key] === "string" && (body[key] as string).length > MAX_LEN) {
      return NextResponse.json({ error: "Salah satu isian terlalu panjang." }, { status: 400 });
    }
  }

  const config = await readConfig();
  if (!config.sheetWebhookUrl) {
    // Belum dikonfigurasi lewat /admin -- jangan gagalkan pengalaman
    // pengguna, cukup beri tahu bahwa request belum benar-benar tersimpan.
    return NextResponse.json(
      { ok: false, error: "Webhook belum dikonfigurasi. Hubungi admin situs." },
      { status: 200 }
    );
  }

  try {
    const params = new URLSearchParams({
      nama: body.nama!.trim(),
      lagu: body.lagu!.trim(),
      link: body.link!.trim(),
      hari: body.hari!.trim(),
      pesan: (body.pesan || "").trim(),
    });
    // mode "no-cors" tidak berlaku di sisi server (fetch server-to-server
    // tidak dibatasi CORS), jadi di sini kita bisa benar-benar menunggu hasilnya.
    await fetch(config.sheetWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Gagal mengirim ke Google Sheets." }, { status: 502 });
  }
}
