/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Uses a sliding window approach — no Redis/external service required.
 * Resets on server cold-start (acceptable for serverless — per-instance protection).
 */

interface RateLimitEntry {
  count: number;
  firstRequest: number;
}

// Store: key → { count, firstRequest timestamp }
const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.firstRequest > 60 * 60 * 1000) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limit a request by IP.
 * @param ip - The client IP address (from headers)
 * @param action - Identifier for the action (e.g. "login", "contact")
 * @param maxRequests - Max allowed requests per window
 * @param windowSeconds - Time window in seconds
 * @returns { allowed: boolean, remaining: number, resetInSeconds: number }
 */
export function rateLimit(
  ip: string,
  action: string,
  maxRequests: number,
  windowSeconds: number
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const key = `${action}:${ip}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const entry = store.get(key);

  if (!entry || now - entry.firstRequest > windowMs) {
    // First request or window expired — reset
    store.set(key, { count: 1, firstRequest: now });
    return { allowed: true, remaining: maxRequests - 1, resetInSeconds: windowSeconds };
  }

  if (entry.count >= maxRequests) {
    const resetInSeconds = Math.ceil((entry.firstRequest + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  entry.count++;
  store.set(key, entry);
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetInSeconds: Math.ceil((entry.firstRequest + windowMs - now) / 1000),
  };
}

/**
 * Extract client IP from Next.js request headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown";
}
