-- CreateEnum
CREATE TYPE "DniDocumentSide" AS ENUM ('FRONT', 'BACK');

-- CreateTable
CREATE TABLE "UserDniDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "side" "DniDocumentSide" NOT NULL,
    "name" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT DEFAULT 'application/octet-stream',
    "size" INTEGER,
    "driveSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDniDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDniDocument_userId_side_key" ON "UserDniDocument"("userId", "side");

-- AddForeignKey
ALTER TABLE "UserDniDocument" ADD CONSTRAINT "UserDniDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
