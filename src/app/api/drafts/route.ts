import { NextResponse } from "next/server";
import { runPrisma } from "@/lib/prisma";
import { contractFormSchema } from "@/lib/validation/contractSchema";

export const runtime = "nodejs";

const partyTypeToDb = {
  physical: "PHYSICAL",
  ip: "IP",
  ooo: "OOO"
} as const;

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { message: "База данных не подключена. Черновик не сохранён." },
      { status: 503 }
    );
  }

  try {
    const payload = await request.json();
    const parsed = contractFormSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Проверьте данные формы",
          errors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Для production нужно добавить авторизацию, права доступа и политику
    // хранения персональных данных. MVP сохраняет только данные формы.
    const draft = await runPrisma((client) =>
      client.documentDraft.create({
        data: {
          contractNumber: data.contractNumber,
          contractDate: toDate(data.contractDate),
          city: data.city,
          actNumber: data.actNumber,
          actDate: toDate(data.actDate),
          customerName: data.customerName,
          customerType: partyTypeToDb[data.customerType],
          customerRepresentative: data.customerRepresentative || null,
          customerBasis: data.customerBasis || null,
          customerRequisites: data.customerRequisites,
          contractorName: data.contractorName,
          contractorType: partyTypeToDb[data.contractorType],
          contractorRepresentative: data.contractorRepresentative || null,
          contractorBasis: data.contractorBasis || null,
          contractorRequisites: data.contractorRequisites,
          subject: data.subject,
          worksDescription: data.worksDescription,
          works: data.works,
          totalAmount: data.totalAmount,
          prepaymentPercent: data.prepaymentPercent ?? null,
          prepaymentAmount: data.prepaymentAmount ?? null,
          finalPaymentAmount: data.finalPaymentAmount ?? null,
          prepaymentDate: data.prepaymentDate
            ? toDate(data.prepaymentDate)
            : null,
          finalPaymentDate: data.finalPaymentDate
            ? toDate(data.finalPaymentDate)
            : null,
          startDate: data.startDate ? toDate(data.startDate) : null,
          endDate: data.endDate ? toDate(data.endDate) : null,
          status: "DRAFT"
        },
        select: {
          id: true,
          createdAt: true
        }
      })
    );

    return NextResponse.json({ draft });
  } catch {
    return NextResponse.json(
      { message: "Не удалось сохранить черновик" },
      { status: 500 }
    );
  }
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}
