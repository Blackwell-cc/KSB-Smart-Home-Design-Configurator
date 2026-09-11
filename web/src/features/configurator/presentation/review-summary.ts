import { calculateArea } from "@/features/area-planning/domain/calculate-area";
import { QA_AREA_CATALOG } from "@/features/area-planning/domain/area-catalog";
import { CONCEPT_CATALOG, conceptForFloors } from "@/features/preview/domain/concept-catalog";
import type { HouseConfiguration } from "../domain/configuration";
import { budgetRangeOptionFor } from "../domain/budget-ranges";
import {
  visibleMaterialCatalogForStyle,
  MATERIAL_QUALITY_CATALOG,
  ORIGINAL_MATERIAL_OPTION_ID,
  ORIGINAL_MATERIAL_OPTION_LABEL,
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

  const materials = visibleMaterialCatalogForStyle(configuration.styleId).map((category) => {
    const lockedMaterialLabel = configuration.styleId === "loft-style"
      && (category.id === "roof" || category.id === "wall")
      ? "คงรูปแบบต้นฉบับ Loft"
      : configuration.styleId === "classic-style" && category.id === "wall"
        ? "คงรูปแบบต้นฉบับ Classic"
        : configuration.styleId === "vintage-style" && category.id === "wall"
          ? "คงรูปแบบต้นฉบับ Contemporary"
          : null;
    const selectedId = configuration.materialSelections[category.id];
    const selectedOption = category.options.find((option) => option.id === selectedId);
    const original = selectedId === ORIGINAL_MATERIAL_OPTION_ID;
    return {
      categoryId: category.id,
      categoryLabel: category.label,
      imageSrc: lockedMaterialLabel || original ? null : selectedOption?.imageSrc ?? null,
      optionLabel: lockedMaterialLabel ?? (original ? ORIGINAL_MATERIAL_OPTION_LABEL : selectedOption?.label) ?? "ยังไม่ได้เลือก",
    };
  });

  const specialFeatures = configuration.specialFeatures.flatMap((id) => {
    const feature = SPECIAL_FEATURE_CATALOG.find((item) => item.id === id);

    return feature
      ? [{ id: feature.id, label: feature.label, imageSrc: feature.imageSrc }]
      : [];
  });
  const specialFeatureLabels = specialFeatures.map((feature) => feature.label);
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
    specialFeatures,
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
