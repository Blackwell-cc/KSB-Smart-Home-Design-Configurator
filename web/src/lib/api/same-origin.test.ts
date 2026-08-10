import { expect, test } from "vitest";
import { isSameOriginRequest } from "./same-origin";

test("accepts the browser-facing Host when an application server canonicalizes request.url", () => {
  const request = new Request("http://localhost:3000/api/reports/exchange", {
    headers: { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000" },
  });
  expect(isSameOriginRequest(request)).toBe(true);
});

test("accepts an explicit forwarded public origin and rejects unrelated or malformed origins", () => {
  const forwarded = new Request("http://internal:3000/api/shares", {
    headers: { host: "internal:3000", origin: "https://design.ksb.co.th", "x-forwarded-host": "design.ksb.co.th", "x-forwarded-proto": "https" },
  });
  const hostile = new Request("https://design.ksb.co.th/api/shares", { headers: { host: "design.ksb.co.th", origin: "https://evil.example" } });
  const malformed = new Request("https://design.ksb.co.th/api/shares", { headers: { host: "design.ksb.co.th", origin: "not-a-url" } });

  expect(isSameOriginRequest(forwarded)).toBe(true);
  expect(isSameOriginRequest(hostile)).toBe(false);
  expect(isSameOriginRequest(malformed)).toBe(false);
});
