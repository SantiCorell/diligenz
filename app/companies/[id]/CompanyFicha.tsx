"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  ExternalLink,
  MapPin,
  BarChart3,
  Users,
  Upload,
  Download,
  File,
  Lock,
} from "lucide-react";
import RegisterModal from "@/components/auth/RegisterModal";
import RequestInfoModal from "@/components/companies/RequestInfoModal";
import CompanyFavoriteButton from "@/components/companies/CompanyFavoriteButton";
import type { CompanyMock } from "@/lib/mock-companies";
import { authFetch } from "@/lib/auth-client";
import SectorVisual from "@/components/companies/SectorVisual";
import { getSectorVisual } from "@/lib/sector-visual";
import { formatEuroAmountFromString, formatEuroRange } from "@/lib/format-financial";

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
};

export default function CompanyFicha({
  company,
  isLoggedIn,
  isOwner = false,
  isAdmin = false,
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
  const hasBuyerTeaser = Boolean(company.buyerTeaserUrl?.trim());

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

  const tabs: { id: TabId; label: string }[] = [
    { id: "informacion", label: "Información" },
    { id: "descripcion", label: "Descripción" },
    { id: "documentos", label: "Documentos" },
  ];

  const sectorVisual = getSectorVisual(company.sector);
  const annualRevenue = formatEuroAmountFromString(
    company.revenue?.trim() || company.gmv || null
  );
  const ebitdaLabel = formatEuroAmountFromString(company.ebitda);
  const exerciseResultLabel = formatEuroAmountFromString(company.exerciseResult);
  const salePriceLabel = formatEuroRange(company.valuationSaleMin, company.valuationSaleMax);

  return (
    <>
      <div className="mt-6 rounded-xl border border-black/[0.06] bg-[var(--surface-card)] overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <SectorVisual sector={company.sector} variant="banner" />
        <div className="grid md:grid-cols-[1fr,280px] gap-0">
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${sectorVisual.tagClass}`}
              >
                {sectorVisual.label}
              </span>
              <span className="rounded-md border border-black/[0.05] px-2.5 py-1 text-[11px] font-normal text-[var(--foreground)]/45">
                Confidencial
              </span>
              {company.reference ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--brand-primary)]/25 bg-[var(--brand-primary)]/5 px-2.5 py-1 font-mono text-[11px] font-bold text-[var(--brand-primary)]">
                  Ref. {company.reference}
                </span>
              ) : null}
            </div>
            <h1 className="mt-4 text-2xl md:text-3xl font-semibold text-[var(--foreground)]">
              {company.name}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-[var(--foreground)]/55">
              <MapPin className="w-3.5 h-3.5 opacity-60" />
              {company.location}
            </p>
          </div>
          <div className="bg-[var(--surface-muted)]/40 border-t md:border-t-0 md:border-l border-black/[0.05] p-6 flex flex-col justify-between gap-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-[var(--foreground)] opacity-70">
                  Facturación anual €
                </p>
                <p className="text-lg font-bold text-[var(--brand-primary)]">
                  {annualRevenue}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--foreground)] opacity-70">
                  EBITDA
                </p>
                <p className="text-lg font-bold text-[var(--brand-primary)]">
                  {ebitdaLabel}
                </p>
              </div>
              {company.exerciseResult ? (
                <div>
                  <p className="text-xs text-[var(--foreground)] opacity-70">
                    Resultado del ejercicio
                  </p>
                  <p className="text-lg font-bold text-[var(--brand-primary)]">
                    {exerciseResultLabel}
                  </p>
                </div>
              ) : null}
              {salePriceLabel ? (
                <div className="md:col-span-2 lg:col-span-1">
                  <p className="text-xs text-[var(--foreground)] opacity-70">
                    Precio de venta
                  </p>
                  <p className="text-lg font-bold text-[var(--brand-primary)]">{salePriceLabel}</p>
                </div>
              ) : null}
              {company.employees != null && (
                <div>
                  <p className="text-xs text-[var(--foreground)] opacity-70">
                    Nº Empleados
                  </p>
                  <p className="text-lg font-bold text-[var(--brand-primary)]">
                    {company.employees}
                  </p>
                </div>
              )}
            </div>
            {isLoggedIn ? (
              <div className="flex flex-col gap-2">
                {requestInfo ? (
                  <div className="rounded-xl border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/8 px-4 py-3 text-center">
                    <p className="text-sm font-semibold text-[var(--brand-primary)]">
                      Solicitud enviada
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--foreground)]/75">
                      En breve un compañero se pondrá en contacto contigo.
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={openRequestModal}
                    className="w-full rounded-xl bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white hover:opacity-90"
                  >
                    ¿Estás interesado?
                  </button>
                )}
                <CompanyFavoriteButton
                  companyId={company.id}
                  initialFavorite={isFavorite}
                  onChange={setIsFavorite}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setRegisterModalOpen(true)}
                className="w-full rounded-xl bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                Regístrate para ver datos y solicitar información
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pestañas */}
      <div className="mt-8 border-b border-[var(--brand-primary)]/15">
        <nav className="flex gap-6" aria-label="Secciones">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                  : "border-transparent text-[var(--foreground)] opacity-70 hover:opacity-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido por pestaña */}
      <div className="mt-6 rounded-2xl border border-[var(--brand-primary)]/10 bg-[var(--brand-bg)] p-6 md:p-8">
        {activeTab === "informacion" && (
          <section>
            <h2 className="text-lg font-bold text-[var(--brand-primary)]">
              Información del proyecto
            </h2>
            <p className="mt-3 text-[var(--foreground)] opacity-90 leading-relaxed">
              {company.description}
            </p>
            {isLoggedIn && (
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-[var(--brand-bg-lavender)]/60 p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[var(--brand-primary)]/70" />
                    <span className="text-xs font-medium opacity-75">
                      Facturación anual €
                    </span>
                  </div>
                  <p className="mt-1 font-bold text-[var(--brand-primary)]">
                    {annualRevenue}
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--brand-bg-lavender)]/60 p-4">
                  <span className="text-xs font-medium opacity-75">EBITDA</span>
                  <p className="mt-1 font-bold text-[var(--brand-primary)]">
                    {ebitdaLabel}
                  </p>
                </div>
                {company.exerciseResult ? (
                  <div className="rounded-xl bg-[var(--brand-bg-lavender)]/60 p-4">
                    <span className="text-xs font-medium opacity-75">Resultado del ejercicio</span>
                    <p className="mt-1 font-bold text-[var(--brand-primary)]">
                      {exerciseResultLabel}
                    </p>
                  </div>
                ) : null}
                {company.employees != null && (
                  <div className="rounded-xl bg-[var(--brand-bg-lavender)]/60 p-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[var(--brand-primary)]/70" />
                      <span className="text-xs font-medium opacity-75">Nº Empleados</span>
                    </div>
                    <p className="mt-1 font-bold text-[var(--brand-primary)]">
                      {company.employees}
                    </p>
                  </div>
                )}
              </div>
            )}
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
            {isLoggedIn && !isOwner && !isAdmin && hasBuyerTeaser && company.buyerTeaserUrl && (
              <div className="mt-6 pt-6 border-t border-[var(--brand-primary)]/10">
                <h3 className="text-sm font-semibold text-[var(--brand-primary)] opacity-90 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Documento / teaser
                </h3>
                <p className="mt-1 text-xs text-[var(--foreground)] opacity-70">
                  Tu solicitud de información está validada. Solo tienes acceso a este documento.
                </p>
                <a
                  href={company.buyerTeaserUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-[var(--brand-primary)] hover:underline font-medium"
                >
                  Descargar documento / teaser
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
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
            ) : !canSeeDocuments ? (
              <p className="mt-4 text-[var(--foreground)] opacity-80">
                La subida de archivos en la web es solo para el vendedor y el equipo Diligenz. Si
                solicitaste información y está validada, el documento / teaser está en la pestaña
                Descripción.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
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
                    Aún no hay documentos subidos. Sube memorias, cuentas anuales o otros archivos para que el equipo pueda revisarlos.
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
            )}
          </section>
        )}
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
