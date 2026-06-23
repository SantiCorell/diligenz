"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import ShellLayout from "@/components/layout/ShellLayout";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

function RestablecerContrasenaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkInvalid = !token || !email;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudo actualizar la contraseña.");
        setLoading(false);
        return;
      }

      router.push("/login?reset=ok");
    } catch {
      setError("Error inesperado. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <ShellLayout>
      {loading && <LoadingOverlay message="Guardando contraseña…" />}
      <div className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-md">
          <div className="flex justify-center mb-8">
            <Image
              src="/logo-dili-panel.png"
              alt="Diligenz"
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
              priority
            />
          </div>

          <div className="page-card page-card-padded shadow-[0_12px_48px_rgba(145,70,255,0.1)]">
            <h1 className="text-2xl font-bold text-[var(--brand-primary)] mb-2 text-center">
              Nueva contraseña
            </h1>

            {linkInvalid ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  El enlace no es válido o ha caducado. Solicita uno nuevo.
                </div>
                <Link
                  href="/recuperar-contrasena"
                  className="block w-full text-center rounded-xl py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
                >
                  Solicitar nuevo enlace
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <p className="text-sm text-[var(--foreground)] opacity-80 text-center">
                  Cuenta: <span className="font-medium">{email}</span>
                </p>

                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-[var(--brand-primary)] mb-1">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      minLength={8}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 bg-white px-4 py-3 pr-12 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-primary)] hover:opacity-80 text-sm font-medium"
                    >
                      {showPassword ? "Ocultar" : "Ver"}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-[var(--brand-primary)] mb-1">
                    Repetir contraseña
                  </label>
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    minLength={8}
                    placeholder="Repite la contraseña"
                    className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 bg-white px-4 py-3 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
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
                  {loading ? "Guardando…" : "Guardar contraseña"}
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-[var(--foreground)] opacity-80">
              <Link href="/login" className="font-medium text-[var(--brand-primary)] hover:underline">
                Volver al inicio de sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}

export default function RestablecerContrasenaPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <RestablecerContrasenaForm />
    </Suspense>
  );
}
