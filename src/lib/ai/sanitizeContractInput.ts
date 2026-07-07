import "server-only";

type RawContractAssistantInput = {
  selectedText?: string;
  fullText?: string;
  userQuestion?: string;
};

export function sanitizeContractInput(input: RawContractAssistantInput) {
  return {
    selectedText: sanitizeText(input.selectedText, 3000),
    fullText: sanitizeText(input.fullText, 8000),
    userQuestion: sanitizeText(input.userQuestion, 700)
  };
}

export function estimateTokens(value: string) {
  return Math.max(1, Math.ceil(value.length / 4));
}

function sanitizeText(value: string | undefined, maxLength: number) {
  if (!value) {
    return "";
  }

  return redactSensitiveData(value).slice(0, maxLength).trim();
}

function redactSensitiveData(value: string) {
  return value
    .replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, "[email скрыт]")
    .replace(/(?:\+7|8)\s?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g, "[телефон скрыт]")
    .replace(/\b\d{20}\b/g, "[номер счета скрыт]")
    .replace(/\b\d{16,19}\b/g, "[длинный номер скрыт]")
    .replace(/\b\d{13,15}\b/g, "[регистрационный номер скрыт]")
    .replace(/\b\d{10,12}\b/g, "[ИНН или иной номер скрыт]")
    .replace(/паспорт[^.\n]{0,160}/gi, "паспортные данные скрыты")
    .replace(/снилс[^.\n]{0,80}/gi, "СНИЛС скрыт")
    .replace(/(?:адрес|место регистрации|место жительства)[^.\n]{0,180}/gi, "адрес скрыт")
    .replace(/(?:г\.|город|ул\.|улица|пр-т|проспект|д\.|дом)\s*[^,\n.]{2,120}/gi, "[адрес скрыт]");
}
