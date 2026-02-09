export type CompanyMock = {
  id: string;
  name: string;
  sector: string;
  location: string;
  revenue: string;
  ebitda: string;
  description: string;
};

export const MOCK_COMPANIES: CompanyMock[] = [
  {
    id: "mock-1",
    name: "Clínica Salud Plus",
    sector: "Salud",
    location: "Madrid",
    revenue: "2–5M €",
    ebitda: "650k €",
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
    description:
      "Cadena de retail especializada en producto local. Varias tiendas en Andalucía. Marca reconocida y crecimiento orgánico sostenido.",
  },
];
