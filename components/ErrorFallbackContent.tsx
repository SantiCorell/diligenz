"use client";

import Link from "next/link";
import Image from "next/image";
import { AlertCircle, RefreshCw, LogOut, Mail } from "lucide-react";

type Props = {
  onRetry?: () => void;
  showRetry?: boolean;
};

export default function ErrorFallbackContent({
  onRetry,
  showRetry = true,
}: Props) {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-block mb-8">
          <Image
            src="/logo-diligenz-completo.png"
            alt="Diligenz"
            width={180}
            height={48}
            className="h-12 w-auto object-contain mx-auto"
          />
        </Link>

        <div className="rounded-2xl border border-[var(--brand-primary)]/20 bg-[var(--brand-bg)] p-8 shadow-sm">
          <div className="flex justify-center mb-4">
            <span className="rounded-full bg-[var(--brand-primary)]/10 p-3">
              <AlertCircle className="w-10 h-10 text-[var(--brand-primary)]" />
            </span>
          </div>
          <h1 className="text-xl font-bold text-[var(--brand-primary)]">
            Ups, ha habido un problema
          </h1>
          <p className="mt-3 text-[var(--foreground)] opacity-90 text-sm leading-relaxed">
            Sentimos mucho las molestias. Algo no ha ido como esperábamos.
          </p>

          <div className="mt-6 text-left rounded-xl bg-[var(--brand-bg-lavender)]/60 border border-[var(--brand-primary)]/10 p-4">
            <p className="text-xs font-semibold text-[var(--brand-primary)] mb-2">
              Prueba antes de contactar:
            </p>
            <ul className="space-y-2 text-sm text-[var(--foreground)] opacity-90">
              <li className="flex items-start gap-2">
                <RefreshCw className="w-4 h-4 shrink-0 mt-0.5 text-[var(--brand-primary)]/70" />
                <span>Recarga la página (F5 o el botón de actualizar del navegador).</span>
              </li>
              <li className="flex items-start gap-2">
                <LogOut className="w-4 h-4 shrink-0 mt-0.5 text-[var(--brand-primary)]/70" />
                <span>Sal de la sesión, vuelve a entrar o intenta en otra pestaña.</span>
              </li>
            </ul>
          </div>

          <p className="mt-5 text-sm text-[var(--foreground)] opacity-80">
            Si el problema persiste, ponte en contacto con nosotros y te atenderemos lo antes posible.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              <Mail className="w-4 h-4" />
              Contactar con nosotros
            </Link>
            {showRetry && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[var(--brand-primary)]/40 px-5 py-3 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </button>
            )}
          </div>

          <p className="mt-6">
            <Link
              href="/"
              className="text-sm text-[var(--brand-primary)] hover:underline"
            >
              ← Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
