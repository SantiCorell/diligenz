-- =============================================================================
-- Migraciones para Supabase (PostgreSQL)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- Fecha: 2026-02-09
-- =============================================================================
-- Incluye:
-- 1) Nuevas columnas en Company: gmv, sellerDescription, documentLinks
-- 2) Nueva tabla CompanyFile (documentos subidos por el vendedor, solo admin/dueño)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. COMPANY: añadir columnas (si no existen)
-- -----------------------------------------------------------------------------
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "gmv" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "sellerDescription" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "documentLinks" JSONB;

-- -----------------------------------------------------------------------------
-- 2. COMPANYFILE: tabla de documentos subidos (solo visibles para admin y dueño)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "CompanyFile" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "uploadedById" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "mimeType" TEXT DEFAULT 'application/octet-stream',
  "size" INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("id"),
  CONSTRAINT "CompanyFile_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CompanyFile_uploadedById_fkey"
    FOREIGN KEY ("uploadedById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "CompanyFile_companyId_idx" ON "CompanyFile"("companyId");

-- -----------------------------------------------------------------------------
-- Comentarios (opcional)
-- -----------------------------------------------------------------------------
COMMENT ON COLUMN "Company"."gmv" IS 'Gross Merchandise Value / volumen de negocio';
COMMENT ON COLUMN "Company"."sellerDescription" IS 'Descripción amplia del vendedor; solo visible para usuarios registrados';
COMMENT ON COLUMN "Company"."documentLinks" IS 'Enlaces a Drive, etc. [{ label, url }]';

-- -----------------------------------------------------------------------------
-- 3. COMPANY: attachmentsApproved (usuarios registrados pueden ver docs/fotos)
-- -----------------------------------------------------------------------------
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "attachmentsApproved" BOOLEAN NOT NULL DEFAULT false;

-- -----------------------------------------------------------------------------
-- 4. COMPANYFILE: kind (document | image)
-- -----------------------------------------------------------------------------
ALTER TABLE "CompanyFile" ADD COLUMN IF NOT EXISTS "kind" TEXT NOT NULL DEFAULT 'document';

COMMENT ON COLUMN "Company"."attachmentsApproved" IS 'Si true, usuarios registrados pueden ver documentación, enlaces y fotos';
COMMENT ON TABLE "CompanyFile" IS 'Documentos/imágenes subidos por el dueño; visibles según attachmentsApproved';

-- -----------------------------------------------------------------------------
-- 5. VALUATIONLEAD: leads del formulario "Valora tu empresa" (CRM)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "ValuationLead" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "companyName" TEXT,
  "sector" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "revenue" INTEGER NOT NULL,
  "ebitda" INTEGER,
  "employees" INTEGER,
  "description" TEXT,
  "minValue" INTEGER NOT NULL,
  "maxValue" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ValuationLead_createdAt_idx" ON "ValuationLead"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "ValuationLead_email_idx" ON "ValuationLead"("email");
COMMENT ON TABLE "ValuationLead" IS 'Leads del formulario Valora tu empresa: contacto + datos empresa + valoración orientativa';
