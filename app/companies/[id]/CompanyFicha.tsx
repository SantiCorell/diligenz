"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import RegisterModal from "@/components/auth/RegisterModal";
import type { CompanyMock } from "@/lib/mock-companies";

type Props = {
  company: CompanyMock;
  isLoggedIn: boolean;
};

export default function CompanyFicha({ company, isLoggedIn }: Props) {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [requestInfo, setRequestInfo] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState<"request" | "favorite" | null>(null);
  const showBlur = !isLoggedIn;

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(`/api/companies/${company.id}/interest`)
      .then((r) => r.json())
      .then((d) => {
        setRequestInfo(d.requestInfo ?? false);
        setFavorite(d.favorite ?? false);
      })
      .catch(() => {});
  }, [company.id, isLoggedIn]);

  const handleRequestInfo = async () => {
    setLoading("request");
    try {
      const res = await fetch(`/api/companies/${company.id}/interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "REQUEST_INFO" }),
      });
      if (res.ok) setRequestInfo(true);
    } finally {
      setLoading(null);
    }
  };

  const handleFavorite = async () => {
    setLoading("favorite");
    try {
      if (favorite) {
        await fetch(`/api/companies/${company.id}/interest?type=FAVORITE`, { method: "DELETE" });
        setFavorite(false);
      } else {
        const res = await fetch(`/api/companies/${company.id}/interest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "FAVORITE" }),
        });
        if (res.ok) setFavorite(true);
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <article className="mt-8 rounded-2xl border border-[var(--brand-primary)]/15 bg-[var(--brand-bg)] p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--brand-primary)]">
              {company.name}
            </h1>
            <p className="mt-1 text-[var(--foreground)] opacity-85">
              {company.sector} · {company.location}
            </p>
          </div>
          <span className="rounded-full bg-[var(--brand-primary)]/10 px-3 py-1 text-xs font-medium text-[var(--brand-primary)]">
            Confidencial
          </span>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-[var(--brand-primary)] opacity-90">
            Descripción
          </h2>
          <p className="mt-2 text-[var(--foreground)] opacity-90 leading-relaxed">
            {company.description}
          </p>
        </div>

        <div className={`mt-8 ${showBlur ? "relative" : ""}`}>
          {showBlur && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-[var(--brand-bg)]/90 backdrop-blur-md z-10 min-h-[120px] border border-[var(--brand-primary)]/10"
              aria-hidden
            >
              <p className="text-sm font-medium text-[var(--brand-primary)] px-4 text-center">
                Facturación, EBITDA y datos detallados
              </p>
              <button
                type="button"
                onClick={() => setRegisterModalOpen(true)}
                className="mt-3 rounded-xl bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Regístrate para ver la ficha completa
              </button>
            </div>
          )}
          <div
            className={`grid grid-cols-2 gap-6 ${showBlur ? "blur-sm pointer-events-none select-none" : ""}`}
          >
            <div>
              <p className="text-xs text-[var(--foreground)] opacity-70">
                Facturación anual
              </p>
              <p className="mt-1 text-xl font-semibold text-[var(--brand-primary)]">
                {company.revenue}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--foreground)] opacity-70">
                EBITDA
              </p>
              <p className="mt-1 text-xl font-semibold text-[var(--brand-primary)]">
                {company.ebitda}
              </p>
            </div>
          </div>
        </div>

        {isLoggedIn && (
          <div className="mt-8 pt-6 border-t border-[var(--brand-primary)]/10 flex flex-wrap gap-3">
            {requestInfo ? (
              <span className="inline-flex items-center rounded-xl bg-[var(--brand-primary)]/15 px-4 py-2 text-sm font-medium text-[var(--brand-primary)]">
                De mi interés
              </span>
            ) : (
              <button
                type="button"
                onClick={handleRequestInfo}
                disabled={loading !== null}
                className="rounded-xl bg-[var(--brand-primary)] px-6 py-3 text-white font-medium hover:opacity-90 disabled:opacity-60"
              >
                {loading === "request" ? "Enviando…" : "Solicitar información"}
              </button>
            )}
            <button
              type="button"
              onClick={handleFavorite}
              disabled={loading !== null}
              className="rounded-xl border-2 border-[var(--brand-primary)]/40 px-6 py-3 text-[var(--brand-primary)] font-medium hover:bg-[var(--brand-primary)]/5 disabled:opacity-60"
            >
              {loading === "favorite" ? "…" : favorite ? "✓ En seguimiento" : "Guardar en seguimiento"}
            </button>
          </div>
        )}
      </article>

      <RegisterModal
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </>
  );
}
