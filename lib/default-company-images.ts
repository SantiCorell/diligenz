/**
 * Imágenes por defecto para empresas (tarjetas y ficha) cuando no tienen foto.
 * Varias imágenes por sector, profesionales y variadas. Se elige una estable por empresa (id/sector)
 * y por posición en el grupo para que cartas adyacentes no repitan imagen.
 */

const W = 800;
const Q = 85;

function u(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=${W}&q=${Q}&fit=crop`;
}

// Solo IDs de Unsplash que ya se usan en el proyecto (blog, servicios, home) y cargan bien.
const VERIFIED_IDS = [
  "1579684385127-1ef15d508118", // SpecializedSectors
  "1518770660439-4636190af475",
  "1581091226825-a6a2a5aee158",
  "1556742049-0cfed4f6a45d",
  "1450101499163-c8848c66ca85", // blog + servicios
  "1560472354-b33ff0c44a43",     // blog + servicios
  "1554224155-6726b3ff858f",     // blog + servicios
  "1611974789855-9c2a0a7236a3",  // blog
  "1605649487212-47bdab064df7",  // sobre-nosotros Valencia
  "1506905925346-21bda4d32df4",  // sobre-nosotros montaña
];

// Imágenes por sector: solo IDs verificados (cada sector rota entre estos para variedad)
const BY_SECTOR: Record<string, string[]> = {
  Salud: [...VERIFIED_IDS],
  Tecnología: [...VERIFIED_IDS],
  Industria: [...VERIFIED_IDS],
  Energía: [...VERIFIED_IDS],
  Logística: [...VERIFIED_IDS],
  Consumo: [...VERIFIED_IDS],
  Construcción: [...VERIFIED_IDS],
  Servicios: [...VERIFIED_IDS],
  Alimentación: [...VERIFIED_IDS],
  Otros: [...VERIFIED_IDS],
};

const FALLBACK_IDS = BY_SECTOR["Otros"] ?? VERIFIED_IDS;

function normalizeSector(s: string): string {
  return (s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/** positionInGroup: evita que cartas adyacentes (0, 1, 2) reciban la misma imagen */
export function getDefaultCompanyImageUrl(
  company: {
    id?: string;
    sector: string;
    location?: string;
  },
  positionInGroup?: number
): string {
  const normalized = normalizeSector(company.sector || "");
  const sectorKey =
    Object.keys(BY_SECTOR).find(
      (k) => normalizeSector(k) === normalized
    ) || "Otros";
  const pool = BY_SECTOR[sectorKey] ?? FALLBACK_IDS;
  const seed =
    [company.id, company.sector, company.location].filter(Boolean).join("|") ||
    "default";
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    hash = (hash << 5) - hash + c;
    hash = hash & 0x7fffffff;
  }
  const offset = positionInGroup ?? 0;
  const index = (hash + offset) % pool.length;
  const id = pool[Math.abs(index)]!;
  return u(id);
}
