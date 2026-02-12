"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ShellLayout from "@/components/layout/ShellLayout";
import { setStoredToken } from "@/lib/auth-client";

const ROLE_TARGET: Record<string, string> = {
  ADMIN: "/admin",
  BUYER: "/dashboard/buyer",
  SELLER: "/dashboard/seller",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Credenciales incorrectas");
        setLoading(false);
        return;
      }
      if (data.token) {
        setStoredToken(data.token);
      }
      // Navegación client-side + directo al panel según role (sin recarga completa)
      const target = (data.role && ROLE_TARGET[data.role]) || "/dashboard";
      router.push(target);
    } catch {
      setError("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShellLayout>
      <div className="min-h-screen bg-gradient-to-br from-[var(--brand-bg)] via-white to-[var(--brand-primary)]/5">
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-10">
          {/* Logo centrado arriba */}
          <div className="flex justify-center mb-12">
            <Image
              src="/logo-dili-panel.png"
              alt="Diligenz"
              width={100}
              height={100}
              className="h-20 w-20 md:h-24 md:w-24 object-contain"
              priority
            />
          </div>

          {/* Layout de dos columnas */}
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Columna izquierda: Texto inspirador */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--brand-primary)] mb-6 leading-tight">
                  Bienvenido de vuelta
                </h1>
                <p className="text-xl md:text-2xl text-[var(--foreground)] opacity-90 leading-relaxed mb-6">
                  Accede a tu panel personalizado y gestiona todas tus oportunidades de inversión y venta en un solo lugar.
                </p>
                <p className="text-lg text-[var(--foreground)] opacity-80 leading-relaxed">
                  Desde aquí podrás explorar empresas disponibles, gestionar tus solicitudes de información, realizar valoraciones y conectar con otros miembros verificados de nuestra comunidad.
                </p>
              </div>

              <div className="space-y-6 pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center">
                    <span className="text-[var(--brand-primary)] text-xl font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--brand-primary)] mb-1">Panel Personalizado</h3>
                    <p className="text-[var(--foreground)] opacity-75 text-sm">
                      Accede a un dashboard diseñado específicamente para tu perfil. Compradores e inversores tienen herramientas diferentes adaptadas a sus necesidades.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center">
                    <span className="text-[var(--brand-primary)] text-xl font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--brand-primary)] mb-1">Seguimiento en Tiempo Real</h3>
                    <p className="text-[var(--foreground)] opacity-75 text-sm">
                      Mantén un registro completo de todas tus interacciones: empresas que te interesan, solicitudes enviadas y respuestas recibidas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center">
                    <span className="text-[var(--brand-primary)] text-xl font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--brand-primary)] mb-1">Acceso Exclusivo</h3>
                    <p className="text-[var(--foreground)] opacity-75 text-sm">
                      Como miembro verificado, tienes acceso a información detallada de empresas, documentos confidenciales y comunicación directa con vendedores.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center">
                    <span className="text-[var(--brand-primary)] text-xl font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--brand-primary)] mb-1">Soporte Dedicado</h3>
                    <p className="text-[var(--foreground)] opacity-75 text-sm">
                      Nuestro equipo está disponible para ayudarte en cada paso del proceso. Desde la valoración inicial hasta el cierre de la transacción.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha: Formulario */}
            <div className="w-full">
              <div className="rounded-2xl border-2 border-[var(--brand-primary)]/20 bg-white/95 backdrop-blur-sm p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-[var(--brand-primary)] mb-6 text-center">
                  Inicia sesión
                </h2>

                <form onSubmit={submit} className="space-y-5">
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-[var(--brand-primary)] mb-1">
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="tu@email.com"
                      className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 bg-white px-4 py-3 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-[var(--brand-primary)] mb-1">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        placeholder="Tu contraseña"
                        className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 bg-white px-4 py-3 pr-12 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-primary)] hover:opacity-80 text-sm font-medium"
                        aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                      >
                        {showPassword ? "Ocultar" : "Ver"}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 disabled:opacity-50 transition"
                  >
                    {loading ? "Entrando…" : "Entrar"}
                  </button>
                </form>

                {/* Login con Google deshabilitado (comentado para reactivar en el futuro)
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-white text-gray-500">
                        O continúa con
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = "/api/auth/signin/google";
                    }}
                    className="mt-4 w-full flex items-center justify-center gap-3 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition shadow-sm"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continuar con Google
                  </button>
                </div>
                */}

                <p className="mt-6 text-center text-sm text-[var(--foreground)] opacity-80">
                  ¿No tienes cuenta?{" "}
                  <Link href="/register" className="font-medium text-[var(--brand-primary)] hover:underline">
                    Crear cuenta
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
