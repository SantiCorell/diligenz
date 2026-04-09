-- AlterTable
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "removedAt" TIMESTAMP(3);
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "removedById" TEXT;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Company_removedById_fkey'
  ) THEN
    ALTER TABLE "Company" ADD CONSTRAINT "Company_removedById_fkey"
      FOREIGN KEY ("removedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Company_removedAt_idx" ON "Company"("removedAt");
