export const DILIGENZ_SL_FEE = "300 € + IVA";

export const SL_THIRD_PARTY = [
  { label: "Notaría", value: "60 € + IVA" },
  { label: "Copia de la escritura", value: "40,57 € + IVA" },
  { label: "Registro Mercantil", value: "40 € + IVA" },
  { label: "Certificación negativa", value: "27 €" },
] as const;

export const SL_STEPS = [
  "Formalizar el pago",
  "Datos y denominación",
  "Certificación negativa",
  "Tramitación de la constitución",
  "Cuenta bancaria",
  "Escritura notarial",
  "Registro Mercantil",
  "Cartera Sede Registradores",
  "Firma digital",
  "Titularidad real",
] as const;

export function isConstitucionRequest(subject: string | null, message: string | null) {
  const text = `${subject ?? ""} ${message ?? ""}`.toLowerCase();
  return text.includes("constituci");
}

export function isConstitucionService(title: string, summary?: string | null) {
  return isConstitucionRequest(title, summary ?? null);
}

export function servicioExpediente(id: string) {
  return `DIL-SRV-${id.slice(-4).toUpperCase()}`;
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}
