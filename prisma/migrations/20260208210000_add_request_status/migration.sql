-- CreateEnum
CREATE TABLE "RequestStatus" (
    "value" TEXT NOT NULL PRIMARY KEY
);
INSERT INTO "RequestStatus" ("value") VALUES ('PENDING'), ('MANAGED'), ('REJECTED');

-- AlterTable
ALTER TABLE "UserCompanyInterest" ADD COLUMN "status" TEXT DEFAULT 'PENDING';
