import { expect, test, vi } from "vitest";
import { createPublishPriceBookPostHandler } from "./route";

const draft = { candidateId: "11111111-1111-4111-8111-111111111111", version: "TH-2026Q3-1.0" };
const admin = { userId: "22222222-2222-4222-8222-222222222222", email: "admin@ksb.test", roles: ["pricing-approver"] as const };
const request = (body: unknown, headers: Record<string, string> = { "content-type": "application/json", origin: "https://ksb.test" }) => new Request("https://ksb.test/api/admin/pricing/publish", { method: "POST", headers, body: typeof body === "string" ? body : JSON.stringify(body) });

test("authorizes a verified admin before publishing and returns no-cache status", async () => {
  const authorize = vi.fn().mockResolvedValue(admin); const publish = vi.fn().mockResolvedValue({ previousStatus: "retired", publishedStatus: "published" });
  const response = await createPublishPriceBookPostHandler({ authorize, publish })(request(draft));
  expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.json()).toEqual({ previousStatus: "retired", publishedStatus: "published" });
  expect(publish).toHaveBeenCalledWith(draft, admin);
});

test("fails closed before auth for cross-site or malformed requests", async () => {
  const authorize = vi.fn(); const publish = vi.fn(); const handler = createPublishPriceBookPostHandler({ authorize, publish });
  expect((await handler(request(draft, { "content-type": "application/json", origin: "https://attacker.test" }))).status).toBe(403);
  expect((await handler(request("{"))).status).toBe(400);
  expect(authorize).not.toHaveBeenCalled(); expect(publish).not.toHaveBeenCalled();
});

test("distinguishes forbidden admin sessions from a candidate that fails publish gates", async () => {
  const forbidden = createPublishPriceBookPostHandler({ authorize: vi.fn().mockRejectedValue(new Error("forbidden")), publish: vi.fn() });
  expect((await forbidden(request(draft))).status).toBe(403);

  const notReady = createPublishPriceBookPostHandler({ authorize: vi.fn().mockResolvedValue(admin), publish: vi.fn().mockRejectedValue(new Error("not ready")) });
  expect((await notReady(request(draft))).status).toBe(409);
});
