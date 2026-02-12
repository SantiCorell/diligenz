-- =============================================================================
-- Valoración mejorada: tipo entidad (Empresa/Startup/Marketplace), años, financiación, etc.
-- Ejecutar en Supabase: SQL Editor → New query → Pegar → Run
-- Todas las columnas son NULLABLE para no afectar registros existentes (NONE/legacy).
-- =============================================================================

-- Company: nuevos campos (todos opcionales)
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "companyType" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "yearsOperating" INTEGER;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "revenueGrowthPercent" DOUBLE PRECISION;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "stage" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "takeRatePercent" DOUBLE PRECISION;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "arr" INTEGER;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "breakevenExpectedYear" INTEGER;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "hasReceivedFunding" BOOLEAN;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "website" TEXT;

-- ValuationLead: mismos campos para leads del formulario de valoración
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "companyType" TEXT;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "yearsOperating" INTEGER;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "revenueGrowthPercent" DOUBLE PRECISION;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "stage" TEXT;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "takeRatePercent" DOUBLE PRECISION;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "arr" INTEGER;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "breakevenExpectedYear" INTEGER;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "hasReceivedFunding" BOOLEAN;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "website" TEXT;
