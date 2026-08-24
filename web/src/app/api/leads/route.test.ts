import { expect, test, vi } from "vitest";
import { createDefaultConfiguration, projectDesignBriefConfiguration } from "@/features/configurator/domain/configuration";
import { createLeadPostHandler, POST } from "./route";

const validBody = {
  configurationId: "11111111-1111-4111-8111-111111111111",
  idempotencyKey: "22222222-2222-4222-8222-222222222222",
  configuration: projectDesignBriefConfiguration({
    ...createDefaultConfiguration(),
    styleId: "contemporary-warm-luxury",
    provinceCode: "10",
  }),
  preferredContactMethod: "phone",
  name: "ผู้ทดสอบ",
  phone: "0812345678",
  email: "owner@example.test",
  requestPurpose: "planning_to_build",
  consentAccepted: true,
  consentVersion: "project-contact-v1",
};

test("rejects invalid content type and never reaches application services", async () => {
  const submit = vi.fn(); const handler = createLeadPostHandler({ submit });
  const response = await handler(new Request("http://test/api/leads", { method: "POST", body: JSON.stringify(validBody) }));
  expect(response.status).toBe(415); expect(submit).not.toHaveBeenCalled();
});

test("accepts only strict bodies and returns a private fragment handoff", async () => {
  const submit = vi.fn().mockResolvedValue({ leadId: "lead", projectId: "project", reportUrl: "/report/project#access=token" }); const handler = createLeadPostHandler({ submit });
  const response = await handler(new Request("http://test/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(validBody) }));
  expect(response.status).toBe(201); expect(await response.json()).toEqual({ leadId: "lead", projectId: "project", reportUrl: "/report/project#access=token" });
  expect(submit).toHaveBeenCalledWith(expect.objectContaining({
    configuration: validBody.configuration,
    phone: "0812345678",
    email: "owner@example.test",
    requestPurpose: "planning_to_build",
  }));
});

test("returns safe validation and payload-size errors without calling application services", async () => {
  const submit = vi.fn(); const handler = createLeadPostHandler({ submit });
  const invalid = await handler(new Request("http://test/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...validBody, requestPurpose: "ป้ายข้อความภาษาไทย" }) }));
  const oversized = await handler(new Request("http://test/api/leads", { method: "POST", headers: { "content-type": "application/json", "content-length": "32769" }, body: "{}" }));
  expect(invalid.status).toBe(400); expect(oversized.status).toBe(413); expect(submit).not.toHaveBeenCalled();
  expect(await invalid.json()).toEqual({ error: { code: "INVALID_LEAD" } });
});

test("returns a no-store 429 envelope before Lead services run", async () => {
  const submit = vi.fn();
  const rateLimit = vi.fn().mockReturnValue({ allowed: false, retryAfterSeconds: 27 });
  const handler = createLeadPostHandler({ submit, rateLimit });
  const response = await handler(new Request("https://ksb.test/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(validBody) }));

  expect(response.status).toBe(429);
  expect(response.headers.get("retry-after")).toBe("27");
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.json()).toEqual({ error: { code: "RATE_LIMITED" } });
  expect(submit).not.toHaveBeenCalled();
});

test("submits through the non-production runtime when Supabase is not configured", async () => {
  const response = await POST(new Request("http://localhost:3000/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(validBody),
  }));

  expect(response.status).toBe(201);
  expect(await response.json()).toEqual(expect.objectContaining({
    leadId: expect.any(String),
    projectId: expect.any(String),
    reportUrl: expect.stringMatching(/^\/report\/access#project=.*&token=.+/),
  }));
});
