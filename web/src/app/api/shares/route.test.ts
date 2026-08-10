import { expect, test, vi } from "vitest";
import { createSharePostHandler } from "./route";

const projectId = "11111111-1111-4111-8111-111111111111";
const source = { id: projectId, conceptAssetId: "contemporary-warm-luxury", styleLabel: "Contemporary Warm Luxury", floors: 2, bedrooms: 3, bathrooms: 3, parkingSpaces: 2, usableAreaM2: 164 };
const request = (body: unknown, headers: Record<string, string> = { "content-type": "application/json", origin: "https://ksb.test" }) => new Request("https://ksb.test/api/shares", { method: "POST", headers, body: typeof body === "string" ? body : JSON.stringify(body) });

test("creates a public share only after same-origin private-project authorization", async () => {
  const authorizeAndLoad = vi.fn().mockResolvedValue(source);
  const createShare = vi.fn().mockResolvedValue({ ...source, slug: "public-example-7f3k" });
  const response = await createSharePostHandler({ authorizeAndLoad, createShare })(request({ projectId }));

  expect(response.status).toBe(201);
  expect(await response.json()).toEqual({ slug: "public-example-7f3k", shareUrl: "/share/public-example-7f3k" });
  expect(authorizeAndLoad).toHaveBeenCalledWith(expect.any(Request), projectId);
  expect(createShare).toHaveBeenCalledWith(source);
});

test("fails closed for cross-site, malformed, and oversized requests", async () => {
  const authorizeAndLoad = vi.fn(); const createShare = vi.fn(); const handler = createSharePostHandler({ authorizeAndLoad, createShare });
  const crossSite = await handler(request({ projectId }, { "content-type": "application/json", origin: "https://attacker.test" }));
  const malformed = await handler(request({ projectId: "not-a-project" }));
  const oversized = await handler(request("x".repeat(5_000)));

  expect(crossSite.status).toBe(403); expect(malformed.status).toBe(400); expect(oversized.status).toBe(413);
  expect(authorizeAndLoad).not.toHaveBeenCalled(); expect(createShare).not.toHaveBeenCalled();
});

test("returns one generic error without leaking private source data", async () => {
  const handler = createSharePostHandler({ authorizeAndLoad: vi.fn().mockRejectedValue(new Error("private-token")), createShare: vi.fn() });
  const response = await handler(request({ projectId }));
  expect(response.status).toBe(404);
  expect(await response.json()).toEqual({ error: { code: "PUBLIC_SHARE_UNAVAILABLE" } });
});
