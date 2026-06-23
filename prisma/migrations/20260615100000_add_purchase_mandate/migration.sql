-- Mandato de compra para inversores
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
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PurchaseMandate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PurchaseMandate_userId_key" ON "PurchaseMandate"("userId");

DO $$ BEGIN
  ALTER TABLE "PurchaseMandate"
    ADD CONSTRAINT "PurchaseMandate_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
