"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import { setStoredToken } from "@/lib/auth-client";

const ROLE_TARGET: Record<string, string> = {
  ADMIN: "/admin",
  BUYER: "/dashboard/buyer",
  SELLER: "/dashboard/seller",
};

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenRegister?: () => void;
  onSuccess?: () => void;
};

export default function LoginModal({ open, onClose, onOpenRegister, onSuccess }: Props) {
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
      if (data.token) setStoredToken(data.token);
      onSuccess?.();
      onClose();
      const target = (data.role && ROLE_TARGET[data.role]) || "/dashboard";
      router.push(target);
    } catch {
      setError("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleCrearCuenta = () => {
    onClose();
    onOpenRegister?.();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border-2 border-[var(--brand-primary)]/20 shadow-xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 relative">
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
            Inicia sesión
          </h2>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="login-modal-email" className="block text-sm font-medium text-[var(--brand-primary)] mb-1">
                Email
              </label>
              <input
                id="login-modal-email"
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
              <label htmlFor="login-modal-password" className="block text-sm font-medium text-[var(--brand-primary)] mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-modal-password"
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

          <p className="mt-5 text-center text-sm text-[var(--foreground)] opacity-80">
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              onClick={handleCrearCuenta}
              className="font-medium text-[var(--brand-primary)] hover:underline"
            >
              Crear cuenta
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
