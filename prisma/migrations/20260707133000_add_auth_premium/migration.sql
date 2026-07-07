-- Add user password hash for email/password authentication.
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;

-- Add MVP premium plan and manual admin provider.
ALTER TYPE "SubscriptionPlan" ADD VALUE 'PREMIUM';
ALTER TYPE "BillingProvider" ADD VALUE 'MANUAL_ADMIN';
