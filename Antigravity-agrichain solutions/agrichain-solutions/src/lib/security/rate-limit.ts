type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function purgeExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

setInterval(() => purgeExpired(Date.now()), 60_000).unref?.();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

export function rateLimit(key: string, limit = 30, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { ok: true, remaining: Math.max(0, limit - bucket.count), resetAt: bucket.resetAt };
}

export function combinedRateLimit(
  ip: string | null,
  userId: string | null,
  prefix: string,
  limit = 30,
  windowMs = 60_000
): RateLimitResult {
  const ipKey = ip ? `${prefix}:ip:${ip}` : `${prefix}:ip:unknown`;
  const userKey = userId ? `${prefix}:user:${userId}` : null;

  const ipResult = rateLimit(ipKey, limit, windowMs);
  if (!ipResult.ok) return ipResult;

  if (userKey) {
    return rateLimit(userKey, limit, windowMs);
  }
  return ipResult;
}

export function requestIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "local"
  );
}
