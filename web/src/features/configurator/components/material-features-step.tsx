import Image from "next/image";
import type { HouseConfiguration } from "../domain/configuration";
import {
  visibleMaterialCatalogForStyle,
  MATERIAL_QUALITY_CATALOG,
  SPECIAL_FEATURE_CATALOG,
  ORIGINAL_MATERIAL_OPTION_ID,
  ORIGINAL_MATERIAL_OPTION_LABEL,
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
  const isLoftStyle = configuration.styleId === "loft-style";
  const isClassicStyle = configuration.styleId === "classic-style";
  const isContemporaryStyle = configuration.styleId === "vintage-style";
  const materialCatalog = visibleMaterialCatalogForStyle(configuration.styleId);
  const materialLock = isLoftStyle
    ? {
        categories: ["roof", "wall"] as const,
        title: "หลังคาและผนังภายนอก",
        headingBadge: "ล็อกตามดีไซน์ Loft",
        optionBadge: "ล็อกตามแบบ Loft",
        description: "หลังคาและผนังภายนอกเป็นองค์ประกอบหลักที่กำหนดเอกลักษณ์ของบ้านสไตล์ Loft จึงแสดงตัวเลือกไว้เพื่อให้เห็นขอบเขตการออกแบบ แต่ล็อกไม่ให้เปลี่ยน เพื่อคงสัดส่วนและแนวคิด Loft ของต้นฉบับอย่างถูกต้อง",
      }
    : isClassicStyle
      ? {
          categories: ["wall"] as const,
          title: "ผนังภายนอก",
          headingBadge: "ล็อกตามดีไซน์ Classic",
          optionBadge: "ล็อกตามแบบ Classic",
          description: "ผนังภายนอกเป็นองค์ประกอบหลักที่กำหนดเอกลักษณ์ของบ้านสไตล์ Classic จึงแสดงตัวเลือกไว้เพื่อให้เห็นขอบเขตการออกแบบ แต่ล็อกไม่ให้เปลี่ยน เพื่อรักษาสัดส่วนและรายละเอียดคลาสสิกของต้นฉบับ",
        }
      : isContemporaryStyle
        ? {
            categories: ["wall"] as const,
            title: "ผนังภายนอก",
            headingBadge: "ล็อกตามดีไซน์ Contemporary",
            optionBadge: "ล็อกตามแบบ Contemporary",
            description: "ผนังภายนอกเป็นองค์ประกอบหลักที่กำหนดเอกลักษณ์ของบ้านสไตล์ Contemporary จึงแสดงตัวเลือกไว้เพื่อให้เห็นขอบเขตการออกแบบ แต่ล็อกไม่ให้เปลี่ยน เพื่อคงสัดส่วนและภาษาสถาปัตยกรรมร่วมสมัยของต้นฉบับ",
          }
        : null;
  const lockDescriptionId = materialLock ? "material-lock-description" : undefined;

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
          {materialLock ? (
            <section aria-labelledby="material-lock-title" className={styles.lockedMaterials}>
              <span aria-hidden="true" className={styles.lockIcon}>
                <svg fill="none" viewBox="0 0 24 24">
                  <rect height="10" rx="2" stroke="currentColor" strokeWidth="1.5" width="14" x="5" y="10" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
                  <path d="M12 14v2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
                </svg>
              </span>
              <div>
                <div className={styles.lockHeading}>
                  <h2 id="material-lock-title">{materialLock.title}</h2>
                  <span>{materialLock.headingBadge}</span>
                </div>
                <p id={lockDescriptionId}>{materialLock.description}</p>
              </div>
            </section>
          ) : null}
          {materialCatalog.map((category) => {
            const locked = Boolean(materialLock?.categories.includes(category.id as never));
            const selectedId = configuration.materialSelections[category.id];
            const selectedLabel = selectedId === ORIGINAL_MATERIAL_OPTION_ID
              ? ORIGINAL_MATERIAL_OPTION_LABEL
              : category.options.find((option) => option.id === selectedId)?.label ?? ORIGINAL_MATERIAL_OPTION_LABEL;
            return (
              <fieldset
                aria-describedby={locked ? lockDescriptionId : undefined}
                className={`${styles.section} ${locked ? styles.lockedCategory : ""}`}
                data-locked={locked}
                disabled={locked}
                key={category.id}
              >
                <legend>
                  <span className={styles.categoryLegend}>
                    {category.label}
                    {locked ? <span className={styles.lockedBadge}>{materialLock?.optionBadge}</span> : null}
                  </span>
                </legend>
                {!locked ? (
                  <div className={styles.materialStatus}>
                    <span className={styles.currentMaterial}>
                      <small>ค่าปัจจุบัน:</small>
                      <strong>{selectedLabel}</strong>
                    </span>
                    <button
                      aria-label={`รีเซ็ต${category.label}เป็น Original`}
                      className={styles.resetMaterial}
                      onClick={() => selectMaterial(category.id, ORIGINAL_MATERIAL_OPTION_ID)}
                      type="button"
                    >
                      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                        <path d="M4 11a8 8 0 1 1 2.34 5.66" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                        <path d="M4 6v5h5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                      </svg>
                      <span>รีเซ็ต</span>
                    </button>
                  </div>
                ) : null}
                <div aria-disabled={locked} className={styles.optionGrid} role="radiogroup" aria-label={category.label}>
                  {category.options.map((option) => {
                    const selected = configuration.materialSelections[category.id] === option.id;
                    return (
                      <label className={styles.assetChoice} data-locked={locked} data-selected={selected} key={option.id}>
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
            );
          })}
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
