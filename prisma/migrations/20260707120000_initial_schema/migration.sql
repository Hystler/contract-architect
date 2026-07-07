-- CreateEnum
CREATE TYPE "PartyRole" AS ENUM ('CUSTOMER', 'CONTRACTOR');

-- CreateEnum
CREATE TYPE "PartyType" AS ENUM ('PHYSICAL', 'IP', 'OOO');

-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('DRAFT', 'GENERATED');

-- CreateEnum
CREATE TYPE "DocumentTemplateType" AS ENUM ('CONTRACT', 'ACT');

-- CreateEnum
CREATE TYPE "GeneratedDocumentType" AS ENUM ('CONTRACT', 'ACT', 'ZIP', 'PDF_PREVIEW');

-- CreateEnum
CREATE TYPE "GeneratedDocumentFormat" AS ENUM ('DOCX', 'ZIP', 'HTML', 'PDF');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'INCOMPLETE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('START');

-- CreateEnum
CREATE TYPE "BillingProvider" AS ENUM ('MOCK', 'STRIPE', 'YOOKASSA');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'START',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "provider" "BillingProvider" NOT NULL DEFAULT 'MOCK',
    "providerCustomerId" TEXT,
    "providerSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "BillingProvider" NOT NULL DEFAULT 'MOCK',
    "providerPaymentId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentDraft" (
    "id" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "contractDate" TIMESTAMP(3) NOT NULL,
    "city" TEXT NOT NULL,
    "actNumber" TEXT NOT NULL,
    "actDate" TIMESTAMP(3) NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerType" "PartyType" NOT NULL,
    "customerRepresentative" TEXT,
    "customerBasis" TEXT,
    "customerRequisites" TEXT NOT NULL,
    "contractorName" TEXT NOT NULL,
    "contractorType" "PartyType" NOT NULL,
    "contractorRepresentative" TEXT,
    "contractorBasis" TEXT,
    "contractorRequisites" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "worksDescription" TEXT NOT NULL,
    "works" JSONB NOT NULL,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "prepaymentPercent" DECIMAL(5,2),
    "prepaymentAmount" DECIMAL(14,2),
    "finalPaymentAmount" DECIMAL(14,2),
    "prepaymentDate" TIMESTAMP(3),
    "finalPaymentDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "DraftStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Party" (
    "id" TEXT NOT NULL,
    "role" "PartyRole" NOT NULL,
    "type" "PartyType" NOT NULL,
    "name" TEXT NOT NULL,
    "representative" TEXT,
    "basis" TEXT,
    "requisites" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "type" "DocumentTemplateType" NOT NULL,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "variables" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedDocument" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "type" "GeneratedDocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "format" "GeneratedDocumentFormat" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");

-- CreateIndex
CREATE INDEX "Subscription_provider_providerSubscriptionId_idx" ON "Subscription"("provider", "providerSubscriptionId");

-- CreateIndex
CREATE INDEX "AiUsage_period_idx" ON "AiUsage"("period");

-- CreateIndex
CREATE UNIQUE INDEX "AiUsage_userId_period_key" ON "AiUsage"("userId", "period");

-- CreateIndex
CREATE INDEX "Payment_userId_createdAt_idx" ON "Payment"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_provider_providerPaymentId_idx" ON "Payment"("provider", "providerPaymentId");

-- CreateIndex
CREATE INDEX "DocumentDraft_contractNumber_idx" ON "DocumentDraft"("contractNumber");

-- CreateIndex
CREATE INDEX "DocumentDraft_createdAt_idx" ON "DocumentDraft"("createdAt");

-- CreateIndex
CREATE INDEX "Party_role_type_idx" ON "Party"("role", "type");

-- CreateIndex
CREATE INDEX "DocumentTemplate_type_isActive_idx" ON "DocumentTemplate"("type", "isActive");

-- CreateIndex
CREATE INDEX "GeneratedDocument_draftId_idx" ON "GeneratedDocument"("draftId");

-- CreateIndex
CREATE INDEX "GeneratedDocument_type_createdAt_idx" ON "GeneratedDocument"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiUsage" ADD CONSTRAINT "AiUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "DocumentDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

