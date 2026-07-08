import { NextResponse } from "next/server";
import {
  DocumentGenerationError,
  TemplateNotFoundError
} from "@/lib/documents/documentErrors";
import {
  generateDocumentsZip,
  type DocumentGenerationTemplate
} from "@/lib/documents/generateDocx";
import { getUserSessionFromRequest } from "@/lib/auth/currentUser";
import { hasActiveSubscription } from "@/lib/billing/hasActiveSubscription";
import { runPrisma } from "@/lib/prisma";
import {
  defaultContractTemplateId,
  findCatalogTemplate
} from "@/lib/templates/templateCatalog";
import { contractFormSchema } from "@/lib/validation/contractSchema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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

    const resolvedTemplate = await resolveGenerationTemplate(
      request,
      parsed.data.templateId || defaultContractTemplateId
    );

    if ("response" in resolvedTemplate) {
      return resolvedTemplate.response;
    }

    const { zipBuffer, fileName } = await generateDocumentsZip(parsed.data, {
      template: resolvedTemplate.template
    });

    return new Response(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    if (error instanceof TemplateNotFoundError) {
      return NextResponse.json(
        { error: "Шаблон документа не найден на сервере." },
        { status: 500 }
      );
    }

    if (error instanceof DocumentGenerationError) {
      return NextResponse.json(
        {
          error:
            "Не удалось сформировать документы. Проверьте данные и шаблоны."
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Не удалось сформировать документы. Проверьте данные и шаблоны."
      },
      { status: 500 }
    );
  }
}

async function resolveGenerationTemplate(
  request: Request,
  templateId = defaultContractTemplateId
): Promise<
  | { template: DocumentGenerationTemplate | null }
  | { response: NextResponse<{ error: string }> }
> {
  const catalogTemplate = findCatalogTemplate(templateId);

  if (catalogTemplate) {
    if (catalogTemplate.isPremium) {
      const accessResponse = await requirePremiumAccess(request);

      if (accessResponse) {
        return { response: accessResponse };
      }
    }

    return {
      template: {
        id: catalogTemplate.id,
        name: catalogTemplate.name,
        type: catalogTemplate.type,
        filePath: catalogTemplate.filePath,
        contentBase64: null
      }
    };
  }

  if (!process.env.DATABASE_URL) {
    throw new TemplateNotFoundError();
  }

  const user = getUserSessionFromRequest(request);
  const template = await runPrisma((client) =>
    client.documentTemplate.findFirst({
      where: {
        id: templateId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        type: true,
        filePath: true,
        contentBase64: true,
        isPremium: true,
        isUserUploaded: true,
        ownerUserId: true
      }
    })
  );

  if (!template) {
    throw new TemplateNotFoundError();
  }

  if (template.isUserUploaded && template.ownerUserId !== user?.userId) {
    return {
      response: NextResponse.json(
        { error: "У вас нет доступа к этому шаблону." },
        { status: 403 }
      )
    };
  }

  if (template.isPremium) {
    const accessResponse = await requirePremiumAccess(request);

    if (accessResponse) {
      return { response: accessResponse };
    }
  }

  return {
    template: {
      id: template.id,
      name: template.name,
      type: template.type,
      filePath: template.filePath,
      contentBase64: template.contentBase64
    }
  };
}

async function requirePremiumAccess(request: Request) {
  const user = getUserSessionFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: "Войдите в аккаунт, чтобы использовать premium-шаблон." },
      { status: 401 }
    );
  }

  const hasPremium = await hasActiveSubscription(user.userId);

  if (!hasPremium) {
    return NextResponse.json(
      { error: "Этот шаблон доступен только с premium-доступом." },
      { status: 402 }
    );
  }

  return null;
}
