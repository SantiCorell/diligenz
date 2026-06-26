import { NextResponse } from "next/server";
import {
  customSectorsToVisualMap,
  getActiveCustomSectors,
  getFormSectorOptions,
} from "@/lib/sector-catalog";

export async function GET() {
  const [options, custom] = await Promise.all([
    getFormSectorOptions(),
    getActiveCustomSectors(),
  ]);
  return NextResponse.json({
    options,
    customVisualMap: customSectorsToVisualMap(custom),
  });
}
