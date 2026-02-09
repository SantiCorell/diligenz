import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// Código por defecto: lolipop123.dili!.
const BETA_PASSWORD_HASH =
  process.env.BETA_ACCESS_HASH ||
  "$2b$10$pyTNh3tLhyIy5qRKqW1bw.9rLVUcm3ZhgkFJk4zQ1rCnRBtX5J27C";

const COOKIE_NAME = "beta_access";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Contraseña obligatoria" },
        { status: 400 }
      );
    }

    const ok = await bcrypt.compare(password.trim(), BETA_PASSWORD_HASH);
    if (!ok) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Error al comprobar la contraseña" },
      { status: 500 }
    );
  }
}
