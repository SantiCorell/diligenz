/**
 * Cliente: gestión del token de sesión en localStorage y sincronización con cookie
 * para que middleware y Server Components sigan validando la sesión.
 */

const STORAGE_KEY = "session";
const COOKIE_NAME = "session";
const COOKIE_MAX_AGE_SEC = 60 * 30; // 30 min, igual que servidor

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, token);
  syncSessionCookie(token);
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Sincroniza el token de localStorage a una cookie para que las peticiones
 * de navegación (middleware, Server Components) reciban la sesión.
 */
export function syncSessionCookie(token?: string | null): void {
  if (typeof document === "undefined") return;
  const t = token ?? getStoredToken();
  if (t) {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(t)}; path=/; max-age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax`;
  } else {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

/** Headers para fetch autenticado (Authorization + cookie sync). */
export function authHeaders(extra: HeadersInit = {}): HeadersInit {
  const token = getStoredToken();
  const headers: Record<string, string> = { ...(extra as Record<string, string>) };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/** fetch con token en Authorization (y credentials para enviar cookie si existe). */
export function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, {
    ...init,
    credentials: init?.credentials ?? "include",
    headers,
  });
}
