import { FieldError } from "@/components/ui/field-error";
import { BUDGET_RANGE_OPTIONS } from "../domain/budget-ranges";
import type { HouseConfiguration } from "../domain/configuration";
import styles from "./configurator-shell.module.css";
import { ProvinceCombobox } from "./province-combobox";
import { SiteAccessSelect } from "./site-access-select";

type SiteBudgetStepProps = {
  configuration: HouseConfiguration;
  error?: string;
  errorId?: string;
  onChange(patch: Partial<HouseConfiguration>): void;
};

function SectionIcon({ type }: { type: "project" | "budget" }) {
  if (type === "budget") {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7.5h16v11H4zM7 4h10v3.5H7zM8 11h8M8 15h5" /></svg>;
  }

  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 20V7l7-3 7 3v13M9 10h2m2 0h2m-6 4h2m2 0h2M9 20v-3h6v3" /></svg>;
}

export function SiteBudgetStep({ configuration, error, errorId, onChange }: SiteBudgetStepProps) {
  return (
    <div className={styles.siteBudgetStack}>
      <section className={styles.siteBudgetSection}>
        <div className={styles.siteBudgetSectionHeading}>
          <SectionIcon type="project" />
          <h2>ข้อมูลโครงการ</h2>
          <span aria-hidden="true" />
        </div>

        <div className={styles.siteBudgetFields}>
          <div className={styles.field}>
            <label htmlFor="province">จังหวัด</label>
            <ProvinceCombobox
              describedBy={error ? errorId : undefined}
              onChange={(provinceCode) => onChange({ provinceCode })}
              value={configuration.provinceCode}
            />
            {error ? <FieldError className={styles.error} id={errorId}>{error}</FieldError> : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="district">อำเภอ / เขต <span>(ไม่บังคับ)</span></label>
            <input id="district" maxLength={100} onChange={(event) => onChange({ district: event.target.value || null })} placeholder="ระบุอำเภอ / เขต" value={configuration.district ?? ""} />
          </div>

          <div className={styles.field}>
            <label htmlFor="site-access">สภาพการเข้าถึงหน้างาน</label>
            <SiteAccessSelect onChange={(siteAccess) => onChange({ siteAccess })} value={configuration.siteAccess} />
            <p className={styles.fieldHelper}>ช่วยให้ทีมพิจารณาการขนส่งและการวางแผนหน้างานเบื้องต้น</p>
          </div>
        </div>
      </section>

      <fieldset aria-label="งบประมาณที่วางไว้" className={styles.budgetRangeFieldset} role="radiogroup">
        <legend className={styles.visuallyHidden}>งบประมาณที่วางไว้</legend>
        <div className={styles.siteBudgetSectionHeading}>
          <SectionIcon type="budget" />
          <h2>งบประมาณที่วางไว้ <small>(ไม่บังคับ)</small></h2>
          <span aria-hidden="true" />
        </div>
        <p className={styles.budgetRangeHelp}>เลือกช่วงงบประมาณโดยประมาณที่คุณตั้งไว้สำหรับโครงการ</p>
        <div className={styles.budgetRangeGrid}>
          {BUDGET_RANGE_OPTIONS.map((option) => {
            const checked = configuration.budgetRangeId === option.id;
            return (
              <label className={styles.budgetRangeOption} data-selected={checked ? "true" : "false"} key={option.id}>
                <input
                  checked={checked}
                  name="budget-range"
                  onChange={() => onChange({ budgetRangeId: option.id, targetBudget: option.targetBudget })}
                  type="radio"
                  value={option.id}
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
