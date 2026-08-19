/**
 * Simple sliding window rate limiter for server actions & sensitive endpoints
 */

interface RateLimitTracker {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitTracker>();

// Cleanup stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((tracker, key) => {
    if (now > tracker.resetAt) {
      rateLimitStore.delete(key);
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Enforce rate limit per identifier (user ID or action key)
 * @param identifier Unique key (e.g., "user_123:create_task")
 * @param limit Max requests permitted within window
 * @param windowMs Time window in milliseconds (default: 60,000ms = 1 min)
 */
export function checkRateLimit(
  identifier: string,
  limit = 30,
  windowMs = 60000
): RateLimitResult {
  const now = Date.now();
  const tracker = rateLimitStore.get(identifier);

  if (!tracker || now > tracker.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (tracker.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetInSeconds: Math.ceil((tracker.resetAt - now) / 1000),
    };
  }

  tracker.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - tracker.count,
    resetInSeconds: Math.ceil((tracker.resetAt - now) / 1000),
  };
}
