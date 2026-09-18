import { NextRequest, NextResponse } from "next/server";
import {
  clearFailedAttempts,
  createSessionToken,
  getClientIp,
  isRateLimited,
  recordFailedAttempt,
  safeEqual,
} from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);

    if (await isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit." },
        { status: 429 }
      );
    }

    let body: { username?: string; password?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
    }

    if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_USERNAME) {
      return NextResponse.json(
        { error: "ADMIN_USERNAME / ADMIN_PASSWORD belum diset di server (lihat .env.local)." },
        { status: 500 }
      );
    }

    const usernameOk = safeEqual(String(body.username ?? ""), process.env.ADMIN_USERNAME);
    const passwordOk = safeEqual(String(body.password ?? ""), process.env.ADMIN_PASSWORD);

    if (!usernameOk || !passwordOk) {
      await recordFailedAttempt(ip);
      return NextResponse.json({ error: "Username atau password salah." }, { status: 401 });
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
  } catch (err) {
    console.error("admin-login error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan di server. Cek Vercel Function Logs untuk detail." },
      { status: 500 }
    );
  }
}
