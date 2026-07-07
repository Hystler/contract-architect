import "server-only";
import { NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/auth/currentUser";
import { AuthConfigurationError } from "@/lib/auth/session";

export function requireAdminSession(request: Request) {
  try {
    const session = getAdminSessionFromRequest(request);

    if (!session) {
      return {
        response: NextResponse.json(
          { message: "Требуется вход администратора." },
          { status: 401 }
        ),
        session: null
      };
    }

    return { response: null, session };
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return {
        response: NextResponse.json({ message: error.message }, { status: 500 }),
        session: null
      };
    }

    throw error;
  }
}
