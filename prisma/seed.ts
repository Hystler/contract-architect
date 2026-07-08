import { PrismaClient, type Prisma } from "@prisma/client";
import { publicTemplateCatalog } from "../src/lib/templates/templateCatalog";

const prisma = new PrismaClient();

async function main() {
  await prisma.documentTemplate.createMany({
    data: publicTemplateCatalog.map((template) => ({
      id: template.id,
      category: template.category,
      description: template.description,
      filePath: template.filePath,
      isActive: template.isActive,
      isPremium: template.isPremium,
      isUserUploaded: false,
      name: template.name,
      storageKey: template.storageKey,
      type: template.type,
      variables: template.variables as Prisma.InputJsonValue
    })),
    skipDuplicates: true
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
