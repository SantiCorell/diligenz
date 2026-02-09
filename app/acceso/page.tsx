"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AccesoPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/acceso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Contraseña incorrecta");
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--brand-bg)] via-white to-[var(--brand-primary)]/10 flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center">
        <Image
          src="/logo-dili-panel.png"
          alt="Diligenz"
          width={80}
          height={80}
          className="mx-auto mb-8 h-20 w-20 object-contain"
          priority
        />
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-[var(--brand-primary)]/10 p-8 md:p-10">
          <p className="text-lg md:text-xl text-[var(--foreground)] mb-6 leading-relaxed">
            Todavía es una web de pruebas. Si eres Jose, ponme la password. Si no te la sabes, me llamas.
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full px-4 py-3 rounded-xl border border-[var(--brand-primary)]/20 bg-white text-[var(--foreground)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/50 focus:border-[var(--brand-primary)]"
                required
                autoFocus
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[var(--brand-primary)]"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[var(--brand-primary)] text-white font-semibold hover:bg-[var(--brand-primary-hover)] disabled:opacity-60 transition-colors"
            >
              {loading ? "Comprobando…" : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
