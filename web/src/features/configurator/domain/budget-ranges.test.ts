import { describe, expect, test } from "vitest";
import { BUDGET_RANGE_OPTIONS, budgetRangeIdForTarget, budgetRangeOptionFor } from "./budget-ranges";

describe("budget ranges", () => {
  test("defines seven stable choices with an unspecified default", () => {
    expect(BUDGET_RANGE_OPTIONS.map((option) => option.id)).toEqual([
      "unspecified", "under_5m", "5m_10m", "10m_20m",
      "20m_40m", "40m_80m", "over_80m",
    ]);
    expect(budgetRangeOptionFor("unspecified")).toMatchObject({ label: "ยังไม่ระบุ", targetBudget: null });
  });

  test("maps bounded ranges without inventing open-ended limits", () => {
    expect(budgetRangeOptionFor("10m_20m").targetBudget).toEqual({ min: 10_000_000, max: 20_000_000 });
    expect(budgetRangeOptionFor("under_5m").targetBudget).toBeNull();
    expect(budgetRangeOptionFor("over_80m").targetBudget).toBeNull();
  });

  test("recognizes exact legacy ranges and leaves custom ranges unspecified", () => {
    expect(budgetRangeIdForTarget({ min: 20_000_000, max: 40_000_000 })).toBe("20m_40m");
    expect(budgetRangeIdForTarget({ min: 5_000_000, max: 7_000_000 })).toBe("unspecified");
    expect(budgetRangeIdForTarget(null)).toBe("unspecified");
  });
});
