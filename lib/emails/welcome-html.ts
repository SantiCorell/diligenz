/** Plantilla de bienvenida (diseño Canva / Zoho Mail). Imágenes alojadas en Canva CDN. */
const CDN = "https://fjgivrfumqriuvc985j5h71nflsxcygq8lr-0ycrvoi.canva-cdn.email";

export const WELCOME_EMAIL_SUBJECT = "¡BIENVENIDO A DILIGENZ!";

export function buildWelcomeEmailHtml(baseUrl: string): string {
  const contactUrl = `${baseUrl}/contact`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${WELCOME_EMAIL_SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background:#f6f5f2;">
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;">
<tbody>
<tr><td style="padding:10px 0 0;vertical-align:top;">
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
<tbody>
<tr><td style="color:#171d2b;font-size:25px;text-align:center;padding:0 20px;line-height:1.3;">¿Quieres saber más sobre nosotros?</td></tr>
<tr><td height="16" style="font-size:0;height:16px;">&nbsp;</td></tr>
<tr><td style="padding:0 20px;text-align:center;">
<img src="${CDN}/e6d9980389c9d83fbc40ac4ba5b9de73.png" width="560" alt="Diligenz" style="display:block;width:100%;max-width:560px;height:auto;border:0;">
</td></tr>
<tr><td height="16" style="font-size:0;height:16px;">&nbsp;</td></tr>
<tr><td style="color:#171d2b;font-size:37px;text-align:center;padding:0 20px;line-height:1.1;">¿Estás pensando en comprar o vender una empresa?</td></tr>
<tr><td height="16" style="font-size:0;height:16px;">&nbsp;</td></tr>
<tr><td style="color:#0e1b10;font-size:19px;text-align:center;padding:0 20px;line-height:1.3;"><b>Nos alegra darte la bienvenida.</b> Diligenz ha sido creada para conectar empresarios e inversores en un entorno seguro, dinámico y confidencial.</td></tr>
<tr><td height="16" style="font-size:0;height:16px;">&nbsp;</td></tr>
<tr><td style="color:#0e1b10;font-size:19px;text-align:center;padding:0 20px;line-height:1.3;"><b>Diligenz</b> es una plataforma de M&amp;A que integra tecnología y datos para mejorar la calidad en los procesos de valoración y análisis de oportunidades.</td></tr>
<tr><td height="16" style="font-size:0;height:16px;">&nbsp;</td></tr>
<tr><td style="color:#0e1b10;font-size:19px;text-align:center;padding:0 20px;line-height:1.3;">Nuestra plataforma está diseñada para <b>optimizar</b> la identificación de oportunidades, reducir fricciones y aportar rigor en la <b>compraventa</b> de empresas.</td></tr>
<tr><td height="16" style="font-size:0;height:16px;">&nbsp;</td></tr>
<tr><td style="padding:0 20px;"><table width="100%"><tr><td style="height:1px;background:#bfc3c8;font-size:0;">&nbsp;</td></tr></table></td></tr>
<tr><td height="16" style="font-size:0;height:16px;">&nbsp;</td></tr>
<tr><td style="color:#171d2b;font-size:25px;text-align:center;padding:0 20px;">¿Qué puede ofrecerte Diligenz?</td></tr>
<tr><td height="16" style="font-size:0;height:16px;">&nbsp;</td></tr>
<tr><td style="padding:0 20px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#171d2b;border-radius:14px;">
<tr><td style="padding:24px 20px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="48%" valign="top" style="padding-right:10px;">
<img src="${CDN}/bc758581d390a9359c9cd71197b44182.png" width="47" alt="" style="display:block;width:47px;height:auto;">
<div style="height:12px;font-size:0;">&nbsp;</div>
<div style="color:#fff;font-family:Verdana,Geneva,sans-serif;font-size:16px;font-weight:bold;">Valora tu empresa en segundos</div>
<div style="height:12px;font-size:0;">&nbsp;</div>
<div style="color:#fff;font-family:Verdana,Geneva,sans-serif;font-size:13px;line-height:1.4;">Utiliza nuestra <b>herramienta de valoración</b> para obtener un precio orientativo de tu empresa en segundos. No lo pienses más y empieza ya a preparar tu venta.</div>
</td>
<td width="4%" style="font-size:0;">&nbsp;</td>
<td width="48%" valign="top" style="padding-left:10px;">
<img src="${CDN}/183a839a5fda5910a3a4cdc73d1727db.png" width="47" alt="" style="display:block;width:47px;height:auto;">
<div style="height:12px;font-size:0;">&nbsp;</div>
<div style="color:#fff;font-family:Verdana,Geneva,sans-serif;font-size:16px;font-weight:bold;">Localiza oportunidades de inversión</div>
<div style="height:12px;font-size:0;">&nbsp;</div>
<div style="color:#fff;font-family:Verdana,Geneva,sans-serif;font-size:13px;line-height:1.4;">En nuestra plataforma podrás encontrar la empresa que mejor se ajuste a tus necesidades. Filtra por sector, tamaño y rentabilidad, nosotros nos encargamos del resto.</div>
</td>
</tr></table>
</td></tr>
</table>
</td></tr>
<tr><td height="16" style="font-size:0;height:16px;">&nbsp;</td></tr>
<tr><td style="color:#171d2b;font-size:25px;text-align:center;padding:0 20px;">Servicios Profesionales</td></tr>
<tr><td height="16" style="font-size:0;height:16px;">&nbsp;</td></tr>
<tr><td style="padding:0 20px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="48%" valign="top"><img src="${CDN}/0d98bfb95baf0a90876e6f072dbc0dd9.png" width="216" alt="Vendedor" style="display:block;width:100%;max-width:216px;height:auto;"></td>
<td width="4%" style="font-size:0;">&nbsp;</td>
<td width="48%" valign="top" style="background:#fff;">
<div style="color:#171d2b;font-family:Verdana,Geneva,sans-serif;font-size:16px;font-weight:bold;padding:4px 0;">¿Eres Vendedor?</div>
<div style="height:12px;font-size:0;">&nbsp;</div>
<div style="color:#171d2b;font-family:Verdana,Geneva,sans-serif;font-size:13px;line-height:1.4;">Planifica tu venta con tiempo, una buena preparación previa es esencial para poder obtener el mejor resultado de la venta.</div>
</td>
</tr></table>
</td></tr>
<tr><td height="16" style="font-size:0;height:16px;">&nbsp;</td></tr>
<tr><td style="padding:0 20px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="48%" valign="top"><img src="${CDN}/16a1e2c06d41c1752f1486f6b55d435c.png" width="216" alt="Comprador" style="display:block;width:100%;max-width:216px;height:auto;"></td>
<td width="4%" style="font-size:0;">&nbsp;</td>
<td width="48%" valign="top" style="background:#fff;">
<div style="color:#171d2b;font-family:Verdana,Geneva,sans-serif;font-size:16px;font-weight:bold;padding:4px 0;">¿Eres Comprador?</div>
<div style="height:12px;font-size:0;">&nbsp;</div>
<div style="color:#171d2b;font-family:Verdana,Geneva,sans-serif;font-size:13px;line-height:1.4;">No afrontes un proceso de compra tú solo. Es fundamental contar con profesionales que te asesoren durante todo el proceso.</div>
</td>
</tr></table>
</td></tr>
<tr><td height="16" style="font-size:0;height:16px;">&nbsp;</td></tr>
<tr><td style="padding:0 20px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="48%" valign="top"><img src="${CDN}/e54bc96875e36a1b3de3b3a2ccc7fea0.png" width="216" alt="Profesional" style="display:block;width:100%;max-width:216px;height:auto;"></td>
<td width="4%" style="font-size:0;">&nbsp;</td>
<td width="48%" valign="top" style="background:#fff;">
<div style="color:#171d2b;font-family:Verdana,Geneva,sans-serif;font-size:16px;font-weight:bold;padding:4px 0;">¿Eres un Profesional?</div>
<div style="height:12px;font-size:0;">&nbsp;</div>
<div style="color:#171d2b;font-family:Verdana,Geneva,sans-serif;font-size:13px;line-height:1.4;">Te ofrecemos un equipo que te brindará la estructura y los medios necesarios para poder afrontar cualquier tipo de operación de M&amp;A.</div>
</td>
</tr></table>
</td></tr>
<tr><td height="16" style="font-size:0;height:16px;">&nbsp;</td></tr>
<tr><td style="padding:0 20px;"><table width="100%"><tr><td style="height:1px;background:#bfc3c8;font-size:0;">&nbsp;</td></tr></table></td></tr>
<tr><td height="16" style="font-size:0;height:16px;">&nbsp;</td></tr>
<tr><td style="color:#0e1b10;font-size:19px;text-align:center;padding:0 20px;line-height:1.3;">Nuestro equipo se pondrá en contacto contigo pronto para <b>completar tu registro</b>.</td></tr>
<tr><td height="16" style="font-size:0;height:16px;">&nbsp;</td></tr>
<tr><td style="text-align:center;padding:0 20px;">
<a href="${contactUrl}" style="display:inline-block;background:#8129fe;color:#ffffff;text-decoration:none;font-family:Verdana,Geneva,sans-serif;font-size:16px;font-weight:normal;padding:12px 28px;border-radius:100px;">PROGRAMA UNA LLAMADA</a>
</td></tr>
<tr><td height="16" style="font-size:0;height:16px;">&nbsp;</td></tr>
<tr><td style="color:#0e1b10;font-size:19px;text-align:center;padding:0 20px;line-height:1.3;">Si tienes cualquier duda puedes contestar directamente a este e-mail y estaremos encantado de atenderte.</td></tr>
</tbody></table>
</td></tr>
<tr><td style="background:#171d2b;padding:24px 20px;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:547px;margin:0 auto;">
<tr><td style="color:#bfc3c8;font-family:Verdana,Geneva,sans-serif;font-size:13px;line-height:1.4;">
<a href="mailto:info@diligenz.es" style="color:#bfc3c8;text-decoration:none;">info@diligenz.es</a><br><br>
Calle Colon 39, 1º, Valencia. España<br>
<a href="${baseUrl}" style="color:#bfc3c8;text-decoration:none;">diligenz.es</a><br><br>
Puedes darte de baja respondiendo <u>baja</u> a este e-mail.
</td></tr>
</table>
</td></tr>
</tbody>
</table>
</body>
</html>`;
}

export function buildWelcomeEmailText(baseUrl: string): string {
  return `¿Estás pensando en comprar o vender una empresa?

Nos alegra darte la bienvenida. Diligenz ha sido creada para conectar empresarios e inversores en un entorno seguro, dinámico y confidencial.

Diligenz es una plataforma de M&A que integra tecnología y datos para mejorar la calidad en los procesos de valoración y análisis de oportunidades.

Nuestra plataforma está diseñada para optimizar la identificación de oportunidades, reducir fricciones y aportar rigor en la compraventa de empresas.

¿Qué puede ofrecerte Diligenz?

- Valora tu empresa en segundos
- Localiza oportunidades de inversión
- Servicios profesionales para vendedores, compradores y profesionales

Nuestro equipo se pondrá en contacto contigo pronto para completar tu registro.

Programa una llamada: ${baseUrl}/contact

Si tienes cualquier duda puedes contestar directamente a este e-mail.

info@diligenz.es
Calle Colon 39, 1º, Valencia. España
${baseUrl}`;
}
