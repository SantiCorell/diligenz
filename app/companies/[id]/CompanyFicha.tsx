"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  ExternalLink,
  MapPin,
  Upload,
  Download,
  File,
  Lock,
  Check,
  Heart,
  MessageSquare,
  Phone,
  Repeat,
  TrendingUp,
} from "lucide-react";
import RegisterModal from "@/components/auth/RegisterModal";
import RequestInfoModal from "@/components/companies/RequestInfoModal";
import CompanyFavoriteButton from "@/components/companies/CompanyFavoriteButton";
import AssignedAgentCard from "@/components/dashboard/AssignedAgentCard";
import type { CompanyMock } from "@/lib/mock-companies";
import type { AgentCardData } from "@/lib/agent-shared";
import { authFetch } from "@/lib/auth-client";
import { getSectorVisual } from "@/lib/sector-visual";
import { formatEuroAmountFromString, formatEuroRange } from "@/lib/format-financial";
import { ccaaLabel } from "@/lib/spain-ccaa";
import { CONSENT_EVENT, hasAnalyticsConsent } from "@/lib/cookie-consent";
import { trackRequestCompanyInfo, trackViewCompany } from "@/lib/meta-pixel";

type TabId = "informacion" | "descripcion" | "documentos";

type CompanyFileItem = {
  id: string;
  name: string;
  size: number | null;
  mimeType: string | null;
  kind: string;
  sortOrder?: number;
  createdAt: string;
};

type Props = {
  company: CompanyMock;
  isLoggedIn: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
  agent?: AgentCardData | null;
  viewerName?: string;
  viewerEmail?: string;
  documentCount?: number;
};

function missingFigure(value: string | null | undefined): boolean {
  const trimmed = value?.trim() ?? "";
  return !trimmed || trimmed === "—" || trimmed === "-" || /^confidencial$/i.test(trimmed);
}

function compactLocation(label: string): string {
  return label
    .replace(/^Comunidad de /, "")
    .replace(/^Comunidad Foral de /, "")
    .replace(/^Comunidad /, "C. ")
    .replace(/^Principado de /, "")
    .replace(/^Región de /, "")
    .replace(/^Islas /, "");
}

