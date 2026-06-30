export type DocumentLink = { label: string; url: string };

export type CompanyMock = {
  id: string;
  name: string;
  sector: string;
  location: string;
  revenue: string;
  ebitda: string;
  /** Resultado del ejercicio (beneficio neto); opcional */
  exerciseResult?: string | null;
  gmv?: string | null;
  /** Nº de empleados (para mostrar en tarjeta y ficha) */
  employees?: number | null;
  description: string;
  /** Descripción amplia del vendedor; solo visible para usuarios registrados */
  sellerDescription?: string | null;
  /** Carpeta Drive interna; solo vendedor y admin */
  documentLinks?: DocumentLink[] | null;
  /** Enlace único al teaser/documento para compradores con solicitud validada */
  buyerTeaserUrl?: string | null;
  /** Si true y hay buyerTeaserUrl: comprador MANAGED puede ver el enlace del teaser */
  attachmentsApproved?: boolean;
  /** Tipo: EMPRESA | AUTONOMO; histórico STARTUP/MARKETPLACE */
  companyType?: string | null;
  yearsOperating?: number | null;
  hasReceivedFunding?: boolean | null;
  website?: string | null;
  /** URL de portada (imagen subida); si no hay, se usa imagen por defecto por sector */
  heroImageSrc?: string | null;
  /** Resto de imágenes públicas (misma API, empresa publicada) */
  galleryImageSrcs?: string[];
  /** Precio de venta pedido (€), desde valoración */
  valuationSaleMin?: number | null;
  valuationSaleMax?: number | null;
  /** Referencia pública para citar la empresa (teléfono, email). */
  reference?: string | null;
  /** Nombre real del negocio (solo admin / propietario). */
  businessName?: string | null;
};

/** Empresas de demostración retiradas: solo datos reales publicados en el marketplace. */
export const MOCK_COMPANIES: CompanyMock[] = [];

export function isMockCompanyId(companyId: string): boolean {
  return companyId.startsWith("mock-");
}
