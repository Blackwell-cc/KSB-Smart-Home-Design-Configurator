import { calculateArea } from "@/features/area-planning/domain/calculate-area";
import { QA_AREA_CATALOG } from "@/features/area-planning/domain/area-catalog";
import { CONCEPT_CATALOG, conceptForFloors } from "@/features/preview/domain/concept-catalog";
import type { HouseConfiguration } from "../domain/configuration";
import { budgetRangeOptionFor } from "../domain/budget-ranges";
import {
  MATERIAL_CATALOG,
  MATERIAL_QUALITY_CATALOG,
  SPECIAL_FEATURE_CATALOG,
  type MaterialQualityId,
} from "../domain/material-catalog";
import { THAI_PROVINCES } from "../domain/provinces";
import { ADDITIONAL_REQUIREMENT_LABELS } from "./additional-requirements";

export const FUNCTION_DISPLAY_LABELS: Record<keyof HouseConfiguration["functions"], string> = {
  office: "ห้องทำงาน",
  elderlyRoom: "ห้องผู้สูงอายุ",
  thaiKitchen: "ครัวไทย",
  multipurposeRoom: "ห้องอเนกประสงค์",
};

const SITE_ACCESS_LABELS: Record<HouseConfiguration["siteAccess"], string> = {
  normal: "เข้าถึงสะดวก",
  restricted: "ถนนค่อนข้างแคบ",
  "very-restricted": "รถขนาดใหญ่เข้าถึงยาก",
};

const QUALITY_THAI_LABELS: Record<MaterialQualityId, string> = {
  standard: "มาตรฐาน",
  premium: "พรีเมียม",
  signature: "ซิกเนเจอร์",
  bespoke: "เบสโป๊ก",
};

const QUALITY_DESCRIPTIONS: Record<MaterialQualityId, string> = {
  standard: "คุ้มค่า เหมาะสำหรับการใช้งานทั่วไป",
  premium: "วัสดุคุณภาพดี ดีไซน์สวยงามและทนทาน",
  signature: "วัสดุเกรดพรีเมียม คัดสรรอย่างพิถีพิถัน",
  bespoke: "วัสดุหายาก ระดับลักชัวรี สั่งทำพิเศษเฉพาะคุณ",
};

export function buildReviewSummary(configuration: HouseConfiguration) {
  const area = calculateArea(configuration, QA_AREA_CATALOG);
  const catalogConcept = CONCEPT_CATALOG.find((item) => item.id === configuration.styleId);
  const concept = catalogConcept ? conceptForFloors(catalogConcept, configuration.floors) : null;
  const province = THAI_PROVINCES.find((item) => item.code === configuration.provinceCode)?.name;
  const quality = MATERIAL_QUALITY_CATALOG.find((item) => item.id === configuration.materialQualityId)!;
  const functionLabels = Object.entries(configuration.functions)
    .filter(([, enabled]) => enabled)
    .map(([id]) => FUNCTION_DISPLAY_LABELS[id as keyof HouseConfiguration["functions"]]);

  functionLabels.push(
    ...configuration.additionalRequirements.map((id) => ADDITIONAL_REQUIREMENT_LABELS[id]),
  );

  const materials = MATERIAL_CATALOG.map((category) => {
    const selectedId = configuration.materialSelections[category.id];
    const selectedOption = category.options.find((option) => option.id === selectedId);
    return {
      categoryId: category.id,
      categoryLabel: category.label,
      imageSrc: selectedOption?.imageSrc ?? null,
      optionLabel: selectedOption?.label ?? "ยังไม่ได้เลือก",
    };
  });

  const specialFeatureLabels = configuration.specialFeatures.map(
    (id) => SPECIAL_FEATURE_CATALOG.find((feature) => feature.id === id)?.label ?? "รายการส่วนพิเศษ",
  );
  const missingSections = [
    ...(concept ? [] : ["สไตล์บ้าน"]),
    ...(configuration.residents > 0 && configuration.floors > 0 && configuration.bedrooms > 0 && configuration.bathrooms > 0 ? [] : ["พื้นที่และฟังก์ชัน"]),
    ...(province ? [] : ["ทำเลที่ตั้ง"]),
    ...(quality ? [] : ["ระดับคุณภาพวัสดุ"]),
  ];

  return {
    concept,
    area,
    functionLabels,
    location: {
      province: province ?? "ยังไม่ได้ระบุจังหวัด",
      district: configuration.district?.trim() || "ยังไม่ได้ระบุอำเภอ / เขต",
      access: SITE_ACCESS_LABELS[configuration.siteAccess],
    },
    budgetLabel: configuration.budgetRangeId === "unspecified"
      ? "ยังไม่ระบุช่วงงบประมาณ"
      : budgetRangeOptionFor(configuration.budgetRangeId).label,
    materials,
    specialFeatureLabels,
    quality: {
      label: quality.label,
      thaiLabel: QUALITY_THAI_LABELS[configuration.materialQualityId],
      description: QUALITY_DESCRIPTIONS[configuration.materialQualityId],
    },
    missingSections,
    isReady: missingSections.length === 0,
  };
}
