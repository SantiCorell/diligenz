-- Diligenz · cambios de base de datos para Supabase
-- SQL Editor → pegar este archivo entero → Run
--
-- No borra tablas, filas ni usuarios. Solo añade lo que falte y rellena
-- campos vacíos. Se puede ejecutar otra vez: lo que ya exista se deja igual.
--
-- Cubre, respecto al esquema actual del portal:
--   1. Estados del pipeline de solicitudes (Pendiente NDA, En revisión, Teaser, Conversaciones, Cerrado)
--   2. Nota interna y fecha de cambio en UserCompanyInterest
--   3. Gestores (Agent), reuniones y agente asignado
--   4. Solicitudes de servicios ligadas a la cuenta (ContactRequest.userId)
--   5. Mandato de venta con o sin exclusividad

-- ---------------------------------------------------------------------------
-- 1. Estados nuevos. Postgres exige guardarlos antes de usarlos.
-- ---------------------------------------------------------------------------
ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'PENDING_NDA';
ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'IN_REVIEW';
ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'TEASER';
ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'CONVERSATIONS';
ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'CLOSED';

COMMIT;

-- ---------------------------------------------------------------------------
-- 2. Solicitudes de información
-- ---------------------------------------------------------------------------
ALTER TABLE "UserCompanyInterest"
  ADD COLUMN IF NOT EXISTS "internalNote" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'UserCompanyInterest'
      AND column_name = 'statusUpdatedAt'
  ) THEN
    ALTER TABLE "UserCompanyInterest"
      ADD COLUMN "statusUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    UPDATE "UserCompanyInterest"
    SET "statusUpdatedAt" = "createdAt";
  END IF;
END $$;

UPDATE "User"
SET "accountStatus" = 'ACTIVE'
WHERE "accountStatus" = 'IN_REVIEW';

UPDATE "UserCompanyInterest"
SET status = 'PENDING_NDA'
WHERE status = 'PENDING';

UPDATE "UserCompanyInterest"
SET status = 'TEASER'
WHERE status = 'MANAGED';

UPDATE "UserCompanyInterest" AS interest
SET status = 'IN_REVIEW',
    "statusUpdatedAt" = CURRENT_TIMESTAMP
FROM "User" AS u
WHERE interest."userId" = u.id
  AND interest.type = 'REQUEST_INFO'
  AND interest.status = 'PENDING_NDA'
  AND u."ndaSigned" = true;

ALTER TABLE "UserCompanyInterest"
  ALTER COLUMN status SET DEFAULT 'PENDING_NDA';

ALTER TABLE "User"
  ALTER COLUMN "accountStatus" SET DEFAULT 'PENDING';

-- ---------------------------------------------------------------------------
-- 3. Gestores y reuniones. No cambia un agente que ya esté asignado.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  CREATE TYPE "AgentMeetingStatus" AS ENUM ('SCHEDULED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Agent" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "photoUrl" TEXT,
  "photoMime" TEXT,
  "photoData" BYTEA,
  "bookingUrl" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AgentMeeting" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "agentId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "externalEventUri" TEXT,
  "status" "AgentMeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgentMeeting_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "assignedAgentId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "AgentMeeting_externalEventUri_key"
  ON "AgentMeeting"("externalEventUri");

CREATE INDEX IF NOT EXISTS "AgentMeeting_userId_startsAt_idx"
  ON "AgentMeeting"("userId", "startsAt");

CREATE INDEX IF NOT EXISTS "User_assignedAgentId_idx"
  ON "User"("assignedAgentId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'User_assignedAgentId_fkey'
  ) THEN
    ALTER TABLE "User"
      ADD CONSTRAINT "User_assignedAgentId_fkey"
      FOREIGN KEY ("assignedAgentId") REFERENCES "Agent"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AgentMeeting_userId_fkey'
  ) THEN
    ALTER TABLE "AgentMeeting"
      ADD CONSTRAINT "AgentMeeting_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AgentMeeting_agentId_fkey'
  ) THEN
    ALTER TABLE "AgentMeeting"
      ADD CONSTRAINT "AgentMeeting_agentId_fkey"
      FOREIGN KEY ("agentId") REFERENCES "Agent"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

