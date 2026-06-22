import Image from "next/image";
import { AI_DEFINITION } from "@/lib/seo";

export default function WhatIsDiligenz() {
  return (
    <section
      id="que-es-diligenz"
      className="bg-white py-16 md:py-20"
      aria-label="Qué es Diligenz"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2 md:gap-14">
        <div className="flex justify-center md:justify-start">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--brand-primary)]/20 to-[var(--brand-bg-mint)]/40 blur-2xl" aria-hidden />
            <Image
              src="/logo-dili-panel.png"
              alt=""
              width={280}
              height={280}
              className="relative h-48 w-48 object-contain sm:h-56 sm:w-56 md:h-64 md:w-64"
              priority={false}
            />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--brand-dark)] sm:text-3xl">
            Qué es Diligenz
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--foreground)]/80">
            {AI_DEFINITION}
          </p>
          <p className="mt-4 text-base leading-relaxed text-[var(--foreground)]/70">
            Somos el punto de encuentro entre empresarios que buscan relevo generacional o
            liquidez, e inversores que quieren oportunidades reales en el mercado español — con
            procesos confidenciales, verificados y acompañados de principio a fin.
          </p>
        </div>
      </div>
    </section>
  );
}
