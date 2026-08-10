import type { AreaCatalog } from "@/features/area-planning/domain/area-catalog";
import { QA_AREA_CATALOG } from "@/features/area-planning/domain/area-catalog";
import { THAI_PROVINCE_CODES, type ThaiProvinceCode } from "@/features/configurator/domain/provinces";
import type { MoneyRange, PriceBook } from "../domain/price-book";
import { qaPriceBook } from "./qa-price-book";

/**
 * Development-only calibration. Bangkok (10) is the documented reference;
 * the regional multipliers below produce a complete test fixture, not a quote.
 */
const BANGKOK_BENCHMARK: MoneyRange = { low: 23_700, expected: 28_600, high: 33_500 };
const REGIONAL_MULTIPLIERS = {
  bangkok: 1,
  metro: 0.98,
  east: 0.96,
  centralWest: 0.92,
  north: 0.9,
  northeast: 0.88,
  south: 0.94,
} as const;

const METRO = new Set<ThaiProvinceCode>(["11", "12", "13", "74"]);
const EAST = new Set<ThaiProvinceCode>(["20", "21", "22", "23", "24", "25", "26", "27"]);
const NORTHEAST = new Set<ThaiProvinceCode>(["30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49"]);
const NORTH = new Set<ThaiProvinceCode>(["50", "51", "52", "53", "54", "55", "56", "57", "58"]);
const SOUTH = new Set<ThaiProvinceCode>(["80", "81", "82", "83", "84", "85", "86", "90", "91", "92", "93", "94", "95", "96"]);

function multiplierFor(code: ThaiProvinceCode) {
  if (code === "10") return REGIONAL_MULTIPLIERS.bangkok;
  if (METRO.has(code)) return REGIONAL_MULTIPLIERS.metro;
  if (EAST.has(code)) return REGIONAL_MULTIPLIERS.east;
  if (NORTHEAST.has(code)) return REGIONAL_MULTIPLIERS.northeast;
  if (NORTH.has(code)) return REGIONAL_MULTIPLIERS.north;
  if (SOUTH.has(code)) return REGIONAL_MULTIPLIERS.south;
  return REGIONAL_MULTIPLIERS.centralWest;
}

const scaledRate = (factor: number): MoneyRange => ({
  low: Math.round(BANGKOK_BENCHMARK.low * factor),
  expected: Math.round(BANGKOK_BENCHMARK.expected * factor),
  high: Math.round(BANGKOK_BENCHMARK.high * factor),
});

export const developmentDemoProvinceRates = Object.fromEntries(
  THAI_PROVINCE_CODES.map((code) => [code, scaledRate(multiplierFor(code))]),
) as Record<ThaiProvinceCode, MoneyRange>;

const { status: _qaStatus, ...demoAreaCatalog } = QA_AREA_CATALOG;
void _qaStatus;
export const developmentDemoAreaCatalog: AreaCatalog = demoAreaCatalog;

export const developmentDemoPriceBook: PriceBook = {
  ...qaPriceBook,
  version: "TH-2026Q2-DEVELOPMENT-DEMO-0.1",
  status: "review",
  referenceDate: "2026-06-30",
  provinceRates: developmentDemoProvinceRates,
};
