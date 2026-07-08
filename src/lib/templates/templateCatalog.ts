import type { DocumentTemplateType } from "@prisma/client";

export type TemplateVariable = {
  key: string;
  label: string;
  type: "text" | "textarea" | "date" | "money" | "list" | "number";
  required: boolean;
  hint?: string;
};

export type TemplateSummary = {
  id: string;
  type: DocumentTemplateType;
  category: string;
  name: string;
  description: string;
  filePath?: string | null;
  storageKey?: string | null;
  variables: TemplateVariable[];
  isActive: boolean;
  isPremium: boolean;
  isUserUploaded: boolean;
  ownerUserId?: string | null;
  requiresLegalReview: boolean;
};

export const defaultContractTemplateId = "services-contract";
export const defaultActTemplateId = "services-act";

export const templateCategories = [
  "Услуги",
  "Подряд",
  "Аренда",
  "Поставка",
  "Купля-продажа",
  "NDA / конфиденциальность",
  "Агентские / посреднические",
  "Займ"
] as const;

export const baseContractVariables: TemplateVariable[] = [
  {
    key: "contract_number",
    label: "Номер договора",
    type: "text",
    required: true
  },
  {
    key: "contract_date",
    label: "Дата договора",
    type: "date",
    required: true
  },
  { key: "city", label: "Город", type: "text", required: true },
  {
    key: "customer_name",
    label: "Наименование заказчика",
    type: "text",
    required: true
  },
  {
    key: "customer_requisites",
    label: "Реквизиты заказчика",
    type: "textarea",
    required: true
  },
  {
    key: "contractor_name",
    label: "Наименование исполнителя",
    type: "text",
    required: true
  },
  {
    key: "contractor_requisites",
    label: "Реквизиты исполнителя",
    type: "textarea",
    required: true
  },
  {
    key: "subject",
    label: "Предмет договора",
    type: "text",
    required: true
  },
  {
    key: "works_description",
    label: "Описание работ",
    type: "textarea",
    required: true
  },
  { key: "works", label: "Перечень работ", type: "list", required: true },
  {
    key: "total_amount",
    label: "Общая сумма",
    type: "money",
    required: true
  },
  {
    key: "prepayment_amount",
    label: "Предоплата",
    type: "money",
    required: false
  },
  {
    key: "final_payment_amount",
    label: "Остаток оплаты",
    type: "money",
    required: false
  },
  {
    key: "start_date",
    label: "Дата начала работ",
    type: "date",
    required: false
  },
  {
    key: "end_date",
    label: "Дата окончания работ",
    type: "date",
    required: false
  }
];

export const baseActVariables: TemplateVariable[] = [
  { key: "act_number", label: "Номер акта", type: "text", required: true },
  { key: "act_date", label: "Дата акта", type: "date", required: true },
  ...baseContractVariables.filter((variable) =>
    [
      "contract_number",
      "contract_date",
      "customer_name",
      "contractor_name",
      "subject",
      "works_description",
      "total_amount",
      "customer_requisites",
      "contractor_requisites"
    ].includes(variable.key)
  )
];

const legalReviewText = "Шаблон требует юридической проверки перед использованием.";

export const publicTemplateCatalog: TemplateSummary[] = [
  template("services-contract", "CONTRACT", "Услуги", "Договор оказания услуг", "Базовый технический шаблон договора услуг для MVP.", false),
  template("services-act", "ACT", "Услуги", "Акт выполненных работ", "Акт к договору услуг, формируется теми же данными.", false, "src/templates/act-template.docx", baseActVariables),
  template("services-addendum", "CONTRACT", "Услуги", "Дополнительное соглашение к договору услуг", legalReviewText, true),
  template("contractor-contract", "CONTRACT", "Подряд", "Договор подряда", legalReviewText, true),
  template("contractor-act", "ACT", "Подряд", "Акт сдачи-приёмки работ", legalReviewText, true, "src/templates/act-template.docx", baseActVariables),
  template("rent-premises", "CONTRACT", "Аренда", "Договор аренды помещения", legalReviewText, true),
  template("rent-transfer-act", "ACT", "Аренда", "Акт приёма-передачи помещения", legalReviewText, true, "src/templates/act-template.docx", baseActVariables),
  template("supply-contract", "CONTRACT", "Поставка", "Договор поставки", legalReviewText, true),
  template("supply-specification", "CONTRACT", "Поставка", "Спецификация к договору поставки", legalReviewText, true),
  template("sale-goods", "CONTRACT", "Купля-продажа", "Договор купли-продажи товара", legalReviewText, true),
  template("sale-transfer-act", "ACT", "Купля-продажа", "Акт приёма-передачи товара", legalReviewText, true, "src/templates/act-template.docx", baseActVariables),
  template("nda", "CONTRACT", "NDA / конфиденциальность", "Соглашение о конфиденциальности", legalReviewText, true),
  template("agency-contract", "CONTRACT", "Агентские / посреднические", "Агентский договор", legalReviewText, true),
  template("loan-contract", "CONTRACT", "Займ", "Договор займа", legalReviewText, true),
  template("receipt", "CONTRACT", "Займ", "Расписка", legalReviewText, true)
];

export function normalizeTemplateVariables(value: unknown): TemplateVariable[] {
  if (!Array.isArray(value)) {
    return baseContractVariables;
  }

  const normalized = value
    .map((item) => normalizeTemplateVariable(item))
    .filter((item): item is TemplateVariable => Boolean(item));

  return normalized.length > 0 ? normalized : baseContractVariables;
}

export function findCatalogTemplate(id: string | undefined | null) {
  if (!id) {
    return null;
  }

  return publicTemplateCatalog.find((templateItem) => templateItem.id === id) || null;
}

function normalizeTemplateVariable(value: unknown): TemplateVariable | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Partial<TemplateVariable>;
  const key = String(raw.key || "").trim();
  const label = String(raw.label || key).trim();

  if (!key || !label) {
    return null;
  }

  const variable: TemplateVariable = {
    key,
    label,
    type: normalizeVariableType(raw.type),
    required: Boolean(raw.required)
  };

  if (raw.hint) {
    variable.hint = String(raw.hint).slice(0, 240);
  }

  return variable;
}

function normalizeVariableType(value: unknown): TemplateVariable["type"] {
  return ["text", "textarea", "date", "money", "list", "number"].includes(
    String(value)
  )
    ? (value as TemplateVariable["type"])
    : "text";
}

function template(
  id: string,
  type: DocumentTemplateType,
  category: string,
  name: string,
  description: string,
  isPremium: boolean,
  filePath = "src/templates/contract-template.docx",
  variables = baseContractVariables
): TemplateSummary {
  return {
    id,
    type,
    category,
    name,
    description,
    filePath,
    storageKey: null,
    variables,
    isActive: true,
    isPremium,
    isUserUploaded: false,
    ownerUserId: null,
    requiresLegalReview: true
  };
}
