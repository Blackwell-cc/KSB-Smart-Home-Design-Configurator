export type MoneyRange = { low: number; expected: number; high: number };
export type EstimateMode = "published" | "development-demo";

export type PriceBookStatus = "draft" | "review" | "published" | "retired";

export type CalculationLineCode =
  | "core-construction"
  | "special-features"
  | "site-risk"
  | "design-professional-fee"
  | "tax-fees";

export type CalculationSnapshot = {
  pricingVersion: string;
  referenceDate: string;
  confidence: "C" | "B";
  lines: Array<{ code: CalculationLineCode; label: string; amount: MoneyRange }>;
  total: MoneyRange;
  assumptions: string[];
  includedItems: string[];
  excludedItems: string[];
};

export type PriceBook = {
  version: string;
  status: PriceBookStatus;
  referenceDate: string;
  provinceRates: Record<string, MoneyRange>;
  materialFactors: Record<"select" | "premium" | "signature", number>;
  floorFactors: Record<1 | 2 | 3, number>;
  siteAccessFactors: Record<"normal" | "restricted" | "very-restricted", number>;
  siteRisk: Record<"normal" | "restricted" | "very-restricted", MoneyRange>;
  featureAllowances: Record<string, MoneyRange>;
  designFeeRates: MoneyRange;
  taxRate: number;
};
