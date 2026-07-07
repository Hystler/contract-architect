import "server-only";
import OpenAI from "openai";

export class OpenAIConfigurationError extends Error {
  constructor() {
    super("OPENAI_API_KEY is not configured");
    this.name = "OpenAIConfigurationError";
  }
}

let cachedClient: OpenAI | null = null;

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new OpenAIConfigurationError();
  }

  cachedClient ??= new OpenAI({
    apiKey,
    maxRetries: 1,
    timeout: 20000
  });

  return cachedClient;
}

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL?.trim() || "gpt-5-mini";
}
