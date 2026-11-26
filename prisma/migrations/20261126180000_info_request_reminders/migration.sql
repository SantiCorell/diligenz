-- Historial de recordatorios enviados desde el panel de solicitudes.
CREATE TABLE "InfoRequestReminder" (
    "id" TEXT NOT NULL,
    "interestId" TEXT NOT NULL,
    "sentById" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InfoRequestReminder_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InfoRequestReminder_interestId_createdAt_idx" ON "InfoRequestReminder"("interestId", "createdAt" DESC);

ALTER TABLE "InfoRequestReminder" ADD CONSTRAINT "InfoRequestReminder_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "UserCompanyInterest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InfoRequestReminder" ADD CONSTRAINT "InfoRequestReminder_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
