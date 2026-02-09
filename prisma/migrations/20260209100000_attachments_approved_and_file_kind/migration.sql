-- Company: permitir que admin autorice visibilidad de docs/fotos a usuarios registrados
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "attachmentsApproved" BOOLEAN NOT NULL DEFAULT false;

-- CompanyFile: distinguir documento vs imagen (galería)
ALTER TABLE "CompanyFile" ADD COLUMN IF NOT EXISTS "kind" TEXT NOT NULL DEFAULT 'document';
