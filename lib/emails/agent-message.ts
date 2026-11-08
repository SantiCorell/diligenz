import type { UserRole } from "@prisma/client";
import { ADMIN_ROLE_LABELS } from "@/lib/user-admin-ui";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type AgentMessageProfile = {
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  ndaSigned: boolean;
  dniVerified: boolean;
  profileComplete: boolean;
};

function profileLines(profile: AgentMessageProfile): string[] {
  return [
    `Nombre: ${profile.name}`,
    `Email: ${profile.email}`,
    `Teléfono: ${profile.phone?.trim() || "—"}`,
    `Perfil: ${ADMIN_ROLE_LABELS[profile.role]}`,
    `Mandato o NDA firmado: ${profile.ndaSigned ? "sí" : "no"}`,
    `DNI verificado: ${profile.dniVerified ? "sí" : "no"}`,
    `Perfil completo: ${profile.profileComplete ? "sí" : "no"}`,
  ];
}

export function buildAgentMessageEmail(opts: {
  agentName: string;
  profile: AgentMessageProfile;
  message: string;
}): { subject: string; text: string; html: string } {
  const role = ADMIN_ROLE_LABELS[opts.profile.role];
  const subject = `Mensaje de ${opts.profile.name} (${role})`;
  const lines = profileLines(opts.profile);
  const text = [
    `Hola ${opts.agentName},`,
    "",
    `${opts.profile.name} te ha escrito desde su panel de Diligenz.`,
    "",
    ...lines,
    "",
    "Mensaje:",
    opts.message.trim(),
    "",
    "Puedes responder a este correo y le llegará directamente al usuario.",
  ].join("\n");

  const html = `<p>Hola ${escapeHtml(opts.agentName)},</p>
<p><strong>${escapeHtml(opts.profile.name)}</strong> te ha escrito desde su panel de Diligenz.</p>
<ul>
${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("\n")}
</ul>
<p><strong>Mensaje</strong></p>
<p>${escapeHtml(opts.message.trim()).replace(/\n/g, "<br>")}</p>
<p>Puedes responder a este correo y le llegará directamente al usuario.</p>`;

  return { subject, text, html };
}
