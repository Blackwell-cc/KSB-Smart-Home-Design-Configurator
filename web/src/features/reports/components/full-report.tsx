"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { FullReportViewModel } from "../application/build-full-report";
import styles from "./full-report.module.css";

type FullReportProps = {
  report: FullReportViewModel;
  pdfHref: string;
  onCreateShare?: () => Promise<string>;
  onRequestConsultation?: (signal: AbortSignal) => Promise<void>;
  onConsultationRequested?: () => void;
};

const money = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });
const thaiDate = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "long", year: "numeric" });

type IconName = "download" | "share" | "arrow" | "home" | "area" | "bed" | "bath" | "car" | "layers" | "location" | "check" | "spark" | "document";
function Icon({ name }: { name: IconName }) {
  const paths = {
    download: <><path d="M12 3v12m0 0 5-5m-5 5-5-5M4 20h16" /></>,
    share: <><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5M8 13l8 5" /></>,
    arrow: <path d="m9 18 6-6-6-6" />,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
    area: <><rect x="4" y="4" width="6" height="16" rx="1" /><rect x="14" y="4" width="6" height="16" rx="1" /><path d="M7 8h1m-1 4h1m-1 4h1m9-8h1m-1 4h1m-1 4h1" /></>,
    bed: <><path d="M3 18v-8m18 8v-6H8a4 4 0 0 0-4 4v2m0-6h5V8H5a1 1 0 0 0-1 1v3m-1 6h18" /></>,
    bath: <><path d="M4 13h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2ZM7 13V6a2 2 0 0 1 4 0m3 1h3" /></>,
    car: <><path d="M4 17h16l-1.5-6h-13L4 17Zm2-6 2-4h8l2 4M7 17v2m10-2v2" /><circle cx="8" cy="15" r="1" /><circle cx="16" cy="15" r="1" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5m-18 4 9 5 9-5" /></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    spark: <><path d="m12 3 1.4 4.2L18 9l-4.6 1.8L12 15l-1.4-4.2L6 9l4.6-1.8L12 3Z" /><path d="m18 15 .7 2.2L21 18l-2.3.8L18 21l-.7-2.2L15 18l2.3-.8L18 15Z" /></>,
    document: <><path d="M6 3h9l3 3v15H6V3Z" /><path d="M15 3v4h4M9 11h6m-6 4h6" /></>,
  } as const;
  return <svg aria-hidden="true" viewBox="0 0 24 24">{paths[name]}</svg>;
}

function Gallery({ report }: { report: FullReportViewModel }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = report.gallery[activeIndex];
  const go = (offset: number) => setActiveIndex((current) => (current + offset + report.gallery.length) % report.gallery.length);
  return (
    <section className={styles.gallery} aria-label="ภาพโครงการทั้งหมด">
      <div className={styles.galleryStage}>
        <Image alt={`${active.label} ของบ้านสไตล์ ${report.concept.label}`} className={styles.galleryImage} fill priority sizes="(max-width: 1050px) 100vw, 60vw" src={active.imageSrc} style={{ objectPosition: active.objectPosition }} />
        <span className={styles.reportBadge}>FULL REPORT</span>
        <span className={styles.galleryCount}>{String(activeIndex + 1).padStart(2, "0")} / {String(report.gallery.length).padStart(2, "0")}</span>
      </div>
      <div className={styles.galleryRail}>
        <button aria-label="ภาพก่อนหน้า" className={styles.galleryArrow} onClick={() => go(-1)} type="button">‹</button>
        <div className={styles.thumbnails}>
          {report.gallery.map((view, index) => <button aria-current={index === activeIndex ? "true" : undefined} aria-label={`แสดง${view.label}`} className={styles.thumbnail} key={view.id} onClick={() => setActiveIndex(index)} type="button"><Image alt="" fill sizes="104px" src={view.imageSrc} style={{ objectPosition: view.objectPosition }} /></button>)}
        </div>
        <button aria-label="ภาพถัดไป" className={styles.galleryArrow} onClick={() => go(1)} type="button">›</button>
      </div>
    </section>
  );
}

function ProjectSummary({ report }: { report: FullReportViewModel }) {
  const facts: Array<[IconName, string, string]> = [
    ["home" as const, "ประเภทโครงการ", `${report.concept.thaiLabel} ${report.configuration.floors} ชั้น`],
    ["area" as const, "พื้นที่ใช้สอย", `${report.area.usableAreaM2} ตร.ม.`],
    ["layers" as const, "พื้นที่ก่อสร้าง (CFA)", `${report.area.constructionFloorAreaM2} ตร.ม.`],
    ["car" as const, "จำนวนที่จอดรถ", `${report.configuration.parkingSpaces} คัน`],
    ["bed" as const, "จำนวนห้องนอน", `${report.configuration.bedrooms} ห้องนอน`],
    ["bath" as const, "จำนวนห้องน้ำ", `${report.configuration.bathrooms} ห้องน้ำ`],
    ["location" as const, "ที่ตั้งโครงการ", report.location.province],
    ["spark" as const, "ระดับวัสดุ", report.configuration.materialQuality],
  ];
  return <section className={styles.summaryCard} aria-labelledby="summary-title"><h2 id="summary-title">สรุปข้อมูลโครงการ</h2><dl>{facts.map(([icon, label, value]) => <div key={label}><dt><Icon name={icon} /><span>{label}</span></dt><dd>{value}</dd></div>)}</dl></section>;
}

