import { NextResponse } from "next/server";
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
  } catch {
    return NextResponse.json(
      { message: "Не удалось сформировать документы. Проверьте шаблоны DOCX." },
      { status: 500 }
    );
  }
}