INSERT INTO "Agent" (
  "id", "name", "email", "phone", "photoUrl", "bookingUrl",
  "active", "isDefault", "createdAt", "updatedAt"
) VALUES (
  'agent_jose_canizares',
  'Jose Cañizares',
  'jose@diligenz.es',
  '623 941 511',
  '/agents/jose-canizares.jpg',
  'https://calendly.com/jose-diligenz/30min',
  true,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

UPDATE "User"
SET "assignedAgentId" = 'agent_jose_canizares'
WHERE "assignedAgentId" IS NULL
  AND "deletedAt" IS NULL;

-- ---------------------------------------------------------------------------
-- 4. Servicios: la solicitud queda unida a la cuenta con el mismo email.
--    Solo rellena userId cuando todavía está vacío.
-- ---------------------------------------------------------------------------
ALTER TABLE "ContactRequest" ADD COLUMN IF NOT EXISTS "userId" TEXT;

CREATE INDEX IF NOT EXISTS "ContactRequest_userId_idx" ON "ContactRequest"("userId");
CREATE INDEX IF NOT EXISTS "ContactRequest_email_idx" ON "ContactRequest"("email");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ContactRequest_userId_fkey'
  ) THEN
    ALTER TABLE "ContactRequest"
      ADD CONSTRAINT "ContactRequest_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

UPDATE "ContactRequest" AS c
SET "userId" = u.id
FROM "User" AS u
WHERE c."userId" IS NULL
  AND u."deletedAt" IS NULL
  AND lower(c.email) = lower(u.email);

