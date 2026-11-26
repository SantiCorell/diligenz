-- Comentario opcional del admin en cada paso. El cliente lo ve en su ficha; vacío es NULL.
ALTER TABLE "ClientServiceStep" ADD COLUMN IF NOT EXISTS "clientComment" TEXT;