function growthLabel(value: number): string {
  const abs = Math.abs(value).toLocaleString("es-ES", { maximumFractionDigits: 1 });
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${abs}% crecimiento`;
}

function projectSummary(description: string): string {
  const prose = description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !/^(?:[-•*]|\d+[.)])\s+/.test(line));
  return prose.join("\n\n");
}

function opportunityPoints(company: CompanyMock): string[] {
  const bullets = company.description
    .split(/\r?\n/)
    .map((line) => line.trim().match(/^(?:[-•*]|\d+[.)])\s+(.+)$/)?.[1]?.trim() ?? "")
    .filter(Boolean);
  if (bullets.length > 0) return bullets.slice(0, 6);

  const points: string[] = [];
  if (
    typeof company.revenueGrowthPercent === "number" &&
    Number.isFinite(company.revenueGrowthPercent)
  ) {
    points.push(`Crecimiento de facturación del ${growthLabel(company.revenueGrowthPercent).replace(" crecimiento", "")}.`);
  }
  if (typeof company.arr === "number" && company.arr > 0) {
    points.push("Modelo con ingresos recurrentes.");
  }
  if (typeof company.yearsOperating === "number" && company.yearsOperating > 0) {
    points.push(
      company.yearsOperating === 1
        ? "Un año en operación."
        : `${company.yearsOperating} años en operación.`
    );
  }
  return points;
}

function ConfidentialBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
      <Lock className="h-3 w-3" aria-hidden />
      Confidencial
    </span>
  );
}

export default function CompanyFicha({
  company,
  isLoggedIn,
  isOwner = false,
  isAdmin = false,
  agent = null,
  viewerName = "",
  viewerEmail = "",
  documentCount = 0,
}: Props) {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestModalSuccess, setRequestModalSuccess] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("informacion");
  const [requestInfo, setRequestInfo] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<CompanyFileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const canSeeDocuments = isOwner || isAdmin;
  const hasDriveLinks = Boolean(company.documentLinks?.length);
  const buyerDocuments = company.buyerDocuments ?? [];
  const hasBuyerDocuments = buyerDocuments.length > 0;

  useEffect(() => {
    let sent = false;
    const send = () => {
      if (sent || !hasAnalyticsConsent()) return;
      sent = true;
      trackViewCompany({
        companyId: company.id,
        companyName: company.name,
        sector: company.sector,
      });
    };
    send();
    window.addEventListener(CONSENT_EVENT, send);
    return () => window.removeEventListener(CONSENT_EVENT, send);
  }, [company.id, company.name, company.sector]);

  useEffect(() => {
    if (!isLoggedIn) return;
    authFetch(`/api/companies/${company.id}/interest`)
      .then((r) => r.json())
      .then((d) => {
        setRequestInfo(d.requestInfo ?? false);
        setIsFavorite(d.favorite ?? false);
      })
      .catch(() => {});
  }, [company.id, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !canSeeDocuments) return;
    authFetch(`/api/companies/${company.id}/files`)
      .then((r) => r.json())
      .then((d) => (d.files ? setFiles(d.files) : []))
      .catch(() => {});
  }, [company.id, isLoggedIn, canSeeDocuments]);

  const handleRequestInfo = async () => {
    setLoading(true);
    setRequestError(null);
    try {
      const res = await authFetch(`/api/companies/${company.id}/interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "REQUEST_INFO" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setRequestInfo(true);
        setRequestModalSuccess(true);
        trackRequestCompanyInfo({
          companyId: company.id,
          companyName: company.name,
        });
      } else {
        setRequestError(
          typeof data.error === "string"
            ? data.error
            : "No se pudo enviar la solicitud. Inténtalo de nuevo."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const openRequestModal = () => {
    setRequestModalSuccess(false);
    setRequestError(null);
    setRequestModalOpen(true);
  };

  const closeRequestModal = () => {
    if (loading) return;
    setRequestModalOpen(false);
    setRequestModalSuccess(false);
    setRequestError(null);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await authFetch(`/api/companies/${company.id}/files`, {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        const res2 = await authFetch(`/api/companies/${company.id}/files`);
        const data2 = await res2.json();
        if (data2.files) setFiles(data2.files);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const documentTabLabel =
    documentCount > 0 ? `Documentos (${documentCount})` : "Documentos";
  const tabs: { id: TabId; label: string }[] = [
    { id: "informacion", label: "Información" },
    { id: "descripcion", label: "Descripción" },
    { id: "documentos", label: documentTabLabel },
  ];

  const sectorVisual = getSectorVisual(company.sector);
  const sectorPath = [
    sectorVisual.label.replace(/\s*\/\s*/g, " · "),
    company.sectorSubcategory?.trim() &&
    !sectorVisual.label.toLowerCase().includes(company.sectorSubcategory.trim().toLowerCase())
      ? company.sectorSubcategory.trim()
      : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const locationFull = ccaaLabel(company.location);
  const locationKnown = !missingFigure(locationFull);
  const annualRevenue = formatEuroAmountFromString(
    company.revenue?.trim() || company.gmv || null
  );
  const ebitdaLabel = formatEuroAmountFromString(company.ebitda);
  const exerciseResultLabel = formatEuroAmountFromString(company.exerciseResult);
  const salePriceLabel = formatEuroRange(company.valuationSaleMin, company.valuationSaleMax);
  const summary = projectSummary(company.description);
  const points = opportunityPoints(company);
  const SectorIcon = sectorVisual.icon;
  const highlightChips: { key: string; label: string; icon: typeof TrendingUp }[] = [];
  if (
    typeof company.revenueGrowthPercent === "number" &&
    Number.isFinite(company.revenueGrowthPercent) &&
    company.revenueGrowthPercent !== 0
  ) {
    highlightChips.push({
      key: "growth",
      label: growthLabel(company.revenueGrowthPercent),
      icon: TrendingUp,
    });
  }
  if (typeof company.arr === "number" && company.arr > 0) {
    highlightChips.push({ key: "arr", label: "Ingresos recurrentes", icon: Repeat });
  }

  const askToRegister = () => setRegisterModalOpen(true);

  return (
    <>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#b57bff] via-[#d2b0ff] to-[#eadbff] px-6 py-8 md:px-8 md:py-10">
          <SectorIcon
            className="pointer-events-none absolute -right-2 top-1/2 h-32 w-32 -translate-y-1/2 text-white/35"
            strokeWidth={1.25}
            aria-hidden
          />
          <span className="relative inline-flex rounded-full bg-white/25 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {sectorPath}
          </span>
        </div>
        <div className="px-6 py-6 md:px-8 md:py-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
              <Lock className="h-3 w-3" aria-hidden />
              Confidencial
            </span>
            {company.reference ? (
              <span className="inline-flex items-center rounded-full bg-[#f3e8ff] px-2.5 py-1 text-[11px] font-semibold text-[#7c4dff]">
                Ref. {company.reference}
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {company.name}
          </h1>
          {locationKnown ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {locationFull}
            </p>
          ) : null}
          {highlightChips.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {highlightChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                >
                  <chip.icon className="h-3.5 w-3.5" aria-hidden />
                  {chip.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
      <div className="border-b border-slate-200">
        <nav className="flex gap-6" aria-label="Secciones">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#7c4dff] text-[#7c4dff]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
        {activeTab === "informacion" && (
          <section>
            <h2 className="text-lg font-bold text-[#7c4dff]">Información del proyecto</h2>
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700">
              {summary || "Sin descripción."}
            </p>
            {points.length > 0 ? (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="text-sm font-bold text-slate-900">Por qué esta oportunidad</h3>
                <ul className="mt-3 space-y-2.5">
                  {points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#7c4dff]" aria-hidden />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        )}

        {activeTab === "descripcion" && (
          <section>
            <h2 className="text-lg font-bold text-[var(--brand-primary)] flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Descripción del vendedor
            </h2>
            {!isLoggedIn ? (
              <div className="mt-6 flex flex-col items-center justify-center rounded-xl bg-[var(--brand-bg-lavender)]/50 border border-[var(--brand-primary)]/10 py-12 px-6 text-center">
                <Lock className="w-10 h-10 text-[var(--brand-primary)]/50 mb-3" />
                <p className="font-medium text-[var(--brand-primary)]">
                  Para ver esta información debes estar logueado
                </p>
                <p className="mt-1 text-sm text-[var(--foreground)] opacity-80">
                  Si todavía no estás dado de alta, ¿a qué estás esperando?
                </p>
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(true)}
                  className="mt-4 rounded-xl bg-[var(--brand-primary)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
                >
                  Saber más
                </button>
                <Link
                  href="/login"
                  className="mt-3 text-sm text-[var(--brand-primary)] hover:underline"
                >
                  Si ya tienes cuenta, accede aquí
                </Link>
              </div>
            ) : company.sellerDescription ? (
              <p className="mt-3 text-[var(--foreground)] opacity-90 leading-relaxed whitespace-pre-wrap">
                {company.sellerDescription}
              </p>
            ) : (
              <p className="mt-3 text-[var(--foreground)] opacity-70">
                El vendedor no ha añadido aún una descripción ampliada.
              </p>
            )}
            {isLoggedIn &&
              (isOwner || isAdmin) &&
              hasDriveLinks &&
              company.documentLinks &&
              company.documentLinks.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[var(--brand-primary)]/10">
                  <h3 className="text-sm font-semibold text-[var(--brand-primary)] opacity-90 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Carpeta de documentación (Google Drive)
                  </h3>
                  <p className="mt-1 text-xs text-[var(--foreground)] opacity-70">
                    Carpeta interna del proyecto. Los compradores no tienen acceso a estos archivos.
                  </p>
                  <ul className="mt-3 space-y-2">
                    {company.documentLinks.map((link, i) => (
                      <li key={i}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[var(--brand-primary)] hover:underline font-medium"
                        >
                          {link.label}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </section>
        )}

        {activeTab === "documentos" && (
          <section>
            <h2 className="text-lg font-bold text-[var(--brand-primary)] flex items-center gap-2">
              <File className="w-5 h-5" />
              Documentos
            </h2>
            {!isLoggedIn ? (
              <div className="mt-6 flex flex-col items-center justify-center rounded-xl bg-[var(--brand-bg-lavender)]/50 border border-[var(--brand-primary)]/10 py-12 px-6 text-center">
                <Lock className="w-10 h-10 text-[var(--brand-primary)]/50 mb-3" />
                <p className="font-medium text-[var(--brand-primary)]">
                  Para ver esta información debes estar logueado
                </p>
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(true)}
                  className="mt-4 rounded-xl bg-[var(--brand-primary)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
                >
                  Saber más
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {hasBuyerDocuments && (
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--brand-primary)] flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Documentación disponible
                      </h3>
                      <p className="mt-1 text-xs text-[var(--foreground)] opacity-70">
                        {isAdmin
                          ? "Vista previa de lo que verá el comprador cuando su solicitud esté en gestión."
                          : "Tu solicitud de información está validada. Puedes acceder a estos documentos."}
                      </p>
                    </div>
                    <ul className="space-y-2">
                      {buyerDocuments.map((doc, index) => (
                        <li
                          key={`${doc.url}-${index}`}
                          className="flex items-center justify-between gap-4 rounded-xl border border-[var(--brand-primary)]/10 bg-[var(--brand-bg-lavender)]/40 px-4 py-3"
                        >
                          <span className="text-sm font-medium text-[var(--foreground)]">
                            {doc.label}
                          </span>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--brand-primary)]/15 px-3 py-2 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/25"
                          >
                            Abrir
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {canSeeDocuments ? (
                  <div className={hasBuyerDocuments ? "pt-6 border-t border-[var(--brand-primary)]/10 space-y-4" : "space-y-4"}>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--brand-primary)]">
                        Archivos internos del proyecto
                      </h3>
                      <p className="mt-1 text-xs text-[var(--foreground)] opacity-70">
                        Solo visible para el vendedor y el equipo Diligenz.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)]/15 px-4 py-2.5 text-sm font-medium text-[var(--brand-primary)] cursor-pointer hover:bg-[var(--brand-primary)]/20">
                        <Upload className="w-4 h-4" />
                        {uploading ? "Subiendo…" : "Subir documento"}
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                          onChange={handleUpload}
                          disabled={uploading}
                        />
                      </label>
                      <span className="text-xs text-[var(--foreground)] opacity-70">
                        PDF, Word, Excel o imágenes. Máx. 15 MB.
                      </span>
                    </div>
                    {files.length === 0 ? (
                      <p className="text-sm text-[var(--foreground)] opacity-70">
                        Aún no hay documentos subidos. Sube memorias, cuentas anuales u otros
                        archivos para que el equipo pueda revisarlos.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {files.map((f) => (
                          <li
                            key={f.id}
                            className="flex items-center justify-between gap-4 rounded-xl border border-[var(--brand-primary)]/10 bg-[var(--brand-bg-lavender)]/40 px-4 py-3"
                          >
                            <span className="text-sm font-medium text-[var(--foreground)] truncate">
                              {f.name}
                            </span>
                            <a
                              href={`/api/companies/${company.id}/files/${f.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 rounded-lg bg-[var(--brand-primary)]/15 p-2 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/25"
                              title="Descargar"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : !hasBuyerDocuments ? (
                  <p className="text-[var(--foreground)] opacity-80">
                    Solicita información sobre esta empresa. Cuando tu gestor te conceda el teaser,
                    el documento resumen aparecerá aquí.
                  </p>
                ) : null}
              </div>
            )}
          </section>
        )}
      </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Datos clave
            </h2>
            <dl className="mt-2">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3">
                <dt className="text-sm text-slate-500">Sector</dt>
                <dd className="text-right text-sm font-semibold text-slate-900">
                  {company.sectorSubcategory?.trim() || sectorVisual.shortLabel}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3">
                <dt className="text-sm text-slate-500">Ubicación</dt>
                <dd className="text-right text-sm font-semibold text-slate-900">
                  {locationKnown ? compactLocation(locationFull) : <ConfidentialBadge />}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3">
                <dt className="text-sm text-slate-500">Facturación anual</dt>
                <dd className="text-right text-sm font-semibold text-slate-900">
                  {missingFigure(annualRevenue) ? <ConfidentialBadge /> : annualRevenue}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-slate-500">EBITDA</dt>
                <dd className="text-right text-sm font-semibold text-slate-900">
                  {missingFigure(ebitdaLabel) ? <ConfidentialBadge /> : ebitdaLabel}
                </dd>
              </div>
              {!missingFigure(exerciseResultLabel) ? (
                <div className="flex items-center justify-between gap-4 border-t border-slate-100 py-3">
                  <dt className="text-sm text-slate-500">Resultado</dt>
                  <dd className="text-right text-sm font-semibold text-slate-900">{exerciseResultLabel}</dd>
                </div>
              ) : null}
              {salePriceLabel ? (
                <div className="flex items-center justify-between gap-4 border-t border-slate-100 py-3">
                  <dt className="text-sm text-slate-500">Precio de venta</dt>
                  <dd className="text-right text-sm font-semibold text-slate-900">{salePriceLabel}</dd>
                </div>
              ) : null}
              {company.employees != null ? (
                <div className="flex items-center justify-between gap-4 border-t border-slate-100 py-3">
                  <dt className="text-sm text-slate-500">Empleados</dt>
                  <dd className="text-right text-sm font-semibold text-slate-900">{company.employees}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <div className="space-y-2.5">
            {isLoggedIn && requestInfo ? (
              <div className="rounded-xl border border-[#eadfff] bg-[#f7f2ff] px-4 py-3 text-center">
                <p className="text-sm font-semibold text-[#5b34d6]">Solicitud enviada</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  En breve un compañero se pondrá en contacto contigo.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={isLoggedIn ? openRequestModal : askToRegister}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7c4dff] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#6b3df0]"
              >
                <MessageSquare className="h-4 w-4" aria-hidden />
                ¿Estás interesado?
              </button>
            )}
            {isLoggedIn ? (
              <CompanyFavoriteButton
                companyId={company.id}
                initialFavorite={isFavorite}
                onChange={setIsFavorite}
              />
            ) : (
              <button
                type="button"
                onClick={askToRegister}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d4c2ff] bg-white px-4 py-3 text-sm font-semibold text-[#5b34d6] hover:bg-[#f7f2ff]"
              >
                <Heart className="h-4 w-4" aria-hidden />
                Guardar en favoritos
              </button>
            )}
            <p className="text-center text-xs text-slate-400">Sin compromiso · Respuesta en 48h</p>
          </div>

          {isLoggedIn && agent ? (
            <AssignedAgentCard
              variant="listing"
              agent={agent}
              nextMeeting={null}
              userName={viewerName}
              userEmail={viewerEmail}
            />
          ) : (
            <article className="rounded-2xl border border-[#eadfff] bg-[#f7f2ff] p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#7c4dff]">
                  <MessageSquare className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7c4dff]">
                    ¿Dudas sobre esta operación?
                  </p>
                  <p className="mt-1 text-base font-bold text-slate-900">Ponte en contacto con nosotros</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {isLoggedIn
                  ? "Nuestro equipo te atiende sin compromiso y te asignará un agente directo para esta y el resto de oportunidades."
                  : "Nuestro equipo te atiende sin compromiso. Al verificarte como comprador, se te asignará un agente directo para esta y el resto de oportunidades."}
              </p>
              {isLoggedIn ? (
                <Link
                  href="/contact"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7c4dff] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#6b3df0]"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  Contactar con nosotros
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={askToRegister}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7c4dff] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#6b3df0]"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  Contactar con nosotros
                </button>
              )}
            </article>
          )}
        </aside>
      </div>

      <RegisterModal
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
      <RequestInfoModal
        open={requestModalOpen}
        companyName={company.name}
        loading={loading}
        success={requestModalSuccess}
        error={requestError}
        onClose={closeRequestModal}
        onConfirm={handleRequestInfo}
      />
    </>
  );
}
