import type { AreaRecommendation } from "@/features/area-planning/domain/calculate-area";
import { MATERIAL_QUALITY_CATALOG, SPECIAL_FEATURE_CATALOG } from "../domain/material-catalog";
import { CONCEPT_CATALOG } from "@/features/preview/domain/concept-catalog";
import type { HouseConfiguration } from "../domain/configuration";
import { THAI_PROVINCES } from "../domain/provinces";

type MaterialSwatch = {
  label: string;
  color: string;
};

type MaterialBoard = {
  label: string;
  description: string;
  swatches: readonly MaterialSwatch[];
};

const MATERIAL_BOARDS = {
  select: {
    label: "Select",
    description: "วัสดุมาตรฐานคุณภาพดี เพื่อควบคุมกรอบงบประมาณอย่างมีระบบ",
    swatches: [
      { label: "ผนัง", color: "#D7CFC2" },
      { label: "ไม้", color: "#8A6548" },
      { label: "โลหะและกระจก", color: "#A9B0AF" },
    ],
  },
  premium: {
    label: "Premium",
    description: "สมดุลความสวยงาม รายละเอียด และคุณภาพ เพื่อภาพรวมที่ประณีตขึ้น",
    swatches: [
      { label: "ผนัง", color: "#E5DDD1" },
      { label: "ไม้", color: "#69452E" },
      { label: "โลหะและกระจก", color: "#7B7770" },
    ],
  },
  signature: {
    label: "Signature",
    description: "เปิดพื้นที่สำหรับวัสดุและรายละเอียดเฉพาะตัว ที่สะท้อนตัวตนของเจ้าของบ้าน",
    swatches: [
      { label: "ผนัง", color: "#BDA98C" },
      { label: "ไม้", color: "#4D2E1F" },
      { label: "โลหะและกระจก", color: "#A98550" },
    ],
  },
} as const satisfies Record<HouseConfiguration["materialLevel"], MaterialBoard>;

export type LivePreviewModel = {
  concept: (typeof CONCEPT_CATALOG)[number];
  material: {
    level: HouseConfiguration["materialLevel"];
    label: string;
    description: string;
    swatches: readonly MaterialSwatch[];
  };
  metricRows: Array<{ id: string; label: string; value: string }>;
  activeFeatures: Array<{ code: HouseConfiguration["specialFeatures"][number]; label: string }>;
};

export function buildLivePreview(configuration: HouseConfiguration, area: AreaRecommendation): LivePreviewModel {
  const concept = CONCEPT_CATALOG.find((item) => item.id === configuration.styleId) ?? CONCEPT_CATALOG[0];
  const material = MATERIAL_BOARDS[configuration.materialLevel];
  const materialQuality = MATERIAL_QUALITY_CATALOG.find((quality) => quality.id === configuration.materialQualityId);
  const provinceName = THAI_PROVINCES.find((province) => province.code === configuration.provinceCode)?.name ?? "ยังไม่ได้เลือกจังหวัด";

  return {
    concept,
    material: { level: configuration.materialLevel, ...material, label: materialQuality?.label ?? material.label, description: materialQuality?.description ?? material.description },
    metricRows: [
      { id: "floors", label: "จำนวนชั้น", value: `${configuration.floors} ชั้น` },
      { id: "bedrooms", label: "ห้องนอน", value: `${configuration.bedrooms} ห้อง` },
      { id: "bathrooms", label: "ห้องน้ำ", value: `${configuration.bathrooms} ห้อง` },
      { id: "parking-spaces", label: "ที่จอดรถ", value: `${configuration.parkingSpaces} คัน` },
      { id: "usable-area", label: "พื้นที่ใช้สอย", value: `${area.usableAreaM2} ตร.ม.` },
      { id: "construction-floor-area", label: "พื้นที่ก่อสร้างรวม (CFA)", value: `${area.constructionFloorAreaM2} ตร.ม.` },
      { id: "province", label: "จังหวัด", value: provinceName },
    ],
    activeFeatures: configuration.specialFeatures.map((code) => ({
      code,
      label: SPECIAL_FEATURE_CATALOG.find((feature) => feature.id === code)?.label ?? code,
    })),
  };
}
