"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import { setStoredToken } from "@/lib/auth-client";

type Role = "SELLER" | "BUYER";

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenLogin?: () => void;
  onSuccess?: () => void;
};

export default function RegisterFormModal({ open, onClose, onOpenLogin, onSuccess }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password || !confirmPassword || !phone || !role) {
      setError("Completa todos los campos.");
      return;
    }
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, phone, role }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear la cuenta.");
        setLoading(false);
        return;
      }
      if (data.token) setStoredToken(data.token);
      onSuccess?.();
      onClose();
      const target = data.role === "BUYER" ? "/dashboard/buyer" : "/dashboard/seller";
      router.push(target);
    } catch {
      setError("Error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarSesion = () => {
    onClose();
    onOpenLogin?.();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 overflow-y-auto py-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border-2 border-[var(--brand-primary)]/20 shadow-xl max-w-md w-full overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 relative max-h-[90vh] overflow-y-auto">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-lg text-[var(--foreground)]/70 hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)]"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex justify-center -mt-2">
            <Image
              src="/logo-dili-panel.png"
              alt="Diligenz"
              width={80}
              height={80}
              className="h-16 w-16 object-contain"
            />
          </div>
          <h2 className="text-xl font-bold text-[var(--brand-primary)] mt-4 mb-5 text-center">
            Crea tu cuenta
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-modal-email" className="block text-sm font-medium text-[var(--brand-primary)] mb-1">
                Email
              </label>
              <input
                id="reg-modal-email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 bg-white px-4 py-3 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition"
              />
            </div>

            <div>
              <label htmlFor="reg-modal-password" className="block text-sm font-medium text-[var(--brand-primary)] mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="reg-modal-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 bg-white px-4 py-3 pr-12 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition"
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

            <div>
              <label htmlFor="reg-modal-confirm" className="block text-sm font-medium text-[var(--brand-primary)] mb-1">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="reg-modal-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 bg-white px-4 py-3 pr-12 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-primary)] hover:opacity-80 text-sm font-medium"
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showConfirmPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="reg-modal-phone" className="block text-sm font-medium text-[var(--brand-primary)] mb-1">
                Teléfono
              </label>
              <input
                id="reg-modal-phone"
                type="tel"
                required
                placeholder="+34 600 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 bg-white px-4 py-3 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--brand-primary)] mb-2">
                ¿Qué quieres hacer en DILIGENZ?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("SELLER")}
                  className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
                    role === "SELLER"
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-md"
                      : "border-[var(--brand-primary)]/30 text-[var(--foreground)] hover:border-[var(--brand-primary)]/50 hover:bg-[var(--brand-primary)]/5"
                  }`}
                >
                  Vender mi empresa
                </button>
                <button
                  type="button"
                  onClick={() => setRole("BUYER")}
                  className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
                    role === "BUYER"
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-md"
                      : "border-[var(--brand-primary)]/30 text-[var(--foreground)] hover:border-[var(--brand-primary)]/50 hover:bg-[var(--brand-primary)]/5"
                  }`}
                >
                  Comprar / Invertir
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
              {loading ? "Creando cuenta…" : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--foreground)] opacity-80">
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              onClick={handleIniciarSesion}
              className="font-medium text-[var(--brand-primary)] hover:underline"
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
