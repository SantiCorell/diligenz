"use client";

import { useState } from "react";

const MOTIVOS = [
  { value: "valoracion", label: "Valoración de mi empresa" },
  { value: "due-diligence", label: "Due diligence" },
  { value: "vender", label: "Vender empresa" },
  { value: "comprar", label: "Comprar / Invertir" },
  { value: "otro", label: "Otro" },
];

export default function ContactFormServicios() {
  const [motivo, setMotivo] = useState("");
  const [otroTexto, setOtroTexto] = useState("");
  const [type, setType] = useState<"PARTICULAR" | "EMPRESA">("PARTICULAR");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const subject = motivo === "otro" ? `Otro: ${otroTexto}` : MOTIVOS.find((m) => m.value === motivo)?.label ?? motivo;
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "servicios",
          type,
          name,
          email,
          phone: phone || undefined,
          companyName: type === "EMPRESA" ? companyName || undefined : undefined,
          contactPerson: type === "EMPRESA" ? contactPerson || undefined : undefined,
          subject,
          message: motivo === "otro" ? otroTexto : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al enviar.");
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Error de conexión.");
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="rounded-2xl border-2 border-[var(--brand-primary)]/20 bg-white p-8 shadow-lg text-center">
        <p className="text-lg font-semibold text-[var(--brand-primary)]">
          Mensaje enviado correctamente
        </p>
        <p className="mt-2 text-[var(--foreground)] opacity-85">
          Te contestaremos a la mayor brevedad.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-[var(--brand-primary)]/20 bg-white p-8 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-[var(--brand-primary)] mb-2">
            Motivo de la consulta
          </label>
          <select
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            required
            className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
          >
            <option value="">Selecciona un motivo</option>
            {MOTIVOS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {motivo === "otro" && (
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Indica tu consulta
            </label>
            <textarea
              value={otroTexto}
              onChange={(e) => setOtroTexto(e.target.value)}
              required={motivo === "otro"}
              rows={3}
              className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none resize-y"
              placeholder="Escribe aquí tu consulta..."
            />
          </div>
        )}

        <div>
          <p className="block text-sm font-semibold text-[var(--brand-primary)] mb-3">
            ¿Eres particular o empresa?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setType("PARTICULAR")}
              className={`flex-1 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                type === "PARTICULAR"
                  ? "bg-[var(--brand-primary)] text-white shadow-md"
                  : "border-2 border-[var(--brand-primary)]/20 bg-[var(--brand-bg-lavender)] text-[var(--brand-primary)] hover:border-[var(--brand-primary)]/40"
              }`}
            >
              Particular
            </button>
            <button
              type="button"
              onClick={() => setType("EMPRESA")}
              className={`flex-1 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                type === "EMPRESA"
                  ? "bg-[var(--brand-primary)] text-white shadow-md"
                  : "border-2 border-[var(--brand-primary)]/20 bg-[var(--brand-bg-lavender)] text-[var(--brand-primary)] hover:border-[var(--brand-primary)]/40"
              }`}
            >
              Empresa
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Nombre *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 focus:border-[var(--brand-primary)] focus:outline-none"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 focus:border-[var(--brand-primary)] focus:outline-none"
              placeholder="tu@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Teléfono</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 focus:border-[var(--brand-primary)] focus:outline-none"
            placeholder="+34 600 000 000"
          />
        </div>

        {type === "EMPRESA" && (
          <>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Nombre de la empresa</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 focus:border-[var(--brand-primary)] focus:outline-none"
                placeholder="Nombre de la empresa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Persona a la que dirigirse</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 focus:border-[var(--brand-primary)] focus:outline-none"
                placeholder="Nombre y apellidos"
              />
            </div>
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--brand-primary)] py-3.5 text-white font-semibold hover:opacity-90 disabled:opacity-50 transition shadow-md"
        >
          {loading ? "Enviando…" : "Enviar consulta"}
        </button>
      </form>
    </div>
  );
}
