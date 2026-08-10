import { expect, test, vi } from "vitest";
import { WebhookLeadNotifier } from "./webhook-lead-notifier";

const summary = { eventType: "lead_submitted" as const, leadId: "11111111-1111-4111-8111-111111111111", projectId: "22222222-2222-4222-8222-222222222222", name: "ผู้ทดสอบ", preferredContactMethod: "email" as const, contact: "owner@example.test" };

test("retries notification independently with an idempotency key", async () => {
  const fetch = vi.fn().mockResolvedValueOnce(new Response(null, { status: 500 })).mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce(new Response(null, { status: 204 }));
  const notifier = new WebhookLeadNotifier("https://hooks.example.test/lead", { fetch, maxAttempts: 3 });
  await expect(notifier.notify(summary)).resolves.toBeUndefined();
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(fetch.mock.calls[0]?.[1]).toEqual(expect.objectContaining({ method: "POST", headers: expect.objectContaining({ "idempotency-key": `lead:${summary.leadId}` }) }));
});

test("rejects invalid webhook protocols and fails after the bounded retry count", async () => {
  expect(() => new WebhookLeadNotifier("http://hooks.example.test/lead")).toThrow("LEAD_WEBHOOK_INVALID");
  const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
  await expect(new WebhookLeadNotifier("https://hooks.example.test/lead", { fetch, maxAttempts: 2 }).notify(summary)).rejects.toThrow("LEAD_NOTIFICATION_FAILED");
  expect(fetch).toHaveBeenCalledTimes(2);
});
