import { NextResponse } from "next/server";
import { z } from "zod";
import {
  analyzeTemplateWithAI,
  type TemplateAnalysis
} from "@/lib/templates/analyzeTemplateWithAI";
import { detectTemplateVariables } from "@/lib/templates/templateVariableDetector";
import { extractDocxText } from "@/lib/templates/extractDocxText";
import { getUserSessionFromRequest } from "@/lib/auth/currentUser";
import { hasActiveSubscription } from "@/lib/billing/hasActiveSubscription";
import { runPrisma } from "@/lib/prisma";
import { normalizeTemplateVariables } from "@/lib/templates/templateCatalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxFileSize = 2 * 1024 * 1024;
const docxMime =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const metadataSchema = z.object({
  category: z.string().trim().min(1, "Выберите категорию").max(120),
  description: z.string().trim().max(1200).default(""),
  legalReviewConsent: z.literal("true", {
    errorMap: () => ({
      message: "Подтвердите, что шаблон требует проверки специалистом."
    })
  }),
  name: z.string().trim().min(2, "Укажите название шаблона").max(160),
  personalDataConsent: z.literal("true", {
    errorMap: () => ({
      message: "Необходимо согласие на обработку персональных данных."
    })
  })
});

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "База данных не подключена. Шаблон не сохранён." },
        { status: 503 }
      );
    }

    const user = getUserSessionFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "Войдите в аккаунт, чтобы загрузить свой шаблон." },
        { status: 401 }
      );
    }

    const hasPremium = await hasActiveSubscription(user.userId);

    if (!hasPremium) {
      return NextResponse.json(
        { error: "Загрузка своих шаблонов доступна только с premium-доступом." },
        { status: 402 }
      );
    }

    const formData = await request.formData();
    const parsed = metadataSchema.safeParse({
      category: formData.get("category"),
      description: formData.get("description") || "",
      legalReviewConsent: formData.get("legalReviewConsent"),
      name: formData.get("name"),
      personalDataConsent: formData.get("personalDataConsent")
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Проверьте данные загрузки шаблона.",
          details: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Добавьте DOCX-файл шаблона." },
        { status: 400 }
      );
    }

    const fileValidationError = validateDocxFile(file);

    if (fileValidationError) {
      return NextResponse.json({ error: fileValidationError }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractDocxText(buffer);

    if (!text) {
      return NextResponse.json(
        { error: "Не удалось извлечь текст из DOCX-шаблона." },
        { status: 400 }
      );
    }

    const detectedVariables = detectTemplateVariables(text);
    const analysis = await analyzeTemplateWithAI({
      category: parsed.data.category,
      detectedVariables,
      text,
      title: parsed.data.name
    });
    const variables = normalizeTemplateVariables(analysis.formFields);

    const template = await runPrisma((client) =>
      client.documentTemplate.create({
        data: {
          category: parsed.data.category,
          contentBase64: buffer.toString("base64"),
          description:
            parsed.data.description ||
            "Пользовательский DOCX-шаблон. Требует юридической проверки перед использованием.",
          filePath: null,
          isActive: true,
          isPremium: true,
          isUserUploaded: true,
          name: parsed.data.name,
          ownerUserId: user.userId,
          storageKey: "database:document_template_content",
          type: "CONTRACT",
          variables
        },
        select: {
          id: true,
          category: true,
          description: true,
          isActive: true,
          isPremium: true,
          isUserUploaded: true,
          name: true,
          ownerUserId: true,
          storageKey: true,
          type: true,
          variables: true
        }
      })
    );

    return NextResponse.json({
      analysis: withSafetyWarnings(analysis),
      template
    });
  } catch {
    return NextResponse.json(
      { error: "AI-анализ шаблона временно недоступен. Попробуйте позже." },
      { status: 503 }
    );
  }
}

function validateDocxFile(file: File) {
  const lowerName = file.name.toLowerCase();

  if (!lowerName.endsWith(".docx")) {
    return "Можно загрузить только файл DOCX.";
  }

  if (file.size <= 0) {
    return "Файл шаблона пустой.";
  }

  if (file.size > maxFileSize) {
    return "Размер DOCX-файла не должен превышать 2 МБ.";
  }

  if (file.type && file.type !== docxMime && file.type !== "application/octet-stream") {
    return "Тип файла не похож на DOCX.";
  }

  return "";
}

function withSafetyWarnings(analysis: TemplateAnalysis): TemplateAnalysis {
  return {
    ...analysis,
    warnings: [
      ...analysis.warnings,
      "AI-анализ помогает настроить форму, но не подтверждает юридическую силу шаблона."
    ],
    legalReviewItems:
      analysis.legalReviewItems.length > 0
        ? analysis.legalReviewItems
        : ["Проверьте загруженный шаблон со специалистом перед использованием."]
  };
}
