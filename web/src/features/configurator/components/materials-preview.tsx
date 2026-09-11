import type { HouseConfiguration } from "../domain/configuration";
import {
  MATERIAL_QUALITY_CATALOG,
  ORIGINAL_MATERIAL_OPTION_ID,
  ORIGINAL_MATERIAL_OPTION_LABEL,
  SPECIAL_FEATURE_CATALOG,
  visibleMaterialCatalogForStyle,
  type MaterialCategoryId,
} from "../domain/material-catalog";
import { MaterialHousePreview } from "./material-house-preview";
import styles from "./materials-preview.module.css";

type MaterialsPreviewProps = {
  configuration: HouseConfiguration;
};

function materialLabel(configuration: HouseConfiguration, categoryId: MaterialCategoryId): string {
  const category = visibleMaterialCatalogForStyle(configuration.styleId)
    .find(({ id }) => id === categoryId);
  const selection = configuration.materialSelections[categoryId];
  if (selection === ORIGINAL_MATERIAL_OPTION_ID) return ORIGINAL_MATERIAL_OPTION_LABEL;
  return category?.options.find(({ id }) => id === selection)?.label ?? selection;
}

function featureSummary(configuration: HouseConfiguration): string {
  const labels = configuration.specialFeatures.map((featureId) => (
    SPECIAL_FEATURE_CATALOG.find(({ id }) => id === featureId)?.label ?? featureId
  ));
  return labels.length > 0 ? labels.join(" · ") : "ไม่ได้เลือก";
}

export function MaterialsPreview({ configuration }: MaterialsPreviewProps) {
  const quality = MATERIAL_QUALITY_CATALOG.find(({ id }) => id === configuration.materialQualityId);
  const lockedLoftMaterial = configuration.styleId === "loft-style" ? "ล็อกตามแบบ Loft" : null;
  const lockedClassicWall = configuration.styleId === "classic-style" ? "ล็อกตามแบบ Classic" : null;
  const lockedContemporaryWall = configuration.styleId === "vintage-style" ? "ล็อกตามแบบ Contemporary" : null;
  const summary = [
    ["หลังคา", lockedLoftMaterial ?? materialLabel(configuration, "roof")],
    ["ผนังภายนอก", lockedLoftMaterial ?? lockedClassicWall ?? lockedContemporaryWall ?? materialLabel(configuration, "wall")],
    ["ประตู / หน้าต่าง", `${materialLabel(configuration, "door")} / ${materialLabel(configuration, "window")}`],
    ["ระดับคุณภาพ", quality?.label ?? configuration.materialQualityId],
    ["ส่วนพิเศษ", featureSummary(configuration)],
  ] as const;

  return (
    <aside aria-label="ภาพตัวอย่างวัสดุ" className={styles.preview} data-mobile-preview-ratio="16:10">
      <div className={styles.previewSurface}>
        <MaterialHousePreview
          configuration={configuration}
          priority
          sizes="(max-width: 1199px) 100vw, 52vw"
        />
      </div>
      <section aria-labelledby="materials-summary-heading" className={styles.summary}>
        <h2 id="materials-summary-heading">สรุปวัสดุที่เลือก</h2>
        <dl>
          {summary.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </aside>
  );
}
