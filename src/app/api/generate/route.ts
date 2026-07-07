import { NextResponse } from "next/server";
import {
  DocumentGenerationError,
  TemplateNotFoundError
} from "@/lib/documents/documentErrors";
import { generateDocumentsZip } from "@/lib/documents/generateDocx";
import { contractFormSchema } from "@/lib/validation/contractSchema";

export const runtime = "nodejs";

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

    const { zipBuffer, fileName } = await generateDocumentsZip(parsed.data);

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
