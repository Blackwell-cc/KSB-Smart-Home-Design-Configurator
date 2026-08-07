import type { HouseConfiguration } from "@/features/configurator/domain/configuration";
import type { CalculationSnapshot, MoneyRange, PriceBook, PriceBookStatus } from "./price-book";

type EstimateInput = {
  configuration: HouseConfiguration;
  constructionFloorAreaM2: number;
  production: boolean;
};

const MATERIAL_LEVELS = ["select", "premium", "signature"] as const;
const FLOORS = [1, 2, 3] as const;
const SITE_ACCESS_LEVELS = ["normal", "restricted", "very-restricted"] as const;
const PRICE_BOOK_STATUSES: PriceBookStatus[] = ["draft", "review", "published", "retired"];

const ASSUMPTIONS = [
  "เป็นการประเมินเบื้องต้นจากข้อมูลที่ผู้ใช้ระบุ",
  "ฐานรากต้องยืนยันหลังสำรวจหรือทดสอบดิน",
];
const INCLUDED_ITEMS = [
  "งานก่อสร้างหลัก",
  "งานออกแบบสถาปัตยกรรม โครงสร้าง ระบบไฟฟ้า ระบบสุขาภิบาล แบบขออนุญาต และแบบก่อสร้าง",
];
const EXCLUDED_ITEMS = [
  "ค่าควบคุมงานก่อสร้าง",
  "ออกแบบตกแต่งภายใน",
  "ออกแบบภูมิสถาปัตยกรรม",
];

const round = (value: number) => Math.round(value);

function scale(range: MoneyRange, factor: number): MoneyRange {
  return {
    low: round(range.low * factor),
    expected: round(range.expected * factor),
    high: round(range.high * factor),
  };
}

function add(...ranges: MoneyRange[]): MoneyRange {
  return ranges.reduce(
    (sum, range) => ({
      low: sum.low + range.low,
      expected: sum.expected + range.expected,
      high: sum.high + range.high,
    }),
    { low: 0, expected: 0, high: 0 },
  );
}

function percent(range: MoneyRange, rates: MoneyRange): MoneyRange {
  return {
    low: round(range.low * rates.low),
    expected: round(range.expected * rates.expected),
    high: round(range.high * rates.high),
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function assertFiniteNonNegative(
  value: unknown,
  path: string,
  maximum?: number,
): asserts value is number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    (maximum !== undefined && value > maximum)
  ) {
    throw new Error(`INVALID_PRICE_BOOK:${path}`);
  }
}

function assertMoneyRange(value: unknown, path: string): asserts value is MoneyRange {
  if (!isObject(value)) {
    throw new Error(`INVALID_PRICE_BOOK:${path}`);
  }
  const { low, expected, high } = value;
  assertFiniteNonNegative(low, path);
  assertFiniteNonNegative(expected, path);
  assertFiniteNonNegative(high, path);
  if (low > expected || expected > high) {
    throw new Error(`INVALID_PRICE_BOOK:${path}`);
  }
}

function assertRecord(value: unknown, path: string): asserts value is Record<string, unknown> {
  if (!isObject(value)) {
    throw new Error(`INVALID_PRICE_BOOK:${path}`);
  }
}

