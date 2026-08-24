import type { PriceBook } from "../domain/price-book";

/**
 * Calibration-only fixture. This is deliberately not a published production price book.
 * `taxRate` remains zero until KSB selects an approved applicable-tax rule.
 */
export const qaPriceBook: PriceBook = {
  version: "TH-2026Q2-QA-0.1",
  status: "review",
  referenceDate: "2026-06-30",
  provinceRates: { "10": { low: 23_700, expected: 28_600, high: 33_500 } },
  materialFactors: { select: 0.78, premium: 1, signature: 1.3 },
  floorFactors: { 1: 1, 2: 1.04, 3: 1.1 },
  siteAccessFactors: { normal: 1, restricted: 1.04, "very-restricted": 1.1 },
  siteRisk: {
    normal: { low: 0, expected: 0, high: 150_000 },
    restricted: { low: 100_000, expected: 250_000, high: 500_000 },
    "very-restricted": { low: 300_000, expected: 700_000, high: 1_500_000 },
  },
  featureAllowances: {
    pool: { low: 800_000, expected: 1_200_000, high: 2_000_000 },
    lift: { low: 900_000, expected: 1_300_000, high: 1_800_000 },
    "smart-home": { low: 150_000, expected: 350_000, high: 800_000 },
    solar: { low: 180_000, expected: 300_000, high: 500_000 },
    "ev-charger": { low: 35_000, expected: 65_000, high: 120_000 },
    "large-glazing": { low: 250_000, expected: 600_000, high: 1_500_000 },
  },
  designFeeRates: { low: 0.05, expected: 0.0675, high: 0.085 },
  taxRate: 0,
};