-- ---------------------------------------------------------------------------
-- 5. Mandato de venta: con exclusividad por defecto. Los ya firmados siguen
--    siendo con exclusividad.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  CREATE TYPE "SalesMandateVariant" AS ENUM ('EXCLUSIVE', 'NON_EXCLUSIVE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "salesMandateVariant" "SalesMandateVariant" NOT NULL DEFAULT 'EXCLUSIVE';

ALTER TABLE "SalesMandate"
  ADD COLUMN IF NOT EXISTS "variant" "SalesMandateVariant" NOT NULL DEFAULT 'EXCLUSIVE';

-- ---------------------------------------------------------------------------
-- 6. Gestor del apartado de servicios. No toca el agente del marketplace.
-- ---------------------------------------------------------------------------
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "servicesAgentId" TEXT;

CREATE INDEX IF NOT EXISTS "User_servicesAgentId_idx"
  ON "User"("servicesAgentId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'User_servicesAgentId_fkey'
  ) THEN
    ALTER TABLE "User"
      ADD CONSTRAINT "User_servicesAgentId_fkey"
      FOREIGN KEY ("servicesAgentId") REFERENCES "Agent"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 7. Propuestas de servicio: el admin las crea y el cliente las acepta.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  CREATE TYPE "ClientServiceStatus" AS ENUM ('PROPOSAL', 'IN_PROGRESS', 'COMPLETED', 'DISCARDED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "ClientService" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "contactRequestId" TEXT,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "priceEur" INTEGER NOT NULL,
  "documentsUrl" TEXT,
  "invoicesUrl" TEXT,
  "status" "ClientServiceStatus" NOT NULL DEFAULT 'PROPOSAL',
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClientService_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ClientServiceStep" (
  "id" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "detail" TEXT,
  "done" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "ClientServiceStep_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ClientServiceDocument" (
  "id" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "mimeType" TEXT,
  "size" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClientServiceDocument_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ClientService" ADD COLUMN IF NOT EXISTS "documentsUrl" TEXT;
ALTER TABLE "ClientService" ADD COLUMN IF NOT EXISTS "invoicesUrl" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "ClientService_contactRequestId_key" ON "ClientService"("contactRequestId");
CREATE INDEX IF NOT EXISTS "ClientService_userId_status_idx" ON "ClientService"("userId", "status");
CREATE INDEX IF NOT EXISTS "ClientService_status_idx" ON "ClientService"("status");
CREATE INDEX IF NOT EXISTS "ClientServiceStep_serviceId_position_idx" ON "ClientServiceStep"("serviceId", "position");
CREATE INDEX IF NOT EXISTS "ClientServiceDocument_serviceId_idx" ON "ClientServiceDocument"("serviceId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ClientService_userId_fkey') THEN
    ALTER TABLE "ClientService"
      ADD CONSTRAINT "ClientService_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ClientService_contactRequestId_fkey') THEN
    ALTER TABLE "ClientService"
      ADD CONSTRAINT "ClientService_contactRequestId_fkey"
      FOREIGN KEY ("contactRequestId") REFERENCES "ContactRequest"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ClientServiceStep_serviceId_fkey') THEN
    ALTER TABLE "ClientServiceStep"
      ADD CONSTRAINT "ClientServiceStep_serviceId_fkey"
      FOREIGN KEY ("serviceId") REFERENCES "ClientService"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ClientServiceDocument_serviceId_fkey') THEN
    ALTER TABLE "ClientServiceDocument"
      ADD CONSTRAINT "ClientServiceDocument_serviceId_fkey"
      FOREIGN KEY ("serviceId") REFERENCES "ClientService"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 8. Datos de la constitución que rellenan el cliente y el admin (sin correo).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "ServiceIntake" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "contactRequestId" TEXT,
  "clientServiceId" TEXT,
  "companyName" TEXT,
  "shareholders" TEXT,
  "shareCapital" TEXT,
  "registeredOffice" TEXT,
  "managementRegime" TEXT,
  "proposedNames" TEXT,
  "constitutionDetails" TEXT,
  "digitalSignature" TEXT,
  "bankOffice" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServiceIntake_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ServiceIntakeFile" (
  "id" TEXT NOT NULL,
  "intakeId" TEXT NOT NULL,
  "slot" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "mimeType" TEXT,
  "size" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServiceIntakeFile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ServiceIntake_contactRequestId_key" ON "ServiceIntake"("contactRequestId");
CREATE UNIQUE INDEX IF NOT EXISTS "ServiceIntake_clientServiceId_key" ON "ServiceIntake"("clientServiceId");
CREATE INDEX IF NOT EXISTS "ServiceIntake_userId_idx" ON "ServiceIntake"("userId");
CREATE INDEX IF NOT EXISTS "ServiceIntakeFile_intakeId_idx" ON "ServiceIntakeFile"("intakeId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ServiceIntake_userId_fkey') THEN
    ALTER TABLE "ServiceIntake"
      ADD CONSTRAINT "ServiceIntake_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ServiceIntake_contactRequestId_fkey') THEN
    ALTER TABLE "ServiceIntake"
      ADD CONSTRAINT "ServiceIntake_contactRequestId_fkey"
      FOREIGN KEY ("contactRequestId") REFERENCES "ContactRequest"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ServiceIntake_clientServiceId_fkey') THEN
    ALTER TABLE "ServiceIntake"
      ADD CONSTRAINT "ServiceIntake_clientServiceId_fkey"
      FOREIGN KEY ("clientServiceId") REFERENCES "ClientService"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ServiceIntakeFile_intakeId_fkey') THEN
    ALTER TABLE "ServiceIntakeFile"
      ADD CONSTRAINT "ServiceIntakeFile_intakeId_fkey"
      FOREIGN KEY ("intakeId") REFERENCES "ServiceIntake"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Comprobación. No modifica nada.
-- ---------------------------------------------------------------------------
SELECT 'users' AS bloque, "accountStatus"::text AS clave, COUNT(*)::int AS total
FROM "User"
WHERE "deletedAt" IS NULL
GROUP BY "accountStatus"
UNION ALL
SELECT 'solicitudes', status::text, COUNT(*)::int
FROM "UserCompanyInterest"
WHERE type = 'REQUEST_INFO'
GROUP BY status
UNION ALL
SELECT 'mandato', "salesMandateVariant"::text, COUNT(*)::int
FROM "User"
WHERE "deletedAt" IS NULL
GROUP BY "salesMandateVariant"
UNION ALL
SELECT 'gestor_servicios',
  CASE WHEN "servicesAgentId" IS NULL THEN 'sin gestor' ELSE 'asignado' END,
  COUNT(*)::int
FROM "User"
WHERE "deletedAt" IS NULL
GROUP BY 2
UNION ALL
SELECT 'servicios_cliente', "status"::text, COUNT(*)::int
FROM "ClientService"
GROUP BY "status"
ORDER BY 1, 2;
