-- Leads del formulario "Valora tu empresa" (CRM)
CREATE TABLE "ValuationLead" (
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
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ValuationLead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ValuationLead_createdAt_idx" ON "ValuationLead"("createdAt" DESC);
CREATE INDEX "ValuationLead_email_idx" ON "ValuationLead"("email");
