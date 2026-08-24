import { describe, expect, test } from "vitest";
import {
  DevelopmentProjectRepository,
  createDevelopmentProjectStore,
  createRuntimeLeadRepository,
  createRuntimePrivateProjectRepository,
  runtimeProjectAccessTokenSecret,
  runtimeProjectSessionSecret,
} from "./runtime-project-repository";

const submission = {
  configurationId: "11111111-1111-4111-8111-111111111111",
  configuration: { targetBudget: { min: 8_000_000, max: 12_000_000 } },
  calculationSnapshot: { estimate: { total: { low: 8_000_000, expected: 10_000_000, high: 12_000_000 } } },
  priceBookId: "development-demo-price-book",
  idempotencyKey: "22222222-2222-4222-8222-222222222222",
  name: "ผู้ทดสอบ",
  preferredContactMethod: "phone" as const,
  phone: "0812345678",
  email: "owner@example.test",
  requestPurpose: "planning_to_build",
  consentVersion: "project-contact-v1",
  tokenHash: "a".repeat(64),
  expiresAt: "2026-09-18T00:00:00.000Z",
};

describe("runtime project repository", () => {
  test("uses one shared development store for lead submission and private report access", async () => {
    const store = createDevelopmentProjectStore();
    const leads = new DevelopmentProjectRepository(store);
    const reports = new DevelopmentProjectRepository(store);

    const submitted = await leads.submitOnce(submission);
    const access = await reports.findAccessByTokenHash(submission.tokenHash);
    const project = await reports.loadProject(submitted.projectId);

    expect(access).toMatchObject({ projectId: submitted.projectId, tokenHash: submission.tokenHash, revokedAt: null });
    expect(project).toEqual({
      id: submitted.projectId,
      targetBudget: { min: 8_000_000, max: 12_000_000 },
      snapshot: expect.objectContaining({
        id: expect.stringMatching(/^[0-9a-f-]{36}$/),
        estimate: submission.calculationSnapshot.estimate,
      }),
    });
    expect(await leads.submitOnce(submission)).toEqual(submitted);
  });

  test("falls back only outside production when Supabase configuration is absent", () => {
    expect(createRuntimeLeadRepository({ environment: "development", supabaseUrl: "", serviceRoleKey: "" })).toBeInstanceOf(DevelopmentProjectRepository);
    expect(createRuntimePrivateProjectRepository({ environment: "test", supabaseUrl: "", serviceRoleKey: "" })).toBeInstanceOf(DevelopmentProjectRepository);
    expect(() => createRuntimeLeadRepository({ environment: "production", supabaseUrl: "", serviceRoleKey: "" })).toThrow("LEAD_SUBMISSION_UNAVAILABLE");
    expect(() => createRuntimePrivateProjectRepository({ environment: "production", supabaseUrl: "", serviceRoleKey: "" })).toThrow("PRIVATE_PROJECT_UNAVAILABLE");
  });

  test("provides strong local-only secrets without weakening production requirements", () => {
    expect(runtimeProjectAccessTokenSecret({ environment: "development", configuredSecret: "" }).length).toBeGreaterThanOrEqual(32);
    expect(runtimeProjectSessionSecret({ environment: "test", configuredSecret: "" }).length).toBeGreaterThanOrEqual(32);
    expect(runtimeProjectAccessTokenSecret({ environment: "production", configuredSecret: "" })).toBe("");
    expect(runtimeProjectSessionSecret({ environment: "production", configuredSecret: "" })).toBe("");
  });
});
