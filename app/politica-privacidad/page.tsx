import ShellLayout from "@/components/layout/ShellLayout";
import Link from "next/link";

export const metadata = {
  title: "Política de privacidad",
  description: "Política de privacidad y protección de datos de Diligenz.",
};

export default function PoliticaPrivacidadPage() {
  return (
    <ShellLayout>
      <div className="min-h-screen bg-[var(--brand-bg)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--brand-primary)]">
            Política de privacidad
          </h1>
          <p className="mt-2 text-sm text-[var(--foreground)] opacity-70">
            Última actualización: febrero 2025
          </p>

          <div className="mt-8 space-y-6 text-[var(--foreground)] opacity-90 leading-relaxed text-sm md:text-base">
            <section>
              <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-2">
                1. Responsable del tratamiento
              </h2>
              <p>
                El responsable del tratamiento de los datos personales que facilite a través de este sitio web o de los servicios de <strong>Diligenz</strong> es la entidad que opera bajo dicha marca. Puede contactar con nosotros a través del formulario de <Link href="/contact" className="text-[var(--brand-primary)] hover:underline">contacto</Link> para cualquier cuestión relacionada con la privacidad.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-2">
                2. Finalidad y base legal
              </h2>
              <p>
                Tratamos sus datos para: gestionar su registro como usuario, el acceso a la plataforma y la relación contractual; atender sus solicitudes de información, valoración o contacto; enviar comunicaciones comerciales si ha dado su consentimiento; cumplir obligaciones legales; y mejorar nuestros servicios. La base legal es la ejecución del contrato, el consentimiento, el interés legítimo o el cumplimiento legal, según el caso.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-2">
                3. Conservación de datos
              </h2>
              <p>
                Conservamos sus datos mientras mantenga una relación con nosotros o sea necesario para la finalidad para la que se recabaron, y posteriormente durante los plazos legalmente exigibles (por ejemplo, obligaciones fiscales o reclamaciones).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-2">
                4. Destinatarios y transferencias
              </h2>
              <p>
                Los datos no se ceden a terceros salvo obligación legal o cuando sea necesario para la prestación del servicio (por ejemplo, proveedores técnicos que actúan como encargados de tratamiento). No realizamos transferencias internacionales fuera del Espacio Económico Europeo salvo las garantías adecuadas (cláusulas tipo, etc.) cuando aplique.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-2">
                5. Sus derechos
              </h2>
              <p>
                Puede ejercer sus derechos de acceso, rectificación, supresión, limitación del tratamiento, oposición y portabilidad, así como el derecho a no ser objeto de decisiones individualizadas automatizadas y a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD), dirigiéndose a nosotros por el canal de contacto indicado.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-2">
                6. Seguridad
              </h2>
              <p>
                Aplicamos medidas técnicas y organizativas adecuadas para proteger sus datos frente a accesos no autorizados, pérdida o alteración, en consonancia con la normativa aplicable (Reglamento UE 2016/679 y Ley Orgánica 3/2018 de protección de datos).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-2">
                7. Cambios
              </h2>
              <p>
                Nos reservamos el derecho a actualizar esta política de privacidad. Los cambios relevantes se comunicarán cuando así lo exija la normativa o mediante un aviso en la web.
              </p>
            </section>
          </div>

          <p className="mt-10 pt-6 border-t border-[var(--brand-primary)]/10 text-sm text-[var(--foreground)] opacity-70">
            <Link href="/" className="text-[var(--brand-primary)] hover:underline">← Volver al inicio</Link>
          </p>
        </div>
      </div>
    </ShellLayout>
  );
}
