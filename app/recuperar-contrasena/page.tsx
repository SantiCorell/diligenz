"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ShellLayout from "@/components/layout/ShellLayout";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudo enviar el correo.");
        setLoading(false);
        return;
      }

      setSuccess(
        data.message ||
          "Si existe una cuenta con ese email, recibirás un enlace para restablecer la contraseña."
      );
      setLoading(false);
    } catch {
      setError("Error inesperado. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <ShellLayout>
      {loading && <LoadingOverlay message="Enviando correo…" />}
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
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-sm text-[var(--foreground)] opacity-80 text-center mb-6">
              Introduce el email de tu cuenta y te enviaremos un enlace para elegir una nueva contraseña.
            </p>

            {success ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
                  {success}
                </div>
                <Link
                  href="/login"
                  className="block w-full text-center rounded-xl py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-[var(--brand-primary)] mb-1">
                    Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="tu@email.com"
                    className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 bg-white px-4 py-3 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  {loading ? "Enviando…" : "Enviar enlace"}
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
