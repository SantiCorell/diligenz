-- Subcategoría de sector (texto libre) en valoración y empresa
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "sectorSubcategory" TEXT;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "sectorSubcategory" TEXT;
