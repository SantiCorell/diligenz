-- CreateEnum
CREATE TYPE "UserAccountStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'ACTIVE', 'REJECTED');

-- AlterEnum (PostgreSQL: add value to UserRole)
DO $$ BEGIN
  ALTER TYPE "UserRole" ADD VALUE 'PROFESSIONAL';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "accountStatus" "UserAccountStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "User_deletedAt_idx" ON "User"("deletedAt");
CREATE INDEX IF NOT EXISTS "User_accountStatus_idx" ON "User"("accountStatus");
