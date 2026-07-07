import { NextResponse } from "next/server";
import {
  USER_SESSION_COOKIE,
  getExpiredCookieOptions
} from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ message: "Вы вышли из аккаунта." });
  response.cookies.set(USER_SESSION_COOKIE, "", getExpiredCookieOptions());

  return response;
}
