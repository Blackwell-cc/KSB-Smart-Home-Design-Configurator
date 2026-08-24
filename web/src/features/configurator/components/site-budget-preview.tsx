import Image from "next/image";
import type { AreaRecommendation } from "@/features/area-planning/domain/calculate-area";
import { budgetRangeOptionFor } from "../domain/budget-ranges";
import type { HouseConfiguration } from "../domain/configuration";
import { THAI_PROVINCES } from "../domain/provinces";
import type { LivePreviewModel } from "../presentation/live-preview";
import styles from "./configurator-shell.module.css";

type SiteBudgetPreviewProps = {
  area: AreaRecommendation;
  configuration: HouseConfiguration;
  livePreview: LivePreviewModel;
};

const SITE_ACCESS_LABELS = {
  normal: "เข้าถึงปกติ",
  restricted: "ถนนค่อนข้างแคบ",
  "very-restricted": "รถขนาดใหญ่เข้าถึงยาก",
} as const;

function SummaryIcon({ type }: { type: "location" | "access" | "budget" | "area" }) {
  const paths = {
    location: <><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></>,
    access: <><path d="M4 20V9l8-5 8 5v11" /><path d="M8 13h8M9 17h6" /></>,
    budget: <><circle cx="12" cy="12" r="8" /><path d="M14.5 8.8c-.7-.5-1.5-.7-2.4-.7-1.4 0-2.5.7-2.5 1.8 0 2.8 5.1 1.2 5.1 4 0 1.2-1.1 2-2.7 2-.9 0-1.9-.3-2.7-.8M12 6.5v11" /></>,
    area: <><rect x="5" y="5" width="14" height="14" rx="1" /><path d="M9 5v14M15 5v14M5 10h4M15 14h4" /></>,
  } as const;

  return <svg aria-hidden="true" viewBox="0 0 24 24">{paths[type]}</svg>;
}

export function SiteBudgetPreview({ area, configuration, livePreview }: SiteBudgetPreviewProps) {
  const province = THAI_PROVINCES.find((item) => item.code === configuration.provinceCode)?.name ?? "ยังไม่ระบุ";
  const budget = budgetRangeOptionFor(configuration.budgetRangeId).label;

  return (
    <aside aria-label="ตัวอย่างแนวคิดบ้าน" className={styles.siteBudgetPreview}>
      <div className={styles.siteBudgetConcept}>
        <div className={styles.siteBudgetConceptHeading}>
          <p>CONCEPT PREVIEW</p>
          <h2>{livePreview.concept.thaiLabel}</h2>
          <span>{livePreview.concept.englishLabel}</span>
        </div>
        <figure className={styles.siteBudgetConceptImage}>
          <Image
            alt={`ภาพแนวคิดบ้าน ${livePreview.concept.thaiLabel}`}
            fill
            key={`${livePreview.concept.id}-${configuration.floors}`}
            preload
            sizes="(max-width: 899px) 100vw, 57vw"
            src={livePreview.concept.image}
          />
        </figure>
      </div>

      <section aria-label="สรุปข้อมูลเบื้องต้น" className={styles.siteBudgetSummary}>
        <h2>สรุปข้อมูลเบื้องต้น</h2>
        <dl>
          <div>
            <dt><SummaryIcon type="location" /><span>ทำเลที่ตั้ง</span></dt>
            <dd>{province}{configuration.district ? <small>{configuration.district}</small> : null}</dd>
          </div>
          <div>
            <dt><SummaryIcon type="access" /><span>สภาพการเข้าถึง</span></dt>
            <dd>{SITE_ACCESS_LABELS[configuration.siteAccess]}</dd>
          </div>
          <div>
            <dt><SummaryIcon type="budget" /><span>งบประมาณ</span></dt>
            <dd>{budget}</dd>
          </div>
          <div>
            <dt><SummaryIcon type="area" /><span>พื้นที่ใช้สอย (โดยประมาณ)</span></dt>
            <dd>{area.usableAreaM2.toLocaleString("th-TH")}–{area.constructionFloorAreaM2.toLocaleString("th-TH")} ตร.ม.<small>(จาก concept)</small></dd>
          </div>
        </dl>
        <p>ข้อมูลนี้ช่วยให้ทีมออกแบบประเมินแนวทางเบื้องต้นได้อย่างเหมาะสมยิ่งขึ้น</p>
      </section>
    </aside>
  );
}
