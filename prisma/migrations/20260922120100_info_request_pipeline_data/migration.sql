ALTER TABLE "UserCompanyInterest" ADD COLUMN IF NOT EXISTS "internalNote" TEXT;
ALTER TABLE "UserCompanyInterest" ADD COLUMN IF NOT EXISTS "statusUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "UserCompanyInterest"
SET "statusUpdatedAt" = "createdAt"
WHERE "statusUpdatedAt" IS NOT NULL;

UPDATE "UserCompanyInterest"
SET status = 'PENDING_NDA'
WHERE status = 'PENDING';

UPDATE "UserCompanyInterest"
SET status = 'TEASER'
WHERE status = 'MANAGED';

UPDATE "UserCompanyInterest" AS interest
SET status = 'IN_REVIEW', "statusUpdatedAt" = CURRENT_TIMESTAMP
FROM "User" AS u
WHERE interest."userId" = u.id
  AND interest.type = 'REQUEST_INFO'
  AND interest.status = 'PENDING_NDA'
  AND u."ndaSigned" = true;

ALTER TABLE "UserCompanyInterest" ALTER COLUMN status SET DEFAULT 'PENDING_NDA';
