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

type OpenAiChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
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
  const provider = process.env.AI_PROVIDER || "openai";

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

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: buildSystemPrompt()
          },
          {
            role: "user",
            content: buildUserPrompt(input)
          }
        ]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new AiProviderError(
        "AI-помощник временно недоступен. Проверьте настройки провайдера и повторите запрос."
      );
    }

    const json = (await response.json()) as OpenAiChatResponse;
    const result = json.choices?.[0]?.message?.content?.trim();

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

function buildSystemPrompt() {
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
    "Отвечай по-русски, кратко, структурировано и без маркетинговых обещаний."
  ].join("\n");
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
