-- Mensaje de contacto: TEXT para textos largos
ALTER TABLE "ContactRequest" ALTER COLUMN "message" TYPE TEXT;

-- Migrar categorías antiguas → pendiente | gestionado | rechazado
UPDATE "ContactRequest" SET "category" = 'gestionado' WHERE "category" = 'pruebas';
UPDATE "ContactRequest" SET "category" = 'rechazado' WHERE "category" = 'archivado';
UPDATE "ContactRequest" SET "category" = 'pendiente' WHERE "category" IS NULL OR "category" = 'activo';
UPDATE "ContactRequest" SET "category" = 'pendiente' WHERE "category" NOT IN ('pendiente', 'gestionado', 'rechazado');

ALTER TABLE "ContactRequest" ALTER COLUMN "category" SET DEFAULT 'pendiente';
ALTER TABLE "ContactRequest" ALTER COLUMN "category" SET NOT NULL;

UPDATE "ValuationLead" SET "category" = 'gestionado' WHERE "category" = 'pruebas';
UPDATE "ValuationLead" SET "category" = 'rechazado' WHERE "category" = 'archivado';
UPDATE "ValuationLead" SET "category" = 'pendiente' WHERE "category" IS NULL OR "category" = 'activo';
UPDATE "ValuationLead" SET "category" = 'pendiente' WHERE "category" NOT IN ('pendiente', 'gestionado', 'rechazado');

ALTER TABLE "ValuationLead" ALTER COLUMN "category" SET DEFAULT 'pendiente';
ALTER TABLE "ValuationLead" ALTER COLUMN "category" SET NOT NULL;
