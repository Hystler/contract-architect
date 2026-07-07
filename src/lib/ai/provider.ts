import { getAiRuntimeSettings } from "@/lib/ai/settings";

export type AiAssistantAction =
  | "explain"
  | "risk_hints"
  | "rewrite"
  | "questions";

export type AiAssistantInput = {
  action: AiAssistantAction;
  contractType?: string;
  selectedText?: string;
  fullText?: string;
  userQuestion?: string;
};

type OpenAiResponsesResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
};

export class AiProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiProviderError";
  }
}

const actionLabels: Record<AiAssistantAction, string> = {
  explain: "Объясни выбранный пункт простым языком",
  risk_hints: "Найди потенциально спорные места",
  rewrite: "Сделай формулировку понятнее, сохранив смысл",
  questions: "Составь список вопросов к юристу"
};

export async function runContractAssistant(input: AiAssistantInput) {
  const settings = getAiRuntimeSettings();
  const provider = settings.provider || process.env.AI_PROVIDER || "openai";

  if (!settings.enabled) {
    throw new AiProviderError("AI-помощник отключён в админке.");
  }

  if (provider !== "openai") {
    throw new AiProviderError(
      "AI-провайдер пока не поддерживается в этом MVP."
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AiProviderError(
      "AI-помощник не подключён. Добавьте OPENAI_API_KEY в переменные окружения."
    );
  }

  const model = settings.model || process.env.OPENAI_MODEL || "gpt-5.4-mini";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        instructions: buildSystemPrompt(settings.customInstruction),
        input: buildUserPrompt(input),
        max_output_tokens: 900
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new AiProviderError(
        "AI-помощник временно недоступен. Проверьте настройки провайдера и повторите запрос."
      );
    }

    const json = (await response.json()) as OpenAiResponsesResponse;
    const result = extractResponseText(json);

    if (!result) {
      throw new AiProviderError(
        "AI-помощник не вернул ответ. Попробуйте сократить текст и повторить запрос."
      );
    }

    return result;
  } catch (error) {
    if (error instanceof AiProviderError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new AiProviderError(
        "AI-помощник не успел ответить. Попробуйте отправить более короткий текст."
      );
    }

    throw new AiProviderError(
      "Не удалось получить ответ AI-помощника. Повторите запрос позже."
    );
  } finally {
    clearTimeout(timeout);
  }
}

function extractResponseText(json: OpenAiResponsesResponse) {
  const directText = json.output_text?.trim();
  if (directText) {
    return directText;
  }

  return json.output
    ?.flatMap((item) => item.content || [])
    .map((content) => content.text?.trim() || "")
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function buildSystemPrompt(customInstruction: string) {
  return [
    "Ты AI-помощник в шаблонном генераторе договоров Contract Architect.",
    "Ты не являешься юристом и не даёшь юридическую гарантию.",
    "Ты помогаешь объяснить и структурировать текст договора простым языком.",
    "Ты можешь обратить внимание на потенциально спорные места, но не называй это юридической проверкой.",
    "Для финальной проверки договора всегда советуй обратиться к специалисту.",
    "Не выдумывай законы, номера статей, судебную практику и обязательные правила.",
    "Если информации недостаточно, прямо скажи, что нужно уточнить.",
    "Не советуй подписывать документ без проверки специалистом.",
    "Не меняй смысл договора без явного указания пользователя.",
    "Отвечай по-русски, кратко, структурировано и без маркетинговых обещаний.",
    customInstruction ? `Дополнительная инструкция администратора: ${customInstruction}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

function buildUserPrompt(input: AiAssistantInput) {
  return [
    `Действие: ${actionLabels[input.action]}.`,
    `Тип документа: ${input.contractType || "договор оказания услуг"}.`,
    input.userQuestion ? `Вопрос пользователя: ${input.userQuestion}` : "",
    input.selectedText ? `Выбранный текст:\n${input.selectedText}` : "",
    input.fullText ? `Контекст документа:\n${input.fullText}` : "",
    "Формат ответа:",
    "- начни с короткого вывода;",
    "- затем дай 3-6 пунктов;",
    "- если это подсказки по вниманию, укажи уровень: низкий / средний / высокий;",
    "- заверши напоминанием, что это не юридическая консультация."
  ]
    .filter(Boolean)
    .join("\n\n");
}