function BudgetTable({ report }: { report: FullReportViewModel }) {
  const rows = [...report.detailedBudget.categories, report.detailedBudget.contingency];
  return <section className={styles.budgetCard} aria-labelledby="budget-title">
    <h2 id="budget-title">งบประมาณและค่าใช้จ่ายโดยละเอียด</h2>
    <div className={styles.desktopTable}><table><thead><tr><th scope="col">ลำดับ</th><th scope="col">รายการ</th><th scope="col">รายละเอียดโดยสรุป</th><th scope="col">ประมาณการ (บาท)</th></tr></thead><tbody>{report.detailedBudget.categories.map((row, index) => <tr key={row.code}><td>{index + 1}</td><th scope="row">{row.label}</th><td>{row.description}</td><td>{money.format(row.amount.low)} – {money.format(row.amount.high)}</td></tr>)}<tr className={styles.subtotalRow}><td colSpan={3}>รวมย่อย (Subtotal)</td><td>{money.format(report.detailedBudget.subtotal.low)} – {money.format(report.detailedBudget.subtotal.high)}</td></tr><tr><td>{report.detailedBudget.categories.length + 1}</td><th scope="row">{report.detailedBudget.contingency.label}</th><td>{report.detailedBudget.contingency.description}</td><td>{money.format(report.detailedBudget.contingency.amount.low)} – {money.format(report.detailedBudget.contingency.amount.high)}</td></tr></tbody><tfoot><tr><th colSpan={3} scope="row">รวมงบประมาณโดยประมาณ (Total Estimated Cost)</th><td>{money.format(report.total.low)} – {money.format(report.total.high)} บาท</td></tr></tfoot></table></div>
    <div className={styles.mobileBudget}>{rows.map((row, index) => <details key={row.code}><summary><span>{String(index + 1).padStart(2, "0")} {row.label}</span><strong>{money.format(row.amount.low)} – {money.format(row.amount.high)}</strong></summary><p>{row.description}</p></details>)}<div className={styles.mobileTotal}><span>รวมงบประมาณโดยประมาณ</span><strong>{money.format(report.total.low)} – {money.format(report.total.high)} บาท</strong></div></div>
    <p className={styles.disclaimer}>{report.disclaimer}</p>
  </section>;
}

function ConceptCards({ report }: { report: FullReportViewModel }) {
  return <>
    <div className={styles.tripleCards}>
      <section className={styles.contentCard}><p className={styles.kicker}>CONCEPT DIRECTION</p><h2>{report.concept.direction.title}</h2><p>{report.concept.direction.description}</p><button type="button">ดูแนวคิดการออกแบบเพิ่มเติม <Icon name="arrow" /></button></section>
      <section className={styles.contentCard}><p className={styles.kicker}>EXTERIOR &amp; INTERIOR HIGHLIGHTS</p><p>ภาพมุมภายนอก / ภายในตามแนวคิด</p><div className={styles.highlightStrip}>{report.gallery.slice(1, 5).map((view) => <span key={view.id}><Image alt={view.label} fill sizes="100px" src={view.imageSrc} style={{ objectPosition: view.objectPosition }} /></span>)}</div><button type="button">ดูภาพทั้งหมด ({report.gallery.length}) <Icon name="arrow" /></button></section>
      <section className={styles.contentCard}><p className={styles.kicker}>MATERIAL &amp; FINISHES</p><div className={styles.materialStrip}>{report.materials.slice(0, 5).map((material, index) => <span className={styles.materialSwatch} data-tone={index} key={material.categoryId} title={`${material.categoryLabel}: ${material.optionLabel}`} />)}</div><p className={styles.materialCaption}>{report.materials.slice(0, 3).map(({ optionLabel }) => optionLabel).join(" · ")}</p><button type="button">ดูรายละเอียดวัสดุทั้งหมด <Icon name="arrow" /></button></section>
    </div>
    <div className={styles.doubleCards}>
      <section className={styles.featureCard}><h2>รายละเอียดส่วนพิเศษ</h2>{report.specialFeatures.length ? <ul>{report.specialFeatures.map((feature) => <li key={feature.id}><Icon name="spark" /><span><strong>{feature.label}</strong><small>{feature.description}</small></span></li>)}</ul> : <p className={styles.emptyState}>ยังไม่มีรายการส่วนพิเศษเพิ่มเติมในโครงการนี้</p>}</section>
      <section className={styles.valueCard}><h2>คุณค่าที่จะได้รับ</h2><ul><li><Icon name="check" /><span><strong>บ้านที่ออกแบบเฉพาะคุณ</strong><small>ตอบโจทย์ไลฟ์สไตล์และอนาคต</small></span></li><li><Icon name="check" /><span><strong>เพิ่มคุณภาพชีวิตที่ดีขึ้น</strong><small>อยู่สบาย ปลอดภัย ได้มาตรฐาน</small></span></li><li><Icon name="check" /><span><strong>คุ้มค่าการลงทุนในระยะยาว</strong><small>วางวัสดุและงบประมาณอย่างเป็นระบบ</small></span></li><li><Icon name="check" /><span><strong>บริการครบวงจร มืออาชีพ</strong><small>ดูแลทุกขั้นตอนโดยทีมผู้เชี่ยวชาญ</small></span></li></ul></section>
    </div>
  </>;
}

