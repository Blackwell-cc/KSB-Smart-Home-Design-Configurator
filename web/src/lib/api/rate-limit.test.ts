import { describe, expect, test } from "vitest";
import { createFixedWindowRateLimiter, fingerprintRequest } from "./rate-limit";

describe("fixed-window API rate limiter", () => {
  test("allows requests up to the limit and returns a bounded retry delay", () => {
    let now = 1_000;
    const limiter = createFixedWindowRateLimiter({ limit: 2, windowMs: 10_000, now: () => now });

    expect(limiter.consume("lead:visitor")).toEqual({ allowed: true, remaining: 1, retryAfterSeconds: 0 });
    expect(limiter.consume("lead:visitor")).toEqual({ allowed: true, remaining: 0, retryAfterSeconds: 0 });
    expect(limiter.consume("lead:visitor")).toEqual({ allowed: false, remaining: 0, retryAfterSeconds: 10 });

    now = 11_001;
    expect(limiter.consume("lead:visitor")).toEqual({ allowed: true, remaining: 1, retryAfterSeconds: 0 });
  });

  test("isolates scopes and never retains a raw client address", () => {
    const request = new Request("https://ksb.test/api/leads", { headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" } });
    const first = fingerprintRequest(request, "secret-a");
    const second = fingerprintRequest(request, "secret-b");

    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).not.toContain("203.0.113.7");
    expect(second).not.toBe(first);
  });
});
