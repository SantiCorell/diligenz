import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugifySectorLabel } from "@/lib/sector-slug";
import { SECTOR_ICON_PRESETS } from "@/lib/sector-icon-presets";
import { SECTOR_COLOR_PRESETS } from "@/lib/sector-color-presets";
import { getSessionWithUserFromRequest } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

const ICON_KEYS = new Set(SECTOR_ICON_PRESETS.map((p) => p.key));
const COLOR_KEYS = new Set(SECTOR_COLOR_PRESETS.map((p) => p.key));

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const data: {
    label?: string;
    shortLabel?: string | null;
    iconKey?: string;
    colorKey?: string;
    slug?: string;
    sortOrder?: number;
    active?: boolean;
  } = {};

  if (typeof body.label === "string" && body.label.trim()) {
    data.label = body.label.trim().slice(0, 120);
  }
  if (body.shortLabel !== undefined) {
    data.shortLabel =
      typeof body.shortLabel === "string" && body.shortLabel.trim()
        ? body.shortLabel.trim().slice(0, 40)
        : null;
  }
  if (typeof body.iconKey === "string") {
    if (!ICON_KEYS.has(body.iconKey)) {
      return NextResponse.json({ error: "Icono no válido." }, { status: 400 });
    }
    data.iconKey = body.iconKey;
  }
  if (typeof body.colorKey === "string") {
    if (!COLOR_KEYS.has(body.colorKey)) {
      return NextResponse.json({ error: "Color no válido." }, { status: 400 });
    }
    data.colorKey = body.colorKey;
  }
  if (typeof body.slug === "string" && body.slug.trim()) {
    data.slug = slugifySectorLabel(body.slug);
  }
  if (typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)) {
    data.sortOrder = Math.round(body.sortOrder);
  }
  if (typeof body.active === "boolean") {
    data.active = body.active;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Sin cambios." }, { status: 400 });
  }

  try {
    const sector = await prisma.sectorCatalog.update({ where: { id }, data });
    return NextResponse.json({ sector });
  } catch {
    return NextResponse.json({ error: "Sector no encontrado o slug duplicado." }, { status: 404 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.sectorCatalog.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sector no encontrado." }, { status: 404 });
  }
}
