import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Cpu,
  Factory,
  GraduationCap,
  HardHat,
  HeartPulse,
  Layers,
  Leaf,
  MonitorSmartphone,
  Plane,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
  Wheat,
} from "lucide-react";
import { PharmacyCross } from "@/components/icons/PharmacyCross";

export type SectorIconPreset = {
  key: string;
  label: string;
  icon: LucideIcon;
};

/** Iconos disponibles al crear sectores personalizados en admin. */
export const SECTOR_ICON_PRESETS: SectorIconPreset[] = [
  { key: "PharmacyCross", label: "Cruz de farmacia", icon: PharmacyCross },
  { key: "HeartPulse", label: "Salud / bienestar", icon: HeartPulse },
  { key: "Cpu", label: "Tecnología", icon: Cpu },
  { key: "UtensilsCrossed", label: "Hostelería", icon: UtensilsCrossed },
  { key: "ShoppingBag", label: "Retail / consumo", icon: ShoppingBag },
  { key: "Factory", label: "Industria", icon: Factory },
  { key: "Building2", label: "Servicios / inmobiliario", icon: Building2 },
  { key: "GraduationCap", label: "Educación", icon: GraduationCap },
  { key: "Truck", label: "Logística", icon: Truck },
  { key: "MonitorSmartphone", label: "E-commerce / medios", icon: MonitorSmartphone },
  { key: "Wheat", label: "Alimentación", icon: Wheat },
  { key: "Leaf", label: "Energía / sostenibilidad", icon: Leaf },
  { key: "Plane", label: "Turismo", icon: Plane },
  { key: "HardHat", label: "Construcción", icon: HardHat },
  { key: "Layers", label: "Otros / genérico", icon: Layers },
];

export function getSectorIconPreset(key: string): SectorIconPreset | undefined {
  return SECTOR_ICON_PRESETS.find((p) => p.key === key);
}
