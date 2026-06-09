import type { ContractFormValues, TemplateData } from "@/types/contract";
import { formatPlainMoney } from "./formatMoney";
import { numberToWordsRu } from "./numberToWordsRu";

const partyTypeLabel = {
  physical: "Физлицо",
  ip: "ИП",
  ooo: "ООО"
} as const;

export function mapContractToTemplateData(data: ContractFormValues): TemplateData {
  const prepaymentAmount = data.prepaymentAmount ?? 0;
  const finalPaymentAmount = data.finalPaymentAmount ?? 0;

  return {
    contract_number: data.contractNumber,
    contract_date: formatDate(data.contractDate),
    city: data.city,
    customer_name: data.customerName,
    customer_type: partyTypeLabel[data.customerType],
    customer_representative: data.customerRepresentative || "не указано",
    customer_basis: data.customerBasis || "не указано",
    customer_requisites: data.customerRequisites,
    contractor_name: data.contractorName,
    contractor_type: partyTypeLabel[data.contractorType],
    contractor_representative: data.contractorRepresentative || "не указано",
    contractor_basis: data.contractorBasis || "не указано",
    contractor_requisites: data.contractorRequisites,
    subject: data.subject,
    works_description: data.worksDescription,
    works: data.works.map((work) => ({ name: work.name })),
    total_amount: formatPlainMoney(data.totalAmount),
    total_amount_words: numberToWordsRu(data.totalAmount),
    prepayment_percent: `${formatPercent(data.prepaymentPercent ?? 0)}%`,
    prepayment_amount: formatPlainMoney(prepaymentAmount),
    prepayment_amount_words: numberToWordsRu(prepaymentAmount),
    final_payment_amount: formatPlainMoney(finalPaymentAmount),
    final_payment_amount_words: numberToWordsRu(finalPaymentAmount),
    start_date: data.startDate ? formatDate(data.startDate) : "не указано",
    end_date: data.endDate ? formatDate(data.endDate) : "не указано",
    act_number: data.actNumber,
    act_date: formatDate(data.actDate)
  };
}

export function formatDate(value: string) {
  if (!value) {
    return "не указано";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
}
