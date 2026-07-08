import "server-only";
import { getOpenAIClient, getOpenAIModel } from "@/lib/ai/openai";
import { sanitizeContractInput } from "@/lib/ai/sanitizeContractInput";
import {
  normalizeTemplateVariables,
  type TemplateVariable
} from "@/lib/templates/templateCatalog";

export const templateAnalyzerSystemPrompt =
  "Ты AI-анализатор шаблонов внутри Contract Architect. Твоя задача — разобрать загруженный DOCX-договор как шаблон: определить переменные, повторяющиеся данные, стороны, суммы, сроки, предмет, реквизиты и актовые данные. Не давай юридическое заключение. Не обещай юридическую силу. Не создавай договор с нуля. Верни только структурированный JSON для настройки формы генератора.";

export type TemplateAnalysis = {
  documentType: string;
  parties: string[];
  variables: TemplateVariable[];
  formFields: TemplateVariable[];
  warnings: string[];
  lawyerQuestions: string[];
  legalReviewItems: string[];
};

export async function analyzeTemplateWithAI(input: {
  category: string;
  detectedVariables: TemplateVariable[];
  text: string;
  title: string;
}) {
  const sanitizedText = sanitizeContractInput({ fullText: input.text }).fullText;
  const prompt = buildTemplateAnalysisPrompt({
    ...input,
    text: sanitizedText
  });

  const response = await getOpenAIClient().responses.create({
    model: process.env.OPENAI_MODEL?.trim() || getOpenAIModel(),
    instructions: templateAnalyzerSystemPrompt,
    input: prompt,
    max_output_tokens: 1400
  });

  const raw = response.output_text?.trim();

  if (!raw) {
    throw new Error("Empty template analysis");
  }

  return normalizeTemplateAnalysis(JSON.parse(extractJson(raw)), input.detectedVariables);
}

function buildTemplateAnalysisPrompt(input: {
  category: string;
  detectedVariables: TemplateVariable[];
  text: string;
  title: string;
}) {
  return [
    "Проанализируй загруженный DOCX как шаблон для генератора документов.",
    "Нельзя переписывать договор, создавать новый договор или давать юридическое заключение.",
    "Верни только JSON без markdown.",
    "",
    "Формат JSON:",
    "{",
    '  "documentType": "краткий тип документа",',
    '  "parties": ["сторона 1", "сторона 2"],',
    '  "variables": [{"key":"contract_number","label":"Номер договора","type":"text","required":true,"hint":"..."}],',
    '  "formFields": [{"key":"contract_number","label":"Номер договора","type":"text","required":true,"hint":"..."}],',
    '  "warnings": ["..."],',
    '  "lawyerQuestions": ["..."],',
    '  "legalReviewItems": ["..."]',
    "}",
    "",
    `Название шаблона: ${input.title}`,
    `Категория: ${input.category}`,
    `Локально найденные переменные: ${JSON.stringify(input.detectedVariables.slice(0, 30))}`,
    "",
    "Текст шаблона после удаления чувствительных данных:",
    input.text.slice(0, 9000)
  ].join("\n");
}

function normalizeTemplateAnalysis(
  value: unknown,
  fallbackVariables: TemplateVariable[]
): TemplateAnalysis {
  const raw = isRecord(value) ? value : {};
  const variables = normalizeTemplateVariables(raw.variables);
  const formFields = normalizeTemplateVariables(raw.formFields);

  return {
    documentType: normalizeString(raw.documentType, "Загруженный шаблон"),
    parties: normalizeStringArray(raw.parties).slice(0, 8),
    variables: variables.length > 0 ? variables : fallbackVariables,
    formFields: formFields.length > 0 ? formFields : fallbackVariables,
    warnings: normalizeStringArray(raw.warnings).slice(0, 12),
    lawyerQuestions: normalizeStringArray(raw.lawyerQuestions).slice(0, 12),
    legalReviewItems: normalizeStringArray(raw.legalReviewItems).slice(0, 12)
  };
}

function extractJson(value: string) {
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");

  if (start >= 0 && end > start) {
    return value.slice(start, end + 1);
  }

  return value;
}

function normalizeString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, 180)
    : fallback;
}

function normalizeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
