import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const DRIVE_OAUTH_SETUP_COOKIE = "drive_oauth_setup";

export function upsertEnvLocal(key: string, value: string) {
  const envPath = join(process.cwd(), ".env.local");
  let content = "";
  try {
    content = readFileSync(envPath, "utf8");
  } catch {
    content = "";
  }

  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const line = `${key}="${escaped}"`;
  const regex = new RegExp(`^${key}=.*$`, "m");

  if (regex.test(content)) {
    content = content.replace(regex, line);
  } else {
    if (content && !content.endsWith("\n")) content += "\n";
    content += `\n# Google Drive OAuth — cuenta dueña de carpeta CLIENTES (prioriza sobre service account)\n${line}\n`;
  }

  writeFileSync(envPath, content, "utf8");
}
