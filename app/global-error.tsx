"use client";

import { AlertCircle, RefreshCw, Mail } from "lucide-react";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          backgroundColor: "#F3F0E6",
          color: "#2F265D",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
        }}
      >
        <div style={{ maxWidth: "28rem", width: "100%", textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" style={{ display: "inline-block", marginBottom: "2rem" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-diligenz-completo.png"
              alt="Diligenz"
              width={180}
              height={48}
              style={{ height: 48, width: "auto", objectFit: "contain" }}
            />
          </a>

          <div
            style={{
              borderRadius: "1rem",
              border: "1px solid rgba(106, 90, 205, 0.2)",
              backgroundColor: "#F3F0E6",
              padding: "2rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              <span
                style={{
                  borderRadius: "9999px",
                  backgroundColor: "rgba(106, 90, 205, 0.1)",
                  padding: "0.75rem",
                }}
              >
                <AlertCircle
                  style={{ width: 40, height: 40, color: "#6A5ACD" }}
                  aria-hidden
                />
              </span>
            </div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#6A5ACD", margin: 0 }}>
              Ups, ha habido un problema
            </h1>
            <p
              style={{
                marginTop: "0.75rem",
                color: "rgba(26,26,26,0.9)",
                fontSize: "0.875rem",
                lineHeight: 1.6,
              }}
            >
              Sentimos mucho las molestias. Algo no ha ido como esperábamos.
            </p>

            <div
              style={{
                marginTop: "1.5rem",
                textAlign: "left",
                borderRadius: "0.75rem",
                backgroundColor: "rgba(217, 208, 243, 0.6)",
                border: "1px solid rgba(106, 90, 205, 0.1)",
                padding: "1rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#6A5ACD",
                  margin: "0 0 0.5rem 0",
                }}
              >
                Prueba antes de contactar:
              </p>
              <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.875rem", lineHeight: 1.8 }}>
                <li>Recarga la página (F5 o el botón de actualizar del navegador).</li>
                <li>Sal de la sesión, vuelve a entrar o intenta en otra pestaña.</li>
              </ul>
            </div>

            <p
              style={{
                marginTop: "1.25rem",
                fontSize: "0.875rem",
                color: "rgba(26,26,26,0.8)",
              }}
            >
              Si el problema persiste, ponte en contacto con nosotros y te atenderemos lo antes posible.
            </p>

            <div
              style={{
                marginTop: "1.5rem",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                justifyContent: "center",
              }}
            >
              <a
                href="/contact"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "#6A5ACD",
                  padding: "0.75rem 1.25rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "white",
                  textDecoration: "none",
                }}
              >
                <Mail style={{ width: 16, height: 16 }} />
                Contactar con nosotros
              </a>
              <button
                type="button"
                onClick={() => reset()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  borderRadius: "0.75rem",
                  border: "2px solid rgba(106, 90, 205, 0.4)",
                  padding: "0.75rem 1.25rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#6A5ACD",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                }}
              >
                <RefreshCw style={{ width: 16, height: 16 }} />
                Reintentar
              </button>
            </div>

            <p style={{ marginTop: "1.5rem" }}>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" style={{ fontSize: "0.875rem", color: "#6A5ACD", textDecoration: "underline" }}>
                ← Volver al inicio
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
