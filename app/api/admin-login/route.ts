import { NextRequest, NextResponse } from "next/server";
import {
  clearFailedAttempts,
  createSessionToken,
  getClientIp,
  isRateLimited,
  recordFailedAttempt,
} from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  if (await isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit." },
      { status: 429 }
    );
  }

  let body: { password?: string };
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

  if (body.password !== process.env.ADMIN_PASSWORD) {
    await recordFailedAttempt(ip);
    return NextResponse.json({ error: "Password admin salah." }, { status: 401 });
  }

  await clearFailedAttempts(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("efm_admin_session", createSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
  return res;
}
