import { NextRequest } from "next/server";
import { expect, test, vi } from "vitest";
import { createConsultationPostHandler } from "./route";

test("sets consultation idempotently only after authenticated project access", async () => {
  const timestamp = new Date("2026-08-10T00:00:00.000Z");
  const requestConsultation = vi.fn().mockResolvedValue(timestamp);
  const response = await createConsultationPostHandler({ authorize: vi.fn().mockResolvedValue(undefined), requestConsultation })(new NextRequest("https://ksb.test/api/projects/11111111-1111-4111-8111-111111111111/consultation", { method: "POST", headers: { origin: "https://ksb.test" } }), { params: Promise.resolve({ projectId: "11111111-1111-4111-8111-111111111111" }) });

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ consultationRequestedAt: timestamp.toISOString() });
  expect(requestConsultation).toHaveBeenCalledWith("11111111-1111-4111-8111-111111111111");
});

test("does not store a consultation request when authorization fails", async () => {
  const requestConsultation = vi.fn();
  const response = await createConsultationPostHandler({ authorize: vi.fn().mockRejectedValue(new Error("invalid")), requestConsultation })(new NextRequest("https://ksb.test/api/projects/11111111-1111-4111-8111-111111111111/consultation", { method: "POST" }), { params: Promise.resolve({ projectId: "11111111-1111-4111-8111-111111111111" }) });

  expect(response.status).toBe(404);
  expect(requestConsultation).not.toHaveBeenCalled();
});
