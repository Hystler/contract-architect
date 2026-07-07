import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getExpiredCookieOptions
} from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ message: "Вы вышли из админки." });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", getExpiredCookieOptions());

  return response;
}
