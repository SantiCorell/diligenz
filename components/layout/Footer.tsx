"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";

function FooterAccordion({
  title,
  children,
  open,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[var(--brand-bg)]/20 md:border-none">
      <button
        type="button"
        onClick={onToggle}
        className="md:pointer-events-none w-full flex items-center justify-between gap-2 py-4 text-left font-semibold opacity-95 md:py-0 md:pb-3"
        aria-expanded={open}
      >
        {title}
        <span className="md:hidden shrink-0">
          {open ? <ChevronUp className="w-5 h-5 opacity-80" /> : <ChevronDown className="w-5 h-5 opacity-80" />}
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 md:!block md:!opacity-100 ${
          open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 md:max-h-none"
        }`}
      >
        <ul className="mt-0 md:mt-3 space-y-2 text-sm opacity-90 pb-2 md:pb-0">
          {children}
        </ul>
      </div>
    </div>
  );
}

export default function Footer() {
  const [plataformaOpen, setPlataformaOpen] = useState(false);
  const [recursosOpen, setRecursosOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);

  return (
    <footer className="bg-[var(--brand-primary)] text-[var(--brand-bg)] py-8 md:py-12 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Móvil: logo + descripción siempre visible; resto en acordeones */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-8">
          <div className="pt-0 pb-2 md:pb-0">
            <Link href="/" className="inline-block hover:opacity-90 transition">
              <Image
                src="/logo-diligenz-claro.png"
                alt="Diligenz"
                width={140}
                height={40}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 text-sm opacity-90">
              Marketplace privado para la compraventa de empresas de forma segura
              y confidencial.
            </p>
          </div>

          <FooterAccordion
            title="Plataforma"
            open={plataformaOpen}
            onToggle={() => setPlataformaOpen((o) => !o)}
          >
            <li><Link href="/sobre-nosotros" className="hover:underline">Sobre nosotros</Link></li>
            <li><Link href="/companies" className="hover:underline">Empresas</Link></li>
            <li><Link href="/companies/mi-interes" className="hover:underline">De mi interés</Link></li>
            <li><Link href="/sell" className="hover:underline">Valorar / Vender</Link></li>
            <li><Link href="/servicios" className="hover:underline">Servicios</Link></li>
            <li><Link href="/servicios#pricing" className="hover:underline">Precios</Link></li>
            <li><Link href="/waitlist" className="hover:underline">Lista de espera</Link></li>
          </FooterAccordion>

          <FooterAccordion
            title="Recursos"
            open={recursosOpen}
            onToggle={() => setRecursosOpen((o) => !o)}
          >
            <li><Link href="/blog" className="hover:underline">Blog</Link></li>
            <li><Link href="/contact" className="hover:underline">Contacto</Link></li>
            <li><Link href="/login" className="hover:underline">Iniciar sesión</Link></li>
            <li><Link href="/register" className="hover:underline">Crear cuenta</Link></li>
          </FooterAccordion>

          <FooterAccordion
            title="Legal"
            open={legalOpen}
            onToggle={() => setLegalOpen((o) => !o)}
          >
            <li><Link href="/aviso-legal" className="hover:underline">Aviso legal</Link></li>
            <li><Link href="/politica-privacidad" className="hover:underline">Política de privacidad</Link></li>
            <li><Link href="/politica-cookies" className="hover:underline">Política de cookies</Link></li>
          </FooterAccordion>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 md:mt-8 pt-6 border-t border-[var(--brand-bg)]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs opacity-75">
          © {new Date().getFullYear()} Diligenz. Todos los derechos reservados.
        </p>
        <a
          href="https://metrio.es"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs opacity-70 hover:opacity-100 transition-opacity"
          title="Web creada por Metrio"
        >
          Web creada por metrio.es
        </a>
      </div>
    </footer>
  );
}
