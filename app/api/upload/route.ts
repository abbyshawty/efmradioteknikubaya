import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { verifySessionFromCookieHeader } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB, longgar untuk foto hasil crop
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function POST(req: NextRequest) {
  const authed = verifySessionFromCookieHeader(req.headers.get("cookie"));
  if (!authed) {
    return NextResponse.json({ error: "Sesi admin tidak valid. Silakan login ulang." }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Penyimpanan foto (Vercel Blob) belum diatur di server. Lihat README bagian Vercel Blob." },
      { status: 500 }
    );
  }

  const contentType = req.headers.get("content-type") || "";
  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json(
      { error: "Format file tidak didukung. Gunakan PNG, JPG, atau WebP." },
      { status: 400 }
    );
  }

  const buffer = await req.arrayBuffer();
  if (buffer.byteLength === 0) {
    return NextResponse.json({ error: "File kosong." }, { status: 400 });
  }
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Ukuran file terlalu besar (maksimal 8 MB)." }, { status: 400 });
  }

  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const filename = `efm/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  try {
    const blob = await put(filename, buffer, {
      access: "public",
      contentType,
    });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch {
    return NextResponse.json({ error: "Gagal mengunggah file." }, { status: 500 });
  }
}
