import type { HouseConfiguration } from "../domain/configuration";
import {
  MATERIAL_CATALOG,
  MATERIAL_QUALITY_CATALOG,
  SPECIAL_FEATURE_CATALOG,
  type MaterialCategoryId,
} from "../domain/material-catalog";
import { AssetPlaceholder } from "./asset-placeholder";
import styles from "./materials-preview.module.css";

type MaterialsPreviewProps = {
  configuration: HouseConfiguration;
};

function materialLabel(configuration: HouseConfiguration, categoryId: MaterialCategoryId): string {
  const category = MATERIAL_CATALOG.find(({ id }) => id === categoryId);
  const selection = configuration.materialSelections[categoryId];
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
  const summary = [
    ["หลังคา", materialLabel(configuration, "roof")],
    ["ผนังภายนอก", materialLabel(configuration, "wall")],
    ["ประตู / หน้าต่าง", `${materialLabel(configuration, "door")} / ${materialLabel(configuration, "window")}`],
    ["พื้น", materialLabel(configuration, "flooring")],
    ["ระดับคุณภาพ", quality?.label ?? configuration.materialQualityId],
    ["ส่วนพิเศษ", featureSummary(configuration)],
  ] as const;

  return (
    <aside aria-label="ภาพตัวอย่างวัสดุ" className={styles.preview} data-mobile-preview-ratio="16:10">
      <div className={styles.previewSurface}>
        <AssetPlaceholder type="preview" testId="main-house-preview-placeholder" />
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
