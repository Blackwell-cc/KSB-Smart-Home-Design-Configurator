import { describe, expect, test } from "vitest";
import {
  createDefaultConfiguration,
  SPECIAL_FEATURE_CODES,
  type HouseConfiguration,
} from "@/features/configurator/domain/configuration";
import { calculateEstimate } from "./calculate-estimate";
import type { MoneyRange, PriceBook } from "./price-book";
import { qaPriceBook } from "../fixtures/qa-price-book";

const SUPERVISION_EXCLUSION = "ค่าควบคุมงานก่อสร้าง";
const INCLUDED_ITEMS = [
  "งานก่อสร้างหลัก",
  "งานออกแบบสถาปัตยกรรม โครงสร้าง ระบบไฟฟ้า ระบบสุขาภิบาล แบบขออนุญาต และแบบก่อสร้าง",
];
const EXCLUDED_ITEMS = [
  SUPERVISION_EXCLUSION,
  "ออกแบบตกแต่งภายใน",
  "ออกแบบภูมิสถาปัตยกรรม",
];

function estimateInput(
  configuration: Partial<HouseConfiguration> = {},
  constructionFloorAreaM2 = 198,
  production = false,
) {
  const resolvedConfiguration: HouseConfiguration = {
    ...createDefaultConfiguration(),
    styleId: "contemporary-warm-luxury",
    provinceCode: "10",
    ...configuration,
  };

  return {
    configuration: resolvedConfiguration,
    constructionFloorAreaM2,
    production,
  };
}

const goldenPremiumBangkokInput = estimateInput();

function expectValidRange(range: MoneyRange) {
  expect(Number.isFinite(range.low)).toBe(true);
  expect(Number.isFinite(range.expected)).toBe(true);
  expect(Number.isFinite(range.high)).toBe(true);
  expect(range.low).toBeGreaterThanOrEqual(0);
  expect(range.low).toBeLessThanOrEqual(range.expected);
  expect(range.expected).toBeLessThanOrEqual(range.high);
}

function expectSnapshotInvariants(snapshot: ReturnType<typeof calculateEstimate>) {
  for (const line of snapshot.lines) {
    expectValidRange(line.amount);
  }
  expectValidRange(snapshot.total);
  expect(snapshot.total).toEqual(
    snapshot.lines.reduce(
      (sum, line) => ({
        low: sum.low + line.amount.low,
        expected: sum.expected + line.amount.expected,
        high: sum.high + line.amount.high,
      }),
      { low: 0, expected: 0, high: 0 },
    ),
  );
  expect(snapshot.excludedItems).toContain(SUPERVISION_EXCLUSION);
}

