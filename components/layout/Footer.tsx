import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[var(--brand-primary)] text-[var(--brand-bg)] py-10 md:py-12 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
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
        <div>
          <h5 className="font-semibold opacity-95">Plataforma</h5>
          <ul className="mt-3 space-y-2 text-sm opacity-90">
            <li><Link href="/sobre-nosotros" className="hover:underline">Sobre nosotros</Link></li>
            <li><Link href="/companies" className="hover:underline">Empresas</Link></li>
            <li><Link href="/companies/mi-interes" className="hover:underline">De mi interés</Link></li>
            <li><Link href="/sell" className="hover:underline">Valorar / Vender</Link></li>
            <li><Link href="/servicios" className="hover:underline">Servicios</Link></li>
            <li><Link href="/servicios#pricing" className="hover:underline">Precios</Link></li>
            <li><Link href="/waitlist" className="hover:underline">Lista de espera</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold opacity-95">Recursos</h5>
          <ul className="mt-3 space-y-2 text-sm opacity-90">
            <li><Link href="/blog" className="hover:underline">Blog</Link></li>
            <li><Link href="/contact" className="hover:underline">Contacto</Link></li>
            <li><Link href="/login" className="hover:underline">Iniciar sesión</Link></li>
            <li><Link href="/register" className="hover:underline">Crear cuenta</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold opacity-95">Legal</h5>
          <ul className="mt-3 space-y-2 text-sm opacity-90">
            <li><Link href="/aviso-legal" className="hover:underline">Aviso legal</Link></li>
            <li><Link href="/politica-privacidad" className="hover:underline">Política de privacidad</Link></li>
            <li><Link href="/politica-cookies" className="hover:underline">Política de cookies</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 pt-6 border-t border-[var(--brand-bg)]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
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
