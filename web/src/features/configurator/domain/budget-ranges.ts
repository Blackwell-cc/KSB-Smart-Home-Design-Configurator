export const BUDGET_RANGE_IDS = [
  "unspecified",
  "under_5m",
  "5m_10m",
  "10m_20m",
  "20m_40m",
  "40m_80m",
  "over_80m",
] as const;

export type BudgetRangeId = (typeof BUDGET_RANGE_IDS)[number];
export type TargetBudget = Readonly<{ min: number; max: number }> | null;

export const BUDGET_RANGE_OPTIONS = [
  { id: "unspecified", label: "ยังไม่ระบุ", shortLabel: "ยังไม่ระบุ", targetBudget: null },
  { id: "under_5m", label: "ต่ำกว่า 5 ล้านบาท", shortLabel: "ต่ำกว่า 5 ลบ.", targetBudget: null },
  { id: "5m_10m", label: "5–10 ล้านบาท", shortLabel: "5–10 ลบ.", targetBudget: { min: 5_000_000, max: 10_000_000 } },
  { id: "10m_20m", label: "10–20 ล้านบาท", shortLabel: "10–20 ลบ.", targetBudget: { min: 10_000_000, max: 20_000_000 } },
  { id: "20m_40m", label: "20–40 ล้านบาท", shortLabel: "20–40 ลบ.", targetBudget: { min: 20_000_000, max: 40_000_000 } },
  { id: "40m_80m", label: "40–80 ล้านบาท", shortLabel: "40–80 ลบ.", targetBudget: { min: 40_000_000, max: 80_000_000 } },
  { id: "over_80m", label: "มากกว่า 80 ล้านบาท", shortLabel: "80 ลบ. +", targetBudget: null },
] as const satisfies readonly {
  id: BudgetRangeId;
  label: string;
  shortLabel: string;
  targetBudget: TargetBudget;
}[];

export function budgetRangeOptionFor(id: BudgetRangeId) {
  return BUDGET_RANGE_OPTIONS.find((option) => option.id === id)!;
}

export function budgetRangeIdForTarget(targetBudget: TargetBudget): BudgetRangeId {
  if (!targetBudget) return "unspecified";
  return BUDGET_RANGE_OPTIONS.find((option) =>
    option.targetBudget?.min === targetBudget.min && option.targetBudget.max === targetBudget.max,
  )?.id ?? "unspecified";
}
