import "server-only";
import { getOpenAIModel } from "@/lib/ai/openai";

type SafeAiLogContext = {
  model?: string;
  route: string;
};

export function getSafeOpenAIErrorDetails(error: unknown) {
  const errorLike = error as {
    code?: unknown;
    message?: unknown;
    name?: unknown;
    status?: unknown;
    type?: unknown;
  };

  return {
    code: normalizeLogValue(errorLike.code),
    name:
      normalizeLogValue(errorLike.name) ||
      (error instanceof Error ? error.name : "UnknownError"),
    status: normalizeLogValue(errorLike.status),
    type: normalizeLogValue(errorLike.type)
  };
}

export function logSafeAiError(error: unknown, context: SafeAiLogContext) {
  const details = getSafeOpenAIErrorDetails(error);

  console.error("[contract-architect-ai]", {
    code: details.code,
    model: context.model || getOpenAIModel(),
    name: details.name,
    route: context.route,
    status: details.status,
    type: details.type
  });
}

export function isOpenAIModelUnavailableError(error: unknown) {
  const details = getSafeOpenAIErrorDetails(error);
  const message = error instanceof Error ? error.message : "";
  const combined = `${details.code} ${details.type} ${message}`.toLowerCase();

  return (
    ["400", "404"].includes(details.status) &&
    combined.includes("model") &&
    /not found|does not exist|not exist|invalid|unsupported|access|permission|available/.test(
      combined
    )
  );
}

function normalizeLogValue(value: unknown) {
  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    return value.slice(0, 120);
  }

  return "";
}