function assertPriceBookIsSafe(book: PriceBook) {
  if (!isObject(book)) {
    throw new Error("INVALID_PRICE_BOOK");
  }
  if (typeof book.version !== "string" || book.version.length === 0) {
    throw new Error("INVALID_PRICE_BOOK:version");
  }
  if (typeof book.referenceDate !== "string" || book.referenceDate.length === 0) {
    throw new Error("INVALID_PRICE_BOOK:referenceDate");
  }
  if (!PRICE_BOOK_STATUSES.includes(book.status)) {
    throw new Error("INVALID_PRICE_BOOK:status");
  }

  assertRecord(book.provinceRates, "provinceRates");
  for (const [provinceCode, range] of Object.entries(book.provinceRates)) {
    assertMoneyRange(range, `provinceRates.${provinceCode}`);
  }

  assertRecord(book.materialFactors, "materialFactors");
  for (const materialLevel of MATERIAL_LEVELS) {
    assertFiniteNonNegative(book.materialFactors[materialLevel], `materialFactors.${materialLevel}`);
  }

  assertRecord(book.floorFactors, "floorFactors");
  for (const floors of FLOORS) {
    assertFiniteNonNegative(book.floorFactors[floors], `floorFactors.${floors}`);
  }

  assertRecord(book.siteAccessFactors, "siteAccessFactors");
  assertRecord(book.siteRisk, "siteRisk");
  for (const siteAccess of SITE_ACCESS_LEVELS) {
    assertFiniteNonNegative(book.siteAccessFactors[siteAccess], `siteAccessFactors.${siteAccess}`);
    assertMoneyRange(book.siteRisk[siteAccess], `siteRisk.${siteAccess}`);
  }

  assertRecord(book.featureAllowances, "featureAllowances");
  for (const [featureCode, range] of Object.entries(book.featureAllowances)) {
    assertMoneyRange(range, `featureAllowances.${featureCode}`);
  }

  assertMoneyRange(book.designFeeRates, "designFeeRates");
  for (const rate of [book.designFeeRates.low, book.designFeeRates.expected, book.designFeeRates.high]) {
    assertFiniteNonNegative(rate, "designFeeRates", 1);
  }
  assertFiniteNonNegative(book.taxRate, "taxRate", 1);
}

export function calculateEstimate(input: EstimateInput, book: PriceBook): CalculationSnapshot {
  if (!Number.isFinite(input.constructionFloorAreaM2) || input.constructionFloorAreaM2 <= 0) {
    throw new Error("INVALID_CONSTRUCTION_FLOOR_AREA");
  }
  assertPriceBookIsSafe(book);
  if (input.production && book.status !== "published") {
    throw new Error("PUBLISHED_PRICE_BOOK_REQUIRED");
  }

  const provinceCode = input.configuration.provinceCode;
  const provinceRate = provinceCode ? book.provinceRates[provinceCode] : undefined;
  if (!provinceRate) {
    throw new Error("PROVINCE_RATE_NOT_FOUND");
  }

  const materialFactor = book.materialFactors[input.configuration.materialLevel];
  if (materialFactor === undefined) {
    throw new Error("MATERIAL_FACTOR_NOT_FOUND");
  }
  const floorFactor = book.floorFactors[input.configuration.floors as 1 | 2 | 3];
  if (floorFactor === undefined) {
    throw new Error("FLOOR_FACTOR_NOT_FOUND");
  }
  const siteAccessFactor = book.siteAccessFactors[input.configuration.siteAccess];
  const siteRisk = book.siteRisk[input.configuration.siteAccess];
  if (siteAccessFactor === undefined || siteRisk === undefined) {
    throw new Error("SITE_ACCESS_FACTOR_NOT_FOUND");
  }

  const construction = scale(
    provinceRate,
    input.constructionFloorAreaM2 * materialFactor * floorFactor * siteAccessFactor,
  );
  const features = add(
    ...input.configuration.specialFeatures.map((featureCode) => {
      const allowance = book.featureAllowances[featureCode];
      if (!allowance) {
        throw new Error(`FEATURE_ALLOWANCE_NOT_FOUND:${featureCode}`);
      }
      return allowance;
    }),
  );
  const designFee = percent(construction, book.designFeeRates);
  const beforeTax = add(construction, features, siteRisk, designFee);
  const taxFees = scale(beforeTax, book.taxRate);
  const total = add(beforeTax, taxFees);

  return {
    pricingVersion: book.version,
    referenceDate: book.referenceDate,
    confidence: "B",
    lines: [
      { code: "core-construction", label: "ค่าก่อสร้างหลัก", amount: construction },
      { code: "special-features", label: "รายการพิเศษ", amount: features },
      { code: "site-risk", label: "ค่าเผื่อความเสี่ยงหน้างาน", amount: siteRisk },
      { code: "design-professional-fee", label: "ค่าออกแบบและบริการวิชาชีพ", amount: designFee },
      { code: "tax-fees", label: "ภาษีและค่าธรรมเนียม", amount: taxFees },
    ],
    total,
    assumptions: [...ASSUMPTIONS],
    includedItems: [...INCLUDED_ITEMS],
    excludedItems: [...EXCLUDED_ITEMS],
  };
}
