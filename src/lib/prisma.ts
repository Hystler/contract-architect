import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function runPrisma<T>(
  action: (client: PrismaClient) => Promise<T>
) {
  const client = createPrismaClient();

  try {
    return await action(client);
  } finally {
    await client.$disconnect().catch(() => undefined);
  }
}
