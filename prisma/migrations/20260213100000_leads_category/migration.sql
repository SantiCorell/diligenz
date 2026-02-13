-- AlterTable
ALTER TABLE "ContactRequest" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "category" TEXT;
