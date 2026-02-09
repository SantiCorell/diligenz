export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  body: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "como-valorar-empresa-pymes",
    title: "Cómo valorar una empresa: guía para pymes y autónomos",
    excerpt:
      "Claves para entender el valor de tu negocio antes de venderlo o buscar inversión. Métodos habituales y qué factores influyen en la valoración.",
    date: "2025-02-01",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80",
    body: `
La valoración de una empresa es el primer paso serio cuando se plantea una venta o una operación de inversión. No existe una cifra única "correcta": el valor depende del método elegido, del sector, del comprador y del momento. En esta guía repasamos los enfoques más usados en pymes y qué debes tener en cuenta.

**Métodos más utilizados**

- **Múltiplos de EBITDA**: se aplica un múltiplo (según sector y tamaño) al beneficio operativo. Muy usado en empresas con beneficios estables.
- **Múltiplos de facturación**: en sectores con poco margen o en fase de crecimiento, se valora en función de la facturación (por ejemplo, 1x–2x ingresos anuales).
- **Valoración por activos**: suma del valor de activos menos deudas. Útil en empresas con mucho activo tangible (inmuebles, maquinaria).
- **Descuento de flujos (DCF)**: proyección de caja futura descontada. Más complejo y habitual en operaciones mayores.

**Qué influye en el resultado**

El sector marca mucho: tecnología y SaaS suelen cotizar a múltiplos altos; hostelería o retail, más bajos. La ubicación, la concentración de clientes, la calidad del equipo y la escalabilidad también se reflejan en el múltiplo que un comprador está dispuesto a pagar.

**Conclusión**

Una valoración orientativa te da un rango para negociar. Para una cifra defendible ante un comprador o un inversor, conviene apoyarse en un informe profesional (due diligence y valoración formal). En Diligenz te ayudamos con una estimación inicial y, si lo necesitas, con servicios de valoración y venta.
    `.trim(),
  },
  {
    slug: "due-diligence-que-es-cuando-hacerla",
    title: "Due diligence: qué es y cuándo hacerla en una compraventa",
    excerpt:
      "Qué se analiza en una due diligence y por qué es clave antes de comprar o vender una empresa. Legal, financiero y operativo.",
    date: "2025-01-28",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80",
    body: `
La due diligence es el proceso de análisis exhaustivo de una empresa antes de cerrar una operación de compraventa o inversión. Su objetivo es confirmar que lo que se ha negociado se ajusta a la realidad y detectar riesgos ocultos.

**Qué se revisa**

- **Due diligence financiera**: cuentas anuales, impagos, deuda, flujo de caja, proyecciones. Se comprueba la calidad del beneficio y la sostenibilidad.
- **Due diligence legal**: contratos clave, litigios, propiedad intelectual, empleados, convenios. Se identifican obligaciones y contingencias.
- **Due diligence fiscal**: impuestos pagados y pendientes, inspecciones, criterios contables. Evita sorpresas tras la compra.
- **Due diligence comercial**: concentración de clientes, acuerdos marco, pipeline. Evalúa la solidez del negocio.

**Cuándo hacerla**

El comprador suele encargarla tras haber llegado a un acuerdo de principio (precio y condiciones básicas) y antes de firmar. El vendedor puede anticiparse con una "vendor due diligence" para dar confianza y acelerar el proceso.

**Conclusión**

No cerrar una operación relevante sin una due diligence adecuada. Un informe bien hecho permite renegociar si aparecen hallazgos negativos o abandonar la operación con fundamento. En Diligenz realizamos due diligence a medida para compradores y vendedores.
    `.trim(),
  },
  {
    slug: "vender-empresa-paso-a-paso",
    title: "Vender tu empresa paso a paso: preparación y proceso",
    excerpt:
      "Cómo preparar la venta de tu negocio, qué documentación necesitas y qué fases suele seguir una operación de M&A.",
    date: "2025-01-25",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=80",
    body: `
Vender una empresa bien preparada aumenta las probabilidades de cerrar a un buen precio y en plazos razonables. Resumimos las fases y tareas clave.

**Antes de ponerla en venta**

- Tener las cuentas al día y documentación ordenada (contratos, permisos, nóminas).
- Hacer una valoración orientativa para saber en qué rango moverte.
- Identificar posibles puntos débiles (concentración de cliente, deuda, litigios) y, si es posible, abordarlos antes.

**Fases típicas del proceso**

1. **Preparación**: memorándum de venta (o teaser), datos financieros y operativos, limpieza de datos sensibles.
2. **Búsqueda de comprador**: plataforma, asesores, red. Criterios de confidencialidad y perfil del comprador.
3. **Primeras conversaciones y NDA**: intercambio de información bajo acuerdo de confidencialidad.
4. **Ofertas y negociación**: ofertas no vinculantes, selección, negociación de precio y condiciones.
5. **Due diligence**: el comprador analiza la empresa en detalle.
6. **Contrato y cierre**: firma del contrato de compraventa y cumplimiento de condiciones (financiación, permisos, etc.).

**Conclusión**

Cada operación es distinta, pero un proceso ordenado y un asesoramiento experto reducen riesgos y mejoran el resultado. En Diligenz te acompañamos en la valoración, la preparación y la búsqueda de comprador.
    `.trim(),
  },
  {
    slug: "comprar-empresa-inversor-privado",
    title: "Comprar una empresa como inversor privado: qué tener en cuenta",
    excerpt:
      "Criterios y riesgos al evaluar una empresa como objetivo de inversión. Cómo enfocar la búsqueda y la negociación.",
    date: "2025-01-20",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80",
    body: `
Comprar una empresa existente permite entrar en un negocio con clientes, equipo y flujos ya generados, pero exige un análisis riguroso y una estrategia clara.

**Qué buscar según tu perfil**

- **Cash flow estable**: empresas con beneficios recurrentes y poca dependencia del fundador.
- **Potencial de mejora**: operaciones suboptimizadas donde tu experiencia o sinergias añadan valor.
- **Sector alineado**: conocimiento del sector reduce el riesgo y facilita la integración.

**Riesgos habituales**

- Información incompleta o poco fiable: por eso la due diligence es imprescindible.
- Dependencia del vendedor: si se va, ¿el negocio se resiente? Hay que planificar la transición.
- Sobrevaloración: comparar con transacciones similares y con múltiplos de mercado.

**El papel del asesor**

Un asesor puede ayudarte a filtrar oportunidades, revisar memorándums, coordinar la due diligence y apoyar en la negociación. Es especialmente útil si no tienes equipo interno dedicado a M&A.

**Conclusión**

Comprar una empresa bien elegida y bien analizada puede ser una vía de crecimiento muy eficiente. En Diligenz ofrecemos asesoramiento a compradores: identificación de targets, análisis y apoyo en due diligence y cierre.
    `.trim(),
  },
  {
    slug: "multiples-mercado-espana-pymes",
    title: "Múltiplos de mercado en España: qué se paga por una pyme",
    excerpt:
      "Rangos de múltiplos por sector en operaciones de compraventa de pymes en España. Factores que hacen subir o bajar el precio.",
    date: "2025-01-15",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80",
    body: `
Los múltiplos que se aplican en la compraventa de pymes varían por sector, tamaño y tipo de comprador. Estos rangos son orientativos y siempre hay casos por encima y por debajo.

**Rangos orientativos por sector (múltiplo sobre EBITDA)**

- **Tecnología / SaaS**: suelen estar entre 6x y 12x EBITDA (o múltiplos de facturación si hay poco beneficio). Alto valor por escalabilidad y recurrencia.
- **Salud y servicios sanitarios**: 4x–8x, según tipo de actividad y contratos.
- **Industria y manufactura**: 3x–6x, con impacto de activos y concentración de clientes.
- **Consumo y retail**: 3x–5x, muy ligado a ubicación y formato.
- **Hostelería**: 2x–4x, con fuerte peso de la ubicación y el arrendamiento.

**Qué hace subir el múltiplo**

- Ingresos recurrentes y contratos a largo plazo.
- Crecimiento orgánico sostenido.
- Equipo directivo que pueda seguir sin el vendedor.
- Poca concentración de clientes o proveedores.

**Qué lo baja**

- Dependencia del fundador, conflictos o litigios.
- Deuda elevada o necesidad de inversión fuerte.
- Sector en declive o muy regulado sin ventaja competitiva clara.

**Conclusión**

Estos rangos sirven para tener una referencia; la valoración concreta depende de cada empresa. En Diligenz te damos una valoración orientativa y, si quieres profundizar, un informe profesional con múltiplos y comparables.
    `.trim(),
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
