export type DocumentLink = { label: string; url: string };

export type CompanyMock = {
  id: string;
  name: string;
  sector: string;
  location: string;
  revenue: string;
  ebitda: string;
  gmv?: string | null;
  /** Nº de empleados (para mostrar en tarjeta y ficha) */
  employees?: number | null;
  description: string;
  /** Descripción amplia del vendedor; solo visible para usuarios registrados */
  sellerDescription?: string | null;
  /** Enlaces a documentación (Drive, etc.); solo visible si registrado y admin ha permitido */
  documentLinks?: DocumentLink[] | null;
  /** Si true, usuarios registrados pueden ver documentación, enlaces y fotos subidas */
  attachmentsApproved?: boolean;
};

export const MOCK_COMPANIES: CompanyMock[] = [
  {
    id: "mock-1",
    name: "Clínica Salud Plus",
    sector: "Salud",
    location: "Madrid",
    revenue: "2–5M €",
    ebitda: "650k €",
    gmv: "2,8M €",
    employees: 24,
    description:
      "Clínica privada con más de 12 años de trayectoria. Especializada en medicina general y chequeos. Cartera estable de pacientes recurrentes y convenios con empresas.",
  },
  {
    id: "mock-2",
    name: "TechFlow Software",
    sector: "Tecnología",
    location: "Barcelona",
    revenue: "1–3M €",
    ebitda: "420k €",
    gmv: "2,1M €",
    employees: 18,
    description:
      "Empresa consolidada en desarrollo de software empresarial B2B. Soluciones a medida para grandes corporaciones y pymes. Más de 15 años en el mercado.",
  },
  {
    id: "mock-3",
    name: "Grupo Industrial Norte",
    sector: "Industria",
    location: "Bilbao",
    revenue: "5–10M €",
    ebitda: "1.1M €",
    gmv: "7,2M €",
    employees: 85,
    description:
      "Fabricación y logística industrial. Contratos estables con sector automoción y construcción. Instalaciones propias y equipo técnico cualificado.",
  },
  {
    id: "mock-4",
    name: "GreenEnergy Plus",
    sector: "Energía",
    location: "Valencia",
    revenue: "8.2M €",
    ebitda: "1.6M €",
    gmv: "8,2M €",
    employees: 32,
    description:
      "Compañía de energías renovables, instalaciones fotovoltaicas para industria y residencial. Fuerte crecimiento y contratos a largo plazo.",
  },
  {
    id: "mock-5",
    name: "LogisTrans Express",
    sector: "Logística",
    location: "Madrid",
    revenue: "12.0M €",
    ebitda: "2.1M €",
    gmv: "12,0M €",
    employees: 120,
    description:
      "Operador logístico con flota propia y red de distribución nacional. Alta rentabilidad y contratos estables con retail y alimentación.",
  },
  {
    id: "mock-6",
    name: "Retail & Co",
    sector: "Consumo",
    location: "Sevilla",
    revenue: "3–6M €",
    ebitda: "480k €",
    gmv: "4,5M €",
    employees: 45,
    description:
      "Cadena de retail especializada en producto local. Varias tiendas en Andalucía. Marca reconocida y crecimiento orgánico sostenido.",
  },
];
