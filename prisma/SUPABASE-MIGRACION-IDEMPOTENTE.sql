-- =============================================================================
-- DILIGENZ · Migración idempotente para Supabase (nueva web)
-- =============================================================================
-- Qué hace:
--   • Crea tablas, enums, columnas, índices y FK que el código actual necesita.
--   • Solo añade lo que NO existe. Puedes ejecutarlo varias veces sin error.
--
-- Qué NO hace:
--   • No borra tablas ni datos.
--   • No hace INSERT, UPDATE ni DELETE (tus datos actuales no se tocan).
--   • No cambia RLS ni permisos de Supabase.
--
-- Dónde ejecutar:
--   Supabase Dashboard → SQL Editor → New query → pegar todo → Run
--
-- Después:
--   1. Variables en Vercel: DATABASE_URL (+ credenciales Drive, SMTP, etc.)
--   2. Redeploy de la app
-- =============================================================================

-- ----- Enums -----
DO $$ BEGIN
  CREATE TYPE "UserAccountStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'ACTIVE', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CompanyInterestType" AS ENUM ('REQUEST_INFO', 'FAVORITE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'MANAGED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "DniDocumentSide" AS ENUM ('FRONT', 'BACK');
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
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "oauthProfileComplete" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "documentsDriveFolderUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- OAuth: passwordHash opcional para usuarios Google
DO $$
BEGIN
  ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "User_deletedAt_idx" ON "User"("deletedAt");
CREATE INDEX IF NOT EXISTS "User_accountStatus_idx" ON "User"("accountStatus");

-- ----- NextAuth (si no existían) -----
CREATE TABLE IF NOT EXISTS "Account" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key"
  ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key"
  ON "Session"("sessionToken");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key"
  ON "VerificationToken"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key"
  ON "VerificationToken"("identifier", "token");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Account_userId_fkey') THEN
    ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Session_userId_fkey') THEN
    ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ----- DNI del usuario -----
CREATE TABLE IF NOT EXISTS "UserDniDocument" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "side" "DniDocumentSide" NOT NULL,
  "name" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "mimeType" TEXT DEFAULT 'application/octet-stream',
  "size" INTEGER,
  "driveSyncedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserDniDocument_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserDniDocument_userId_side_key"
  ON "UserDniDocument"("userId", "side");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserDniDocument_userId_fkey') THEN
    ALTER TABLE "UserDniDocument" ADD CONSTRAINT "UserDniDocument_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ----- Mandato de venta (vendedor) -----
CREATE TABLE IF NOT EXISTS "SalesMandate" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "representativeName" TEXT NOT NULL,
  "representativeDni" TEXT NOT NULL,
  "companyLegalName" TEXT NOT NULL,
  "companyCif" TEXT NOT NULL,
  "companyAddress" TEXT NOT NULL,
  "contactEmail" TEXT NOT NULL,
  "contactPhone" TEXT,
  "companyTradeName" TEXT,
  "companySector" TEXT,
  "companyCnae" TEXT,
  "companyFoundedYear" INTEGER,
  "employeeCount" INTEGER,
  "lastRevenueEur" INTEGER,
  "lastEbitdaEur" INTEGER,
  "expectedSalePriceEur" INTEGER,
  "saleReason" TEXT,
  "signaturePngBase64" TEXT NOT NULL,
  "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "clientIp" TEXT,
  "userAgent" TEXT,
  "termsAccepted" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SalesMandate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SalesMandate_userId_key" ON "SalesMandate"("userId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SalesMandate_userId_fkey') THEN
    ALTER TABLE "SalesMandate" ADD CONSTRAINT "SalesMandate_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ----- Mandato de compra (comprador / inversor) -----
CREATE TABLE IF NOT EXISTS "PurchaseMandate" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "buyerLegalName" TEXT NOT NULL,
  "buyerNifCif" TEXT NOT NULL,
  "buyerAddress" TEXT NOT NULL,
  "contactEmail" TEXT NOT NULL,
  "contactPhone" TEXT,
  "representativeName" TEXT NOT NULL,
  "representativeDni" TEXT NOT NULL,
  "representativeRole" TEXT,
  "signaturePngBase64" TEXT NOT NULL,
  "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "clientIp" TEXT,
  "userAgent" TEXT,
  "termsAccepted" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PurchaseMandate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PurchaseMandate_userId_key" ON "PurchaseMandate"("userId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PurchaseMandate_userId_fkey') THEN
    ALTER TABLE "PurchaseMandate" ADD CONSTRAINT "PurchaseMandate_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ----- Acuerdo de colaboración (profesional) -----
CREATE TABLE IF NOT EXISTS "CollaborationAgreement" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "professionalLegalName" TEXT NOT NULL,
  "professionalNif" TEXT NOT NULL,
  "professionalAddress" TEXT NOT NULL,
  "contactEmail" TEXT NOT NULL,
  "contactPhone" TEXT,
  "representativeName" TEXT NOT NULL,
  "representativeDni" TEXT NOT NULL,
  "representativeRole" TEXT,
  "signaturePngBase64" TEXT NOT NULL,
  "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "clientIp" TEXT,
  "userAgent" TEXT,
  "termsAccepted" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CollaborationAgreement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CollaborationAgreement_userId_key" ON "CollaborationAgreement"("userId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CollaborationAgreement_userId_fkey') THEN
    ALTER TABLE "CollaborationAgreement" ADD CONSTRAINT "CollaborationAgreement_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ----- Company -----
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "gmv" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "sellerDescription" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "documentLinks" JSONB;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "attachmentsApproved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "exerciseResult" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "removedAt" TIMESTAMP(3);
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "removedById" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "sellerDocumentsNote" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "sectorSubcategory" TEXT;
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

-- ----- CompanyFile -----
CREATE TABLE IF NOT EXISTS "CompanyFile" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "uploadedById" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "mimeType" TEXT DEFAULT 'application/octet-stream',
  "size" INTEGER,
  "kind" TEXT NOT NULL DEFAULT 'document',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CompanyFile_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CompanyFile" ADD COLUMN IF NOT EXISTS "kind" TEXT NOT NULL DEFAULT 'document';
ALTER TABLE "CompanyFile" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;

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

-- ----- Valuation -----
ALTER TABLE "Valuation" ADD COLUMN IF NOT EXISTS "salePriceMin" INTEGER;
ALTER TABLE "Valuation" ADD COLUMN IF NOT EXISTS "salePriceMax" INTEGER;

-- ----- ValuationLead -----
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "exerciseResult" INTEGER;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "sectorSubcategory" TEXT;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "companyType" TEXT;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "yearsOperating" INTEGER;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "revenueGrowthPercent" DOUBLE PRECISION;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "stage" TEXT;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "takeRatePercent" DOUBLE PRECISION;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "arr" INTEGER;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "breakevenExpectedYear" INTEGER;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "hasReceivedFunding" BOOLEAN;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "website" TEXT;
ALTER TABLE "ValuationLead" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'pendiente';

-- ----- ContactRequest -----
ALTER TABLE "ContactRequest" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'pendiente';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ContactRequest' AND column_name = 'message'
  ) THEN
    ALTER TABLE "ContactRequest" ALTER COLUMN "message" TYPE TEXT;
  END IF;
END $$;

-- ----- UserCompanyInterest (por si faltaba) -----
CREATE TABLE IF NOT EXISTS "UserCompanyInterest" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "type" "CompanyInterestType" NOT NULL,
  "status" "RequestStatus" DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,
  CONSTRAINT "UserCompanyInterest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserCompanyInterest_userId_companyId_type_key"
  ON "UserCompanyInterest"("userId", "companyId", "type");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserCompanyInterest_userId_fkey') THEN
    ALTER TABLE "UserCompanyInterest" ADD CONSTRAINT "UserCompanyInterest_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- =============================================================================
-- Fin. Si todo fue bien verás "Success" en Supabase.
-- Puedes volver a ejecutar este script sin riesgo: solo añade lo que falte.
-- =============================================================================
