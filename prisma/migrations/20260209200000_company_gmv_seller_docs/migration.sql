-- AlterTable: GMV, descripción del vendedor y enlaces a documentación (Drive, etc.)
ALTER TABLE "Company" ADD COLUMN "gmv" TEXT;
ALTER TABLE "Company" ADD COLUMN "sellerDescription" TEXT;
ALTER TABLE "Company" ADD COLUMN "documentLinks" JSONB;
