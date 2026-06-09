"use client";

import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue
} from "react-hook-form";
import type { ContractFormValues } from "@/types/contract";
import { Button } from "@/components/ui/Button";
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

  return (
    <section className="rounded-md border border-white/10 bg-matte-900/70 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-white">Финансы</h2>
        <Button variant="secondary" onClick={recalculatePayment}>
          Пересчитать оплату
        </Button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm text-steel-200">Общая сумма</span>
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
          <span className="mb-2 block text-sm text-steel-200">
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
          <span className="mb-2 block text-sm text-steel-200">
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
          <span className="mb-2 block text-sm text-steel-200">
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
          <span className="mb-2 block text-sm text-steel-200">
            Дата предоплаты
          </span>
          <Input
            isInvalid={Boolean(errors.prepaymentDate)}
            type="date"
            {...register("prepaymentDate")}
          />
          <FieldError message={errors.prepaymentDate?.message} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-steel-200">
            Дата финального платежа
          </span>
          <Input
            isInvalid={Boolean(errors.finalPaymentDate)}
            type="date"
            {...register("finalPaymentDate")}
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
