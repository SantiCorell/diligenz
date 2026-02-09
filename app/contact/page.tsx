"use client";

import { useState } from "react";
import ShellLayout from "@/components/layout/ShellLayout";

export default function ContactPage() {
  const [type, setType] = useState<"PARTICULAR" | "EMPRESA">("PARTICULAR");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "contact",
          type,
          name,
          email,
          phone: phone || undefined,
          companyName: type === "EMPRESA" ? companyName || undefined : undefined,
          contactPerson: type === "EMPRESA" ? contactPerson || undefined : undefined,
          message: message || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al enviar.");
        setLoading(false);
        return;
      }
      setSent(true);
      setName("");
      setEmail("");
      setPhone("");
      setCompanyName("");
      setContactPerson("");
      setMessage("");
    } catch {
      setError("Error de conexión.");
    }
    setLoading(false);
  };

  return (
    <ShellLayout>
      <div className="min-h-screen bg-[var(--brand-bg)]">
        <section className="border-b border-[var(--brand-primary)]/10 py-12 md:py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <span className="inline-block text-sm font-semibold uppercase tracking-wider text-[var(--brand-primary)] opacity-90 mb-2">
              Hablemos
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--brand-primary)]">
              Contacto
            </h1>
            <p className="mt-3 text-[var(--foreground)] opacity-85">
              Escríbenos y te respondemos lo antes posible. Indica si eres particular o empresa y tus datos.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <div className="rounded-2xl border-2 border-[var(--brand-primary)]/20 bg-white p-8 shadow-lg">
              {sent ? (
                <div className="text-center py-8">
                  <p className="text-lg font-semibold text-[var(--brand-primary)]">
                    Mensaje enviado correctamente
                  </p>
                  <p className="mt-2 text-[var(--foreground)] opacity-85">
                    Te contestaremos a la mayor brevedad.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--brand-primary)] mb-2">
                      ¿Eres particular o empresa?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value="PARTICULAR"
                          checked={type === "PARTICULAR"}
                          onChange={() => setType("PARTICULAR")}
                          className="text-[var(--brand-primary)]"
                        />
                        <span className="text-[var(--foreground)]">Particular</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value="EMPRESA"
                          checked={type === "EMPRESA"}
                          onChange={() => setType("EMPRESA")}
                          className="text-[var(--brand-primary)]"
                        />
                        <span className="text-[var(--foreground)]">Empresa</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                        Nombre *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                        Email *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-phone" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                      Teléfono
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
                      placeholder="+34 600 000 000"
                    />
                  </div>

                  {type === "EMPRESA" && (
                    <>
                      <div>
                        <label htmlFor="contact-company" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                          Nombre de la empresa
                        </label>
                        <input
                          id="contact-company"
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
                          placeholder="Nombre de la empresa"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-person" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                          Persona de contacto / A la que dirigirse
                        </label>
                        <input
                          id="contact-person"
                          type="text"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
                          placeholder="Nombre y apellidos"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                      Mensaje
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none resize-y"
                      placeholder="¿En qué podemos ayudarte?"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[var(--brand-primary)] py-3.5 text-white font-semibold hover:opacity-90 disabled:opacity-50 transition shadow-md"
                  >
                    {loading ? "Enviando…" : "Enviar mensaje"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </ShellLayout>
  );
}
