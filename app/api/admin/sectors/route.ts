import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugifySectorLabel } from "@/lib/sector-slug";
import { SECTOR_ICON_PRESETS } from "@/lib/sector-icon-presets";
import {
  DEFAULT_SECTOR_COLOR_KEY,
  SECTOR_COLOR_PRESETS,
} from "@/lib/sector-color-presets";
import { getSessionWithUserFromRequest } from "@/lib/session";

const ICON_KEYS = new Set(SECTOR_ICON_PRESETS.map((p) => p.key));
const COLOR_KEYS = new Set(SECTOR_COLOR_PRESETS.map((p) => p.key));

export async function GET(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const sectors = await prisma.sectorCatalog.findMany({
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });
  return NextResponse.json({
    sectors,
    iconPresets: SECTOR_ICON_PRESETS.map((p) => ({ key: p.key, label: p.label })),
    colorPresets: SECTOR_COLOR_PRESETS.map((p) => ({
      key: p.key,
      label: p.label,
      accent: p.accent,
      iconBgClass: p.iconBgClass,
      tagClass: p.tagClass,
    })),
  });
}

export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const shortLabel =
    typeof body.shortLabel === "string" && body.shortLabel.trim()
      ? body.shortLabel.trim().slice(0, 40)
      : null;
  const iconKey = typeof body.iconKey === "string" ? body.iconKey.trim() : "";
  const colorKey =
    typeof body.colorKey === "string" && body.colorKey.trim()
      ? body.colorKey.trim()
      : DEFAULT_SECTOR_COLOR_KEY;
  const slugRaw = typeof body.slug === "string" ? body.slug.trim() : "";
  const slug = slugRaw ? slugifySectorLabel(slugRaw) : slugifySectorLabel(label);
  const sortOrder =
    typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)
      ? Math.round(body.sortOrder)
      : 0;

  if (!label) {
    return NextResponse.json({ error: "El nombre del sector es obligatorio." }, { status: 400 });
  }
  if (!slug) {
    return NextResponse.json({ error: "No se pudo generar un identificador válido." }, { status: 400 });
  }
  if (!ICON_KEYS.has(iconKey)) {
    return NextResponse.json({ error: "Selecciona un icono válido." }, { status: 400 });
  }
  if (!COLOR_KEYS.has(colorKey)) {
    return NextResponse.json({ error: "Selecciona un color válido." }, { status: 400 });
  }

  try {
    const sector = await prisma.sectorCatalog.create({
      data: {
        slug,
        label: label.slice(0, 120),
        shortLabel,
        iconKey,
        colorKey,
        sortOrder,
        active: true,
      },
    });
    return NextResponse.json({ sector }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Ya existe un sector con ese identificador (slug)." },
      { status: 409 }
    );
  }
}
