/**
 * Imágenes por defecto para empresas (tarjetas y ficha) cuando el cliente no ha subido fotos.
 * URLs de Unsplash: atractivas, por sector y contexto. Se elige una estable por empresa (id/sector).
 */

const W = 800;
const Q = 80;

function u(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=${W}&q=${Q}&fit=crop`;
}

// Muchas imágenes por sector: profesional, atractivas, coherentes con el sector/ciudad
const BY_SECTOR: Record<string, string[]> = {
  Salud: [
    "1579684382683-32c2c9c2a2f2", // consultorio médico
    "1576091160550-2173dba999ef", // hospital/clínica
    "1551076805-e18693ef769b", // equipo médico
    "1559757148-5c350d0d3c56", // centro salud
    "1584515933487-676824299434", // médico
    "1579684382683-32c2c9c2a2f2",
    "1559839734-2b71ea197ec2", // laboratorio
    "1579684382683-32c2c9c2a2f2",
    "1551601651-2a8557f82a39", // hospital
    "1587351021759-37e8bb4d8b8d",
  ],
  Tecnología: [
    "1498050108023-52408f592256", // laptop
    "1517694712202-14dd9538aa97", // oficina tech
    "1460925895917-afdab827c52f", // datos
    "1504384308090-c894fdcc538d", // equipo
    "1551431003-a622eea8a752", // reunión
    "1497215842964-222b430dc094", // oficina
    "1556761175-b413da4baf72", // colaboración
    "1552664730-ed3079643a4c", // equipo
    "1522071820081-009f0129c71c", // reunión
    "1531482615713-2c43c6611621", // startup
  ],
  Industria: [
    "1581091226823-a81aeb115a78", // fábrica
    "1581092160562-184f46083f6f", // industrial
    "1581092160562-184f46083f6f",
    "1565793298595-6a879b8852b2", // maquinaria
    "1504328345609-5d2f0c356b0d", // logística
    "1586528116311-ad8dd3c8310d", // almacén
    "1581091226823-a81aeb115a78",
    "1553413078-9c57e3c0d0e4", // manufactura
    "1586528116311-ad8dd3c8310d",
    "1565793298595-6a879b8852b2",
  ],
  Energía: [
    "1509391366360-2e959784a276", // solar
    "1508514177221-188b1cf16e9d", // paneles
    "1473348744175-7d673c7abf29", // renovables
    "1497435334941-8c898ee393e4", // verde
    "1509391366360-2e959784a276",
    "1473348744175-7d673c7abf29",
    "1559305616-3f7e57101d0a", // energía
    "1513828583688-c52646db42f4", // eólica
    "1508514177221-188b1cf16e9d",
    "1497435334941-8c898ee393e4",
  ],
  Logística: [
    "1586528116311-ad8dd3c8310d", // almacén
    "1566576912321-94f2b2ec6426", // camión
    "1544620347-c4fd394ffbca", // contenedores
    "1601584115197-04ecc0da31d7", // almacén
    "1586528116311-ad8dd3c8310d",
    "1566576912321-94f2b2ec6426",
    "1544620347-c4fd394ffbca",
    "1601584115197-04ecc0da31d7",
    "1504384308090-c894fdcc538d",
    "1581092160562-184f46083f6f",
  ],
  Consumo: [
    "1556742049-257e1344a847", // retail
    "1556742049-257e1344a847",
    "1607083206869-4c76782e4a28", // tienda
    "1607083206869-4c76782e4a28",
    "1556742049-257e1344a847",
    "1441986300887-2fea7575d8e9", // comercio
    "1556742049-257e1344a847",
    "1607083206869-4c76782e4a28",
    "1441986300887-2fea7575d8e9",
    "1556742049-257e1344a847",
  ],
  Construcción: [
    "1504307651254-35680f356dfd", // obra
    "1504307651254-35680f356dfd",
    "1581092160562-184f46083f6f",
    "1504307651254-35680f356dfd",
    "1586528116311-ad8dd3c8310d",
    "1504328345609-5d2f0c356b0d",
    "1504307651254-35680f356dfd",
    "1581091226823-a81aeb115a78",
    "1504307651254-35680f356dfd",
    "1586528116311-ad8dd3c8310d",
  ],
  Servicios: [
    "1556761175-b413da4baf72", // oficina
    "1522071820081-009f0129c71c",
    "1497215842964-222b430dc094",
    "1551431003-a622eea8a752",
    "1531482615713-2c43c6611621",
    "1517694712202-14dd9538aa97",
    "1552664730-ed3079643a4c",
    "1498050108023-52408f592256",
    "1522071820081-009f0129c71c",
    "1556761175-b413da4baf72",
  ],
  Alimentación: [
    "1556910103-2d3b2c5b5b5b", // restaurante
    "1556910103-2d3b2c5b5b5b",
    "1565299624946-b28f40a0ae38", // comida
    "1565299624946-b28f40a0ae38",
    "1556910103-2d3b2c5b5b5b",
    "1565299624946-b28f40a0ae38",
    "1556910103-2d3b2c5b5b5b",
    "1565299624946-b28f40a0ae38",
    "1556910103-2d3b2c5b5b5b",
    "1565299624946-b28f40a0ae38",
  ],
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
  ],
};

const FALLBACK_IDS = BY_SECTOR["Otros"]!;

/** Devuelve una URL de imagen por defecto estable para la empresa (misma empresa = misma imagen). */
export function getDefaultCompanyImageUrl(company: {
  id?: string;
  sector: string;
  location?: string;
}): string {
  const sectorKey =
    Object.keys(BY_SECTOR).find(
      (k) => k.toLowerCase() === (company.sector || "").trim().toLowerCase()
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
  const index = hash % pool.length;
  const id = pool[index]!;
  return u(id);
}
