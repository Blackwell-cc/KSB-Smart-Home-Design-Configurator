import { THAI_PROVINCE_CODES } from "../domain/provinces";
import type { HouseConfiguration } from "../domain/configuration";
import styles from "./configurator-shell.module.css";

type SiteBudgetStepProps = {
  configuration: HouseConfiguration;
  error?: string;
  errorId?: string;
  onChange(patch: Partial<HouseConfiguration>): void;
};

const PROVINCE_NAMES: Record<string, string> = {
  "10": "กรุงเทพมหานคร",
  "20": "ชลบุรี",
  "50": "เชียงใหม่",
  "76": "เพชรบุรี",
  "83": "ภูเก็ต",
};

export function SiteBudgetStep({ configuration, error, errorId, onChange }: SiteBudgetStepProps) {
  const budget = configuration.targetBudget;
  const updateBudget = (key: "min" | "max", rawValue: string) => {
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      onChange({ targetBudget: null });
      return;
    }
    const other = key === "min" ? budget?.max ?? parsed : budget?.min ?? parsed;
    onChange({ targetBudget: key === "min" ? { min: parsed, max: other } : { min: other, max: parsed } });
  };

  return (
    <div className={styles.stepStack}>
      <div className={styles.field}>
        <label htmlFor="province">จังหวัด</label>
        <select
          aria-describedby={error ? errorId : undefined}
          id="province"
          onChange={(event) => onChange({ provinceCode: event.target.value === "" ? null : event.target.value as HouseConfiguration["provinceCode"] })}
          value={configuration.provinceCode ?? ""}
        >
          <option value="">เลือกจังหวัด</option>
          {THAI_PROVINCE_CODES.map((code) => <option key={code} value={code}>{PROVINCE_NAMES[code] ?? `จังหวัดรหัส ${code}`}</option>)}
        </select>
        {error ? <p className={styles.error} id={errorId} role="alert">{error}</p> : null}
      </div>
      <div className={styles.field}>
        <label htmlFor="district">อำเภอ / เขต <span>(ไม่บังคับ)</span></label>
        <input id="district" maxLength={100} onChange={(event) => onChange({ district: event.target.value || null })} value={configuration.district ?? ""} />
      </div>
      <fieldset className={styles.choiceFieldset}>
        <legend>งบประมาณที่วางไว้ <span>(ไม่บังคับ)</span></legend>
        <div className={styles.budgetGrid}>
          <label>เริ่มต้น (บาท)<input inputMode="numeric" min="1" onChange={(event) => updateBudget("min", event.target.value)} type="number" value={budget?.min ?? ""} /></label>
          <label>สูงสุด (บาท)<input inputMode="numeric" min="1" onChange={(event) => updateBudget("max", event.target.value)} type="number" value={budget?.max ?? ""} /></label>
        </div>
      </fieldset>
    </div>
  );
}