describe("calculateEstimate", () => {
  test("separates the approved pricing categories in their required line order", () => {
    const snapshot = calculateEstimate(goldenPremiumBangkokInput, qaPriceBook);

    expect(snapshot.pricingVersion).toBe("TH-2026Q2-QA-0.1");
    expect(snapshot.referenceDate).toBe("2026-06-30");
    expect(snapshot.confidence).toBe("B");
    expect(snapshot.lines).toEqual([
      { code: "core-construction", label: "ค่าก่อสร้างหลัก", amount: { low: 4_880_304, expected: 5_889_312, high: 6_898_320 } },
      { code: "special-features", label: "รายการพิเศษ", amount: { low: 0, expected: 0, high: 0 } },
      { code: "site-risk", label: "ค่าเผื่อความเสี่ยงหน้างาน", amount: { low: 0, expected: 0, high: 150_000 } },
      { code: "design-professional-fee", label: "ค่าออกแบบและบริการวิชาชีพ", amount: { low: 244_015, expected: 397_529, high: 586_357 } },
      { code: "tax-fees", label: "ภาษีและค่าธรรมเนียม", amount: { low: 0, expected: 0, high: 0 } },
    ]);
    expect(snapshot.total).toEqual({ low: 5_124_319, expected: 6_286_841, high: 7_634_677 });
    expect(snapshot.includedItems).toEqual(INCLUDED_ITEMS);
    expect(snapshot.excludedItems).toEqual(EXCLUDED_ITEMS);
  });

  test("is deterministic and does not mutate its input or QA price book", () => {
    const input = estimateInput({ specialFeatures: ["pool", "smart-home"] });
    const originalInput = structuredClone(input);
    const originalBook = structuredClone(qaPriceBook);

    const first = calculateEstimate(input, qaPriceBook);
    const second = calculateEstimate(input, qaPriceBook);

    expect(second).toEqual(first);
    expect(input).toEqual(originalInput);
    expect(qaPriceBook).toEqual(originalBook);
  });

  test("returns independent money ranges that cannot mutate the source price book", () => {
    const originalBook = structuredClone(qaPriceBook);
    const expectedSnapshot = calculateEstimate(goldenPremiumBangkokInput, qaPriceBook);
    const snapshot = calculateEstimate(goldenPremiumBangkokInput, qaPriceBook);
    const siteRiskLine = snapshot.lines.find((line) => line.code === "site-risk");

    if (!siteRiskLine) {
      throw new Error("TEST_SETUP_SITE_RISK_LINE_MISSING");
    }
    siteRiskLine.amount.high = 0;

    expect(qaPriceBook).toEqual(originalBook);
    expect(calculateEstimate(goldenPremiumBangkokInput, qaPriceBook)).toEqual(expectedSnapshot);
  });

  test.each(["select", "premium", "signature"] as const)(
    "calculates valid ranges for %s material level",
    (materialLevel) => {
      expectSnapshotInvariants(calculateEstimate(estimateInput({ materialLevel }), qaPriceBook));
    },
  );

  test.each(["normal", "restricted", "very-restricted"] as const)(
    "keeps site risk separate for %s site access",
    (siteAccess) => {
      const snapshot = calculateEstimate(estimateInput({ siteAccess }), qaPriceBook);

      expect(snapshot.lines.find((line) => line.code === "site-risk")?.amount).toEqual(
        qaPriceBook.siteRisk[siteAccess],
      );
      expectSnapshotInvariants(snapshot);
    },
  );

  test.each([1, 2, 3] as const)("supports floor factor %i", (floors) => {
    expectSnapshotInvariants(calculateEstimate(estimateInput({ floors }), qaPriceBook));
  });

  test.each([60, 1_500])("calculates valid ranges at CFA boundary %i", (cfa) => {
    expectSnapshotInvariants(calculateEstimate(estimateInput({}, cfa), qaPriceBook));
  });

  test.each(SPECIAL_FEATURE_CODES)("maps the %s special feature to its QA allowance", (specialFeature) => {
    const snapshot = calculateEstimate(
      estimateInput({ specialFeatures: [specialFeature] }),
      qaPriceBook,
    );

    expect(snapshot.lines.find((line) => line.code === "special-features")?.amount).toEqual(
      qaPriceBook.featureAllowances[specialFeature],
    );
    expectSnapshotInvariants(snapshot);
  });

  test("aggregates every special feature allowance and keeps supervision excluded", () => {
    const snapshot = calculateEstimate(
      estimateInput({ specialFeatures: [...SPECIAL_FEATURE_CODES] }),
      qaPriceBook,
    );

    expect(snapshot.lines.find((line) => line.code === "special-features")?.amount).toEqual({
      low: 2_465_000,
      expected: 4_165_000,
      high: 7_420_000,
    });
    expect(snapshot.excludedItems).toContain(SUPERVISION_EXCLUSION);
    expectSnapshotInvariants(snapshot);
  });

  test("keeps QA allowance keys exactly aligned with canonical feature codes", () => {
    expect(Object.keys(qaPriceBook.featureAllowances).sort()).toEqual(
      [...SPECIAL_FEATURE_CODES].sort(),
    );
  });

  test("rejects missing province and special-feature mappings", () => {
    expect(() => calculateEstimate(estimateInput({ provinceCode: null }), qaPriceBook)).toThrow(
      "PROVINCE_RATE_NOT_FOUND",
    );
    expect(() =>
      calculateEstimate(
        estimateInput({ specialFeatures: ["unlisted-feature" as HouseConfiguration["specialFeatures"][number]] }),
        qaPriceBook,
      ),
    ).toThrow("FEATURE_ALLOWANCE_NOT_FOUND:unlisted-feature");
  });

  test("rejects a QA/review book for production but accepts an explicitly published version", () => {
    expect(() => calculateEstimate(estimateInput({}, 198, true), qaPriceBook)).toThrow(
      "PUBLISHED_PRICE_BOOK_REQUIRED",
    );
    const publishedBook: PriceBook = { ...qaPriceBook, status: "published" };
    expect(calculateEstimate(estimateInput({}, 198, true), publishedBook).pricingVersion).toBe(
      qaPriceBook.version,
    );
  });

  test.each([
    { status: "draft", production: false, error: "PRICE_BOOK_STATUS_NOT_ALLOWED" },
    { status: "draft", production: true, error: "PRICE_BOOK_STATUS_NOT_ALLOWED" },
    { status: "review", production: false },
    { status: "review", production: true, error: "PUBLISHED_PRICE_BOOK_REQUIRED" },
    { status: "published", production: false },
    { status: "published", production: true },
    { status: "retired", production: false, error: "PRICE_BOOK_STATUS_NOT_ALLOWED" },
    { status: "retired", production: true, error: "PRICE_BOOK_STATUS_NOT_ALLOWED" },
  ] as const)("enforces the $status price-book status gate for production=$production", ({ status, production, error }) => {
    const book: PriceBook = { ...qaPriceBook, status };
    const calculate = () => calculateEstimate(estimateInput({}, 198, production), book);

    if (error) {
      expect(calculate).toThrow(error);
      return;
    }
    expect(calculate().pricingVersion).toBe(qaPriceBook.version);
  });

  test.each([-1, 0, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects unsafe CFA value %s instead of calculating silently",
    (constructionFloorAreaM2) => {
      expect(() => calculateEstimate(estimateInput({}, constructionFloorAreaM2), qaPriceBook)).toThrow(
        "INVALID_CONSTRUCTION_FLOOR_AREA",
      );
    },
  );

  test.each([2_001, Number.MAX_VALUE])(
    "rejects CFA value %s above the supported calculation ceiling",
    (constructionFloorAreaM2) => {
      expect(() => calculateEstimate(estimateInput({}, constructionFloorAreaM2), qaPriceBook)).toThrow(
        "CONSTRUCTION_FLOOR_AREA_OUT_OF_RANGE",
      );
    },
  );

  test("rejects an overflowed combined factor before it can create an unsafe estimate", () => {
    const overflowedFactorBook: PriceBook = structuredClone(qaPriceBook);
    overflowedFactorBook.materialFactors.premium = Number.MAX_VALUE;

    expect(() => calculateEstimate(goldenPremiumBangkokInput, overflowedFactorBook)).toThrow(
      "CALCULATION_OVERFLOW",
    );
  });

  test("rejects an unsafe rate before it can overflow a calculated money range", () => {
    const unsafeRateBook: PriceBook = structuredClone(qaPriceBook);
    unsafeRateBook.taxRate = Number.MAX_VALUE;

    expect(() => calculateEstimate(goldenPremiumBangkokInput, unsafeRateBook)).toThrow(
      "INVALID_PRICE_BOOK:taxRate",
    );
  });

  test("rejects forged duplicate special features before allowances can double-count", () => {
    expect(() =>
      calculateEstimate(
        estimateInput({
          specialFeatures: ["pool", "pool"] as HouseConfiguration["specialFeatures"],
        }),
        qaPriceBook,
      ),
    ).toThrow("DUPLICATE_SPECIAL_FEATURE");
  });

  test("rejects malformed money ranges and unsafe numeric price-book values", () => {
    const negativeRateBook: PriceBook = structuredClone(qaPriceBook);
    negativeRateBook.taxRate = -0.01;
    expect(() => calculateEstimate(goldenPremiumBangkokInput, negativeRateBook)).toThrow(
      "INVALID_PRICE_BOOK:taxRate",
    );

    const unorderedRangeBook: PriceBook = structuredClone(qaPriceBook);
    unorderedRangeBook.provinceRates["10"] = { low: 30_000, expected: 20_000, high: 40_000 };
    expect(() => calculateEstimate(goldenPremiumBangkokInput, unorderedRangeBook)).toThrow(
      "INVALID_PRICE_BOOK:provinceRates.10",
    );

    const nonFiniteFactorBook: PriceBook = structuredClone(qaPriceBook);
    nonFiniteFactorBook.materialFactors.premium = Number.NaN;
    expect(() => calculateEstimate(goldenPremiumBangkokInput, nonFiniteFactorBook)).toThrow(
      "INVALID_PRICE_BOOK:materialFactors.premium",
    );
  });
});
