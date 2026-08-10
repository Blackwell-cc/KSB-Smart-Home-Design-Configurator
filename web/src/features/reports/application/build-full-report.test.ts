import { expect, test } from "vitest";
import { buildFullReport } from "./build-full-report";

const snapshot = {
  id: "11111111-1111-4111-8111-111111111111",
  pricingVersion: "TH-2026Q2-QA-0.1", referenceDate: "2026-06-30", confidence: "B" as const,
  configuration: { styleId: "contemporary-warm-luxury", floors: 2, bedrooms: 3, bathrooms: 3, parkingSpaces: 2, materialLevel: "premium", specialFeatures: ["pool"] },
  area: { usableAreaM2: 164, constructionFloorAreaM2: 198 },
  estimate: {
    pricingVersion: "TH-2026Q2-QA-0.1", referenceDate: "2026-06-30", confidence: "B" as const,
    lines: [
      { code: "core-construction", label: "ค่าก่อสร้างหลัก", amount: { low: 4_500_000, expected: 5_500_000, high: 6_500_000 } },
      { code: "special-features", label: "รายการพิเศษ", amount: { low: 0, expected: 0, high: 0 } },
      { code: "site-risk", label: "ค่าเผื่อความเสี่ยงหน้างาน", amount: { low: 0, expected: 0, high: 0 } },
      { code: "design-professional-fee", label: "ค่าออกแบบและบริการวิชาชีพ", amount: { low: 225_000, expected: 371_250, high: 552_500 } },
      { code: "tax-fees", label: "ภาษีและค่าธรรมเนียม", amount: { low: 0, expected: 0, high: 0 } },
    ],
    total: { low: 4_725_000, expected: 5_871_250, high: 7_052_500 }, assumptions: ["ต้องตรวจสอบหน้างาน"], includedItems: ["งานออกแบบ"], excludedItems: ["ค่าควบคุมงานก่อสร้าง"],
  },
};

test("builds one immutable five-line view model from the saved snapshot", () => {
  const report = buildFullReport({ id: "22222222-2222-4222-8222-222222222222", targetBudget: null }, snapshot);

  expect(report.snapshotId).toBe(snapshot.id);
  expect(report.area).toEqual({ usableAreaM2: 164, constructionFloorAreaM2: 198 });
  expect(report.lines).toHaveLength(5);
  expect(report.lines[1].amount).toEqual({ low: 0, expected: 0, high: 0 });
  expect(report.excludedItems).toContain("ค่าควบคุมงานก่อสร้าง");
  expect(Object.isFrozen(report)).toBe(true);
  expect(Object.isFrozen(report.concept)).toBe(true);
});

test("compares an optional target budget without changing the saved estimate", () => {
  const report = buildFullReport({ id: "22222222-2222-4222-8222-222222222222", targetBudget: { min: 4_000_000, max: 5_000_000 } }, snapshot);

  expect(report.budgetComparison.status).toBe("above-target");
  expect(report.total).toEqual(snapshot.estimate.total);
});

test("rejects malformed snapshots instead of returning a partial report", () => {
  expect(() => buildFullReport({ id: "22222222-2222-4222-8222-222222222222", targetBudget: null }, { ...snapshot, estimate: { ...snapshot.estimate, lines: [] } })).toThrow("INVALID_SAVED_SNAPSHOT");
});
