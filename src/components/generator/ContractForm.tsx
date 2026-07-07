"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AiAssistantPanel } from "@/components/ai/AiAssistantPanel";
import { GenerateActions } from "@/components/generator/GenerateActions";
import { PartyFields } from "@/components/generator/PartyFields";
import { PaymentFields } from "@/components/generator/PaymentFields";
import { PreviewPanel } from "@/components/generator/PreviewPanel";
import { TemplateSelector } from "@/components/generator/TemplateSelector";
import { WorksListField } from "@/components/generator/WorksListField";
import { CalendarInput } from "@/components/ui/CalendarInput";
import { FieldError } from "@/components/ui/FieldError";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { buildContractTextFromValues } from "@/lib/ai/contractText";
import {
  contractKindOptions,
  getContractKindOption,
  type ContractKind
} from "@/lib/contracts/contractOptions";
import {
  contractFormSchema,
  defaultContractValues
} from "@/lib/validation/contractSchema";
import type { ContractFormValues } from "@/types/contract";

export function ContractForm() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch
  } = useForm<ContractFormValues>({
    defaultValues: defaultContractValues,
    mode: "onBlur",
    resolver: zodResolver(contractFormSchema)
  });

  const values = watch();
  const watchedValues = useMemo(() => values, [values]);
  const assistantText = useMemo(
    () => buildContractTextFromValues(watchedValues),
    [watchedValues]
  );
  const defaultAiText =
    watchedValues.worksDescription || watchedValues.subject || "";

  async function generateZip(data: ContractFormValues) {
    setIsGenerating(true);
    setFormMessage(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Не удалось сформировать документы");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      const fileName =
        disposition?.match(/filename="([^"]+)"/)?.[1] || "documents.zip";

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      setFormMessage("ZIP-архив сформирован и передан на скачивание.");
    } catch (error) {
      setFormMessage(
        error instanceof Error
          ? error.message
          : "Не удалось сформировать документы"
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function saveDraft() {
    await handleSubmit(async (data) => {
      setIsSaving(true);
      setFormMessage(null);

      try {
        const response = await fetch("/api/drafts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.message || "Не удалось сохранить черновик");
        }

        setFormMessage("Черновик сохранен в базе данных.");
      } catch (error) {
        setFormMessage(
          error instanceof Error ? error.message : "Не удалось сохранить черновик"
        );
      } finally {
        setIsSaving(false);
      }
    })();
  }

  async function openPreview() {
    await handleSubmit((data) => {
      sessionStorage.setItem("contract-preview-data", JSON.stringify(data));
      router.push("/preview");
    })();
  }

  function updateDateField(
    field:
      | "contractDate"
      | "actDate"
      | "startDate"
      | "endDate",
    value: string
  ) {
    setValue(field, value, {
      shouldDirty: true,
      shouldValidate: true
    });
  }

  function selectContractKind(value: ContractKind) {
    const nextOption = getContractKindOption(value);
    const currentOption = getContractKindOption(watchedValues.contractKind);

    setValue("contractKind", value, {
      shouldDirty: true,
      shouldValidate: true
    });

    if (shouldReplacePreset(watchedValues.subject, "subject")) {
      setValue("subject", nextOption.subject, {
        shouldDirty: true,
        shouldValidate: true
      });
    }

    if (shouldReplacePreset(watchedValues.worksDescription, "worksDescription")) {
      setValue("worksDescription", nextOption.worksDescription, {
        shouldDirty: true,
        shouldValidate: true
      });
    }

    const firstWork = watchedValues.works?.[0]?.name || "";
    if (
      nextOption.firstWork &&
      watchedValues.works?.length &&
      (firstWork.trim() === "" || firstWork === currentOption.firstWork)
    ) {
      setValue("works.0.name", nextOption.firstWork, {
        shouldDirty: true,
        shouldValidate: true
      });
    }
  }

  return (
    <form
      className="grid gap-6 xl:grid-cols-[230px_minmax(0,1fr)_380px]"
      onSubmit={handleSubmit(generateZip)}
    >
      <BuilderSteps />

      <div className="order-1 space-y-6 xl:order-none">
        <TemplateSelector />

        <section className="rounded-lg border border-legal-border bg-paper-50 p-5 text-graphite-950 shadow-paper">
          <h2 className="text-xl font-semibold">Основные данные</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-muted-500">
                Номер договора
              </span>
              <Input
                isInvalid={Boolean(errors.contractNumber)}
                placeholder="1/2026"
                {...register("contractNumber")}
              />
              <FieldError message={errors.contractNumber?.message} />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-muted-500">
                Дата договора
              </span>
              <input type="hidden" {...register("contractDate")} />
              <CalendarInput
                isInvalid={Boolean(errors.contractDate)}
                onChange={(value) => updateDateField("contractDate", value)}
                value={watchedValues.contractDate}
              />
              <FieldError message={errors.contractDate?.message} />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-muted-500">Город</span>
              <Input
                isInvalid={Boolean(errors.city)}
                placeholder="Москва"
                {...register("city")}
              />
              <FieldError message={errors.city?.message} />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-muted-500">
                Номер акта
              </span>
              <Input
                isInvalid={Boolean(errors.actNumber)}
                placeholder="1"
                {...register("actNumber")}
              />
              <FieldError message={errors.actNumber?.message} />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-muted-500">
                Дата акта
              </span>
              <input type="hidden" {...register("actDate")} />
              <CalendarInput
                isInvalid={Boolean(errors.actDate)}
                onChange={(value) => updateDateField("actDate", value)}
                value={watchedValues.actDate}
              />
              <FieldError message={errors.actDate?.message} />
            </label>
          </div>
        </section>

        <PartyFields
          errors={errors}
          partyType={watchedValues.customerType}
          prefix="customer"
          register={register}
          title="Заказчик"
        />

        <PartyFields
          errors={errors}
          partyType={watchedValues.contractorType}
          prefix="contractor"
          register={register}
          title="Исполнитель"
        />

        <section className="rounded-lg border border-legal-border bg-paper-50 p-5 text-graphite-950 shadow-paper">
          <h2 className="text-xl font-semibold">Предмет договора</h2>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-muted-500">
                Тип договора
              </span>
              <input type="hidden" {...register("contractKind")} />
              <Select
                isInvalid={Boolean(errors.contractKind)}
                onChange={(event) =>
                  selectContractKind(event.target.value as ContractKind)
                }
                value={watchedValues.contractKind}
              >
                {contractKindOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <p className="mt-2 text-sm leading-5 text-muted-500">
                Выберите базовый сценарий. DOCX-шаблон остаётся тем же, но
                подсказки и предмет договора подстроятся под выбранный тип.
              </p>
              <FieldError message={errors.contractKind?.message} />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-muted-500">
                Предмет договора
              </span>
              <Input
                isInvalid={Boolean(errors.subject)}
                placeholder="Например, оказание консультационных услуг"
                {...register("subject")}
              />
              <FieldError message={errors.subject?.message} />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-muted-500">
                Описание работ
              </span>
              <Textarea
                className="min-h-32"
                isInvalid={Boolean(errors.worksDescription)}
                placeholder="Опишите объем, результат и существенные условия работ"
                {...register("worksDescription")}
              />
              <FieldError message={errors.worksDescription?.message} />
            </label>

            <WorksListField
              control={control}
              errors={errors}
              register={register}
            />
          </div>
        </section>

        <PaymentFields
          errors={errors}
          register={register}
          setValue={setValue}
          values={watchedValues}
        />

        <section className="rounded-lg border border-legal-border bg-paper-50 p-5 text-graphite-950 shadow-paper">
          <h2 className="text-xl font-semibold">Сроки</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-muted-500">
                Дата начала работ
              </span>
              <input type="hidden" {...register("startDate")} />
              <CalendarInput
                isInvalid={Boolean(errors.startDate)}
                onChange={(value) => updateDateField("startDate", value)}
                placeholder="Не указана"
                value={watchedValues.startDate}
              />
              <FieldError message={errors.startDate?.message} />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-muted-500">
                Дата окончания работ
              </span>
              <input type="hidden" {...register("endDate")} />
              <CalendarInput
                isInvalid={Boolean(errors.endDate)}
                onChange={(value) => updateDateField("endDate", value)}
                placeholder="Не указана"
                value={watchedValues.endDate}
              />
              <FieldError message={errors.endDate?.message} />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-legal-border bg-paper-50 p-5 text-graphite-950 shadow-paper">
          <label className="flex items-start gap-3">
            <input
              className="mt-1 h-5 w-5 shrink-0 rounded border-legal-border text-gold-500 focus:ring-gold-500"
              type="checkbox"
              {...register("personalDataConsent")}
            />
            <span className="text-sm leading-6 text-muted-500">
              Я{" "}
              <Link className="font-semibold text-graphite-950 underline decoration-gold-500/45 underline-offset-4" href="/consent" target="_blank">
                согласен на обработку персональных данных
              </Link>{" "}
              и ознакомлен с{" "}
              <Link className="font-semibold text-graphite-950 underline decoration-gold-500/45 underline-offset-4" href="/privacy" target="_blank">
                Политикой обработки персональных данных
              </Link>
              . Данные формы передаются на сервер для формирования ZIP и могут
              использоваться для AI-проверки только при наличии подписки.
            </span>
          </label>
          <FieldError message={errors.personalDataConsent?.message} />
        </section>

        {formMessage ? (
          <div className="rounded-md border border-gold-500/30 bg-gold-500/10 p-4 text-sm text-graphite-950">
            {formMessage}
          </div>
        ) : null}

        <GenerateActions
          hasPersonalDataConsent={Boolean(watchedValues.personalDataConsent)}
          isGenerating={isGenerating}
          isSaving={isSaving}
          onPreview={openPreview}
          onSaveDraft={saveDraft}
        />
      </div>

      <aside className="order-3 space-y-6 xl:sticky xl:top-6 xl:order-none xl:self-start">
        <PreviewPanel values={watchedValues} />
        <AiAssistantPanel
          defaultSelectedText={defaultAiText}
          fullText={assistantText}
          hasActiveSubscription={false}
          hasPersonalDataConsent={Boolean(watchedValues.personalDataConsent)}
        />
      </aside>
    </form>
  );
}

function shouldReplacePreset(
  currentValue: string | undefined,
  key: "subject" | "worksDescription"
) {
  const value = currentValue?.trim() || "";

  if (!value) {
    return true;
  }

  return contractKindOptions.some((option) => option[key] === value);
}

function BuilderSteps() {
  const steps = [
    "Шаблон и тип договора",
    "Данные сторон",
    "Предмет и работы",
    "Финансы и сроки",
    "AI-проверка",
    "Экспорт"
  ];

  return (
    <aside className="order-2 rounded-lg border border-white/10 bg-white/[0.045] p-4 text-white xl:sticky xl:top-6 xl:order-none xl:self-start">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-300">
        Сценарий
      </p>
      <ol className="mt-4 space-y-3">
        {steps.map((step, index) => (
          <li className="flex gap-3 text-sm leading-6" key={step}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold-400/40 text-xs font-semibold text-gold-300">
              {index + 1}
            </span>
            <span className="text-steel-200">{step}</span>
          </li>
        ))}
      </ol>
      <div className="mt-5 rounded-md border border-blue-300/20 bg-blue-300/10 p-3 text-xs leading-5 text-blue-100">
        AI работает как слой подсказок. Документ формируется только из
        выбранных шаблонов и данных формы.
      </div>
    </aside>
  );
}
