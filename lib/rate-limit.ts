/**
 * Rate limiting simple en memoria
 * En producción, considera usar Redis o un servicio externo
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Limpia entradas expiradas cada 5 minutos
 */
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number; // ventana en milisegundos
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Verifica si una solicitud está dentro del límite de tasa
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  const entry = store[key];

  // Si no existe entrada o expiró, crear nueva
  if (!entry || entry.resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime: now + options.windowMs,
    };
  }

  // Si ya alcanzó el límite
  if (entry.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Incrementar contador
  entry.count++;
  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Obtiene identificador único para rate limiting
 * Prioriza IP, luego userId si está autenticado
 */
export function getRateLimitIdentifier(
  ip: string | null,
  userId?: string | null
): string {
  if (userId) {
    return `user:${userId}`;
  }
  return `ip:${ip || "unknown"}`;
}
