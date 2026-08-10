import { NextRequest } from "next/server";
import { expect, test, vi } from "vitest";
import { createPrivateAccessExchangeHandler } from "./route";

const request = (body: unknown, headers: Record<string, string> = { "content-type": "application/json", origin: "https://ksb.test" }) => new NextRequest("https://ksb.test/api/reports/exchange", { method: "POST", headers, body: typeof body === "string" ? body : JSON.stringify(body) });

test("exchanges a fragment token for a strict HttpOnly server session", async () => {
  const resolve = vi.fn().mockResolvedValue({ access: { projectId: "11111111-1111-4111-8111-111111111111", tokenHash: "a".repeat(64), expiresAt: new Date("2026-08-10T00:10:00.000Z") } });
  const response = await createPrivateAccessExchangeHandler({ resolve, secret: "s".repeat(32), now: () => new Date("2026-08-10T00:00:00.000Z") })(request({ projectId: "11111111-1111-4111-8111-111111111111", token: "private-token-12345678901234567890" }));

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ projectId: "11111111-1111-4111-8111-111111111111" });
  expect(response.headers.get("set-cookie")).toMatch(/HttpOnly; Path=\/; Secure; SameSite=Strict/i);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(response.headers.get("set-cookie")).not.toContain("private-token");
});

test("rejects invalid content, oversized payloads, and invalid links without leaking data", async () => {
  const handler = createPrivateAccessExchangeHandler({ resolve: vi.fn().mockRejectedValue(new Error("anything")), secret: "s".repeat(32), now: () => new Date() });
  const wrongType = await handler(request({}, { "content-type": "text/plain", origin: "https://ksb.test" }));
  const invalid = await handler(request({ projectId: "not-a-uuid", token: "x" }));
  const tooLarge = await handler(request("x".repeat(5_000)));

  expect(wrongType.status).toBe(415);
  await expect(invalid.json()).resolves.toEqual({ error: { code: "PROJECT_LINK_INVALID" } });
  expect(tooLarge.status).toBe(413);
});

test("fails closed when the exchange Origin is absent or cross-site", async () => {
  const handler = createPrivateAccessExchangeHandler({ resolve: vi.fn(), secret: "s".repeat(32), now: () => new Date() });
  expect((await handler(request({ projectId: "11111111-1111-4111-8111-111111111111", token: "private-token-12345678901234567890" }, { "content-type": "application/json" }))).status).toBe(403);
  expect((await handler(request({ projectId: "11111111-1111-4111-8111-111111111111", token: "private-token-12345678901234567890" }, { "content-type": "application/json", origin: "https://attacker.test" }))).status).toBe(403);
});
