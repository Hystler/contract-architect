-- Extend document templates for catalog and premium user uploads.
ALTER TABLE "DocumentTemplate" ALTER COLUMN "filePath" DROP NOT NULL;
ALTER TABLE "DocumentTemplate" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'Услуги';
ALTER TABLE "DocumentTemplate" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';
ALTER TABLE "DocumentTemplate" ADD COLUMN "storageKey" TEXT;
ALTER TABLE "DocumentTemplate" ADD COLUMN "contentBase64" TEXT;
ALTER TABLE "DocumentTemplate" ADD COLUMN "isPremium" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "DocumentTemplate" ADD COLUMN "isUserUploaded" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "DocumentTemplate" ADD COLUMN "ownerUserId" TEXT;

ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "DocumentTemplate_category_isActive_idx" ON "DocumentTemplate"("category", "isActive");
CREATE INDEX "DocumentTemplate_ownerUserId_isUserUploaded_idx" ON "DocumentTemplate"("ownerUserId", "isUserUploaded");
