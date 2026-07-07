"use client";

import type {
  FieldErrors,
  UseFormRegister
} from "react-hook-form";
import type { ContractFormValues, PartyType } from "@/types/contract";
import { FieldError } from "@/components/ui/FieldError";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

type PartyPrefix = "customer" | "contractor";

type PartyFieldsProps = {
  errors: FieldErrors<ContractFormValues>;
  partyType: PartyType;
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

const partyHints: Record<
  PartyType,
  {
    typeLabel: string;
    namePlaceholder: string;
    representativePlaceholder: string;
    representativeHint: string;
    basisPlaceholder: string;
    basisHint: string;
    requisitesPlaceholder: string;
    requisitesHint: string;
  }
> = {
  physical: {
    typeLabel: "Физлицо",
    namePlaceholder: "Например, Иванов Иван Иванович",
    representativePlaceholder: "Оставьте пустым, если сторона действует лично",
    representativeHint:
      "Для физлица представитель нужен только при доверенности или ином основании.",
    basisPlaceholder: "Действует от своего имени",
    basisHint:
      "Если представитель не используется, можно указать: действует от своего имени.",
    requisitesPlaceholder:
      "ФИО, паспортные данные, адрес регистрации, телефон или e-mail",
    requisitesHint:
      "Для физлица обычно указывают паспортные данные и адрес регистрации."
  },
  ip: {
    typeLabel: "ИП",
    namePlaceholder: "Например, ИП Иванов Иван Иванович",
    representativePlaceholder: "Например, Иванов Иван Иванович",
    representativeHint:
      "Если ИП подписывает сам, укажите ФИО предпринимателя или оставьте поле пустым.",
    basisPlaceholder: "на основании записи ЕГРИП / ОГРНИП",
    basisHint:
      "Для ИП часто указывают запись в ЕГРИП, ОГРНИП или свидетельство о регистрации.",
    requisitesPlaceholder:
      "ИНН, ОГРНИП, адрес регистрации, банковские реквизиты",
    requisitesHint:
      "Для ИП обычно нужны ИНН, ОГРНИП, адрес и платежные реквизиты."
  },
  ooo: {
    typeLabel: "Юрлицо / ООО",
    namePlaceholder: "Например, ООО «Альфа Проект»",
    representativePlaceholder: "Например, Петров Петр Петрович",
    representativeHint:
      "Укажите руководителя или представителя, который подписывает договор.",
    basisPlaceholder: "на основании Устава",
    basisHint:
      "Для ООО обычно указывают Устав, доверенность или решение о назначении.",
    requisitesPlaceholder:
      "ИНН, ОГРН, юридический адрес, банк, БИК, р/с, к/с",
    requisitesHint:
      "Для юрлица укажите регистрационные данные, адрес и банковские реквизиты."
  }
};

export function PartyFields({
  errors,
  partyType,
  prefix,
  register,
  title
}: PartyFieldsProps) {
  const fieldLabels = labels[prefix];
  const hints = partyHints[partyType];
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
            <option value="physical">{partyHints.physical.typeLabel}</option>
            <option value="ip">ИП</option>
            <option value="ooo">{partyHints.ooo.typeLabel}</option>
          </Select>
          <FieldError message={errors[typeName]?.message} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted-500">
            {fieldLabels.name}
          </span>
          <Input
            isInvalid={Boolean(errors[nameName])}
            placeholder={hints.namePlaceholder}
            {...register(nameName)}
          />
          <FieldError message={errors[nameName]?.message} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted-500">
            {fieldLabels.representative}
          </span>
          <Input
            placeholder={hints.representativePlaceholder}
            {...register(representativeName)}
          />
          <p className="mt-2 text-xs leading-5 text-muted-500">
            {hints.representativeHint}
          </p>
          <FieldError message={errors[representativeName]?.message} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted-500">
            {fieldLabels.basis}
          </span>
          <Input
            placeholder={hints.basisPlaceholder}
            {...register(basisName)}
          />
          <p className="mt-2 text-xs leading-5 text-muted-500">
            {hints.basisHint}
          </p>
          <FieldError message={errors[basisName]?.message} />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-muted-500">
            {fieldLabels.requisites}
          </span>
          <Textarea
            className="min-h-32"
            isInvalid={Boolean(errors[requisitesName])}
            placeholder={hints.requisitesPlaceholder}
            {...register(requisitesName)}
          />
          <p className="mt-2 text-xs leading-5 text-muted-500">
            {hints.requisitesHint}
          </p>
          <FieldError message={errors[requisitesName]?.message} />
        </label>
      </div>
    </section>
  );
}
