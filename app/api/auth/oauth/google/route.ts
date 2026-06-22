import { signIn } from "@/auth";

/** Inicia OAuth con Google (POST interno; Auth.js v5 no admite GET /signin/google). */
export async function GET() {
  await signIn("google");
}
