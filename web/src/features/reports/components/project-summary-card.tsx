"use client";

import Image from "next/image";
import { forwardRef } from "react";
import type { FullReportViewModel } from "../application/build-full-report";
import styles from "./project-summary-card.module.css";

type ProjectSummaryCardProps = {
  report: FullReportViewModel;
};

const money = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });

function formatMoney(amount: number) {
  return `${money.format(amount)} บาท`;
}

export const ProjectSummaryCard = forwardRef<HTMLElement, ProjectSummaryCardProps>(function ProjectSummaryCard({ report }, ref) {
  const { concept, configuration, area, disclaimer, total } = report;

  return (
    <article ref={ref} className={styles.card} aria-labelledby="project-summary-title">
      <header className={styles.header}>
        <p className={styles.brand}>KSB ARCHITECT</p>
        <p className={styles.document}>PROJECT SUMMARY / 01</p>
      </header>

      <div className={styles.content}>
        <div className={styles.concept}>
          {concept.imageSrc ? (
            <Image className={styles.image} src={concept.imageSrc} alt={`Concept บ้านสไตล์ ${concept.label}`} width={720} height={480} />
          ) : (
            <div className={styles.imageFallback} aria-hidden="true" />
          )}
          <p className={styles.conceptLabel}>CONCEPT DIRECTION</p>
          <h2 id="project-summary-title">{concept.label}</h2>
        </div>

        <div className={styles.details}>
          <p className={styles.eyebrow}>ภาพรวมการวางแผนบ้าน</p>
          <dl className={styles.facts}>
            <div><dt>จำนวนชั้น</dt><dd>{configuration.floors} ชั้น</dd></div>
            <div><dt>ห้องนอน</dt><dd>{configuration.bedrooms} ห้อง</dd></div>
            <div><dt>ห้องน้ำ</dt><dd>{configuration.bathrooms} ห้อง</dd></div>
            <div><dt>ที่จอดรถ</dt><dd>{configuration.parkingSpaces} คัน</dd></div>
            <div><dt>พื้นที่ใช้สอย</dt><dd>{area.usableAreaM2} ตร.ม.</dd></div>
            <div><dt>CFA</dt><dd>{area.constructionFloorAreaM2} ตร.ม.</dd></div>
          </dl>

          <section className={styles.budget} aria-label="ประมาณการงบโครงการ">
            <p>ประมาณการงบโครงการ</p>
            <strong>{money.format(total.low)} – {money.format(total.high)} บาท</strong>
            <span>{disclaimer}</span>
          </section>
        </div>
      </div>

      <dl className={styles.triptych} aria-label="กรอบงบประมาณ ต่ำ กลาง สูง">
        <div><dt>LOW / เริ่มต้น</dt><dd>{formatMoney(total.low)}</dd></div>
        <div><dt>EXPECTED / แนะนำ</dt><dd>{formatMoney(total.expected)}</dd></div>
        <div><dt>HIGH / เผื่อความยืดหยุ่น</dt><dd>{formatMoney(total.high)}</dd></div>
      </dl>

      <footer className={styles.footer}>บ้านที่อยู่ได้จริง เริ่มจากการวางแผนที่ดี</footer>
    </article>
  );
});
