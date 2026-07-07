import "server-only";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  AuthConfigurationError,
  USER_SESSION_COOKIE,
  getCookieFromHeader,
  verifyAdminSession,
  verifyUserSession
} from "@/lib/auth/session";

export function getCurrentUserSession() {
  try {
    return verifyUserSession(cookies().get(USER_SESSION_COOKIE)?.value);
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return null;
    }

    throw error;
  }
}

export function getCurrentAdminSession() {
  try {
    return verifyAdminSession(cookies().get(ADMIN_SESSION_COOKIE)?.value);
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return null;
    }

    throw error;
  }
}

export function getUserSessionFromRequest(request: Request) {
  try {
    return verifyUserSession(getCookieFromHeader(request, USER_SESSION_COOKIE));
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      throw error;
    }

    return null;
  }
}

export function getAdminSessionFromRequest(request: Request) {
  try {
    return verifyAdminSession(getCookieFromHeader(request, ADMIN_SESSION_COOKIE));
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      throw error;
    }

    return null;
  }
}
