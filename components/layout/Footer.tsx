import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[var(--brand-primary)] text-[var(--brand-bg)] py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <Link href="/" className="inline-block rounded-lg bg-white/95 px-3 py-2 hover:bg-white transition shadow-sm">
            <Image
              src="/logo-diligenz-completo.png"
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
            <li>Términos</li>
            <li>Privacidad</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
