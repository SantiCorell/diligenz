/** Textos legales del Mandato de Venta Diligenz (2026) — resumen en UI; PDF completo en /public/legal */

export const MANDATO_META = {
  title: "Mandato de Venta",
  subtitle:
    "2 minutos · Firma electrónica · Reglamento eIDAS (UE) 910/2014 · Ley 34/2002 LSSI",
  intermediary: {
    name: "Jose Ángel Cañizares Llorca",
    nif: "23848753F",
    address: "C/ Colón 39, 1º, 46004 Valencia",
    email: "jose@diligenz.com",
    brand: "DILIGENZ",
  },
};

export const MANDATO_FEE_SUMMARY = [
  "Honorarios por éxito: 4% del precio de transmisión efectivo, con un mínimo de 5.000 € (sin IVA).",
  "Elaboración del contrato de compraventa: gratuita si el precio ≤ 150.000 €; 1.500 € si supera dicho importe.",
  "Honorarios por retirada o venta fuera de canal (una vez iniciados los trabajos): 5.000 €.",
  "Encargo exclusivo inicial de 6 meses, prorrogable salvo denuncia con 1 mes de preaviso.",
];

export const MANDATO_PARTICULARES_EXCERPT = `MANDATO DE VENTA — CONDICIONES PARTICULARES (2026)

1. Datos de las partes. DILIGENZ actúa como intermediario (Jose Ángel Cañizares Llorca, NIF 23848753F). EL VENDEDOR facilita sus datos de identificación y los de la compañía en venta.

2. Exclusividad. Encargo exclusivo por 6 meses naturales desde la firma, prorrogable salvo denuncia con 1 mes de preaviso.

3. Honorarios. Success fee 4% (mín. 5.000 €); contrato de compraventa según tramos; penalidad 5.000 € por retirada o venta fuera de canal.

4. Documentación. EL VENDEDOR entrega la documentación indicada en el plazo de 10 días hábiles.

5. Declaraciones. El vendedor declara titularidad/representación, veracidad de la información, ausencia de impedimentos y aceptación de las Condiciones Generales.

Documento íntegro: /legal/mandato-venta-condiciones-particulares-2026.pdf`;

export const MANDATO_GENERAL_CLAUSES_EXCERPT = `CONDICIONES GENERALES — MANDATO DE VENTA DILIGENZ (2026)

Las presentes Condiciones Generales regulan el marco jurídico aplicable a todo encargo de intermediación y venta de empresa suscrito con DILIGENZ. Rigen conjuntamente con el Mandato de Venta (Condiciones Particulares), que prevalece en caso de contradicción expresa.

1. Objeto. DILIGENZ presta servicios de intermediación, promoción, coordinación y apoyo en el proceso de venta de la compañía. Obligación de medios, no de resultado.

2. Identidad del intermediario. DILIGENZ actúa representada por Jose Ángel Cañizares Llorca (NIF: 23848753F), domicilio C/ Colón 39, 1º, 46004 Valencia.

3. Obligaciones del vendedor. Entrega de documentación completa en 10 días hábiles, veracidad de la información, colaboración activa, deber de información continuada y respeto de la exclusividad.

4. Servicios de DILIGENZ. Valoración preliminar orientativa, cuaderno de venta, promoción confidencial, cualificación de compradores, coordinación, acompañamiento al cierre e informes de seguimiento.

5. Exclusividad. Encargo exclusivo por 6 meses naturales desde la firma, prorrogable salvo denuncia con 1 mes de antelación.

6. Honorarios. Success fee 4% (mín. 5.000 €); contrato de compraventa según tramos indicados; penalidad por retirada o venta fuera de canal.

7. Confidencialidad. Ambas partes mantendrán confidencial la información intercambiada.

8. Protección de datos. Tratamiento conforme al RGPD (UE) 2016/679 y LOPDGDD 3/2018.

9. Ley aplicable. Legislación española; jurisdicción de los Juzgados y Tribunales de Valencia.

Documento íntegro disponible en: /legal/condiciones-generales-mandato-venta-2026.pdf`;

export const MANDATO_ACCEPTANCE_TEXT =
  "He leído y acepto íntegramente las cláusulas del presente Mandato de Venta (Condiciones Particulares y Condiciones Generales de DILIGENZ), las condiciones del servicio y la política de privacidad. Autorizo expresamente a DILIGENZ a actuar como intermediario en la venta de mi empresa y a contactar con inversores de su red bajo NDA previo y estricta confidencialidad.";

export const LEGAL_PDF_LINKS = {
  generales: "/legal/condiciones-generales-mandato-venta-2026.pdf",
  particulares: "/legal/mandato-venta-condiciones-particulares-2026.pdf",
};

export type SalesMandateVariantId = "EXCLUSIVE" | "NON_EXCLUSIVE";

