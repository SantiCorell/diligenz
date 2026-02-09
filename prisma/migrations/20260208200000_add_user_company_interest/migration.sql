-- CreateEnum
CREATE TABLE "CompanyInterestType" (
  "value" TEXT NOT NULL PRIMARY KEY
);
INSERT INTO "CompanyInterestType" ("value") VALUES ('REQUEST_INFO'), ('FAVORITE');

-- CreateTable
CREATE TABLE "UserCompanyInterest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserCompanyInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCompanyInterest_userId_companyId_type_key" ON "UserCompanyInterest"("userId", "companyId", "type");
