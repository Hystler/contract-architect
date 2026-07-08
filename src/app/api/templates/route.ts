import { NextResponse } from "next/server";
import { getUserSessionFromRequest } from "@/lib/auth/currentUser";
import { runPrisma } from "@/lib/prisma";
import {
  normalizeTemplateVariables,
  publicTemplateCatalog,
  type TemplateSummary
} from "@/lib/templates/templateCatalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ templates: publicTemplateCatalog });
  }

  try {
    const user = getUserSessionFromRequest(request);
    const templates = await runPrisma((client) =>
      client.documentTemplate.findMany({
        where: {
          isActive: true,
          OR: [
            { isUserUploaded: false },
            ...(user ? [{ ownerUserId: user.userId }] : [])
          ]
        },
        orderBy: [{ isUserUploaded: "asc" }, { category: "asc" }, { name: "asc" }],
        select: {
          id: true,
          type: true,
          category: true,
          name: true,
          description: true,
          filePath: true,
          storageKey: true,
          variables: true,
          isActive: true,
          isPremium: true,
          isUserUploaded: true,
          ownerUserId: true
        }
      })
    );

    return NextResponse.json({
      templates: mergeTemplates(templates.map(toTemplateSummary))
    });
  } catch {
    return NextResponse.json({ templates: publicTemplateCatalog });
  }
}

function mergeTemplates(databaseTemplates: TemplateSummary[]) {
  const merged = new Map(
    publicTemplateCatalog.map((template) => [template.id, template])
  );

  for (const template of databaseTemplates) {
    merged.set(template.id, template);
  }

  return Array.from(merged.values());
}

function toTemplateSummary(
  template: {
    id: string;
    type: "CONTRACT" | "ACT";
    category: string;
    name: string;
    description: string;
    filePath: string | null;
    storageKey: string | null;
    variables: unknown;
    isActive: boolean;
    isPremium: boolean;
    isUserUploaded: boolean;
    ownerUserId: string | null;
  }
): TemplateSummary {
  return {
    id: template.id,
    type: template.type,
    category: template.category,
    name: template.name,
    description: template.description,
    filePath: template.filePath,
    storageKey: template.storageKey,
    variables: normalizeTemplateVariables(template.variables),
    isActive: template.isActive,
    isPremium: template.isPremium,
    isUserUploaded: template.isUserUploaded,
    ownerUserId: template.ownerUserId,
    requiresLegalReview: true
  };
}
