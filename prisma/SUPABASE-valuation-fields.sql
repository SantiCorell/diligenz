-- =============================================================================
-- DILIGENZ – Actualizar BD: valoración mejorada + página web
-- =============================================================================
-- Dónde: Supabase Dashboard → SQL Editor → New query → Pegar todo → Run
-- Cuándo: Una vez. Incluye tipo Empresa/Startup/Marketplace, años, financiación,
--        EBITDA negativo, página web, etc.
-- Los registros ya existentes quedarán con NULL en los nuevos campos (NONE).
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
