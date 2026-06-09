"use client";

import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import type { ContractFormValues } from "@/types/contract";
import { Button } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/FieldError";
import { Input } from "@/components/ui/Input";

type WorksListFieldProps = {
  control: Control<ContractFormValues>;
  errors: FieldErrors<ContractFormValues>;
  register: UseFormRegister<ContractFormValues>;
};

export function WorksListField({
  control,
  errors,
  register
}: WorksListFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "works"
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            Перечень работ
          </h3>
          <p className="mt-1 text-sm text-steel-300">
            Добавьте минимум одну работу для договора и акта.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => append({ name: "" })}
          type="button"
        >
          Добавить работу
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {fields.length === 0 ? (
          <div className="rounded-md border border-white/10 bg-white/[0.035] p-4 text-sm text-steel-300">
            Список работ пуст. Добавьте работу, чтобы сформировать документы.
          </div>
        ) : null}

        {fields.map((field, index) => (
          <div
            className="grid gap-3 rounded-md border border-white/10 bg-white/[0.035] p-3 sm:grid-cols-[1fr_auto]"
            key={field.id}
          >
            <label className="block">
              <span className="mb-2 block text-sm text-steel-200">
                Работа {index + 1}
              </span>
              <Input
                isInvalid={Boolean(errors.works?.[index]?.name)}
                placeholder="Например, подготовка проектной документации"
                {...register(`works.${index}.name`)}
              />
              <FieldError message={errors.works?.[index]?.name?.message} />
            </label>
            <div className="flex items-end">
              <Button
                className="w-full sm:w-auto"
                disabled={fields.length === 1}
                onClick={() => remove(index)}
                type="button"
                variant="danger"
              >
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>
      <FieldError
        message={
          typeof errors.works?.message === "string"
            ? errors.works.message
            : undefined
        }
      />
    </div>
  );
}
