-- AlterTable
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "exerciseResult" TEXT;

-- AlterTable
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "exerciseResult" INTEGER;