const NON_EXCLUSIVE_META = {
  title: "Mandato de venta sin exclusividad",
  subtitle:
    "Sin exclusividad general · Firma electrónica · Reglamento eIDAS (UE) 910/2014 · Ley 34/2002 LSSI",
};

const NON_EXCLUSIVE_FEE_SUMMARY = [
  "Encargo sin exclusividad general: puedes vender por tu cuenta o con otros intermediarios, e informarás a Diligenz de cualquier oferta.",
  "Cuando Diligenz presente formalmente a un comprador, ese comprador queda en exclusividad durante 12 meses, o mientras siga una negociación activa.",
  "Honorarios de éxito: 4% del valor de la operación, mínimo 5.000 € (sin IVA), si cierras con un comprador presentado por Diligenz, por cualquier vía.",
  "Contrato de compraventa, solo si lo encargas: gratuito si el precio es de hasta 150.000 €; 1.500 € (sin IVA) si lo supera.",
  "Documentación inicial en un máximo de 30 días hábiles desde la firma.",
];

const NON_EXCLUSIVE_EXCERPT = `CONDICIONES GENERALES — MANDATO DE VENTA SIN EXCLUSIVIDAD (DILIGENZ, versión 2.0 — 2026)

Las Condiciones Generales y las Condiciones Particulares forman un único contrato. Si hay contradicción, prevalecen las Particulares.

1. Objeto. DILIGENZ intermedia, promociona y coordina la venta. Es una obligación de medios, no de resultado. No hay exclusividad general.

2. Intermediario. Jose Ángel Cañizares Llorca (NIF 23848753F), C/ Colón 39, 1º, 46004 Valencia, jose@diligenz.com.

3. Vendedor. Entrega la documentación razonablemente necesaria, responde de su veracidad y colabora en el proceso. Debe informar de inmediato de cualquier oferta o contacto con un comprador.

4. Servicios. Valoración preliminar, cuaderno de venta, promoción confidencial, cualificación de compradores, coordinación y acompañamiento al cierre.

5. Presentación de un comprador. Una presentación válida (por escrito, comprador identificable, fecha y petición expresa de reconocimiento) abre 12 meses de exclusividad solo sobre ese comprador. El plazo se alarga mientras continúe una negociación activa. Cerrar con ese comprador, por cualquier vía, devenga los honorarios de éxito.

6. Honorarios. Éxito: 4% del valor de la transacción, mínimo 5.000 € más IVA. Contrato de compraventa solo si el vendedor lo pide: gratuito hasta 150.000 € y 1.500 € más IVA por encima.

7. Duración. Cualquiera de las partes puede resolver el encargo con 30 días de preaviso. Los plazos de exclusividad ya abiertos sobre un comprador presentado se mantienen.

8. Ley aplicable. Legislación española. Juzgados del domicilio del demandado.

Documentos íntegros:
/legal/condiciones-generales-mandato-venta-sin-exclusividad-2026.pdf
/legal/mandato-venta-sin-exclusividad-condiciones-particulares-2026.pdf`;

const NON_EXCLUSIVE_ACCEPTANCE =
  "He leído y acepto íntegramente el Mandato de Venta sin exclusividad (Condiciones Particulares y Condiciones Generales de DILIGENZ), las condiciones del servicio y la política de privacidad. Autorizo a DILIGENZ a actuar como intermediario sin exclusividad general. Acepto que, cuando DILIGENZ presente formalmente a un comprador, ese comprador queda sujeto a 12 meses de exclusividad y que, si cierro la venta con un comprador presentado por DILIGENZ, deberé abonar los honorarios de éxito.";

const NON_EXCLUSIVE_LINKS = {
  generales: "/legal/condiciones-generales-mandato-venta-sin-exclusividad-2026.pdf",
  particulares: "/legal/mandato-venta-sin-exclusividad-condiciones-particulares-2026.pdf",
};

export function mandatoPresentation(variant: SalesMandateVariantId = "EXCLUSIVE") {
  if (variant === "NON_EXCLUSIVE") {
    return {
      meta: NON_EXCLUSIVE_META,
      feeSummary: NON_EXCLUSIVE_FEE_SUMMARY,
      generalExcerpt: NON_EXCLUSIVE_EXCERPT,
      acceptance: NON_EXCLUSIVE_ACCEPTANCE,
      links: NON_EXCLUSIVE_LINKS,
    };
  }
  return {
    meta: { title: MANDATO_META.title, subtitle: MANDATO_META.subtitle },
    feeSummary: MANDATO_FEE_SUMMARY,
    generalExcerpt: MANDATO_GENERAL_CLAUSES_EXCERPT,
    acceptance: MANDATO_ACCEPTANCE_TEXT,
    links: LEGAL_PDF_LINKS,
  };
}
