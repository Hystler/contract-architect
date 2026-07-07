"use client";

import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue
} from "react-hook-form";
import type { ContractFormValues } from "@/types/contract";
import { Button } from "@/components/ui/Button";
import { CalendarInput } from "@/components/ui/CalendarInput";
import { FieldError } from "@/components/ui/FieldError";
import { Input } from "@/components/ui/Input";

type PaymentFieldsProps = {
  errors: FieldErrors<ContractFormValues>;
  register: UseFormRegister<ContractFormValues>;
  setValue: UseFormSetValue<ContractFormValues>;
  values: ContractFormValues;
};

export function PaymentFields({
  errors,
  register,
  setValue,
  values
}: PaymentFieldsProps) {
  function recalculatePayment() {
    const totalAmount = Number(values.totalAmount) || 0;
    const percent = Number(values.prepaymentPercent) || 0;
    const prepaymentAmount = roundMoney((totalAmount * percent) / 100);
    const finalPaymentAmount = roundMoney(totalAmount - prepaymentAmount);

    setValue("prepaymentAmount", prepaymentAmount, {
      shouldDirty: true,
      shouldValidate: true
    });
    setValue("finalPaymentAmount", finalPaymentAmount, {
      shouldDirty: true,
      shouldValidate: true
    });
  }

  function updateDateField(
    field: "prepaymentDate" | "finalPaymentDate",
    value: string
  ) {
    setValue(field, value, {
      shouldDirty: true,
      shouldValidate: true
    });
  }

  return (
    <section className="rounded-lg border border-legal-border bg-paper-50 p-5 text-graphite-950 shadow-paper">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Финансы</h2>
        <Button variant="secondary" onClick={recalculatePayment}>
          Пересчитать оплату
        </Button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted-500">Общая сумма</span>
          <Input
            isInvalid={Boolean(errors.totalAmount)}
            min={0}
            placeholder="100000"
            step="0.01"
            type="number"
            {...register("totalAmount", { valueAsNumber: true })}
          />
          <FieldError message={errors.totalAmount?.message} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted-500">
            Предоплата в процентах
          </span>
          <Input
            isInvalid={Boolean(errors.prepaymentPercent)}
            min={0}
            max={100}
            placeholder="50"
            step="0.01"
            type="number"
            {...register("prepaymentPercent", { valueAsNumber: true })}
          />
          <FieldError message={errors.prepaymentPercent?.message} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted-500">
            Предоплата в рублях
          </span>
          <Input
            isInvalid={Boolean(errors.prepaymentAmount)}
            min={0}
            placeholder="50000"
            step="0.01"
            type="number"
            {...register("prepaymentAmount", { valueAsNumber: true })}
          />
          <FieldError message={errors.prepaymentAmount?.message} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted-500">
            Остаток оплаты
          </span>
          <Input
            isInvalid={Boolean(errors.finalPaymentAmount)}
            min={0}
            placeholder="50000"
            step="0.01"
            type="number"
            {...register("finalPaymentAmount", { valueAsNumber: true })}
          />
          <FieldError message={errors.finalPaymentAmount?.message} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted-500">
            Дата предоплаты
          </span>
          <input type="hidden" {...register("prepaymentDate")} />
          <CalendarInput
            isInvalid={Boolean(errors.prepaymentDate)}
            onChange={(value) => updateDateField("prepaymentDate", value)}
            placeholder="Не указана"
            value={values.prepaymentDate}
          />
          <FieldError message={errors.prepaymentDate?.message} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted-500">
            Дата финального платежа
          </span>
          <input type="hidden" {...register("finalPaymentDate")} />
          <CalendarInput
            isInvalid={Boolean(errors.finalPaymentDate)}
            onChange={(value) => updateDateField("finalPaymentDate", value)}
            placeholder="Не указана"
            value={values.finalPaymentDate}
          />
          <FieldError message={errors.finalPaymentDate?.message} />
        </label>
      </div>
    </section>
  );
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
