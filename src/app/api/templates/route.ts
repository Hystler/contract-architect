import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fallbackTemplates = [
  {
    id: "fallback-contract",
    type: "CONTRACT",
    name: "Договор оказания услуг",
    filePath: "src/templates/contract-template.docx",
    isActive: true
  },
  {
    id: "fallback-act",
    type: "ACT",
    name: "Акт выполненных работ",
    filePath: "src/templates/act-template.docx",
    isActive: true
  }
];

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ templates: fallbackTemplates });
  }

  try {
    const templates = await prisma.documentTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        type: true,
        name: true,
        filePath: true,
        variables: true,
        isActive: true
      }
    });

    return NextResponse.json({
      templates: templates.length > 0 ? templates : fallbackTemplates
    });
  } catch {
    return NextResponse.json({ templates: fallbackTemplates });
  }
}
