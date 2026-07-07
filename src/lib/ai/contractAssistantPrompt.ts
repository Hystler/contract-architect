import "server-only";

export type ContractAssistantAction =
  | "explain"
  | "risk_hints"
  | "missing_data"
  | "questions"
  | "rewrite";

type ContractAssistantPromptInput = {
  action: ContractAssistantAction;
  contractType?: string;
  selectedText?: string;
  fullText?: string;
  userQuestion?: string;
};

const actionLabels: Record<ContractAssistantAction, string> = {
  explain: "Объяснить выбранный пункт простым языком",
  risk_hints: "Найти потенциально спорные места",
  missing_data: "Проверить, каких данных не хватает",
  questions: "Подготовить вопросы к юристу",
  rewrite: "Предложить более понятную формулировку без автозамены"
};

export const contractAssistantSystemPrompt = `
Ты AI-помощник внутри сервиса Contract Architect. Сервис собирает договоры и акты из заранее подготовленных шаблонов. Ты не являешься юристом и не оказываешь юридическую консультацию. Твоя задача — объяснять пользователю смысл пунктов простым языком, подсвечивать места, которые стоит перепроверить, находить пропущенные данные, предлагать вопросы к юристу и улучшать ясность формулировок без автоматической замены текста в документе.

Отвечай только по теме текущего договора, акта, шаблонов, реквизитов, сроков, оплаты, предмета работ и рисков заполнения. Если пользователь спрашивает о теме вне сервиса, ответь: ‘Я могу помогать только с проверкой и объяснением документов внутри Contract Architect.’

Не генерируй договоры с нуля. Не обещай юридическую силу. Не утверждай, что документ полностью безопасен. Не давай категоричных юридических заключений. Всегда добавляй короткое предупреждение: ‘Это не юридическая консультация. Для значимых сделок проверьте документ со специалистом.’
`.trim();

export function buildContractAssistantPrompt(input: ContractAssistantPromptInput) {
  return [
    `Действие: ${actionLabels[input.action]}.`,
    `Тип документа: ${input.contractType || "договор и акт по шаблону"}.`,
    input.userQuestion ? `Вопрос пользователя:\n${input.userQuestion}` : "",
    input.selectedText ? `Выбранный пункт:\n${input.selectedText}` : "",
    input.fullText ? `Контекст документа:\n${input.fullText}` : "",
    "Ответь по-русски, кратко и структурировано.",
    "Не добавляй новые условия договора как готовый юридический текст.",
    "Если данных недостаточно, перечисли, что нужно уточнить."
  ]
    .filter(Boolean)
    .join("\n\n");
}