export function FullReport({ report, pdfHref, onCreateShare, onRequestConsultation, onConsultationRequested }: FullReportProps) {
  const consultationController = useRef<AbortController | null>(null);
  const [shareState, setShareState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [consultationState, setConsultationState] = useState<"idle" | "loading" | "success" | "error">("idle");
  useEffect(() => () => consultationController.current?.abort(), []);

  async function shareReport() {
    if (!onCreateShare || shareState === "loading") return;
    setShareState("loading");
    try {
      const path = await onCreateShare();
      const url = new URL(path, window.location.origin).toString();
      await navigator.clipboard.writeText(url);
      setShareState("success");
    } catch { setShareState("error"); }
  }
  async function requestConsultation() {
    if (!onRequestConsultation || consultationState === "loading") return;
    consultationController.current?.abort();
    const controller = new AbortController(); consultationController.current = controller; setConsultationState("loading");
    try { await onRequestConsultation(controller.signal); if (!controller.signal.aborted) { setConsultationState("success"); onConsultationRequested?.(); } }
    catch { if (!controller.signal.aborted) setConsultationState("error"); }
    finally { if (consultationController.current === controller) consultationController.current = null; }
  }

  return <main className={styles.page} aria-labelledby="full-report-title">
    <header className={styles.topbar}><p>KSB ARCHITECT / SMART HOME</p><div className={styles.topActions}><a href={pdfHref}><Icon name="download" />ดาวน์โหลดเอกสารฉบับเต็ม (PDF)</a><button disabled={!onCreateShare || shareState === "loading"} onClick={() => void shareReport()} type="button"><Icon name="share" />{shareState === "loading" ? "กำลังเตรียมลิงก์…" : "แชร์รายงานนี้"}</button><button className={styles.consultButton} disabled={!onRequestConsultation || consultationState === "loading"} onClick={() => void requestConsultation()} type="button">{consultationState === "loading" ? "กำลังส่งคำขอ…" : "ปรึกษาสถาปนิก"}</button></div></header>
    {(shareState !== "idle" || consultationState !== "idle") && <div className={styles.actionStatus} aria-live="polite">{shareState === "success" ? <p role="status">คัดลอกลิงก์รายงานแล้ว</p> : shareState === "error" ? <p role="alert">ยังสร้างลิงก์แชร์ไม่ได้ กรุณาลองอีกครั้ง</p> : null}{consultationState === "success" ? <p role="status">ส่งคำขอนัดปรึกษาแล้ว</p> : consultationState === "error" ? <p role="alert">ยังส่งคำขอนัดปรึกษาไม่ได้ กรุณาลองอีกครั้ง</p> : null}</div>}
    <nav aria-label="เส้นทางนำทาง" className={styles.breadcrumb}><span>หน้าหลัก</span><b>›</b><span>โครงการของฉัน</span><b>›</b><strong>รายงานฉบับเต็ม</strong></nav>
    <div className={styles.reportGrid}>
      <div className={styles.leftColumn}><div className={styles.galleryColumn}><Gallery report={report} /></div><div className={styles.leftCards}><ConceptCards report={report} /></div></div>
      <aside className={styles.rightColumn}>
        <section className={styles.reportIntro}><h1 id="full-report-title">รายงานฉบับเต็ม ภาพรวมบ้านที่คุณกำลังวางแผน</h1><p>จัดทำเพื่อคุณโดยทีมสถาปนิกและที่ปรึกษาบ้านอัจฉริยะ KSB Architect / Smart Home</p><time dateTime={report.generatedAt}>วันที่จัดทำรายงาน {thaiDate.format(new Date(report.generatedAt))}</time></section>
        <ProjectSummary report={report} /><BudgetTable report={report} />
      </aside>
    </div>
    <section className={styles.nextSteps}><div><p className={styles.kicker}>NEXT STEPS</p><h2>ขั้นตอนถัดไป เมื่อคุณพร้อม</h2><p>{report.nextStepAdvice}</p></div><ol><li>นัดหมายพูดคุยกับสถาปนิก</li><li>ยืนยันรายละเอียดพื้นที่และหน้างาน</li><li>ปรับแบบตามความต้องการ</li><li>วางแผนกระบวนการก่อสร้าง</li></ol></section>
    <footer className={styles.footer}><span>PRICING {report.pricingVersion}</span><span>REFERENCE {report.referenceDate}</span><span>CONFIDENCE {report.confidence}</span></footer>
  </main>;
}
