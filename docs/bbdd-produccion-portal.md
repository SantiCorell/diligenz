# Base de datos de producción — portal de solicitudes

Copia el bloque de abajo, pégalo entero en el SQL Editor de Supabase y ejecútalo una sola vez.

No borra usuarios, empresas, sesiones ni solicitudes. Añade los estados nuevos, dos columnas y reetiqueta las solicitudes que ya existen. El `COMMIT` del medio es necesario: Postgres no deja usar un estado nuevo hasta que lo ha guardado.

```sql
ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'PENDING_NDA';
ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'IN_REVIEW';
ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'TEASER';
ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'CONVERSATIONS';
ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'CLOSED';

COMMIT;

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
```

Qué hace, en orden:

- Crea los estados `PENDING_NDA`, `IN_REVIEW`, `TEASER`, `CONVERSATIONS` y `CLOSED`.
- Añade `internalNote` (nota privada del gestor) y `statusUpdatedAt` (fecha del último cambio; las solicitudes antiguas se quedan con su fecha de alta).
- Pasa las cuentas que estaban en revisión a activas. No toca `notionValidated`.
- Pasa las solicitudes pendientes a Pendiente NDA y las gestionadas a Teaser.
- Si el comprador ya firmó el mandato, esa solicitud pasa a En revisión.
- Las solicitudes nuevas nacen en Pendiente NDA.
- Las cuentas nuevas nacen en pendiente. Las que ya están activas no cambian.

Para comprobarlo, pega esto en otra ejecución:

```sql
SELECT status, COUNT(*) AS total
FROM "UserCompanyInterest"
WHERE type = 'REQUEST_INFO'
GROUP BY status
ORDER BY status;

SELECT "accountStatus", COUNT(*) AS total
FROM "User"
WHERE "deletedAt" IS NULL
GROUP BY "accountStatus"
ORDER BY "accountStatus";
```

No debe quedar ninguna solicitud en `PENDING` ni en `MANAGED`, ni ningún usuario en `IN_REVIEW`. El número de usuarios tiene que ser el mismo que antes.
