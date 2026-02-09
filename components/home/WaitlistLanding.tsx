"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function WaitlistLanding() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Error al enviar");
        return;
      }
      setStatus("success");
      setMessage(data.message || "¡Listo! Te avisamos cuando estemos en marcha.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Error de conexión. Inténtalo de nuevo.");
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{
        background: `linear-gradient(180deg, var(--gradient-start) 0%, var(--gradient-end) 100%)`,
      }}
    >
      <div className="w-full max-w-md flex flex-col items-center text-center">
        {/* Logo */}
        <Link href="/" className="mb-8">
          <Image
            src="/logo-diligenz.png"
            alt="Diligenz"
            width={120}
            height={48}
            className="h-12 w-auto object-contain"
            style={{ filter: "brightness(0) invert(1)" }}
            priority
          />
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Inversión en Empresas
        </h1>

        <p className="text-[#c8befa] text-base md:text-lg max-w-sm mb-8">
          Conectamos compradores y vendedores. Unifica compra, venta y valoración
          de empresas en una sola plataforma que trae claridad a tus operaciones
          de M&A.
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="text-left">
            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Introduce tu correo electrónico"
              disabled={status === "loading"}
              className="w-full rounded-xl border-2 border-[var(--gradient-end)] bg-white/10 backdrop-blur-sm px-4 py-3 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-xl bg-[#6d46c8] hover:bg-[#5c3ab0] text-white font-semibold py-3.5 px-4 transition disabled:opacity-70"
          >
            {status === "loading" ? "Enviando…" : "Unirse a la lista de espera"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm ${
              status === "success" ? "text-white" : "text-red-200"
            }`}
          >
            {message}
          </p>
        )}

        {/* Email providers */}
        <div className="mt-12 flex items-center justify-center gap-3 flex-wrap">
          {["Gmail", "Outlook", "Yahoo"].map((name) => (
            <div
              key={name}
              className="rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 w-12 h-12 flex items-center justify-center text-white text-xs font-medium"
            >
              {name.slice(0, 1)}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center text-sm">
          <Link href="/" className="text-white/90 underline hover:text-white">
            ← Volver al inicio
          </Link>
          <Link href="/companies" className="text-white/90 underline hover:text-white">
            Ver empresas →
          </Link>
        </div>
      </div>
    </div>
  );
}
