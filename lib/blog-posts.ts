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
  {
    slug: "por-que-mayoria-pymes-no-se-venden",
    title: "Errores estructurales en la venta de pymes: análisis y claves para el éxito",
    excerpt:
      "Análisis de los errores que impiden vender una pyme en España: valoración incorrecta, falta de calidad del dato, dependencia del propietario y cómo preparar la empresa para una venta exitosa.",
    date: "2025-02-10",
    readTime: "14 min",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80",
    body: `
Vender una empresa es uno de los procesos más complejos y menos entendidos dentro del mundo empresarial. En España, cada año miles de pymes intentan venderse, pero solo una minoría logra cerrar una operación con éxito. Y cuando lo hacen, muchas veces ocurre tras meses o años de desgaste, con rebajas importantes en el precio o aceptando condiciones que inicialmente no estaban sobre la mesa. En este artículo analizamos por qué la mayoría de pymes no se venden, cuáles son los errores estructurales más habituales y qué se puede hacer —desde un punto de vista técnico, financiero y operativo— para maximizar las probabilidades de éxito en una venta de empresa. Si buscas cómo vender tu pyme o por qué tu empresa no encuentra comprador, aquí encontrarás causas y soluciones concretas.

**La falsa creencia: "si el negocio es bueno, se venderá solo"**

Uno de los mayores errores conceptuales al plantearse la venta de una pyme es pensar que una empresa rentable se venderá automáticamente. En la práctica, rentabilidad no equivale a vendibilidad. Los compradores profesionales —inversores, grupos industriales, family offices— no compran solo resultados históricos. Compran riesgo controlado, capacidad de generación futura, calidad del dato, control del negocio y facilidad de integración o continuidad. Cuando alguno de estos elementos falla, la operación se bloquea. Por eso preparar la empresa para la venta es tan importante como tener buenos números. La venta de pymes en España exige, cada vez más, estándares de información y gobernanza que muchas empresas no cumplen hasta que es demasiado tarde.

**1. Valoración incorrecta: cuando el precio no está respaldado por datos**

La mayoría de procesos de venta de pymes fallidos empiezan con una valoración mal planteada. Errores frecuentes: valorar sobre facturación en lugar de beneficio, no normalizar el EBITDA, ignorar dependencias clave (un cliente que concentra el 40% de ingresos, un contrato que caduca), usar múltiplos genéricos sin contexto sectorial y no justificar el crecimiento futuro. Desde el lado comprador, una valoración sin base sólida destruye credibilidad desde el minuto uno. En un proceso de compraventa de empresas, la primera impresión cuenta: si el vendedor no puede defender el precio con datos, la negociación se resiente desde el inicio.

**La importancia del dato en la valoración**

Una valoración profesional debe apoyarse en estados financieros coherentes y comparables, ajustes claramente documentados (normalización de sueldos del socio, gastos extraordinarios), hipótesis explicables y defendibles y benchmarking real de mercado (transacciones similares en el sector). El precio no es una opinión: es una conclusión técnica. Antes de salir al mercado es clave realizar una valoración basada en datos validados, entendiendo qué variables generan valor y cuáles lo destruyen. Una valoración de empresa bien hecha no solo da un número; permite argumentar ante cualquier comprador por qué ese rango es razonable y qué factores lo sostienen.

**2. Falta de calidad y validación del dato financiero**

Uno de los principales motivos por los que una due diligence fracasa es la baja calidad del dato. Problemas habituales: inconsistencias entre cuentas anuales y reporting interno, gastos personales mezclados con gastos de empresa, falta de trazabilidad en ingresos, datos que no cuadran entre ejercicios y dependencia excesiva de Excel manual sin controles. Para un comprador esto no es solo un problema contable; es una señal de riesgo operativo y de control interno. En la venta de una pyme, la transparencia financiera es uno de los pilares que separan un cierre exitoso de una ruptura en fase avanzada.

**Due diligence y validación del dato**

La due diligence no busca solo números; busca confianza. Si el dato no es consistente, trazable y explicable, el comprador asumirá el peor escenario posible y ajustará el precio, pedirá garantías o abandonará la operación. Cómo evitarlo: preparar la empresa para una due diligence implica ordenar la información financiera con antelación, validar datos clave (ingresos, márgenes, clientes), documentar criterios contables y anticipar preguntas incómodas. Una empresa con datos claros negocia desde una posición de fuerza. La preparación para due diligence no es opcional si se quiere vender en condiciones óptimas.

**3. Dependencia crítica del propietario**

Otro gran freno en la compraventa de pymes es la dependencia del fundador o del socio principal. Indicadores claros: el dueño concentra la relación con clientes clave, no existe un segundo nivel de gestión, las decisiones no están sistematizadas y el conocimiento no está documentado. Desde fuera esto se traduce en una pregunta directa: ¿qué pasa con el negocio cuando el dueño no está? Si la respuesta no es clara, el riesgo se dispara y el valor percibido cae. Este es uno de los factores que más rebaja el múltiplo en operaciones de venta de pymes en España.

**Cómo reducir la dependencia antes de vender**

Antes de vender es fundamental delegar funciones clave, crear estructura organizativa (no solo "yo decido todo"), documentar procesos críticos y reducir la dependencia personal en la relación con clientes y proveedores. Una empresa vendible es una empresa que puede funcionar sin su fundador al menos durante un periodo de transición. Los compradores pagan más por negocios que no dependen de una sola persona. Invertir tiempo en profesionalizar la estructura no solo facilita la venta; suele mejorar también el día a día del negocio.

**4. Llegar al mercado en el momento equivocado**

Muchas pymes intentan venderse cuando ya existen problemas: caída de ingresos, pérdida de clientes, tensiones de caja o agotamiento del empresario. En ese punto el proceso deja de ser estratégico y pasa a ser reactivo. Los compradores lo detectan rápido y ajustan precio, condiciones y estructura de la operación (earn-out, garantías, descuentos). Cómo evitarlo: el mejor momento para vender una empresa es cuando el negocio está estable y no existe urgencia. Planificar con tiempo permite preparar la información, corregir debilidades, elegir comprador y maximizar valor. Vender por necesidad casi siempre se paga con un peor resultado; vender por estrategia permite negociar desde la fortaleza.

**5. Subestimar la due diligence**

La due diligence no es un trámite final; es el corazón de la operación. Muchas pymes fallan porque no tienen contratos formalizados, existen riesgos legales no controlados, hay dependencias no declaradas o la información no está centralizada. Esto suele derivar en renegociaciones a la baja, earn-outs forzados, garantías excesivas o directamente la ruptura de la operación. Cómo evitarlo: realizar una pre-due diligence antes de salir al mercado permite detectar riesgos, corregirlos o explicarlos, controlar el relato del negocio y evitar sorpresas en fases avanzadas. La due diligence no debe improvisarse. Un vendedor que ha pasado por su propia revisión previa llega a la negociación con mucha más seguridad.

**6. Falta de estrategia en el proceso de venta**

Vender una empresa no consiste en "ver si alguien aparece". Sin una estrategia clara se alarga el proceso, se quema la oportunidad, se filtra información sensible y se pierde foco en el negocio. Una compraventa profesional requiere definición clara del tipo de comprador objetivo, control del timing, gestión de la información y coordinación de todas las fases (teaser, memorándum, datos room, negociación, cierre). Cómo evitarlo: tratar la venta como un proyecto estructurado, con hitos, responsables y objetivos claros. El asesoramiento experto en M&A ayuda a no improvisar y a no cometer errores que después cuesten dinero o tiempo.

**Resumen: los seis obstáculos que impiden vender una pyme**

En conjunto, los seis puntos anteriores explican por qué muchas pymes no se venden: valoración sin base, dato poco fiable, dependencia del dueño, momento inadecuado, due diligence mal preparada y proceso sin estrategia. Corregir estos aspectos no asegura un comprador, pero multiplica las probabilidades de cerrar una operación en condiciones aceptables. La venta de una pyme es un proyecto que requiere planificación, datos y criterio técnico.

**Conclusión: vender una pyme es un proceso técnico, no emocional**

La mayoría de pymes no se venden porque no están preparadas para ser analizadas como un activo. Los compradores no buscan historias; buscan datos fiables, riesgos controlados, procesos claros y capacidad de generar valor en el futuro. Preparar una empresa para la venta no garantiza venderla, pero no prepararla casi garantiza el fracaso o un resultado muy por debajo de las expectativas. Si tu objetivo es vender tu empresa, el trabajo comienza mucho antes de contactar con un posible comprador: en la calidad de la información, en la estructura del negocio y en el momento elegido para salir al mercado.

**El enfoque de Diligenz**

En Diligenz trabajamos la compraventa de empresas desde un enfoque técnico y basado en datos. Nuestro trabajo no empieza cuando aparece un comprador, sino mucho antes: estructurando la información, validando los datos, preparando la empresa para una due diligence real y ayudando a tomar decisiones con criterio objetivo. Porque vender una empresa no va de "ponerla en el mercado"; va de estar preparado para que el mercado la quiera. Si estás pensando en vender tu pyme, el primer paso es conocer el valor real de tu negocio y qué puntos debes reforzar antes de salir al mercado. Ofrecemos valoración orientativa, preparación para la venta y acompañamiento en procesos de M&A para pymes en España.
    `.trim(),
  },
  {
    slug: "bolsa-per-valoracion-acciones-ma",
    title: "Bolsa, PER y valoración: en qué basarse para comprar acciones (y su relación con el M&A)",
    excerpt:
      "Qué es el PER, qué otros ratios usar al comprar acciones y cómo la misma lógica de valoración se aplica en M&A cuando se compra o vende una empresa entera.",
    date: "2025-02-12",
    readTime: "10 min",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80",
    body: `
Comprar acciones de una empresa en bolsa y comprar una empresa entera (M&A) comparten la misma pregunta de fondo: ¿cuánto vale este negocio y qué precio tiene sentido pagar? En ambos casos se usan metodologías y términos muy similares. Este artículo explica en qué basarse para invertir en bolsa —con especial foco en el PER y otros indicadores clave— y cómo ese marco conecta con la valoración y el M&A.

**En qué basarse para comprar acciones de una empresa**

Invertir en bolsa no es solo "sube o baja". Los inversores que se basan en fundamentos analizan la empresa detrás del ticker: beneficios, flujo de caja, deuda, sector y expectativas de crecimiento. Los ratios de valoración (PER, P/B, EV/EBITDA, etc.) permiten comparar el precio de la acción con los resultados de la empresa y con otras empresas del sector. No hay una única cifra mágica, pero sí un conjunto de datos que ayuda a decidir si el precio actual es razonable, caro o barato en relación con el valor que genera la compañía.

**Qué es el PER (Price to Earnings Ratio)**

El PER es el ratio más conocido en bolsa. Se calcula dividiendo la capitalización bursátil de la empresa entre su beneficio neto anual, o equivalentemente: precio de la acción entre beneficio por acción (BPA). Un PER de 15 significa que el mercado está pagando 15 veces el beneficio anual de la empresa. En términos simples: si los beneficios se mantuvieran constantes, teóricamente "recuperarías" el precio pagado en 15 años. Un PER alto suele indicar que el mercado espera crecimiento futuro o que la acción está cara; un PER bajo puede indicar que está barata o que el mercado descuenta problemas. El PER hay que interpretarlo siempre en contexto: por sector, por país y en relación con la media histórica de la propia empresa.

**Otros ratios útiles al comprar acciones**

Además del PER conviene mirar otros datos. El **P/B (Price to Book)** compara el precio con el valor contable de los activos netos; es útil en sectores con muchos activos tangibles. El **ROE (Return on Equity)** mide la rentabilidad sobre el capital propio; un ROE alto y estable suele ser señal de calidad. La **rentabilidad por dividendo** indica cuánto paga la empresa en dividendos respecto al precio de la acción. El **EV/EBITDA** (valor de empresa sobre beneficio operativo) es muy usado en M&A y también en bolsa para comparar empresas con estructuras de capital distintas; elimina el efecto de la deuda y los impuestos y permite comparar "cuánto se paga por cada euro de beneficio operativo". Todos estos ratios son herramientas, no respuestas definitivas: se complementan entre sí.

**De la bolsa al M&A: la misma lógica de valoración**

Cuando un inversor compra acciones, está comprando una parte del negocio. Cuando un comprador en un proceso de M&A adquiere el 100 % de una empresa, está haciendo lo mismo a otra escala: pagar un múltiplo por los beneficios o por el cash flow que genera esa empresa. En M&A se habla de múltiplos de EBITDA, múltiplos de facturación o valoración por DCF (descuento de flujos), pero la idea es la misma que en bolsa: relacionar el precio con el resultado económico del negocio. Un PER de 12 en bolsa equivale conceptualmente a pagar 12 veces el beneficio; en M&A, un múltiplo de 8x EBITDA equivale a pagar 8 veces el beneficio operativo. La metodología cambia de nombre y de detalle (ajustes, normalizaciones, due diligence), pero el principio es común: valorar en función de la capacidad de generar beneficio o caja.

**Terminología que une bolsa y M&A**

Términos como **valor de empresa (enterprise value)**, **EBITDA**, **múltiplos** o **flujo de caja descontado** se usan tanto en el análisis de empresas cotizadas como en procesos de compraventa. En bolsa, el EV se calcula como capitalización + deuda neta; en M&A, el precio que se paga por la empresa suele expresarse también en relación al EBITDA (EV/EBITDA). Entender estos conceptos ayuda tanto a analizar una acción como a entender cómo se valora una pyme en una operación de fusión o adquisición. Quien invierte en bolsa con criterio y quien participa en un proceso M&A están, en el fondo, aplicando la misma disciplina: pagar un precio coherente con los fundamentos del negocio.

**Conclusión**

Comprar acciones con fundamento implica basarse en ratios como el PER, el P/B, el ROE o el EV/EBITDA, y en el contexto del sector y de la empresa. Esa misma lógica se traslada al mundo del M&A: cuando se compra o se vende una empresa entera, los múltiplos y los criterios de valoración son los parientes directos de lo que se ve en bolsa. Conocer ambos mundos permite tomar mejores decisiones tanto como accionista como en un proceso de compraventa de empresas. En Diligenz aplicamos esta metodología de valoración en el ámbito del M&A y la compraventa de pymes: mismos principios, misma exigencia con el dato.
    `.trim(),
  },
  {
    slug: "por-que-comprar-empresa-sin-beneficios-startups",
    title: "Por qué comprar o invertir en una empresa que no da beneficios: el sector startup y compras reales",
    excerpt:
      "Compras multimillonarias de empresas sin beneficios: WhatsApp, Instagram, YouTube. Por qué tiene sentido, qué se paga en realidad y cómo se valora una startup o un negocio en crecimiento.",
    date: "2025-02-14",
    readTime: "14 min",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&q=80",
    body: `
Comprar una empresa que no da beneficios puede parecer una locura si solo miramos el beneficio neto. Sin embargo, algunas de las operaciones de M&A más grandes de las últimas dos décadas han sido precisamente adquisiciones de empresas con pérdidas o con beneficios simbólicos: WhatsApp, Instagram, YouTube, LinkedIn y muchas otras. ¿Por qué tiene sentido? ¿En qué se basan comprador e inversor para poner un precio? Este artículo explica la lógica detrás de invertir o comprar empresas sin beneficios, con foco en el ecosistema startup y en operaciones reales que marcaron el mercado.

**Cuando el beneficio no es la moneda de cambio**

En una pyme tradicional, el comprador suele pagar un múltiplo del EBITDA o del beneficio: cuánto gana hoy la empresa y qué flujo puede esperar a corto plazo. En el mundo startup y en muchas empresas de tecnología o crecimiento, el beneficio actual es bajo o negativo a propósito: se prioriza crecer (mercado, usuarios, ingresos recurrentes) y escalar antes que maximizar el margen. El comprador o inversor no paga por el beneficio de este año; paga por el valor futuro que puede generar ese activo una vez integrado, escalado o monetizado. Eso no significa que "cualquier cosa vale": significa que la valoración se apoya en otras variables (ingresos, crecimiento, usuarios, tecnología, posición estratégica) y en un horizonte temporal más largo.

**El sector startup: por qué "no dar beneficios" puede ser estrategia**

En el ecosistema startup es habitual que las empresas operen con pérdidas durante años. El capital se usa para captar usuarios, desarrollar producto, ganar cuota de mercado o construir una base de ingresos recurrentes (SaaS, suscripciones). El objetivo no es repartir dividendos mañana, sino alcanzar una posición dominante o muy relevante en un mercado grande (TAM: total addressable market) y monetizar después. Invertir o comprar en esa fase implica asumir el riesgo de que el plan no se cumpla, a cambio de pagar un precio que refleja el potencial, no el resultado actual. Por eso se habla de valoración por múltiplos de facturación (por ejemplo, 10x o 15x ingresos anuales en SaaS), por número de usuarios o por comparables con otras empresas que ya monetizan. El comprador está comprando opción de crecimiento y posición de mercado.

**Compras reales: qué se pagó y qué sentido tenía**

Algunos ejemplos que ilustran la lógica detrás de operaciones sin beneficios o con beneficios marginales:

**WhatsApp (Facebook, 2014, unos 19.000 millones de dólares).** La app no generaba ingresos significativos por suscripción; el modelo de negocio era incipiente. Facebook pagó por los usuarios (cientos de millones), por la posición en mensajería móvil y por evitar que un competidor se hiciera con ese activo. La valoración no se basaba en el EBITDA sino en el valor estratégico: control del canal de comunicación y datos, integración con la familia de productos y eliminación de un rival. Con el tiempo, WhatsApp se ha ido monetizando (empresas, API, pagos en algunos países); el comprador apostó por ese futuro.

**Instagram (Facebook, 2012, unos 1.000 millones de dólares).** Casi sin ingresos, con una plantilla pequeña y una app de fotos con filtros. Lo que se compró fue la base de usuarios en crecimiento rápido, el engagement y el encaje con la estrategia móvil y social de Facebook. De nuevo: valor por usuarios, por producto y por posición, no por beneficio contable. Hoy Instagram es una de las principales fuentes de ingresos publicitarios de Meta.

**YouTube (Google, 2006, unos 1.650 millones de dólares).** Generaba pérdidas y dudas sobre derechos de autor y costes de infraestructura. Google pagó por el volumen de vídeo, la audiencia y la proyección del vídeo online. La monetización llegó después (publicidad, suscripciones, música). La compra tenía sentido para quien podía asumir los costes y convertir el tráfico en negocio.

**LinkedIn (Microsoft, 2016, unos 26.000 millones de dólares).** LinkedIn sí generaba ingresos (suscripciones, reclutamiento, publicidad), pero el precio pagado era muy superior a cualquier múltiplo de beneficio razonable. Microsoft pagó por la red profesional, los datos y la integración con su ecosistema (Office, Azure, Dynamics). El valor era estratégico y de largo plazo.

En todos estos casos, el comprador tenía escala, capacidad de financiar el crecimiento o la integración y una visión clara de cómo ese activo generaría valor (monetización, sinergias, defensa competitiva). No se compró "una empresa que pierde dinero" de forma abstracta; se compró usuarios, tecnología, mercado y posición.

**En qué se basa la valoración cuando no hay beneficios**

Cuando no hay EBITDA positivo, la valoración se apoya en otros pilares. **Múltiplos de facturación (revenue)**: por ejemplo, X veces los ingresos anuales recurrentes (ARR en SaaS). **Crecimiento**: un 80 % de crecimiento anual puede justificar un múltiplo de ingresos muy alto. **Métricas de uso**: usuarios activos (MAU, DAU), tiempo en la app, retención. **Comparables**: qué múltiplos se han pagado en transacciones similares (sector, tamaño, etapa). **Valor estratégico**: cuánto vale ese activo para un comprador concreto (sinergias, acceso a clientes, tecnología, eliminación de competencia). **DCF con proyecciones**: modelo de flujos futuros asumiendo que la empresa llegará a ser rentable; muy sensible a las hipótesis. En startups y tech, es habitual combinar varios de estos enfoques; rara vez se mira solo el beneficio del último ejercicio.

**Cuándo tiene sentido y cuándo no**

Tiene sentido comprar o invertir en una empresa sin beneficios cuando existe una tesis clara: el activo tiene algo valioso (usuarios, tecnología, datos, mercado) que el comprador puede convertir en flujo o en ventaja competitiva, y el precio refleja ese potencial sin asumir un riesgo desproporcionado. No tiene sentido cuando el precio se basa solo en una historia de crecimiento sin métricas creíbles, cuando no hay camino visible hacia la rentabilidad o cuando el comprador no tiene capacidad para ejecutar (integrar, escalar, financiar). La frontera entre "apuesta razonable" y "sobrevaloración" depende del rigor con el que se analicen los datos y las proyecciones.

**De las startups al M&A de pymes: un mismo marco**

La misma lógica se aplica, en otra escala, en el M&A de pymes. Una pyme puede tener beneficios bajos o negativos porque está en expansión, porque ha hecho inversiones recientes o porque el sector es cíclico. El comprador puede pagar por el potencial de mejora, por la cartera de clientes, por los activos o por la posición en el mercado. La valoración no se limita al EBITDA del último año; puede incorporar normalizaciones, proyecciones y valor estratégico. La diferencia con una startup es de grado: menos incertidumbre, más historial, pero el principio es el mismo. Entender por qué a veces se paga por empresas sin beneficios ayuda a entender tanto las operaciones tech como las operaciones en sectores más tradicionales donde el comprador busca valor futuro, no solo el resultado actual.

**Conclusión**

Comprar o invertir en una empresa que no da beneficios puede tener todo el sentido del mundo cuando el valor está en el crecimiento, en los usuarios, en la tecnología o en la posición estratégica, y cuando el comprador tiene capacidad y plan para materializar ese valor. El sector startup ha normalizado esta forma de pensar; operaciones como WhatsApp, Instagram, YouTube o LinkedIn muestran que el precio se paga por lo que el activo puede llegar a ser, no solo por lo que gana hoy. En M&A, ya sea en tech o en pymes, la valoración debe apoyarse en datos, proyecciones creíbles y una tesis clara sobre el futuro del negocio. En Diligenz trabajamos la valoración y la compraventa de empresas en distintas etapas: con beneficios estables o en fase de crecimiento, con la misma exigencia de rigor y el mismo marco de análisis.
    `.trim(),
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
