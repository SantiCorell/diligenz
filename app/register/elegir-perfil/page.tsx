"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ShellLayout from "@/components/layout/ShellLayout";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { authFetch } from "@/lib/auth-client";

type Role = "SELLER" | "BUYER" | "PROFESSIONAL";

type ProfileState = {
  needsRole: boolean;
  needsPhone: boolean;
  role: Role | null;
  phone: string | null;
};

export default function ElegirPerfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [role, setRole] = useState<Role | "">("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch("/api/user/me");
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        if (!data.provider) {
          router.replace("/dashboard");
          return;
        }

        const needsRole = data.oauthProfileComplete === false;
        const needsPhone = !data.phone?.trim();

        if (!needsRole && !needsPhone) {
          router.replace(
            data.role === "SELLER" ? "/dashboard/seller" : "/dashboard/buyer"
          );
          return;
        }

        if (!cancelled) {
          setProfile({ needsRole, needsPhone, role: data.role ?? null, phone: data.phone ?? null });
          if (data.role && !needsRole) setRole(data.role);
          if (data.phone) setPhone(data.phone);
          setLoading(false);
        }
      } catch {
        if (!cancelled) router.replace("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (profile?.needsRole && !role) {
      setError("Selecciona qué quieres hacer en Diligenz.");
      return;
    }
    if (profile?.needsPhone && !phone.trim()) {
      setError("Indica tu teléfono para continuar.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await authFetch("/api/auth/complete-oauth-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(profile?.needsRole ? { role } : {}),
          ...(profile?.needsPhone || phone.trim() ? { phone: phone.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar tu perfil.");
        setSubmitting(false);
        return;
      }
      router.push(data.redirect || "/dashboard");
    } catch {
      setError("Error inesperado. Inténtalo de nuevo.");
      setSubmitting(false);
    }
  };

  return (
    <ShellLayout>
      {(loading || submitting) && (
        <LoadingOverlay message={submitting ? "Guardando tu perfil…" : "Cargando…"} />
      )}
      <div className="min-h-screen bg-[var(--brand-bg)] py-10">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className="flex justify-center mb-8">
            <Image
              src="/logo-dili-panel.png"
              alt="Diligenz"
              width={80}
              height={80}
              className="h-16 w-16 object-contain"
            />
          </div>

          <div className="rounded-2xl border border-[var(--brand-primary)]/15 bg-white p-6 sm:p-8 shadow-md">
            <h1 className="text-xl sm:text-2xl font-semibold text-[var(--brand-primary)]">
              Completa tu perfil
            </h1>
            <p className="mt-2 text-sm text-[var(--foreground)] opacity-85">
              Has iniciado sesión con Google. Cuéntanos cómo quieres usar Diligenz para
              personalizar tu experiencia.
            </p>

            {!loading && profile && (
              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                {profile.needsRole && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--brand-primary)] mb-2">
                      ¿Qué quieres hacer en Diligenz?
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole("SELLER")}
                        className={`rounded-xl border-2 px-4 py-3 text-sm font-medium text-left transition ${
                          role === "SELLER"
                            ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-md"
                            : "border-[var(--brand-primary)]/30 text-[var(--foreground)] hover:border-[var(--brand-primary)]/50"
                        }`}
                      >
                        Vender mi empresa
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("BUYER")}
                        className={`rounded-xl border-2 px-4 py-3 text-sm font-medium text-left transition ${
                          role === "BUYER"
                            ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-md"
                            : "border-[var(--brand-primary)]/30 text-[var(--foreground)] hover:border-[var(--brand-primary)]/50"
                        }`}
                      >
                        Comprar / Invertir
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("PROFESSIONAL")}
                        className={`rounded-xl border-2 px-4 py-3 text-sm font-medium text-left transition ${
                          role === "PROFESSIONAL"
                            ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-md"
                            : "border-[var(--brand-primary)]/30 text-[var(--foreground)] hover:border-[var(--brand-primary)]/50"
                        }`}
                      >
                        Profesional / Asesor
                      </button>
                    </div>
                  </div>
                )}

                {profile.needsPhone && (
                  <div>
                    <label
                      htmlFor="oauth-phone"
                      className="block text-sm font-medium text-[var(--brand-primary)] mb-2"
                    >
                      Teléfono
                    </label>
                    <input
                      id="oauth-phone"
                      type="tel"
                      required
                      placeholder="+34 600 000 000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 bg-white px-4 py-3 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition"
                    />
                  </div>
                )}

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 disabled:opacity-50 transition"
                >
                  Continuar
                </button>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-[var(--foreground)] opacity-70">
            ¿Problemas?{" "}
            <Link href="/login" className="text-[var(--brand-primary)] hover:underline">
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </div>
    </ShellLayout>
  );
}
