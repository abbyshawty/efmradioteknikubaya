import { NextRequest, NextResponse } from "next/server";
import { readConfig } from "@/lib/config";
import { verifySessionFromCookieHeader } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET: konfigurasi LENGKAP (termasuk sheetWebhookUrl) -- cuma untuk
// halaman admin yang sudah login, dibaca lewat cookie sesi.
export async function GET(req: NextRequest) {
  const authed = verifySessionFromCookieHeader(req.headers.get("cookie"));
  if (!authed) {
    return NextResponse.json({ error: "Sesi admin tidak valid." }, { status: 401 });
  }
  const config = await readConfig();
  return NextResponse.json(config);
}
