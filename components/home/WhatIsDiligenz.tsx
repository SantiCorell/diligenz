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
          <div className="relative mx-auto aspect-square w-full max-w-[18rem] overflow-hidden rounded-[2.5rem] sm:max-w-[20rem] md:mx-0 md:max-w-[22rem] lg:max-w-[24rem] lg:rounded-[2.75rem]">
            <Image
              src="/logo-dili.png"
              alt="Logo Diligenz"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 288px, (max-width: 1024px) 352px, 384px"
              priority
            />
          </div>

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
