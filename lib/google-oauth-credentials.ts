/**
 * Credenciales del cliente OAuth de Google (login + Drive).
 * Misma resolución que auth.ts para evitar invalid_client en producción.
 */
export function getGoogleOAuthClientId(): string | undefined {
  return (
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    process.env.AUTH_GOOGLE_ID?.trim() ||
    undefined
  );
}

export function getGoogleOAuthClientSecret(): string | undefined {
  return (
    process.env.GOOGLE_CLIENT_SECRET?.trim() ||
    process.env.AUTH_GOOGLE_SECRET?.trim() ||
    undefined
  );
}

export function getGoogleOAuthCredentials() {
  const clientId = getGoogleOAuthClientId();
  const clientSecret = getGoogleOAuthClientSecret();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}
