import { ChoiceCard } from "@/components/ui/choice-card";
import type { HouseConfiguration } from "../domain/configuration";
import styles from "./configurator-shell.module.css";

type MaterialFeaturesStepProps = {
  configuration: HouseConfiguration;
  onChange(patch: Partial<HouseConfiguration>): void;
};

const MATERIALS = [
  ["select", "Select", "คุณภาพดี คุมงบอย่างมีมาตรฐาน"],
  ["premium", "Premium", "สมดุลความสวย รายละเอียด และคุณภาพ"],
  ["signature", "Signature", "วัสดุและรายละเอียดเฉพาะตัว"],
] as const;

const SPECIAL_FEATURES = [
  ["pool", "สระว่ายน้ำ"],
  ["lift", "ลิฟต์"],
  ["smart-home", "ระบบ Smart Home"],
  ["solar", "โซลาร์เซลล์"],
  ["ev-charger", "ที่ชาร์จรถ EV"],
  ["double-volume", "โถง Double Volume"],
  ["large-glazing", "ผนังกระจกขนาดใหญ่"],
] as const;

export function MaterialFeaturesStep({ configuration, onChange }: MaterialFeaturesStepProps) {
  const toggleFeature = (feature: HouseConfiguration["specialFeatures"][number]) => {
    const active = configuration.specialFeatures.includes(feature);
    onChange({
      specialFeatures: active
        ? configuration.specialFeatures.filter((item) => item !== feature)
        : [...configuration.specialFeatures, feature],
    });
  };

  return (
    <div className={styles.stepStack}>
      <div aria-label="ระดับวัสดุ" className={styles.materialGrid} role="radiogroup">
        {MATERIALS.map(([id, title, description]) => (
          <ChoiceCard
            aria-checked={configuration.materialLevel === id}
            description={description}
            key={id}
            onClick={() => onChange({ materialLevel: id })}
            selected={configuration.materialLevel === id}
            selectionRole="radio"
            title={title}
          />
        ))}
      </div>
      <fieldset className={styles.choiceFieldset}>
        <legend>ส่วนพิเศษที่อยากพิจารณา</legend>
        <div className={styles.checkboxGrid}>
          {SPECIAL_FEATURES.map(([id, label]) => (
            <label className={styles.checkChoice} key={id}>
              <input checked={configuration.specialFeatures.includes(id)} onChange={() => toggleFeature(id)} type="checkbox" />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
