import type { ContractFormValues, TemplateData } from "@/types/contract";
import { formatMoney } from "@/lib/documents/formatMoney";

const partyTypeLabels = {
  physical: "Физлицо",
  ip: "ИП",
  ooo: "ООО"
} as const;

export function buildContractTextFromValues(values: ContractFormValues) {
  const works = values.works
    ?.map((work, index) => `${index + 1}. ${work.name}`)
    .join("\n");

  return [
    `Договор № ${values.contractNumber || "не указан"} от ${values.contractDate || "дата не указана"}`,
    `Город: ${values.city || "не указан"}`,
    `Заказчик: ${partyTypeLabels[values.customerType]} ${values.customerName || "не указан"}`,
    `Исполнитель: ${partyTypeLabels[values.contractorType]} ${values.contractorName || "не указан"}`,
    `Предмет: ${values.subject || "не указан"}`,
    `Описание работ: ${values.worksDescription || "не указано"}`,
    works ? `Перечень работ:\n${works}` : "Перечень работ не заполнен",
    `Общая сумма: ${formatMoney(values.totalAmount || 0)}`,
    `Предоплата: ${formatMoney(values.prepaymentAmount || 0)} (${values.prepaymentPercent || 0}%)`,
    `Остаток оплаты: ${formatMoney(values.finalPaymentAmount || 0)}`,
    `Сроки: ${values.startDate || "не указано"} - ${values.endDate || "не указано"}`
  ].join("\n\n");
}

export function buildContractTextFromTemplateData(data: TemplateData) {
  return [
    `Договор № ${data.contract_number} от ${data.contract_date}`,
    `Город: ${data.city}`,
    `Заказчик: ${data.customer_type} ${data.customer_name}`,
    `Исполнитель: ${data.contractor_type} ${data.contractor_name}`,
    `Предмет: ${data.subject}`,
    `Описание работ: ${data.works_description}`,
    `Перечень работ:\n${data.works.map((work, index) => `${index + 1}. ${work.name}`).join("\n")}`,
    `Общая сумма: ${data.total_amount} руб. (${data.total_amount_words})`,
    `Предоплата: ${data.prepayment_amount} руб. (${data.prepayment_percent})`,
    `Остаток оплаты: ${data.final_payment_amount} руб.`,
    `Сроки: ${data.start_date} - ${data.end_date}`
  ].join("\n\n");
}
