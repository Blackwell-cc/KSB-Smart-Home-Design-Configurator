import { createHash } from "node:crypto";

export type RateLimitDecision = Readonly<{
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}>;

export type RateLimiter = Readonly<{
  consume(key: string): RateLimitDecision;
}>;

type Bucket = { count: number; resetAt: number };

export function createFixedWindowRateLimiter({
  limit,
  windowMs,
  now = Date.now,
  maxBuckets = 10_000,
}: {
  limit: number;
  windowMs: number;
  now?: () => number;
  maxBuckets?: number;
}): RateLimiter {
  if (!Number.isInteger(limit) || limit < 1) throw new Error("RATE_LIMIT_INVALID");
  if (!Number.isInteger(windowMs) || windowMs < 1_000) throw new Error("RATE_WINDOW_INVALID");
  if (!Number.isInteger(maxBuckets) || maxBuckets < 1) throw new Error("RATE_BUCKET_LIMIT_INVALID");

  const buckets = new Map<string, Bucket>();
  return {
    consume(key) {
      const currentTime = now();
      let bucket = buckets.get(key);
      if (!bucket || currentTime >= bucket.resetAt) {
        if (!bucket && buckets.size >= maxBuckets) {
          for (const [candidate, value] of buckets) {
            if (currentTime >= value.resetAt) buckets.delete(candidate);
          }
          if (buckets.size >= maxBuckets) buckets.delete(buckets.keys().next().value as string);
        }
        bucket = { count: 0, resetAt: currentTime + windowMs };
        buckets.set(key, bucket);
      }

      if (bucket.count >= limit) {
        return Object.freeze({ allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - currentTime) / 1_000)) });
      }

      bucket.count += 1;
      return Object.freeze({ allowed: true, remaining: Math.max(0, limit - bucket.count), retryAfterSeconds: 0 });
    },
  };
}

export function fingerprintRequest(request: Request, secret: string): string {
  const forwarded = request.headers.get("x-vercel-forwarded-for")
    ?? request.headers.get("x-forwarded-for")
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
  const clientAddress = forwarded.split(",", 1)[0]?.trim() || "unknown";
  return createHash("sha256").update(secret).update("\0").update(clientAddress).digest("hex");
}
