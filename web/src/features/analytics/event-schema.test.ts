import { expect, test } from "vitest";
import { AnalyticsEventSchema, ANALYTICS_EVENT_NAMES } from "./event-schema";

const baseProperties = { sessionId: "session-1", projectId: "project-1", configuratorVersion: "0.1.0", pricingVersion: "TH-2026Q2-QA-0.1", deviceClass: "desktop", timestamp: "2026-08-07T00:00:00.000Z" };

test.each(["name", "phone", "email", "lineId", "address", "privateToken"])("rejects PII property %s", (key) => {
  expect(() => AnalyticsEventSchema.parse({ name: "preview_viewed", properties: { ...baseProperties, [key]: "secret" } })).toThrow();
});

test("accepts every required funnel event with only approved properties", () => {
  for (const name of ANALYTICS_EVENT_NAMES) expect(AnalyticsEventSchema.parse({ name, properties: { ...baseProperties, utmSource: "facebook", currentStep: 3, materialLevel: "premium", provinceCode: "10" } })).toBeDefined();
});

test("rejects unknown, malformed, and non-canonical analytics properties", () => {
  expect(() => AnalyticsEventSchema.parse({ name: "preview_viewed", properties: { ...baseProperties, nested: { email: "leak@example.test" } } })).toThrow();
  expect(() => AnalyticsEventSchema.parse({ name: "preview_viewed", properties: { ...baseProperties, provinceCode: "99" } })).toThrow();
  expect(() => AnalyticsEventSchema.parse({ name: "unknown", properties: baseProperties })).toThrow();
});

test("allows pre-submit lead-form events before a Project ID exists", () => {
  const anonymousProperties: Partial<typeof baseProperties> = { ...baseProperties }; delete anonymousProperties.projectId;
  expect(AnalyticsEventSchema.parse({ name: "lead_form_started", properties: anonymousProperties })).toBeDefined();
});
