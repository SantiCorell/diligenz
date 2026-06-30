-- CreateEnum
CREATE TYPE "UserActivityType" AS ENUM (
  'INFO_REQUEST_CREATED',
  'INFO_REQUEST_STATUS_CHANGED',
  'INFO_REQUEST_CANCELLED',
  'FAVORITE_ADDED',
  'FAVORITE_REMOVED'
);

-- CreateTable
CREATE TABLE "UserActivityEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "UserActivityType" NOT NULL,
    "companyId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserActivityEvent_userId_createdAt_idx" ON "UserActivityEvent"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "UserActivityEvent" ADD CONSTRAINT "UserActivityEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: solicitudes existentes como eventos de creación
INSERT INTO "UserActivityEvent" ("id", "userId", "type", "companyId", "metadata", "createdAt")
SELECT
  'backfill_' || "id",
  "userId",
  'INFO_REQUEST_CREATED'::"UserActivityType",
  "companyId",
  jsonb_build_object('status', COALESCE("status"::text, 'PENDING'), 'backfill', true),
  "createdAt"
FROM "UserCompanyInterest"
WHERE "type" = 'REQUEST_INFO'
ON CONFLICT ("id") DO NOTHING;
