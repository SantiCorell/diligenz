-- Nuevos estados del embudo. Van en una migración aparte: Postgres no deja usar
-- un valor de enum en la misma transacción en la que se añade.
ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'PENDING_NDA';
ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'IN_REVIEW';
ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'TEASER';
ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'CONVERSATIONS';
ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'CLOSED';
