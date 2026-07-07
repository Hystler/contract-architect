import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export const databaseNotConnectedMessage = "База данных не подключена";
export const databaseUnavailableMessage =
  "База данных временно недоступна. Попробуйте позже.";
export const migrationsNotAppliedMessage =
  "Миграции базы данных не применены";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message, message }, { status });
}

export function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export function isMigrationError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return ["P2021", "P2022"].includes(error.code);
  }

  const message = getErrorText(error);
  return /relation .* does not exist|column .* does not exist|table .* does not exist/i.test(
    message
  );
}

export function isDatabaseUnavailableError(error: unknown) {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return ["P1000", "P1001", "P1002", "P1017"].includes(error.code);
  }

  return /can't reach database|server has closed|connection terminated|econnrefused|enotfound|timeout/i.test(
    getErrorText(error)
  );
}

export function adminDatabaseErrorResponse(
  error: unknown,
  fallbackMessage: string
) {
  if (!process.env.DATABASE_URL) {
    return jsonError(databaseNotConnectedMessage, 503);
  }

  if (isMigrationError(error)) {
    return jsonError(migrationsNotAppliedMessage, 500);
  }

  if (isDatabaseUnavailableError(error)) {
    return jsonError(databaseUnavailableMessage, 503);
  }

  return jsonError(fallbackMessage, 500);
}

function getErrorText(error: unknown) {
  if (error instanceof Error) {
    return `${error.name} ${error.message}`;
  }

  return String(error);
}
