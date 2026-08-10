import { expect, test } from "vitest";
import { assertProductionEnvironment } from "./production-environment";

const valid = {
  NODE_ENV: "production",
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key-that-is-longer-than-32-bytes",
  SUPABASE_ANON_KEY: "anon-key-that-is-longer-than-twenty-bytes",
  PROJECT_ACCESS_TOKEN_SECRET: "access-secret-that-is-at-least-32-bytes",
  PROJECT_SESSION_SECRET: "session-secret-that-is-at-least-32-bytes",
  RATE_LIMIT_SECRET: "rate-limit-secret-that-is-at-least-32-bytes",
  LEAD_WEBHOOK_URL: "https://automation.example.test/ksb-leads",
  PII_RETENTION_DAYS: "30",
};

test("does not require production secrets in development or test", () => {
  expect(() => assertProductionEnvironment({ NODE_ENV: "development" })).not.toThrow();
  expect(() => assertProductionEnvironment({ NODE_ENV: "test" })).not.toThrow();
});

test("accepts the complete production runtime contract", () => {
  expect(() => assertProductionEnvironment(valid)).not.toThrow();
});

test.each([
  ["missing Supabase URL", { SUPABASE_URL: undefined }],
  ["non-HTTPS Supabase URL", { SUPABASE_URL: "http://project.supabase.co" }],
  ["missing service role", { SUPABASE_SERVICE_ROLE_KEY: undefined }],
  ["short access secret", { PROJECT_ACCESS_TOKEN_SECRET: "short" }],
  ["same access/session secret", { PROJECT_SESSION_SECRET: valid.PROJECT_ACCESS_TOKEN_SECRET }],
  ["non-HTTPS webhook", { LEAD_WEBHOOK_URL: "http://automation.example.test/leads" }],
  ["invalid retention", { PII_RETENTION_DAYS: "0" }],
])("rejects production startup for %s", (_label, patch) => {
  expect(() => assertProductionEnvironment({ ...valid, ...patch })).toThrowError("PRODUCTION_ENVIRONMENT_INVALID");
});
