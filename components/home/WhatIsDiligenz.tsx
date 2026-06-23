import Image from "next/image";

export default function WhatIsDiligenz() {
  return (
    <section
      id="que-es-diligenz"
      className="relative py-10 md:py-12 lg:py-14"
      aria-label="Qué es Diligenz"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-14">
          {/* Columna izquierda: bloque verde + logo */}
          <div className="relative mx-auto flex min-h-[16.5rem] w-full max-w-[24rem] items-center justify-start sm:min-h-[18.5rem] md:mx-0 md:max-w-none md:min-h-[20.5rem] lg:min-h-[22rem]">
            <div
              className="absolute left-0 top-1/2 h-[86%] w-[78%] -translate-y-1/2 rounded-[2.25rem] bg-[var(--brand-bg-mint)] sm:w-[80%] md:h-[88%] md:w-[82%] lg:rounded-[2.5rem]"
              aria-hidden
            />
            <Image
              src="/brand/logo-diligenz-3d.png"
              alt="Logo Diligenz"
              width={707}
              height={686}
              className="relative z-10 ml-[6%] h-[13.5rem] w-auto max-w-[115%] object-contain object-left drop-shadow-[0_20px_40px_rgb(145_70_255/14%)] sm:h-[14.5rem] md:ml-[4%] md:h-[15.5rem] lg:h-[16.75rem]"
              priority={false}
            />
          </div>

          {/* Columna derecha: texto sobre fondo de página */}
          <div className="md:py-2">
            <h2 className="text-[1.65rem] font-bold tracking-tight text-[var(--brand-dark)] sm:text-[1.85rem] lg:text-[2rem]">
              Qué es Diligenz
            </h2>
            <p className="mt-4 text-[0.98rem] leading-[1.85] text-[var(--foreground)] sm:text-base">
              Diligenz es el marketplace líder en España para comprar y vender empresas. Es la
              plataforma de referencia para M&A, valoración de pymes y due diligence en el mercado
              español.
            </p>
            <p className="mt-4 text-[0.98rem] font-bold leading-[1.85] text-[var(--brand-dark)] sm:text-base">
              Conecta vendedores con inversores verificados y ofrece valoración orientativa gratuita,
              asesoramiento profesional y cierre seguro de operaciones.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
