import { prisma } from "@/lib/prisma";

export type ValuationUpsertInput = {
  minValue: number;
  maxValue: number;
  salePriceMin: number | null;
  salePriceMax: number | null;
};

function parseSingleSalePrice(
  raw: string | undefined
): { salePriceMin: number | null; salePriceMax: number | null } | { error: string } {
  const trimmed = (raw ?? "").trim().replace(/\s/g, "");
  if (!trimmed) {
    return { salePriceMin: null, salePriceMax: null };
  }
  const value = parseInt(trimmed, 10);
  if (Number.isNaN(value) || value < 0) {
    return { error: "Precio de venta no válido." };
  }
  return { salePriceMin: value, salePriceMax: value };
}

function parseSalePriceRange(
  minRaw: string | undefined,
  maxRaw: string | undefined
): { salePriceMin: number | null; salePriceMax: number | null } | { error: string } {
  const minTrim = (minRaw ?? "").trim().replace(/\s/g, "");
  const maxTrim = (maxRaw ?? "").trim().replace(/\s/g, "");
  if (!minTrim && !maxTrim) {
    return { salePriceMin: null, salePriceMax: null };
  }
  const minV = minTrim ? parseInt(minTrim, 10) : NaN;
  const maxV = maxTrim ? parseInt(maxTrim, 10) : NaN;
  let salePriceMin: number | null = null;
  let salePriceMax: number | null = null;
  if (minTrim && maxTrim) {
    if (Number.isNaN(minV) || Number.isNaN(maxV) || minV < 0 || maxV < minV) {
      return { error: "Precio de venta: indica dos importes válidos (mín. ≤ máx.) o déjalos vacíos." };
    }
    salePriceMin = minV;
    salePriceMax = maxV;
  } else if (minTrim) {
    if (Number.isNaN(minV) || minV < 0) return { error: "Precio de venta mínimo no válido." };
    salePriceMin = minV;
    salePriceMax = minV;
  } else {
    if (Number.isNaN(maxV) || maxV < 0) return { error: "Precio de venta máximo no válido." };
    salePriceMin = maxV;
    salePriceMax = maxV;
  }
  return { salePriceMin, salePriceMax };
}

function parseValuationRange(
  formData: FormData
): { minValue: number; maxValue: number } | { error: string } {
  const minRaw = formData.get("minValue")?.toString();
  const maxRaw = formData.get("maxValue")?.toString();
  if (!minRaw || !maxRaw) {
    return { error: "Faltan mínimo o máximo de valoración." };
  }
  const minValue = parseInt(minRaw.replace(/\s/g, ""), 10);
  const maxValue = parseInt(maxRaw.replace(/\s/g, ""), 10);
  if (Number.isNaN(minValue) || Number.isNaN(maxValue) || minValue < 0 || maxValue < minValue) {
    return { error: "Valoración orientativa no válida." };
  }
  return { minValue, maxValue };
}

/** Formulario del vendedor: solo rango de valoración (el precio de venta lo fija admin). */
export function parseOwnerValuationFormData(
  formData: FormData
): Pick<ValuationUpsertInput, "minValue" | "maxValue"> | { error: string } {
  const range = parseValuationRange(formData);
  if ("error" in range) return { error: range.error };
  return range;
}

/** Formulario admin: valoración + un único precio de venta. */
export function parseValuationFormData(formData: FormData): ValuationUpsertInput | { error: string } {
  const range = parseValuationRange(formData);
  if ("error" in range) return { error: range.error };

  const salePriceRaw = formData.get("salePrice")?.toString();
  const sale =
    salePriceRaw !== undefined && salePriceRaw !== null
      ? parseSingleSalePrice(salePriceRaw)
      : parseSalePriceRange(
          formData.get("salePriceMin")?.toString(),
          formData.get("salePriceMax")?.toString()
        );
  if ("error" in sale) return sale;

  return {
    minValue: range.minValue,
    maxValue: range.maxValue,
    salePriceMin: sale.salePriceMin,
    salePriceMax: sale.salePriceMax,
  };
}

export async function upsertCompanyValuation(companyId: string, input: ValuationUpsertInput) {
  const latest = await prisma.valuation.findFirst({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });

  const data = {
    minValue: input.minValue,
    maxValue: input.maxValue,
    salePriceMin: input.salePriceMin,
    salePriceMax: input.salePriceMax,
  };

  if (latest) {
    await prisma.valuation.update({
      where: { id: latest.id },
      data,
    });
  } else {
    await prisma.valuation.create({
      data: { ...data, companyId },
    });
  }
}

export async function upsertOwnerCompanyValuation(
  companyId: string,
  input: Pick<ValuationUpsertInput, "minValue" | "maxValue">
) {
  const latest = await prisma.valuation.findFirst({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });

  const data = {
    minValue: input.minValue,
    maxValue: input.maxValue,
    salePriceMin: latest?.salePriceMin ?? null,
    salePriceMax: latest?.salePriceMax ?? null,
  };

  if (latest) {
    await prisma.valuation.update({
      where: { id: latest.id },
      data,
    });
  } else {
    await prisma.valuation.create({
      data: { ...data, companyId },
    });
  }
}
