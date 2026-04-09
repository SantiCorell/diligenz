-- =============================================================================
-- DILIGENZ · Supabase SQL idempotente (seguro de ejecutar varias veces)
-- =============================================================================
-- Qué hace: añade enums, columnas, índices y FK que el código actual espera.
-- Qué NO hace: no borra tablas ni datos, no desactiva RLS ni cambia permisos
--              (la app con la URI de Postgres de Supabase sigue igual).
--
-- Dónde: Dashboard → SQL Editor → New query → pegar todo → Run
--
-- Si algo falla: copia solo el bloque que necesites (p. ej. solo "User") o
-- revisa el mensaje; la mayoría de líneas son ADD IF NOT EXISTS.
-- =============================================================================

-- ----- Enums -----
DO $$ BEGIN
  CREATE TYPE "UserAccountStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'ACTIVE', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "UserRole" ADD VALUE 'PROFESSIONAL';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ----- User -----
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profileVerifiedByAdmin" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "accountStatus" "UserAccountStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ndaSigned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dniVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "blocked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "blockedUntil" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "provider" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "providerId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "image" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "User_deletedAt_idx" ON "User"("deletedAt");
CREATE INDEX IF NOT EXISTS "User_accountStatus_idx" ON "User"("accountStatus");

-- ----- Company -----
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "gmv" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "sellerDescription" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "documentLinks" JSONB;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "attachmentsApproved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "exerciseResult" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "removedAt" TIMESTAMP(3);
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "removedById" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "sellerDocumentsNote" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "companyType" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "yearsOperating" INTEGER;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "revenueGrowthPercent" DOUBLE PRECISION;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "stage" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "takeRatePercent" DOUBLE PRECISION;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "arr" INTEGER;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "breakevenExpectedYear" INTEGER;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "hasReceivedFunding" BOOLEAN;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "website" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Company_removedById_fkey') THEN
    ALTER TABLE "Company" ADD CONSTRAINT "Company_removedById_fkey"
      FOREIGN KEY ("removedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Company_removedAt_idx" ON "Company"("removedAt");

-- ----- CompanyFile (tabla completa si no existe) -----
CREATE TABLE IF NOT EXISTS "CompanyFile" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "uploadedById" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "mimeType" TEXT DEFAULT 'application/octet-stream',
  "size" INTEGER,
  "kind" TEXT NOT NULL DEFAULT 'document',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CompanyFile_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CompanyFile_companyId_fkey') THEN
    ALTER TABLE "CompanyFile" ADD CONSTRAINT "CompanyFile_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CompanyFile_uploadedById_fkey') THEN
    ALTER TABLE "CompanyFile" ADD CONSTRAINT "CompanyFile_uploadedById_fkey"
      FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "CompanyFile_companyId_idx" ON "CompanyFile"("companyId");
ALTER TABLE "CompanyFile" ADD COLUMN IF NOT EXISTS "kind" TEXT NOT NULL DEFAULT 'document';
ALTER TABLE "CompanyFile" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- ----- Valuation -----
ALTER TABLE "Valuation" ADD COLUMN IF NOT EXISTS "salePriceMin" INTEGER;
ALTER TABLE "Valuation" ADD COLUMN IF NOT EXISTS "salePriceMax" INTEGER;

-- ----- ValuationLead -----
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "exerciseResult" INTEGER;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "companyType" TEXT;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "yearsOperating" INTEGER;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "revenueGrowthPercent" DOUBLE PRECISION;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "stage" TEXT;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "takeRatePercent" DOUBLE PRECISION;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "arr" INTEGER;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "breakevenExpectedYear" INTEGER;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "hasReceivedFunding" BOOLEAN;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "website" TEXT;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "category" TEXT;

-- ----- ContactRequest: categoría + mensaje largo -----
ALTER TABLE "ContactRequest" ADD COLUMN IF NOT EXISTS "category" TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ContactRequest' AND column_name = 'message'
  ) THEN
    ALTER TABLE "ContactRequest" ALTER COLUMN "message" TYPE TEXT;
  END IF;
END $$;

UPDATE "ContactRequest" SET "category" = 'gestionado' WHERE "category" = 'pruebas';
UPDATE "ContactRequest" SET "category" = 'rechazado' WHERE "category" = 'archivado';
UPDATE "ContactRequest" SET "category" = 'pendiente' WHERE "category" IS NULL OR "category" = 'activo';
UPDATE "ContactRequest" SET "category" = 'pendiente' WHERE "category" IS NOT NULL AND "category" NOT IN ('pendiente', 'gestionado', 'rechazado');

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ContactRequest' AND column_name = 'category'
  ) THEN
    ALTER TABLE "ContactRequest" ALTER COLUMN "category" SET DEFAULT 'pendiente';
    ALTER TABLE "ContactRequest" ALTER COLUMN "category" SET NOT NULL;
  END IF;
END $$;

-- ----- ValuationLead: categorías coherentes -----
UPDATE "ValuationLead" SET "category" = 'gestionado' WHERE "category" = 'pruebas';
UPDATE "ValuationLead" SET "category" = 'rechazado' WHERE "category" = 'archivado';
UPDATE "ValuationLead" SET "category" = 'pendiente' WHERE "category" IS NULL OR "category" = 'activo';
UPDATE "ValuationLead" SET "category" = 'pendiente' WHERE "category" IS NOT NULL AND "category" NOT IN ('pendiente', 'gestionado', 'rechazado');

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ValuationLead' AND column_name = 'category'
  ) THEN
    ALTER TABLE "ValuationLead" ALTER COLUMN "category" SET DEFAULT 'pendiente';
    ALTER TABLE "ValuationLead" ALTER COLUMN "category" SET NOT NULL;
  END IF;
END $$;

-- =============================================================================
-- Fin. Tras ejecutar: en local puedes hacer `npx prisma db pull` para comprobar
-- que el esquema remoto coincide con prisma/schema.prisma
-- =============================================================================
