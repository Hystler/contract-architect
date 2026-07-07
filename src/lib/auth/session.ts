import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

export const USER_SESSION_COOKIE = "contract_architect_session";
export const ADMIN_SESSION_COOKIE = "contract_architect_admin_session";

export const userSessionMaxAge = 60 * 60 * 24 * 30;
export const adminSessionMaxAge = 60 * 60 * 8;

export type UserSession = {
  kind: "user";
  userId: string;
  email: string;
  exp: number;
};

export type AdminSession = {
  kind: "admin";
  login: string;
  exp: number;
};

export class AuthConfigurationError extends Error {
  constructor() {
    super("AUTH_SECRET не задан. Добавьте AUTH_SECRET в переменные окружения.");
    this.name = "AuthConfigurationError";
  }
}

export function createUserSession(user: { id: string; email: string }) {
  return signSession<UserSession>({
    kind: "user",
    userId: user.id,
    email: user.email,
    exp: getExpiration(userSessionMaxAge)
  });
}

export function createAdminSession(login: string) {
  return signSession<AdminSession>({
    kind: "admin",
    login,
    exp: getExpiration(adminSessionMaxAge)
  });
}

export function verifyUserSession(value?: string | null) {
  return verifySession<UserSession>(value, "user");
}

export function verifyAdminSession(value?: string | null) {
  return verifySession<AdminSession>(value, "admin");
}

export function getSessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge
  };
}

export function getExpiredCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  };
}

export function getCookieFromHeader(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = cookieHeader.split(";").map((part) => part.trim());
  const cookie = cookies.find((part) => part.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(name.length + 1));
}

export function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function signSession<T extends { exp: number; kind: string }>(payload: T) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifySession<T extends { exp: number; kind: string }>(
  value: string | null | undefined,
  kind: T["kind"]
) {
  if (!value) {
    return null;
  }

  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as T;

    if (payload.kind !== kind || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function sign(value: string) {
  return createHmac("sha256", getRequiredAuthSecret())
    .update(value)
    .digest("base64url");
}

function getRequiredAuthSecret() {
  const secret = process.env.AUTH_SECRET?.trim();

  if (!secret) {
    throw new AuthConfigurationError();
  }

  return secret;
}

function getExpiration(maxAge: number) {
  return Math.floor(Date.now() / 1000) + maxAge;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}
