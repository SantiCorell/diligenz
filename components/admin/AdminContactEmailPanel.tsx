"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mail, Phone, Send } from "lucide-react";
import { authFetch } from "@/lib/auth-client";
import {
  ADMIN_EMAIL_TEMPLATE_IDS,
  ADMIN_EMAIL_TEMPLATE_LABELS,
  isAdminEmailTemplateEditable,
  type AdminEmailTemplateId,
} from "@/lib/emails/admin-outreach-templates";

type Props = {
  email: string;
  name?: string | null;
  phone?: string | null;
  /** Plantilla por defecto al abrir */
  defaultTemplate?: AdminEmailTemplateId;
  className?: string;
};

export default function AdminContactEmailPanel({
  email,
  name,
  phone,
  defaultTemplate = "recontacto_sin_respuesta",
  className = "",
}: Props) {
  const [template, setTemplate] = useState<AdminEmailTemplateId>(defaultTemplate);
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [htmlPreview, setHtmlPreview] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const skipNextDebounce = useRef(false);
  const isFreeEmail = isAdminEmailTemplateEditable(template);

  const loadPreview = useCallback(
    async (opts?: { subject?: string; bodyText?: string }) => {
      if (!email.trim()) return;
      setLoadingPreview(true);
      setMessage(null);
      try {
        let freeSubject = subject;
        let freeBody = bodyText;
        if (isFreeEmail) {
          freeSubject = (opts?.subject ?? subject).trim();
          freeBody = (opts?.bodyText ?? bodyText).trim();
          setSubject(freeSubject);
          setBodyText(freeBody);
          if (!freeSubject || !freeBody) {
            setHtmlPreview("");
            return;
          }
        }

        const p = new URLSearchParams({
          template,
          email: email.trim(),
        });
        if (name?.trim()) p.set("name", name.trim());
        if (isFreeEmail) {
          p.set("subject", freeSubject);
          p.set("bodyText", freeBody);
        }

        const res = await authFetch(`/api/admin/email/preview?${p.toString()}`);
        const data = await res.json();
        if (!res.ok) {
          setMessage({ type: "err", text: data.error ?? "No se pudo cargar la vista previa." });
          return;
        }
        setSubject(data.subject ?? "");
        if (isFreeEmail) setBodyText(data.bodyText ?? "");
        setHtmlPreview(data.html ?? "");
      } finally {
        setLoadingPreview(false);
      }
    },
    [email, name, template, subject, bodyText, isFreeEmail]
  );

  useEffect(() => {
    if (showComposer) {
      skipNextDebounce.current = true;
      if (isFreeEmail) {
        setSubject("");
        setBodyText("");
        void loadPreview({ subject: "", bodyText: "" });
      } else {
        void loadPreview();
      }
    }
  }, [showComposer, template, email, name]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!showComposer || !isFreeEmail || skipNextDebounce.current) {
      skipNextDebounce.current = false;
      return;
    }
    const t = setTimeout(() => {
      void loadPreview();
    }, 450);
    return () => clearTimeout(t);
  }, [subject, bodyText, showComposer, loadPreview, isFreeEmail]);

  const handleSend = async () => {
    setSending(true);
    setMessage(null);
    try {
      const res = await authFetch("/api/admin/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email.trim(),
          name: name?.trim() || undefined,
          template,
          ...(isFreeEmail
            ? { subject: subject.trim(), bodyText: bodyText.trim() }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "No se pudo enviar." });
        return;
      }
      setMessage({ type: "ok", text: `Correo enviado a ${email}` });
      if (isFreeEmail) {
        setSubject("");
        setBodyText("");
      }
    } finally {
      setSending(false);
    }
  };

  const phoneDigits = phone?.replace(/\s/g, "") ?? "";
  const canSend = isFreeEmail ? subject.trim() && bodyText.trim() : Boolean(htmlPreview);

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {phoneDigits ? (
          <a
            href={`tel:${phoneDigits}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition"
          >
            <Phone className="w-3.5 h-3.5" />
            Llamar
          </a>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-400"
            title="Sin teléfono registrado"
          >
            <Phone className="w-3.5 h-3.5" />
            Sin teléfono
          </span>
        )}
        <button
          type="button"
          onClick={() => setShowComposer((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-xs font-semibold text-white hover:opacity-95 transition"
        >
          <Mail className="w-3.5 h-3.5" />
          {showComposer ? "Ocultar email" : "Enviar email"}
        </button>
      </div>

      {showComposer && (
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Plantilla de correo
            </label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as AdminEmailTemplateId)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/15"
            >
              {ADMIN_EMAIL_TEMPLATE_IDS.map((id) => (
                <option key={id} value={id}>
                  {ADMIN_EMAIL_TEMPLATE_LABELS[id]}
                </option>
              ))}
            </select>
            {!isFreeEmail && subject && (
              <p className="mt-2 text-xs text-slate-500">
                Asunto: <span className="font-medium text-slate-700">{subject}</span>
              </p>
            )}
          </div>

          {isFreeEmail && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Asunto</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/15"
                  placeholder="Escribe el asunto del correo"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mensaje</label>
                <textarea
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  rows={7}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-relaxed focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/15 resize-y min-h-[140px]"
                  placeholder="Escribe el cuerpo del correo. Separa párrafos con una línea en blanco."
                />
                <p className="mt-1.5 text-[11px] text-slate-500">
                  El diseño Diligenz se aplica automáticamente. Separa párrafos con una línea en
                  blanco.
                </p>
              </div>
            </>
          )}

          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="text-xs font-semibold text-slate-600">Vista previa</label>
              <button
                type="button"
                onClick={() => void loadPreview()}
                disabled={loadingPreview}
                className="text-xs font-medium text-[var(--brand-primary)] hover:underline disabled:opacity-50"
              >
                {loadingPreview ? "Actualizando…" : "Actualizar ahora"}
              </button>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-inner">
              {loadingPreview ? (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando vista previa…
                </div>
              ) : htmlPreview ? (
                <iframe
                  title="Vista previa del email"
                  srcDoc={htmlPreview}
                  className="w-full min-h-[360px] max-h-[520px] bg-white"
                  sandbox=""
                />
              ) : (
                <p className="p-6 text-sm text-slate-500 text-center">
                  {isFreeEmail
                    ? "Escribe asunto y mensaje para ver la vista previa."
                    : "Selecciona una plantilla para ver el borrador."}
                </p>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">
              Destinatario: <strong>{email}</strong>
              {name?.trim() ? ` · ${name.trim()}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || loadingPreview || !canSend}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50 transition"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Enviar correo
            </button>
            {message && (
              <p
                className={`text-sm ${message.type === "ok" ? "text-emerald-700" : "text-red-700"}`}
              >
                {message.text}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
