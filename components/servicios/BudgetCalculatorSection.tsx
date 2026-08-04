"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import BudgetCalculator from "./BudgetCalculator";

type AreaId = "fin" | "fis" | "lab" | "leg";

const AREA_MAP: Record<string, AreaId> = {
  legal: "leg",
  leg: "leg",
  fiscal: "fis",
  fis: "fis",
  laboral: "lab",
  lab: "lab",
  financiero: "fin",
  financiera: "fin",
  fin: "fin",
};

function BudgetCalculatorWithParams() {
  const params = useSearchParams();
  const raw = params.get("area")?.toLowerCase() ?? "";
  const initialArea = AREA_MAP[raw] ?? null;
  return <BudgetCalculator initialArea={initialArea} />;
}

export default function BudgetCalculatorSection() {
  return (
    <Suspense fallback={<BudgetCalculator />}>
      <BudgetCalculatorWithParams />
    </Suspense>
  );
}
