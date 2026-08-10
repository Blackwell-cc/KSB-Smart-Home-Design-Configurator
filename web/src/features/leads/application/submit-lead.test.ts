import { describe, expect, test } from "vitest";
import { createDeterministicAccessToken, ProjectAccessTokenSecretError, submitLead } from "./submit-lead";

const configuration = {
  styleId: "contemporary-warm-luxury", residents: 3, floors: 2, bedrooms: 3, bathrooms: 3,
  parkingSpaces: 2, functions: { office: false, elderlyRoom: false, thaiKitchen: false, multipurposeRoom: false },
  usableAreaOverrideM2: null, provinceCode: "10", siteAccess: "normal", materialLevel: "premium", specialFeatures: [],
} as const;
const validInput = {
  configurationId: "11111111-1111-4111-8111-111111111111", idempotencyKey: "22222222-2222-4222-8222-222222222222",
  configuration, preferredContactMethod: "email" as const, name: "  ผู้ทดสอบ  ", email: "owner@example.test",
  consentAccepted: true as const, consentVersion: "project-contact-v1",
};

function dependencies() {
  const rows = new Map<string, { leadId: string; projectId: string }>();
  const repository = {
    insertCount: 0,
    async submitOnce(input: { idempotencyKey: string }) {
      const existing = rows.get(input.idempotencyKey);
      if (existing) return existing;
      repository.insertCount += 1;
      const row = { leadId: crypto.randomUUID(), projectId: crypto.randomUUID() };
      rows.set(input.idempotencyKey, row);
      return row;
    },
  };
  return {
    repository,
    dependencies: {
      repository,
      priceBookRepository: { async loadPublished() { return { priceBookId: "book-1", priceBook: { version: "v1", status: "published" as const, referenceDate: "2026-08-07", provinceRates: { "10": { low: 30000, expected: 35000, high: 40000 } }, materialFactors: { select: 1, premium: 1.1, signature: 1.2 }, floorFactors: { "1": 1, "2": 1.05, "3": 1.1 }, siteAccessFactors: { normal: 1, restricted: 1.1, "very-restricted": 1.2 }, siteRisk: { normal: { low: 0, expected: 0, high: 0 }, restricted: { low: 0, expected: 0, high: 0 }, "very-restricted": { low: 0, expected: 0, high: 0 } }, featureAllowances: { pool: { low: 0, expected: 0, high: 0 }, lift: { low: 0, expected: 0, high: 0 }, "smart-home": { low: 0, expected: 0, high: 0 }, solar: { low: 0, expected: 0, high: 0 }, "ev-charger": { low: 0, expected: 0, high: 0 }, "double-volume": { low: 0, expected: 0, high: 0 }, "large-glazing": { low: 0, expected: 0, high: 0 } }, designFeeRates: { low: 0.1, expected: 0.1, high: 0.1 }, taxRate: 0 }, areaCatalog: { bedroomM2: 14, bathroomM2: 5, livingDiningBaseM2: 28, livingDiningPerResidentM2: 2, entryStorageM2: 8, kitchenM2: 14, serviceM2: 9, circulationPerFloorM2: 20, officeM2: 12, elderlyRoomM2: 16, thaiKitchenM2: 12, multipurposeRoomM2: 15, coveredParkingPerSpaceM2: 15, coveredServiceM2: 4 } }; } },
      createAccessToken: (key: string) => ({ plainText: `token-${key}`, hash: `hash-${key}` }), now: () => new Date("2026-08-07T00:00:00Z"),
    },
  };
}

describe("submitLead", () => {
  test("derives the same high-entropy token from one idempotency key without storing plaintext", () => {
    const first = createDeterministicAccessToken(validInput.idempotencyKey, "a".repeat(32));
    const second = createDeterministicAccessToken(validInput.idempotencyKey, "a".repeat(32));
    expect(first).toEqual(second);
    expect(first.plainText).toHaveLength(43);
    expect(first.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(() => createDeterministicAccessToken(validInput.idempotencyKey, "weak")).toThrow(ProjectAccessTokenSecretError);
  });

  test("returns the same private access result for concurrent retries of one idempotency key", async () => {
    const { dependencies: deps, repository } = dependencies();
    const [first, second] = await Promise.all([submitLead(validInput, deps), submitLead(validInput, deps)]);
    expect(second).toEqual(first);
    expect(first.reportUrl).toContain("#access=token-");
    expect(repository.insertCount).toBe(1);
  });

  test("allows the same contact to create another project with a different idempotency key", async () => {
    const { dependencies: deps } = dependencies();
    const first = await submitLead(validInput, deps);
    const second = await submitLead({ ...validInput, configurationId: "33333333-3333-4333-8333-333333333333", idempotencyKey: "44444444-4444-4444-8444-444444444444" }, deps);
    expect(second.projectId).not.toBe(first.projectId);
  });
});
