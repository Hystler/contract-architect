import { z } from "zod";

const requiredMessage = "Заполните поле";

const textField = (label: string) =>
  z
    .string({ required_error: `${label}: ${requiredMessage}` })
    .trim()
    .min(1, `${label}: ${requiredMessage}`);

const optionalTextField = z.string().trim().optional().default("");

const dateField = (label: string) =>
  z
    .string({ required_error: `${label}: укажите дату` })
    .trim()
    .min(1, `${label}: укажите дату`)
    .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), {
      message: `${label}: укажите корректную дату`
    });

const optionalDateField = z
  .string()
  .trim()
  .optional()
  .default("")
  .refine(
    (value) =>
      !value || !Number.isNaN(new Date(`${value}T00:00:00`).getTime()),
    {
      message: "Укажите корректную дату"
    }
  );

const moneyField = (label: string) =>
  z.coerce
    .number({
      invalid_type_error: `${label}: укажите число`,
      required_error: `${label}: укажите число`
    })
    .finite(`${label}: укажите число`)
    .min(0, `${label}: сумма не может быть отрицательной`);

const partyTypeSchema = z.enum(["physical", "ip", "ooo"], {
  required_error: "Выберите тип стороны",
  invalid_type_error: "Выберите тип стороны"
});

export const contractFormSchema = z
  .object({
    contractNumber: textField("Номер договора"),
    contractDate: dateField("Дата договора"),
    city: textField("Город"),
    actNumber: textField("Номер акта"),
    actDate: dateField("Дата акта"),

    customerType: partyTypeSchema,
    customerName: textField("Наименование заказчика"),
    customerRepresentative: optionalTextField,
    customerBasis: optionalTextField,
    customerRequisites: textField("Реквизиты заказчика").max(
      4000,
      "Реквизиты заказчика слишком длинные"
    ),

    contractorType: partyTypeSchema,
    contractorName: textField("Наименование исполнителя"),
    contractorRepresentative: optionalTextField,
    contractorBasis: optionalTextField,
    contractorRequisites: textField("Реквизиты исполнителя").max(
      4000,
      "Реквизиты исполнителя слишком длинные"
    ),

    subject: textField("Предмет договора").max(
      1000,
      "Предмет договора слишком длинный"
    ),
    worksDescription: textField("Описание работ").max(
      4000,
      "Описание работ слишком длинное"
    ),
    works: z
      .array(
        z.object({
          name: textField("Работа").max(500, "Название работы слишком длинное")
        })
      )
      .min(1, "Добавьте минимум одну работу"),

    totalAmount: moneyField("Общая сумма").gt(
      0,
      "Общая сумма должна быть больше 0"
    ),
    prepaymentPercent: z.coerce
      .number({ invalid_type_error: "Предоплата в процентах: укажите число" })
      .finite("Предоплата в процентах: укажите число")
      .min(0, "Предоплата в процентах не может быть меньше 0")
      .max(100, "Предоплата в процентах не может быть больше 100")
      .optional()
      .default(0),
    prepaymentAmount: moneyField("Предоплата в рублях"),
    finalPaymentAmount: moneyField("Остаток оплаты"),
    prepaymentDate: optionalDateField,
    finalPaymentDate: optionalDateField,
    startDate: optionalDateField,
    endDate: optionalDateField
  })
  .superRefine((data, ctx) => {
    const paymentSum = roundMoney(data.prepaymentAmount + data.finalPaymentAmount);
    if (paymentSum !== roundMoney(data.totalAmount)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["finalPaymentAmount"],
        message: "Предоплата и остаток должны быть равны общей сумме"
      });
    }

    if (data.totalAmount > 0 && data.prepaymentAmount > 0) {
      const expectedPercent = roundMoney(
        (data.prepaymentAmount / data.totalAmount) * 100
      );
      if (Math.abs(expectedPercent - data.prepaymentPercent) > 0.05) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["prepaymentPercent"],
          message: "Процент предоплаты должен соответствовать сумме предоплаты"
        });
      }
    }

    if (data.startDate && data.endDate) {
      const start = new Date(`${data.startDate}T00:00:00`).getTime();
      const end = new Date(`${data.endDate}T00:00:00`).getTime();
      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "Дата окончания не должна быть раньше даты начала"
        });
      }
    }
  });

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export const defaultContractValues = {
  contractNumber: "1",
  contractDate: new Date().toISOString().slice(0, 10),
  city: "Москва",
  actNumber: "1",
  actDate: new Date().toISOString().slice(0, 10),
  customerType: "ooo",
  customerName: "",
  customerRepresentative: "",
  customerBasis: "",
  customerRequisites: "",
  contractorType: "ip",
  contractorName: "",
  contractorRepresentative: "",
  contractorBasis: "",
  contractorRequisites: "",
  subject: "",
  worksDescription: "",
  works: [{ name: "" }],
  totalAmount: 100000,
  prepaymentPercent: 50,
  prepaymentAmount: 50000,
  finalPaymentAmount: 50000,
  prepaymentDate: "",
  finalPaymentDate: "",
  startDate: "",
  endDate: ""
} satisfies z.input<typeof contractFormSchema>;
