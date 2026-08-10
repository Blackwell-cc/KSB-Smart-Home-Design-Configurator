import { expect, test, vi } from "vitest";
import { trackEvent } from "./track-event";

const event = { name: "preview_viewed", properties: { sessionId: "session-1", projectId: "project-1", configuratorVersion: "0.1.0", pricingVersion: "TH-2026Q2-1.0", deviceClass: "mobile", timestamp: "2026-08-07T00:00:00.000Z" } };

test("sends a validated event through a vendor-neutral provider", async () => {
  const send = vi.fn().mockResolvedValue(undefined);
  await expect(trackEvent(event, { send })).resolves.toBe(true);
  expect(send).toHaveBeenCalledWith(expect.objectContaining({ name: "preview_viewed" }));
});

test("swallows provider failure and logs only a structured non-PII envelope", async () => {
  const warn = vi.fn();
  await expect(trackEvent(event, { send: vi.fn().mockRejectedValue(new Error("owner@example.test")) }, { warn })).resolves.toBe(false);
  expect(warn).toHaveBeenCalledWith({ code: "ANALYTICS_PROVIDER_FAILED", eventName: "preview_viewed" });
  expect(JSON.stringify(warn.mock.calls)).not.toContain("owner@example.test");
});
