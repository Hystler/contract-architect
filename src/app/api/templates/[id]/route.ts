import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserSessionFromRequest } from "@/lib/auth/currentUser";
import { runPrisma } from "@/lib/prisma";
import { normalizeTemplateVariables } from "@/lib/templates/templateCatalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  category: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1200).default(""),
  isActive: z.boolean(),
  isPremium: z.boolean(),
  name: z.string().trim().min(2).max(160),
  variables: z.unknown()
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "База данных не подключена." },
        { status: 503 }
      );
    }

    const user = getUserSessionFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "Войдите в аккаунт, чтобы редактировать шаблон." },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const parsed = updateSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Проверьте данные шаблона." },
        { status: 400 }
      );
    }

    const existing = await runPrisma((client) =>
      client.documentTemplate.findFirst({
        where: {
          id: params.id,
          isUserUploaded: true,
          ownerUserId: user.userId
        },
        select: {
          id: true
        }
      })
    );

    if (!existing) {
      return NextResponse.json(
        { error: "Шаблон не найден или недоступен." },
        { status: 404 }
      );
    }

    const template = await runPrisma((client) =>
      client.documentTemplate.update({
        where: {
          id: params.id
        },
        data: {
          category: parsed.data.category,
          description: parsed.data.description,
          isActive: parsed.data.isActive,
          isPremium: parsed.data.isPremium,
          name: parsed.data.name,
          variables: normalizeTemplateVariables(parsed.data.variables)
        },
        select: {
          id: true,
          category: true,
          description: true,
          isActive: true,
          isPremium: true,
          name: true,
          variables: true
        }
      })
    );

    return NextResponse.json({ template });
  } catch {
    return NextResponse.json(
      { error: "Не удалось сохранить шаблон." },
      { status: 500 }
    );
  }
}
