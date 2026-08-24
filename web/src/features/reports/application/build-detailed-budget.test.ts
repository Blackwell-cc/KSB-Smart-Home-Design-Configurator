import { describe, expect, test } from "vitest";
import { buildDetailedBudget } from "./build-detailed-budget";

const source = {
  lines: [
    { code: "core-construction", label: "ค่าก่อสร้างหลัก", amount: { low: 10_000_003, expected: 12_000_007, high: 14_000_011 } },
    { code: "special-features", label: "รายการพิเศษ", amount: { low: 900_001, expected: 1_200_002, high: 1_500_003 } },
    { code: "site-risk", label: "ค่าเผื่อความเสี่ยงหน้างาน", amount: { low: 200_001, expected: 300_001, high: 400_001 } },
    { code: "design-professional-fee", label: "ค่าออกแบบและบริการวิชาชีพ", amount: { low: 500_001, expected: 700_001, high: 900_001 } },
    { code: "tax-fees", label: "ภาษีและค่าธรรมเนียม", amount: { low: 50_001, expected: 70_001, high: 90_001 } },
  ],
  total: { low: 11_650_007, expected: 14_270_012, high: 16_890_017 },
} as const;

describe("buildDetailedBudget", () => {
  test("derives architectural categories from the authoritative saved estimate and reconciles every range exactly", () => {
    const budget = buildDetailedBudget({
      ...source,
      selectedSpecialFeatures: ["pool", "smart-home"],
    });

    expect(budget.categories.map(({ code }) => code)).toEqual(expect.arrayContaining([
      "structure",
      "architecture",
      "roof",
      "electrical",
      "plumbing",
      "pool",
      "smart-home",
      "design-professional-fee",
      "tax-fees",
    ]));
    expect(budget.categories.some(({ label }) => /pool|smart-home/i.test(label))).toBe(false);

    for (const key of ["low", "expected", "high"] as const) {
      const categorySum = budget.categories.reduce((sum, row) => sum + row.amount[key], 0);
      expect(categorySum).toBe(budget.subtotal[key]);
      expect(categorySum + budget.contingency.amount[key]).toBe(budget.total[key]);
      expect(budget.total[key]).toBe(source.total[key]);
    }
  });

  test("rejects a saved total that does not reconcile with its own source lines", () => {
    expect(() => buildDetailedBudget({
      ...source,
      total: { ...source.total, high: source.total.high + 1 },
      selectedSpecialFeatures: [],
    })).toThrow("REPORT_BUDGET_DOES_NOT_RECONCILE");
  });
});
