"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { GenerateActions } from "@/components/generator/GenerateActions";
import { PartyFields } from "@/components/generator/PartyFields";
import { PaymentFields } from "@/components/generator/PaymentFields";
import { PreviewPanel } from "@/components/generator/PreviewPanel";
import { WorksListField } from "@/components/generator/WorksListField";
import { FieldError } from "@/components/ui/FieldError";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
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

  return (
    <form
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
      onSubmit={handleSubmit(generateZip)}
    >
      <div className="space-y-6">
        <section className="rounded-md border border-white/10 bg-matte-900/70 p-5">
          <h2 className="text-xl font-semibold text-white">Основные данные</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm text-steel-200">
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
              <span className="mb-2 block text-sm text-steel-200">
                Дата договора
              </span>
              <Input
                isInvalid={Boolean(errors.contractDate)}
                type="date"
                {...register("contractDate")}
              />
              <FieldError message={errors.contractDate?.message} />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-steel-200">Город</span>
              <Input
                isInvalid={Boolean(errors.city)}
                placeholder="Москва"
                {...register("city")}
              />
              <FieldError message={errors.city?.message} />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-steel-200">
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
              <span className="mb-2 block text-sm text-steel-200">
                Дата акта
              </span>
              <Input
                isInvalid={Boolean(errors.actDate)}
                type="date"
                {...register("actDate")}
              />
              <FieldError message={errors.actDate?.message} />
            </label>
          </div>
        </section>

        <PartyFields
          errors={errors}
          prefix="customer"
          register={register}
          title="Заказчик"
        />

        <PartyFields
          errors={errors}
          prefix="contractor"
          register={register}
          title="Исполнитель"
        />

        <section className="rounded-md border border-white/10 bg-matte-900/70 p-5">
          <h2 className="text-xl font-semibold text-white">Предмет договора</h2>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-steel-200">
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
              <span className="mb-2 block text-sm text-steel-200">
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

        <section className="rounded-md border border-white/10 bg-matte-900/70 p-5">
          <h2 className="text-xl font-semibold text-white">Сроки</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-steel-200">
                Дата начала работ
              </span>
              <Input
                isInvalid={Boolean(errors.startDate)}
                type="date"
                {...register("startDate")}
              />
              <FieldError message={errors.startDate?.message} />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-steel-200">
                Дата окончания работ
              </span>
              <Input
                isInvalid={Boolean(errors.endDate)}
                type="date"
                {...register("endDate")}
              />
              <FieldError message={errors.endDate?.message} />
            </label>
          </div>
        </section>

        {formMessage ? (
          <div className="rounded-md border border-white/10 bg-white/[0.045] p-4 text-sm text-steel-200">
            {formMessage}
          </div>
        ) : null}

        <GenerateActions
          isGenerating={isGenerating}
          isSaving={isSaving}
          onPreview={openPreview}
          onSaveDraft={saveDraft}
        />
      </div>

      <PreviewPanel values={watchedValues} />
    </form>
  );
}
