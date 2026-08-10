import type { AreaRecommendation } from "@/features/area-planning/domain/calculate-area";
import type { HouseConfiguration } from "@/features/configurator/domain/configuration";
import { CONCEPT_CATALOG } from "../domain/concept-catalog";
import type { CalculationSnapshot, EstimateMode } from "@/features/pricing/domain/price-book";

type PreviewMoneyRange = { low: number; high: number };

export type FreePreviewPayload = {
  conceptAssetId: string;
  styleLabel: string;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  usableAreaM2: number;
  constructionFloorAreaM2: number;
  materialLevel: "select" | "premium" | "signature";
  constructionRange: PreviewMoneyRange;
  designFeeRange: PreviewMoneyRange;
  budgetRange: PreviewMoneyRange;
  confidence: "C";
  estimateMode: EstimateMode;
  disclaimer: string;
};

const FREE_PREVIEW_DISCLAIMER = "กรอบงบประมาณนี้เป็นข้อมูลเบื้องต้นสำหรับการวางแผนเท่านั้น รายละเอียดจริงต้องยืนยันหลังตรวจสอบแบบและหน้างาน";

function rangeFromLine(estimate: CalculationSnapshot, code: "core-construction" | "design-professional-fee"): PreviewMoneyRange {
  const line = estimate.lines.find((item) => item.code === code);
  if (!line) throw new Error(`FREE_PREVIEW_REQUIRED_LINE_MISSING:${code}`);
  return { low: line.amount.low, high: line.amount.high };
}

export function buildFreePreview(
  configuration: HouseConfiguration,
  area: AreaRecommendation,
  estimate: CalculationSnapshot,
  estimateMode: EstimateMode = "published",
): FreePreviewPayload {
  const concept = CONCEPT_CATALOG.find((item) => item.id === configuration.styleId);
  if (!concept) throw new Error("CONCEPT_NOT_FOUND");

  return {
    conceptAssetId: concept.id,
    styleLabel: concept.label,
    floors: configuration.floors,
    bedrooms: configuration.bedrooms,
    bathrooms: configuration.bathrooms,
    parkingSpaces: configuration.parkingSpaces,
    usableAreaM2: area.usableAreaM2,
    constructionFloorAreaM2: area.constructionFloorAreaM2,
    materialLevel: configuration.materialLevel,
    constructionRange: rangeFromLine(estimate, "core-construction"),
    designFeeRange: rangeFromLine(estimate, "design-professional-fee"),
    budgetRange: { low: estimate.total.low, high: estimate.total.high },
    confidence: "C",
    estimateMode,
    disclaimer: FREE_PREVIEW_DISCLAIMER,
  };
}
