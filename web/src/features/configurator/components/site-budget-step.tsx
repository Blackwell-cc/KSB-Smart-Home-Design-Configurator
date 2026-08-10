import { THAI_PROVINCES } from "../domain/provinces";
import { FieldError } from "@/components/ui/field-error";
import type { HouseConfiguration } from "../domain/configuration";
import styles from "./configurator-shell.module.css";

type SiteBudgetStepProps = {
  budgetDraft: { min: string; max: string };
  budgetError?: string;
  configuration: HouseConfiguration;
  error?: string;
  errorId?: string;
  onBudgetChange(key: "min" | "max", value: string): void;
  onChange(patch: Partial<HouseConfiguration>): void;
};

export function SiteBudgetStep({ budgetDraft, budgetError, configuration, error, errorId, onBudgetChange, onChange }: SiteBudgetStepProps) {

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
        {error ? <FieldError className={styles.error} id={errorId}>{error}</FieldError> : null}
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
          <label>เริ่มต้น (บาท)<input aria-describedby={budgetError ? "budget-error" : undefined} inputMode="numeric" min="1" onChange={(event) => onBudgetChange("min", event.target.value)} type="number" value={budgetDraft.min} /></label>
          <label>สูงสุด (บาท)<input aria-describedby={budgetError ? "budget-error" : undefined} inputMode="numeric" min="1" onChange={(event) => onBudgetChange("max", event.target.value)} type="number" value={budgetDraft.max} /></label>
        </div>
        {budgetError ? <FieldError className={styles.error} id="budget-error">{budgetError}</FieldError> : null}
      </fieldset>
    </div>
  );
}
