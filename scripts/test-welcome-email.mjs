/**
 * Prueba el correo de bienvenida (plantilla oficial). Uso: npm run email:test:welcome
 * Opcional: TEST_EMAIL_TO=tu@email.com npm run email:test:welcome
 */
import { execSync } from "node:child_process";

const to = process.env.TEST_EMAIL_TO ? `process.env.TEST_EMAIL_TO='${process.env.TEST_EMAIL_TO}';` : "";

execSync(
  `npx --yes tsx -e "${to}import { sendWelcomeEmail } from './lib/emails/welcome.ts'; sendWelcomeEmail({ to: process.env.TEST_EMAIL_TO || process.env.SMTP_USER, name: 'Prueba', role: 'BUYER' }).then(() => console.log('✓ Bienvenida enviada')).catch((e) => { console.error(e); process.exit(1); });"`,
  { stdio: "inherit", cwd: process.cwd(), env: process.env }
);
