import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;
const _limiters = new Map<string, Ratelimit>();

function getRedisClient(): Redis | null {
  if (_redis !== null) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

function getLimiter(redis: Redis, name: string, requests: number, window: Duration): Ratelimit {
  const cached = _limiters.get(name);
  if (cached) return cached;
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `sustech:rl:${name}`,
  });
  _limiters.set(name, limiter);
  return limiter;
}

/**
 * Returns true if the given IP should be blocked (rate limited).
 * Falls back to allowing the request if Redis is not configured or unreachable.
 */
export async function isRateLimited(
  ip: string,
  name: string,
  requests: number,
  window: Duration,
): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) return false;
  try {
    const { success } = await getLimiter(redis, name, requests, window).limit(ip);
    return !success;
  } catch (err) {
    console.warn("[rate-limit] Redis unreachable, allowing request:", err);
    return false;
  }
}
