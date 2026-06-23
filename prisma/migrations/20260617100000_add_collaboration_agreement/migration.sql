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
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CollaborationAgreement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CollaborationAgreement_userId_key" ON "CollaborationAgreement"("userId");

DO $$ BEGIN
  ALTER TABLE "CollaborationAgreement"
    ADD CONSTRAINT "CollaborationAgreement_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
