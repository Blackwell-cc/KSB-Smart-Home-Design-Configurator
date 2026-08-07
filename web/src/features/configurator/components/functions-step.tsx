import { Counter } from "@/components/ui/counter";
import { useState } from "react";
import type { HouseConfiguration } from "../domain/configuration";
import styles from "./configurator-shell.module.css";

type FunctionsStepProps = {
  configuration: HouseConfiguration;
  onChange(patch: Partial<HouseConfiguration>): void;
};

const FUNCTION_CHOICES = [
  ["office", "ห้องทำงาน"],
  ["elderlyRoom", "ห้องผู้สูงอายุ"],
  ["thaiKitchen", "ครัวไทย"],
  ["multipurposeRoom", "ห้องอเนกประสงค์"],
] as const;

export function FunctionsStep({ configuration, onChange }: FunctionsStepProps) {
  const [areaDraft, setAreaDraft] = useState(configuration.usableAreaOverrideM2?.toString() ?? "");
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
        <input aria-describedby="usable-area-help" id="usable-area" inputMode="numeric" max="1500" min="60" onChange={(event) => {
          const value = event.target.value;
          setAreaDraft(value);
          if (value === "") onChange({ usableAreaOverrideM2: null });
          const parsed = Number(value);
          if (Number.isFinite(parsed) && parsed >= 60 && parsed <= 1500) onChange({ usableAreaOverrideM2: parsed });
        }} type="number" value={areaDraft} />
        <p id="usable-area-help">เว้นว่างเพื่อใช้พื้นที่แนะนำจากจำนวนห้องและผู้อยู่อาศัย (60–1,500 ตร.ม.)</p>
      </div>
      <fieldset className={styles.choiceFieldset}>
        <legend>ฟังก์ชันเพิ่มเติม</legend>
        <div className={styles.checkboxGrid}>
          {FUNCTION_CHOICES.map(([key, label]) => (
            <label className={styles.checkChoice} key={key}>
              <input
                checked={configuration.functions[key]}
                onChange={(event) => onChange({ functions: { ...configuration.functions, [key]: event.target.checked } })}
                type="checkbox"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
