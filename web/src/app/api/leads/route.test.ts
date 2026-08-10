import { expect, test, vi } from "vitest";
import { createLeadPostHandler } from "./route";

const validBody = { configurationId: "11111111-1111-4111-8111-111111111111", idempotencyKey: "22222222-2222-4222-8222-222222222222", configuration: { styleId: "contemporary-warm-luxury", residents: 3, floors: 2, bedrooms: 3, bathrooms: 3, parkingSpaces: 2, functions: { office: false, elderlyRoom: false, thaiKitchen: false, multipurposeRoom: false }, usableAreaOverrideM2: null, provinceCode: "10", siteAccess: "normal", materialLevel: "premium", specialFeatures: [] }, preferredContactMethod: "email", name: "ผู้ทดสอบ", email: "owner@example.test", consentAccepted: true, consentVersion: "project-contact-v1" };

test("rejects invalid content type and never reaches application services", async () => {
  const submit = vi.fn(); const handler = createLeadPostHandler({ submit });
  const response = await handler(new Request("http://test/api/leads", { method: "POST", body: JSON.stringify(validBody) }));
  expect(response.status).toBe(415); expect(submit).not.toHaveBeenCalled();
});

test("accepts only strict bodies and returns a private fragment handoff", async () => {
  const submit = vi.fn().mockResolvedValue({ leadId: "lead", projectId: "project", reportUrl: "/report/project#access=token" }); const handler = createLeadPostHandler({ submit });
  const response = await handler(new Request("http://test/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(validBody) }));
  expect(response.status).toBe(201); expect(await response.json()).toEqual({ leadId: "lead", projectId: "project", reportUrl: "/report/project#access=token" });
  expect(submit).toHaveBeenCalledWith(expect.objectContaining({ configuration: validBody.configuration, email: "owner@example.test" }));
});

test("returns safe validation and payload-size errors without calling application services", async () => {
  const submit = vi.fn(); const handler = createLeadPostHandler({ submit });
  const invalid = await handler(new Request("http://test/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...validBody, phone: "0812345678" }) }));
  const oversized = await handler(new Request("http://test/api/leads", { method: "POST", headers: { "content-type": "application/json", "content-length": "32769" }, body: "{}" }));
  expect(invalid.status).toBe(400); expect(oversized.status).toBe(413); expect(submit).not.toHaveBeenCalled();
  expect(await invalid.json()).toEqual({ error: { code: "INVALID_LEAD" } });
});
