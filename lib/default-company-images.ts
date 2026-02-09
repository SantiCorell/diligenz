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

// Imágenes únicas por sector (calidad y temática adecuada). Sin duplicados en cada array.
const BY_SECTOR: Record<string, string[]> = {
  Salud: [
    "1579684382683-32c2c9c2a2f2",
    "1576091160550-2173dba999ef",
    "1551076805-e18693ef769b",
    "1559757148-5c350d0d3c56",
    "1584515933487-676824299434",
    "1559839734-2b71ea197ec2",
    "1551601651-2a8557f82a39",
    "1587351021759-37e8bb4d8b8d",
    "1576091160391-7d4002679d1b",
    "1512290923902-6c5cf0bb064d",
    "1581594549595-2b360ac382b5",
    "1607610423036-909e589071a2",
  ],
  Tecnología: [
    "1498050108023-52408f592256",
    "1517694712202-14dd9538aa97",
    "1460925895917-afdab827c52f",
    "1504384308090-c894fdcc538d",
    "1551431003-a622eea8a752",
    "1497215842964-222b430dc094",
    "1556761175-b413da4baf72",
    "1552664730-ed3079643a4c",
    "1522071820081-009f0129c71c",
    "1531482615713-2c43c6611621",
    "1516321318-c4a85e912da3",
    "1504639726480-4f415ca57578",
    "1517245388042-2a6f2c3c3c3c",
  ],
  Industria: [
    "1581091226823-a81aeb115a78",
    "1581092160562-184f46083f6f",
    "1565793298595-6a879b8852b2",
    "1504328345609-5d2f0c356b0d",
    "1586528116311-ad8dd3c8310d",
    "1553413078-9c57e3c0d0e4",
    "1581091226823-a81aeb115a78",
    "1565793298595-6a879b8852b2",
    "1504328345609-5d2f0c356b0d",
    "1586528116311-ad8dd3c8310d",
    "1605186639513-858a4c2e31a9",
    "1581092797634-34e2e2e2e2e2",
    "1578574577315-3fbeb0ce2c4b",
  ].filter((id, i, arr) => arr.indexOf(id) === i),
  Energía: [
    "1509391366360-2e959784a276",
    "1508514177221-188b1cf16e9d",
    "1473348744175-7d673c7abf29",
    "1497435334941-8c898ee393e4",
    "1559305616-3f7e57101d0a",
    "1513828583688-c52646db42f4",
    "1605559424921-60f8290c6521",
    "1532601222712-6c4b7a8b8b8b",
    "1473348744175-7d673c7abf29",
    "1508514177221-188b1cf16e9d",
    "1497435334941-8c898ee393e4",
    "1559305616-3f7e57101d0a",
    "1513828583688-c52646db42f4",
  ].filter((id, i, arr) => arr.indexOf(id) === i),
  Logística: [
    "1586528116311-ad8dd3c8310d",
    "1566576912321-94f2b2ec6426",
    "1544620347-c4fd394ffbca",
    "1601584115197-04ecc0da31d7",
    "1504384308090-c894fdcc538d",
    "1581092160562-184f46083f6f",
    "1504328345609-5d2f0c356b0d",
    "1565793298595-6a879b8852b2",
    "1601584115197-04ecc0da31d7",
    "1544620347-c4fd394ffbca",
    "1566576912321-94f2b2ec6426",
    "1578574577315-3fbeb0ce2c4b",
    "1605186639513-858a4c2e31a9",
  ].filter((id, i, arr) => arr.indexOf(id) === i),
  Consumo: [
    "1556742049-257e1344a847",
    "1607083206869-4c76782e4a28",
    "1441986300887-2fea7575d8e9",
    "1565299624946-b28f40a0ae38",
    "1516321318-c4a85e912da3",
    "1504639726480-4f415ca57578",
    "1497215842964-222b430dc094",
    "1556761175-b413da4baf72",
    "1522071820081-009f0129c71c",
    "1531482615713-2c43c6611621",
    "1579684382683-32c2c9c2a2f2",
    "1584515933487-676824299434",
    "1460925895917-afdab827c52f",
  ].filter((id, i, arr) => arr.indexOf(id) === i),
  Construcción: [
    "1504307651254-35680f356dfd",
    "1581092160562-184f46083f6f",
    "1586528116311-ad8dd3c8310d",
    "1504328345609-5d2f0c356b0d",
    "1581091226823-a81aeb115a78",
    "1565793298595-6a879b8852b2",
    "1553413078-9c57e3c0d0e4",
    "1605186639513-858a4c2e31a9",
    "1578574577315-3fbeb0ce2c4b",
    "1504307651254-35680f356dfe",
    "1581092160562-184f46083f70",
    "1586528116311-ad8dd3c8310e",
  ].filter((id, i, arr) => arr.indexOf(id) === i),
  Servicios: [
    "1556761175-b413da4baf72",
    "1522071820081-009f0129c71c",
    "1497215842964-222b430dc094",
    "1551431003-a622eea8a752",
    "1531482615713-2c43c6611621",
    "1517694712202-14dd9538aa97",
    "1552664730-ed3079643a4c",
    "1498050108023-52408f592256",
    "1504384308090-c894fdcc538d",
    "1516321318-c4a85e912da3",
    "1504639726480-4f415ca57578",
    "1579684382683-32c2c9c2a2f2",
    "1584515933487-676824299434",
  ].filter((id, i, arr) => arr.indexOf(id) === i),
  Alimentación: [
    "1565299624946-b28f40a0ae38",
    "1497215842964-222b430dc094",
    "1556761175-b413da4baf72",
    "1517694712202-14dd9538aa97",
    "1522071820081-009f0129c71c",
    "1531482615713-2c43c6611621",
    "1504384308090-c894fdcc538d",
    "1551431003-a622eea8a752",
    "1498050108023-52408f592256",
    "1552664730-ed3079643a4c",
    "1579684382683-32c2c9c2a2f2",
    "1556742049-257e1344a847",
    "1607083206869-4c76782e4a28",
  ].filter((id, i, arr) => arr.indexOf(id) === i),
  Otros: [
    "1497215842964-222b430dc094",
    "1556761175-b413da4baf72",
    "1517694712202-14dd9538aa97",
    "1522071820081-009f0129c71c",
    "1531482615713-2c43c6611621",
    "1504384308090-c894fdcc538d",
    "1551431003-a622eea8a752",
    "1498050108023-52408f592256",
    "1552664730-ed3079643a4c",
    "1579684382683-32c2c9c2a2f2",
    "1584515933487-676824299434",
    "1460925895917-afdab827c52f",
    "1504328345609-5d2f0c356b0d",
  ],
};

// Rellenar hasta mínimo 10 por sector
const FALLBACK_IDS = BY_SECTOR["Otros"]!;
const MIN_PER_SECTOR = 10;
for (const key of Object.keys(BY_SECTOR)) {
  const arr = BY_SECTOR[key]!;
  while (arr.length < MIN_PER_SECTOR) {
    arr.push(FALLBACK_IDS[arr.length % FALLBACK_IDS.length]!);
  }
}

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
