import { ChoiceCard } from "@/components/ui/choice-card";
import type { HouseConfiguration } from "../domain/configuration";
import styles from "./configurator-shell.module.css";

type MaterialFeaturesStepProps = {
  configuration: HouseConfiguration;
  onChange(patch: Partial<HouseConfiguration>): void;
};

const MATERIALS = [
  ["select", "Select", "คุณภาพดี คุมงบอย่างมีมาตรฐาน", [["ผนัง", "#D7CFC2"], ["ไม้", "#8A6548"], ["โลหะและกระจก", "#A9B0AF"]]],
  ["premium", "Premium", "สมดุลความสวย รายละเอียด และคุณภาพ", [["ผนัง", "#E5DDD1"], ["ไม้", "#69452E"], ["โลหะและกระจก", "#7B7770"]]],
  ["signature", "Signature", "วัสดุและรายละเอียดเฉพาะตัว", [["ผนัง", "#BDA98C"], ["ไม้", "#4D2E1F"], ["โลหะและกระจก", "#A98550"]]],
] as const;

const SPECIAL_FEATURES = [
  ["pool", "สระว่ายน้ำ", "พิจารณา allowance และหมวดงบ"],
  ["lift", "ลิฟต์", "พิจารณา allowance และหมวดงบ"],
  ["smart-home", "ระบบ Smart Home", "พิจารณา allowance และหมวดงบ"],
  ["solar", "โซลาร์เซลล์", "พิจารณา allowance และหมวดงบ"],
  ["ev-charger", "ที่ชาร์จรถ EV", "พิจารณา allowance และหมวดงบ"],
  ["double-volume", "โถง Double Volume", "พิจารณา allowance และหมวดงบ"],
  ["large-glazing", "ผนังกระจกขนาดใหญ่", "พิจารณา allowance และหมวดงบ"],
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
        {MATERIALS.map(([id, title, description, swatches]) => (
          <ChoiceCard
            aria-checked={configuration.materialLevel === id}
            data-material-board={id}
            description={description}
            icon={<span aria-label={`วัสดุระดับ ${title}`} className={styles.materialBoard}>{swatches.map(([label, color]) => <span className={styles.materialBoardSwatch} data-testid="material-swatch" key={label}><span aria-hidden="true" className={styles.materialBoardColor} style={{ backgroundColor: color }} /><span>{label}</span></span>)}</span>}
            key={id}
            onClick={() => onChange({ materialLevel: id })}
            onKeyDown={(event) => {
              if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) return;
              event.preventDefault();
              const current = MATERIALS.findIndex(([material]) => material === configuration.materialLevel);
              const direction = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1;
              const next = (current + direction + MATERIALS.length) % MATERIALS.length;
              const group = event.currentTarget.parentElement;
              onChange({ materialLevel: MATERIALS[next][0] });
              requestAnimationFrame(() => group?.querySelectorAll<HTMLElement>("[role=radio]")[next]?.focus());
            }}
            selected={configuration.materialLevel === id}
            selectionRole="radio"
            tabIndex={configuration.materialLevel === id ? 0 : -1}
            title={title}
          />
        ))}
      </div>
      <fieldset className={styles.choiceFieldset}>
        <legend>ส่วนพิเศษที่อยากพิจารณา</legend>
        <p className={styles.choiceImpact}>มีผลต่อ allowance และหมวดงบประมาณ</p>
        <div className={styles.checkboxGrid}>
          {SPECIAL_FEATURES.map(([id, label, impact]) => (
            <label className={styles.checkChoice} data-selected={configuration.specialFeatures.includes(id)} key={id}>
              <input checked={configuration.specialFeatures.includes(id)} onChange={() => toggleFeature(id)} type="checkbox" />
              <span className={styles.featureCopy}><span className={styles.featureLabel}>{label}</span><span aria-hidden="true" className={styles.featureImpact}>{impact}</span></span>
              <span aria-hidden="true" className={styles.featureState}>{configuration.specialFeatures.includes(id) ? "เลือกแล้ว" : "เพิ่มในโจทย์"}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
