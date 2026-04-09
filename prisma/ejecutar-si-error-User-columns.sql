-- Si Prisma devuelve: column User.accountStatus / User.deletedAt does not exist
-- Ejecuta este bloque en Supabase → SQL Editor (o psql contra tu DATABASE_URL).
-- Es idempotente: se puede lanzar varias veces.

DO $$ BEGIN
  CREATE TYPE "UserAccountStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'ACTIVE', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "UserRole" ADD VALUE 'PROFESSIONAL';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "accountStatus" "UserAccountStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "User_deletedAt_idx" ON "User"("deletedAt");
CREATE INDEX IF NOT EXISTS "User_accountStatus_idx" ON "User"("accountStatus");

ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "sellerDocumentsNote" TEXT;
