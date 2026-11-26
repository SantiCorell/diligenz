-- El precio de la propuesta pasa de euros enteros a un importe con céntimos.
ALTER TABLE "ClientService"
  ALTER COLUMN "priceEur" TYPE DECIMAL(12,2)
  USING "priceEur"::DECIMAL(12,2);
