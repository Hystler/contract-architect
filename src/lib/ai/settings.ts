export type AiRuntimeSettings = {
  enabled: boolean;
  provider: "openai";
  model: string;
  maxRequestsPerWindow: number;
  rateLimitWindowSeconds: number;
  customInstruction: string;
  updatedAt: string;
};

type GlobalWithAiSettings = typeof globalThis & {
  contractArchitectAiSettings?: AiRuntimeSettings;
};

export type AiRuntimeSettingsUpdate = Partial<
  Pick<
    AiRuntimeSettings,
    | "enabled"
    | "provider"
    | "model"
    | "maxRequestsPerWindow"
    | "rateLimitWindowSeconds"
    | "customInstruction"
  >
>;

export function getAiRuntimeSettings() {
  const globalStore = globalThis as GlobalWithAiSettings;

  if (!globalStore.contractArchitectAiSettings) {
    globalStore.contractArchitectAiSettings = getDefaultSettings();
  }

  return globalStore.contractArchitectAiSettings;
}

export function updateAiRuntimeSettings(update: AiRuntimeSettingsUpdate) {
  const current = getAiRuntimeSettings();
  const next: AiRuntimeSettings = {
    ...current,
    enabled:
      typeof update.enabled === "boolean" ? update.enabled : current.enabled,
    provider: update.provider === "openai" ? update.provider : current.provider,
    model: normalizeModel(update.model) || current.model,
    maxRequestsPerWindow: normalizeInteger(
      update.maxRequestsPerWindow,
      current.maxRequestsPerWindow,
      1,
      60
    ),
    rateLimitWindowSeconds: normalizeInteger(
      update.rateLimitWindowSeconds,
      current.rateLimitWindowSeconds,
      30,
      3600
    ),
    customInstruction:
      typeof update.customInstruction === "string"
        ? update.customInstruction.trim().slice(0, 1200)
        : current.customInstruction,
    updatedAt: new Date().toISOString()
  };

  (globalThis as GlobalWithAiSettings).contractArchitectAiSettings = next;
  return next;
}

export function getPublicAiRuntimeStatus() {
  const settings = getAiRuntimeSettings();

  return {
    settings,
    hasApiKey: Boolean(process.env.OPENAI_API_KEY),
    adminTokenConfigured: Boolean(process.env.ADMIN_ACCESS_TOKEN),
    canWriteWithoutToken: canWriteWithoutToken(),
    isProduction: process.env.NODE_ENV === "production"
  };
}

export function canWriteWithoutToken() {
  return process.env.NODE_ENV !== "production" && !process.env.ADMIN_ACCESS_TOKEN;
}

function getDefaultSettings(): AiRuntimeSettings {
  return {
    enabled: process.env.AI_ENABLED !== "false",
    provider: "openai",
    model: normalizeModel(process.env.OPENAI_MODEL) || "gpt-5-mini",
    maxRequestsPerWindow: normalizeInteger(
      process.env.AI_MAX_REQUESTS_PER_WINDOW,
      8,
      1,
      60
    ),
    rateLimitWindowSeconds: normalizeInteger(
      process.env.AI_RATE_LIMIT_WINDOW_SECONDS,
      300,
      30,
      3600
    ),
    customInstruction: process.env.AI_CUSTOM_INSTRUCTION?.trim().slice(0, 1200) || "",
    updatedAt: new Date().toISOString()
  };
}

function normalizeModel(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, 80);
}

function normalizeInteger(
  value: unknown,
  fallback: number,
  min: number,
  max: number
) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(parsed)));
}
