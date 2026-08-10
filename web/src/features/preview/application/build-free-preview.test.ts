import { expect, test } from "vitest";
import { calculateArea } from "@/features/area-planning/domain/calculate-area";
import { createDefaultConfiguration } from "@/features/configurator/domain/configuration";
import type { CalculationSnapshot } from "@/features/pricing/domain/price-book";
import { buildFreePreview } from "./build-free-preview";

const snapshot: CalculationSnapshot = {
  pricingVersion: "TEST-1",
  referenceDate: "2026-08-10",
  confidence: "C",
  lines: [
    { code: "core-construction", label: "ค่าก่อสร้างหลัก", amount: { low: 4_600_000, expected: 5_300_000, high: 6_100_000 } },
    { code: "special-features", label: "รายการพิเศษ", amount: { low: 100_000, expected: 120_000, high: 160_000 } },
    { code: "site-risk", label: "ความเสี่ยงหน้างาน", amount: { low: 10_000, expected: 20_000, high: 30_000 } },
    { code: "design-professional-fee", label: "ค่าออกแบบและบริการวิชาชีพ", amount: { low: 250_000, expected: 320_000, high: 400_000 } },
    { code: "tax-fees", label: "ภาษีและค่าธรรมเนียม", amount: { low: 40_000, expected: 50_000, high: 60_000 } },
  ],
  total: { low: 5_000_000, expected: 5_810_000, high: 6_750_000 },
  assumptions: [],
  includedItems: [],
  excludedItems: ["ค่าควบคุมงานก่อสร้าง"],
};

test("maps construction and design ranges from immutable snapshot line codes while keeping total separate", () => {
  const configuration = { ...createDefaultConfiguration(), styleId: "contemporary-warm-luxury", provinceCode: "10" as const };
  const area = calculateArea(configuration, {
    bedroomM2: 14, bathroomM2: 5, livingDiningBaseM2: 28, livingDiningPerResidentM2: 2,
    entryStorageM2: 8, kitchenM2: 14, serviceM2: 9, circulationPerFloorM2: 20,
    officeM2: 12, elderlyRoomM2: 16, thaiKitchenM2: 12, multipurposeRoomM2: 15,
    coveredParkingPerSpaceM2: 15, coveredServiceM2: 4,
  });
  const frozenSnapshot = structuredClone(snapshot);
  Object.freeze(frozenSnapshot.lines);
  Object.freeze(frozenSnapshot);

  const preview = buildFreePreview(configuration, area, frozenSnapshot);

  expect(preview).toMatchObject({
    constructionRange: { low: 4_600_000, high: 6_100_000 },
    designFeeRange: { low: 250_000, high: 400_000 },
    budgetRange: { low: 5_000_000, high: 6_750_000 },
  });
  expect(frozenSnapshot).toEqual(snapshot);
});
