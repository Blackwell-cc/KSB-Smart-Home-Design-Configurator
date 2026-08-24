import Image from "next/image";
import type { HouseConfiguration } from "../domain/configuration";
import {
  MATERIAL_CATALOG,
  MATERIAL_QUALITY_CATALOG,
  SPECIAL_FEATURE_CATALOG,
  materialLevelForQuality,
  type MaterialCategoryId,
  type MaterialQualityId,
  type SpecialFeatureId,
} from "../domain/material-catalog";
import { AssetPlaceholder } from "./asset-placeholder";
import styles from "./material-features-step.module.css";

type MaterialFeaturesStepProps = {
  configuration: HouseConfiguration;
  onChange(patch: Partial<HouseConfiguration>): void;
};

export function MaterialFeaturesStep({ configuration, onChange }: MaterialFeaturesStepProps) {
  const selectMaterial = (category: MaterialCategoryId, option: string) => {
    onChange({
      materialSelections: {
        ...configuration.materialSelections,
        [category]: option,
      },
    });
  };

  const toggleFeature = (feature: SpecialFeatureId) => {
    const active = configuration.specialFeatures.includes(feature);
    onChange({
      specialFeatures: active
        ? configuration.specialFeatures.filter((item) => item !== feature)
        : [...configuration.specialFeatures, feature],
    });
  };

  const selectQuality = (quality: MaterialQualityId) => {
    onChange({
      materialQualityId: quality,
      materialLevel: materialLevelForQuality(quality),
    });
  };

  return (
    <div className={styles.step}>
      <div className={styles.scrollArea} data-testid="material-scroll-area">
        <div className={styles.materialSections}>
          {MATERIAL_CATALOG.map((category) => (
            <fieldset className={styles.section} key={category.id}>
              <legend>{category.label}</legend>
              <div className={styles.optionGrid} role="radiogroup" aria-label={category.label}>
                {category.options.map((option) => {
                  const selected = configuration.materialSelections[category.id] === option.id;
                  return (
                    <label className={styles.assetChoice} data-selected={selected} key={option.id}>
                      <input
                        checked={selected}
                        name={`material-${category.id}`}
                        onChange={() => selectMaterial(category.id, option.id)}
                        type="radio"
                        value={option.id}
                      />
                      {"imageSrc" in option ? (
                        <span aria-hidden="true" className={styles.assetMedia}>
                          <Image
                            alt=""
                            className={styles.assetImage}
                            fill
                            sizes="(max-width: 1199px) 45vw, 140px"
                            src={option.imageSrc}
                            unoptimized
                          />
                        </span>
                      ) : (
                        <AssetPlaceholder type="material" testId="material-asset-placeholder" />
                      )}
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <fieldset className={styles.section}>
          <legend>ส่วนพิเศษที่อยากพิจารณา</legend>
          <p className={styles.impact}>รายการที่เลือกจะบันทึกเป็นความต้องการในการออกแบบ โดยเฉพาะรายการที่ยังไม่มีเกณฑ์ราคา</p>
          <div className={styles.featureGrid}>
            {SPECIAL_FEATURE_CATALOG.map((feature) => {
              const selected = configuration.specialFeatures.includes(feature.id);
              return (
                <label className={styles.assetChoice} data-selected={selected} key={feature.id}>
                  <input
                    checked={selected}
                    onChange={() => toggleFeature(feature.id)}
                    type="checkbox"
                    value={feature.id}
                  />
                  {"imageSrc" in feature ? (
                    <span aria-hidden="true" className={styles.assetMedia}>
                      <Image
                        alt=""
                        className={styles.assetImage}
                        fill
                        sizes="(max-width: 1199px) 45vw, 120px"
                        src={feature.imageSrc}
                        unoptimized
                      />
                    </span>
                  ) : (
                    <AssetPlaceholder type="feature" testId="feature-asset-placeholder" />
                  )}
                  <span>{feature.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      <fieldset className={`${styles.section} ${styles.qualityFieldset}`}>
        <legend>ระดับคุณภาพวัสดุ</legend>
        <p className={styles.impact}>ระดับคุณภาพวัสดุมีผลต่อคุณภาพโดยรวมและงบประมาณของโครงการ</p>
        <div className={styles.qualityGrid} role="radiogroup" aria-label="ระดับคุณภาพวัสดุ">
          {MATERIAL_QUALITY_CATALOG.map((quality) => {
            const selected = configuration.materialQualityId === quality.id;
            return (
              <label className={styles.qualityChoice} data-selected={selected} key={quality.id}>
                <input
                  checked={selected}
                  name="material-quality"
                  onChange={() => selectQuality(quality.id)}
                  type="radio"
                  value={quality.id}
                />
                <span>
                  <strong>{quality.label}</strong>
                  <small>{quality.description}</small>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
