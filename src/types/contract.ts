import type { z } from "zod";
import type { contractFormSchema } from "@/lib/validation/contractSchema";

export type PartyType = "physical" | "ip" | "ooo";

export type WorkItem = {
  name: string;
};

export type ContractFormValues = z.infer<typeof contractFormSchema>;

export type TemplateWorkItem = {
  name: string;
};

export type ContractTemplateData = {
  contract_number: string;
  contract_date: string;
  city: string;
  customer_name: string;
  customer_type: string;
  customer_representative: string;
  customer_basis: string;
  customer_requisites: string;
  contractor_name: string;
  contractor_type: string;
  contractor_representative: string;
  contractor_basis: string;
  contractor_requisites: string;
  subject: string;
  works_description: string;
  works: TemplateWorkItem[];
  total_amount: string;
  total_amount_words: string;
  prepayment_percent: string;
  prepayment_amount: string;
  prepayment_amount_words: string;
  final_payment_amount: string;
  final_payment_amount_words: string;
  start_date: string;
  end_date: string;
};

export type ActTemplateData = Pick<
  ContractTemplateData,
  | "contract_number"
  | "contract_date"
  | "customer_name"
  | "contractor_name"
  | "subject"
  | "works_description"
  | "total_amount"
  | "total_amount_words"
  | "customer_requisites"
  | "contractor_requisites"
> & {
  act_number: string;
  act_date: string;
};

export type TemplateData = ContractTemplateData & ActTemplateData;
