"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
import type { CompanyMock } from "@/lib/mock-companies";
import { getDefaultCompanyImageUrl } from "@/lib/default-company-images";
import { authFetch } from "@/lib/auth-client";

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

function formatSalePriceRange(
  min: number | null | undefined,
  max: number | null | undefined
): string | null {
  if (min == null && max == null) return null;
  const fmt = (n: number) => n.toLocaleString("es-ES");
  if (min != null && max != null) {
    if (min === max) return `${fmt(min)} €`;
    return `${fmt(min)} – ${fmt(max)} €`;
  }
  const n = min ?? max!;
  return `${fmt(n)} €`;
}

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
  const [activeTab, setActiveTab] = useState<TabId>("informacion");
  const [requestInfo, setRequestInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<CompanyFileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const attachmentsApproved = Boolean(company.attachmentsApproved);
  const canSeeDocuments = isOwner || isAdmin || (isLoggedIn && attachmentsApproved);
  /** Enlaces a Drive / carpeta: solo propietario de la empresa y administradores */
  const canSeeDriveLinks = isOwner || isAdmin;

  useEffect(() => {
    if (!isLoggedIn) return;
    authFetch(`/api/companies/${company.id}/interest`)
      .then((r) => r.json())
      .then((d) => {
        setRequestInfo(d.requestInfo ?? false);
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
    try {
      const res = await authFetch(`/api/companies/${company.id}/interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "REQUEST_INFO" }),
      });
      if (res.ok) setRequestInfo(true);
    } finally {
      setLoading(false);
    }
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

  const defaultHero = getDefaultCompanyImageUrl(company);
  const heroSrc = company.heroImageSrc ?? defaultHero;
  const salePriceLabel = formatSalePriceRange(company.valuationSaleMin, company.valuationSaleMax);

  return (
    <>
      {/* Hero tipo Urbanitae: imagen + título + ubicación + panel lateral */}
      <div className="mt-6 rounded-2xl border border-[var(--brand-primary)]/15 bg-[var(--brand-bg)] overflow-hidden shadow-sm">
        <div className="relative w-full aspect-[21/9] min-h-[180px] bg-[var(--brand-bg-lavender)]">
          <Image
            src={heroSrc}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 900px"
            unoptimized={Boolean(company.heroImageSrc) || heroSrc.includes("unsplash.com")}
          />
        </div>
        {company.galleryImageSrcs && company.galleryImageSrcs.length > 0 && (
          <div className="flex gap-2 overflow-x-auto border-t border-[var(--brand-primary)]/10 bg-[var(--foreground)]/5 px-3 py-2">
            {company.galleryImageSrcs.map((src) => (
              <div
                key={src}
                className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg border border-[var(--brand-primary)]/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
        <div className="grid md:grid-cols-[1fr,280px] gap-0">
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-[var(--brand-primary)]/10 px-3 py-1 text-sm font-semibold text-[var(--brand-primary)]">
                {company.sector}
              </span>
              <span className="rounded-lg bg-[var(--brand-bg-lavender)] px-3 py-1 text-xs font-medium text-[var(--foreground)] opacity-80">
                Confidencial
              </span>
            </div>
            <h1 className="mt-4 text-2xl md:text-3xl font-bold text-[var(--foreground)]">
              {company.name}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-[var(--foreground)] opacity-80">
              <MapPin className="w-4 h-4 text-[var(--brand-primary)]/70" />
              {company.location}
            </p>
          </div>
          <div className="bg-[var(--foreground)]/5 border-t md:border-t-0 md:border-l border-[var(--brand-primary)]/10 p-6 flex flex-col justify-between gap-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-[var(--foreground)] opacity-70">
                  Facturación anual €
                </p>
                <p className="text-lg font-bold text-[var(--brand-primary)]">
                  {company.gmv ?? company.revenue}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--foreground)] opacity-70">
                  EBITDA
                </p>
                <p className="text-lg font-bold text-[var(--brand-primary)]">
                  {company.ebitda}
                </p>
              </div>
              {company.exerciseResult ? (
                <div>
                  <p className="text-xs text-[var(--foreground)] opacity-70">
                    Resultado del ejercicio
                  </p>
                  <p className="text-lg font-bold text-[var(--brand-primary)]">
                    {company.exerciseResult}
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
                  <span className="inline-flex items-center justify-center rounded-xl bg-[var(--brand-primary)]/15 px-4 py-3 text-sm font-medium text-[var(--brand-primary)]">
                    De mi interés
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestInfo}
                    disabled={loading}
                    className="w-full rounded-xl bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {loading ? "Enviando…" : "¿Estás interesado?"}
                  </button>
                )}
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
                    {company.gmv ?? company.revenue}
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--brand-bg-lavender)]/60 p-4">
                  <span className="text-xs font-medium opacity-75">EBITDA</span>
                  <p className="mt-1 font-bold text-[var(--brand-primary)]">
                    {company.ebitda}
                  </p>
                </div>
                {company.exerciseResult ? (
                  <div className="rounded-xl bg-[var(--brand-bg-lavender)]/60 p-4">
                    <span className="text-xs font-medium opacity-75">Resultado del ejercicio</span>
                    <p className="mt-1 font-bold text-[var(--brand-primary)]">
                      {company.exerciseResult}
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
              canSeeDriveLinks &&
              company.documentLinks &&
              company.documentLinks.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[var(--brand-primary)]/10">
                  <h3 className="text-sm font-semibold text-[var(--brand-primary)] opacity-90 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Archivos en Google Drive
                  </h3>
                  <p className="mt-1 text-xs text-[var(--foreground)] opacity-70">
                    Solo el vendedor titular de esta ficha y los administradores de Diligenz pueden ver estos enlaces.
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
            ) : !canSeeDocuments ? (
              <p className="mt-4 text-[var(--foreground)] opacity-80">
                Los documentos, enlaces y fotos solo son visibles cuando el administrador lo permita para esta empresa.
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
    </>
  );
}
