import "server-only";
import {
  baseContractVariables,
  type TemplateVariable
} from "@/lib/templates/templateCatalog";

const knownLabels: Record<string, string> = {
  act_date: "Дата акта",
  act_number: "Номер акта",
  city: "Город",
  contract_date: "Дата договора",
  contract_number: "Номер договора",
  contractor_name: "Наименование исполнителя",
  contractor_requisites: "Реквизиты исполнителя",
  customer_name: "Наименование заказчика",
  customer_requisites: "Реквизиты заказчика",
  end_date: "Дата окончания",
  final_payment_amount: "Остаток оплаты",
  prepayment_amount: "Предоплата",
  start_date: "Дата начала",
  subject: "Предмет договора",
  total_amount: "Общая сумма",
  works: "Перечень работ",
  works_description: "Описание работ"
};

export function detectTemplateVariables(text: string): TemplateVariable[] {
  const detected = new Map<string, TemplateVariable>();
  const tagMatches = Array.from(
    text.matchAll(/\{\{\s*(?:#|\/)?([a-zA-Z0-9_:-]+)\s*\}\}/g)
  );

  for (const match of tagMatches) {
    const key = normalizeKey(match[1]);

    if (!key || key === "name") {
      continue;
    }

    detected.set(key, {
      key,
      label: knownLabels[key] || humanizeKey(key),
      type: inferVariableType(key),
      required: true,
      hint: "Найдена в загруженном DOCX-шаблоне."
    });
  }

  if (detected.size > 0) {
    return Array.from(detected.values()).slice(0, 40);
  }

  return inferVariablesFromText(text);
}

function inferVariablesFromText(text: string) {
  const lowerText = text.toLowerCase();
  const result = baseContractVariables.filter((variable) => {
    if (["contract_number", "contract_date", "customer_name", "contractor_name"].includes(variable.key)) {
      return true;
    }

    if (variable.key.includes("amount")) {
      return /стоим|цена|сумм|оплат|руб/.test(lowerText);
    }

    if (variable.key.includes("requisites")) {
      return /реквизит|инн|огрн|счет|банк/.test(lowerText);
    }

    if (variable.key.includes("date") || variable.key.endsWith("_date")) {
      return /срок|дата|период|календар/.test(lowerText);
    }

    return lowerText.includes(variable.label.toLowerCase().split(" ")[0]);
  });

  return result.length > 0 ? result : baseContractVariables.slice(0, 10);
}

function normalizeKey(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9_:-]/g, "").slice(0, 80);
}

function humanizeKey(value: string) {
  return value
    .replace(/[_:-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());
}

function inferVariableType(key: string): TemplateVariable["type"] {
  if (key === "works" || key.endsWith("_items") || key.endsWith("_list")) {
    return "list";
  }

  if (key.includes("date")) {
    return "date";
  }

  if (key.includes("amount") || key.includes("price") || key.includes("sum")) {
    return "money";
  }

  if (key.includes("description") || key.includes("requisites")) {
    return "textarea";
  }

  return "text";
}
