"use client";

import Image from "next/image";
import type { FreePreviewPayload } from "../application/build-free-preview";
import { CONCEPT_CATALOG } from "../domain/concept-catalog";
import styles from "./free-preview.module.css";

type PreviewStatus = "loading" | "ready" | "no-draft" | "invalid-draft" | "unavailable";

type FreePreviewProps = {
  status: PreviewStatus;
  preview?: FreePreviewPayload;
  onBack: () => void;
  onFullReport: () => void;
  onShare: () => void;
};

const money = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });
const materialLabels = { select: "Select", premium: "Premium", signature: "Signature" } as const;

function formatRange(range: { low: number; high: number }) {
  return `${money.format(range.low)} – ${money.format(range.high)} บาท`;
}

function StatusCard({ status, onBack }: Pick<FreePreviewProps, "status" | "onBack">) {
  if (status === "loading") return <main className={styles.statusPage}><p role="status" aria-busy="true">กำลังเตรียมสรุปโครงการของคุณ</p></main>;

  const message = status === "no-draft"
    ? "ไม่พบข้อมูลบ้านสำหรับสร้าง Preview"
    : status === "invalid-draft"
      ? "ข้อมูลบ้านไม่สมบูรณ์ กรุณากลับไปตรวจสอบอีกครั้ง"
      : "ยังไม่สามารถประเมินกรอบงบประมาณได้ในขณะนี้";
  return (
    <main className={styles.statusPage}>
      <section className={styles.statusCard} aria-labelledby="preview-status-title">
        <p className={styles.eyebrow}>KSB ARCHITECT / SMART HOME</p>
        <h1 id="preview-status-title">กลับไปวางแผนบ้านต่อ</h1>
        <p role="alert">{message}</p>
        <button className={styles.backButton} type="button" onClick={onBack}>กลับไปแก้ไขข้อมูลบ้าน</button>
      </section>
    </main>
  );
}

export function FreePreview({ status, preview, onBack, onFullReport, onShare }: FreePreviewProps) {
  if (status !== "ready" || !preview) return <StatusCard status={status === "ready" ? "unavailable" : status} onBack={onBack} />;

  const concept = CONCEPT_CATALOG.find((item) => item.id === preview.conceptAssetId);
  const isDevelopmentDemo = preview.estimateMode === "development-demo";
  return (
    <main className={styles.page} aria-labelledby="preview-title">
      <header className={styles.masthead}>
        <p>KSB ARCHITECT / SMART HOME</p>
        <button className={styles.backButton} type="button" onClick={onBack}>กลับไปแก้ไขข้อมูลบ้าน</button>
      </header>

      <div className={styles.layout}>
        <section className={styles.conceptPanel} aria-label="ภาพคอนเซปต์บ้าน">
          <div className={styles.conceptImageFrame}>
            {concept ? <Image className={styles.conceptImage} src={concept.image} alt={`Concept บ้านสไตล์ ${preview.styleLabel}`} fill sizes="(max-width: 899px) 100vw, 50vw" priority /> : null}
          </div>
          <div className={styles.conceptCaption}>
            <span>CONCEPT DIRECTION</span>
            <strong>{preview.styleLabel}</strong>
          </div>
        </section>

        <section className={styles.summaryPanel}>
          <p className={styles.eyebrow}>PRELIMINARY PROJECT VIEW</p>
          <h1 id="preview-title">ภาพรวมบ้านที่คุณกำลังวางแผน</h1>
          <p className={styles.intro}>ข้อมูลนี้ช่วยให้คุณเห็นขนาดบ้านและกรอบงบประมาณก่อนเริ่มคุยรายละเอียดกับสถาปนิก</p>

          <dl className={styles.facts}>
            <div><dt>จำนวนชั้น</dt><dd>{preview.floors} ชั้น</dd></div>
            <div><dt>ห้องนอน</dt><dd>{preview.bedrooms} ห้องนอน</dd></div>
            <div><dt>ห้องน้ำ</dt><dd>{preview.bathrooms} ห้องน้ำ</dd></div>
            <div><dt>ที่จอดรถ</dt><dd>{preview.parkingSpaces} คัน</dd></div>
            <div><dt>พื้นที่ใช้สอย</dt><dd>{preview.usableAreaM2} ตร.ม.</dd></div>
            <div><dt>CFA (พื้นที่ก่อสร้างรวม)</dt><dd>{preview.constructionFloorAreaM2} ตร.ม.</dd></div>
            <div><dt>ระดับวัสดุ</dt><dd>{materialLabels[preview.materialLevel]}</dd></div>
            <div><dt>ความเชื่อมั่น</dt><dd>ระดับความเชื่อมั่น {preview.confidence}</dd></div>
          </dl>

          <section className={styles.budget} aria-label="กรอบงบประมาณเบื้องต้น">
            {isDevelopmentDemo ? <p className={styles.developmentBadge} role="status">ข้อมูลทดสอบเพื่อพัฒนาระบบ</p> : null}
            <p>กรอบงบประมาณเบื้องต้น</p>
            <dl className={styles.budgetRows}>
              <div><dt>ค่าก่อสร้าง</dt><dd>{formatRange(preview.constructionRange)}</dd></div>
              <div><dt>ค่าออกแบบและบริการวิชาชีพ</dt><dd>{formatRange(preview.designFeeRange)}</dd></div>
              <div><dt>งบรวมโดยประมาณ</dt><dd>{formatRange(preview.budgetRange)}</dd></div>
            </dl>
            <span>เป็นกรอบประมาณการช่วงกว้าง ไม่ใช่ราคาสุดท้าย</span>
            <span>งบรวมรวมค่าออกแบบและบริการวิชาชีพแล้ว และไม่รวมค่าควบคุมงานก่อสร้าง</span>
            <span>{preview.disclaimer}</span>
          </section>

          <div className={styles.actions}>
            <button className={styles.primaryAction} type="button" onClick={onFullReport}>รับสรุปโครงการฉบับเต็ม</button>
            <button className={styles.secondaryAction} type="button" onClick={onShare}>แชร์ภาพ Preview</button>
          </div>
        </section>
      </div>
    </main>
  );
}
