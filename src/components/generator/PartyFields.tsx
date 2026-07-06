"use client";

import type {
  FieldErrors,
  UseFormRegister
} from "react-hook-form";
import type { ContractFormValues } from "@/types/contract";
import { FieldError } from "@/components/ui/FieldError";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

type PartyPrefix = "customer" | "contractor";

type PartyFieldsProps = {
  errors: FieldErrors<ContractFormValues>;
  prefix: PartyPrefix;
  register: UseFormRegister<ContractFormValues>;
  title: string;
};

const labels = {
  customer: {
    type: "Тип заказчика",
    name: "Наименование заказчика",
    representative: "Представитель заказчика",
    basis: "Основание действия",
    requisites: "Реквизиты заказчика"
  },
  contractor: {
    type: "Тип исполнителя",
    name: "Наименование исполнителя",
    representative: "Представитель исполнителя",
    basis: "Основание действия",
    requisites: "Реквизиты исполнителя"
  }
} as const;

export function PartyFields({
  errors,
  prefix,
  register,
  title
}: PartyFieldsProps) {
  const fieldLabels = labels[prefix];
  const typeName = `${prefix}Type` as const;
  const nameName = `${prefix}Name` as const;
  const representativeName = `${prefix}Representative` as const;
  const basisName = `${prefix}Basis` as const;
  const requisitesName = `${prefix}Requisites` as const;

  return (
    <section className="rounded-lg border border-legal-border bg-paper-50 p-5 text-graphite-950 shadow-paper">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted-500">
            {fieldLabels.type}
          </span>
          <Select isInvalid={Boolean(errors[typeName])} {...register(typeName)}>
            <option value="physical">Физлицо</option>
            <option value="ip">ИП</option>
            <option value="ooo">ООО</option>
          </Select>
          <FieldError message={errors[typeName]?.message} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted-500">
            {fieldLabels.name}
          </span>
          <Input
            isInvalid={Boolean(errors[nameName])}
            placeholder="Например, ООО «Вектор»"
            {...register(nameName)}
          />
          <FieldError message={errors[nameName]?.message} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted-500">
            {fieldLabels.representative}
          </span>
          <Input
            placeholder="Например, Иванов Иван Иванович"
            {...register(representativeName)}
          />
          <FieldError message={errors[representativeName]?.message} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted-500">
            {fieldLabels.basis}
          </span>
          <Input
            placeholder="Например, на основании Устава"
            {...register(basisName)}
          />
          <FieldError message={errors[basisName]?.message} />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-muted-500">
            {fieldLabels.requisites}
          </span>
          <Textarea
            className="min-h-32"
            isInvalid={Boolean(errors[requisitesName])}
            placeholder="ИНН, ОГРН, адрес, банковские реквизиты"
            {...register(requisitesName)}
          />
          <FieldError message={errors[requisitesName]?.message} />
        </label>
      </div>
    </section>
  );
}
