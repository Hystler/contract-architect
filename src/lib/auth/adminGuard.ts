import "server-only";
import { jsonError } from "@/lib/api/errors";
import { getAdminSessionFromRequest } from "@/lib/auth/currentUser";
import { AuthConfigurationError } from "@/lib/auth/session";

export function requireAdminSession(request: Request) {
  try {
    const session = getAdminSessionFromRequest(request);

    if (!session) {
      return {
        response: jsonError("Требуется вход администратора.", 401),
        session: null
      };
    }

    return { response: null, session };
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return {
        response: jsonError(error.message, 500),
        session: null
      };
    }

    return {
      response: jsonError("Не удалось проверить сессию администратора.", 500),
      session: null
    };
  }
}
