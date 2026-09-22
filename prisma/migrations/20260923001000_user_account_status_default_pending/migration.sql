-- Los clientes nuevos nacen en pendiente. No cambia el estado de las cuentas que ya existen.
ALTER TABLE "User" ALTER COLUMN "accountStatus" SET DEFAULT 'PENDING';
