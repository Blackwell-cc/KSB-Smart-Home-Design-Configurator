import { useState } from "react";
import { THAI_PROVINCES } from "../domain/provinces";
import type { HouseConfiguration } from "../domain/configuration";
import styles from "./configurator-shell.module.css";

type SiteBudgetStepProps = {
  configuration: HouseConfiguration;
  error?: string;
  errorId?: string;
  onChange(patch: Partial<HouseConfiguration>): void;
};

export function SiteBudgetStep({ configuration, error, errorId, onChange }: SiteBudgetStepProps) {
  const budget = configuration.targetBudget;
  const [budgetDraft, setBudgetDraft] = useState({ min: budget?.min.toString() ?? "", max: budget?.max.toString() ?? "" });
  const reversedBudget = budgetDraft.min !== "" && budgetDraft.max !== "" && Number(budgetDraft.min) > Number(budgetDraft.max);
  const updateBudget = (key: "min" | "max", rawValue: string) => {
    const next = { ...budgetDraft, [key]: rawValue };
    setBudgetDraft(next);
    if (next.min === "" || next.max === "") {
      onChange({ targetBudget: null });
      return;
    }
    const min = Number(next.min); const max = Number(next.max);
    if (Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min) onChange({ targetBudget: { min, max } });
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
          {THAI_PROVINCES.map((province) => <option key={province.code} value={province.code}>{province.name}</option>)}
        </select>
        {error ? <p className={styles.error} id={errorId} role="alert">{error}</p> : null}
      </div>
      <div className={styles.field}>
        <label htmlFor="district">อำเภอ / เขต <span>(ไม่บังคับ)</span></label>
        <input id="district" maxLength={100} onChange={(event) => onChange({ district: event.target.value || null })} value={configuration.district ?? ""} />
      </div>
      <div className={styles.field}>
        <label htmlFor="site-access">สภาพการเข้าถึงหน้างาน</label>
        <select id="site-access" onChange={(event) => onChange({ siteAccess: event.target.value as HouseConfiguration["siteAccess"] })} value={configuration.siteAccess}>
          <option value="normal">เข้าถึงปกติ</option><option value="restricted">เข้าถึงได้จำกัด</option><option value="very-restricted">เข้าถึงได้จำกัดมาก</option>
        </select>
        <p>ช่วยให้สถาปนิกพิจารณาการขนส่งและการวางแผนหน้างานเบื้องต้น</p>
      </div>
      <fieldset className={styles.choiceFieldset}>
        <legend>งบประมาณที่วางไว้ <span>(ไม่บังคับ)</span></legend>
        <div className={styles.budgetGrid}>
          <label>เริ่มต้น (บาท)<input aria-describedby={reversedBudget ? "budget-error" : undefined} inputMode="numeric" min="1" onChange={(event) => updateBudget("min", event.target.value)} type="number" value={budgetDraft.min} /></label>
          <label>สูงสุด (บาท)<input aria-describedby={reversedBudget ? "budget-error" : undefined} inputMode="numeric" min="1" onChange={(event) => updateBudget("max", event.target.value)} type="number" value={budgetDraft.max} /></label>
        </div>
        {reversedBudget ? <p className={styles.error} id="budget-error" role="alert">งบประมาณสูงสุดต้องไม่น้อยกว่างบเริ่มต้น</p> : null}
      </fieldset>
    </div>
  );
}
