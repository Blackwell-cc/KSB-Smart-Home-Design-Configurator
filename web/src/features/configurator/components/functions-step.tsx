import { Counter } from "@/components/ui/counter";
import { FieldError } from "@/components/ui/field-error";
import type { HouseConfiguration } from "../domain/configuration";
import styles from "./configurator-shell.module.css";

type FunctionsStepProps = {
  areaDraft: string;
  areaError?: string;
  configuration: HouseConfiguration;
  onAreaChange(value: string): void;
  onChange(patch: Partial<HouseConfiguration>): void;
};

const FUNCTION_CHOICES = [
  ["office", "ห้องทำงาน"],
  ["elderlyRoom", "ห้องผู้สูงอายุ"],
  ["thaiKitchen", "ครัวไทย"],
  ["multipurposeRoom", "ห้องอเนกประสงค์"],
] as const;

export function FunctionsStep({ areaDraft, areaError, configuration, onAreaChange, onChange }: FunctionsStepProps) {
  const updateNumber = (key: "residents" | "floors" | "bedrooms" | "bathrooms" | "parkingSpaces") => (value: number) =>
    onChange({ [key]: value });

  return (
    <div className={styles.stepStack}>
      <div className={styles.counterGrid}>
        <Counter label="จำนวนผู้อยู่อาศัย" max={20} min={1} onChange={updateNumber("residents")} value={configuration.residents} />
        <Counter label="จำนวนชั้น" max={3} min={1} onChange={updateNumber("floors")} value={configuration.floors} />
        <Counter label="จำนวนห้องนอน" max={12} min={1} onChange={updateNumber("bedrooms")} value={configuration.bedrooms} />
        <Counter label="จำนวนห้องน้ำ" max={15} min={1} onChange={updateNumber("bathrooms")} value={configuration.bathrooms} />
        <Counter label="ที่จอดรถ" max={10} min={0} onChange={updateNumber("parkingSpaces")} value={configuration.parkingSpaces} />
      </div>
      <div className={styles.field}>
        <label htmlFor="usable-area">พื้นที่ใช้สอยที่ต้องการ <span>(ไม่บังคับ)</span></label>
        <input aria-describedby={areaError ? "usable-area-help usable-area-error" : "usable-area-help"} id="usable-area" inputMode="numeric" max="1500" min="60" onChange={(event) => onAreaChange(event.target.value)} type="number" value={areaDraft} />
        <p id="usable-area-help">เว้นว่างเพื่อใช้พื้นที่แนะนำจากจำนวนห้องและผู้อยู่อาศัย (60–1,500 ตร.ม.)</p>
        {areaError ? <FieldError className={styles.error} id="usable-area-error">{areaError}</FieldError> : null}
      </div>
      <fieldset className={styles.choiceFieldset}>
        <legend>ฟังก์ชันเพิ่มเติม</legend>
        <div className={styles.checkboxGrid}>
          {FUNCTION_CHOICES.map(([key, label]) => (
            <label className={styles.checkChoice} data-selected={configuration.functions[key]} key={key}>
              <input
                checked={configuration.functions[key]}
                onChange={(event) => onChange({ functions: { ...configuration.functions, [key]: event.target.checked } })}
                type="checkbox"
              />
              <span className={styles.featureLabel}>{label}</span>
              <span aria-hidden="true" className={styles.featureState}>{configuration.functions[key] ? "เลือกแล้ว" : "เพิ่มในโจทย์"}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
