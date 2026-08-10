"use client";

import { useEffect, useRef, useState } from "react";
import type { FullReportViewModel } from "../application/build-full-report";
import { ProjectSummaryCard } from "./project-summary-card";
import styles from "./full-report.module.css";

type FullReportProps = {
  report: FullReportViewModel;
  onRequestConsultation?: (signal: AbortSignal) => Promise<void>;
  onConsultationRequested?: () => void;
};

const money = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });
const rangeLabels = ["LOW / เริ่มต้น", "EXPECTED / แนะนำ", "HIGH / เผื่อความยืดหยุ่น"] as const;

function formatMoney(amount: number) {
  return `${money.format(amount)} บาท`;
}

function ListSection({ title, items }: { title: string; items: readonly string[] }) {
  return <section className={styles.listSection}><h2>{title}</h2>{items.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p>ไม่มีข้อมูลเพิ่มเติม</p>}</section>;
}

function BudgetComparison({ report }: Pick<FullReportProps, "report">) {
  const { budgetComparison } = report;
  if (budgetComparison.status === "no-target") return null;
  const message = budgetComparison.status === "within-target"
    ? "กรอบงบที่ตั้งไว้สอดคล้องกับประมาณการนี้"
    : budgetComparison.status === "below-target"
      ? "ประมาณการอยู่ต่ำกว่ากรอบงบที่ตั้งไว้"
      : "ประมาณการอาจสูงกว่ากรอบงบที่ตั้งไว้ ควรหารือรายละเอียดกับสถาปนิก";
  return <p className={styles.budgetComparison}>{message}</p>;
}

export function FullReport({ report, onRequestConsultation, onConsultationRequested }: FullReportProps) {
  const summaryRef = useRef<HTMLElement>(null);
  const consultationController = useRef<AbortController | null>(null);
  const [exportState, setExportState] = useState<"idle" | "exporting" | "error">("idle");
  const [consultationState, setConsultationState] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => () => consultationController.current?.abort(), []);

  async function exportSummary() {
    if (!summaryRef.current || exportState === "exporting") return;
    setExportState("exporting");
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(summaryRef.current, { cacheBust: true, pixelRatio: 2 });
      const encoded = dataUrl.split(",", 2)[1];
      if (!encoded) throw new Error("INVALID_PNG");
      const binary = atob(encoded);
      const objectUrl = URL.createObjectURL(new Blob([Uint8Array.from(binary, (character) => character.charCodeAt(0))], { type: "image/png" }));
      const download = document.createElement("a");
      download.href = objectUrl;
      download.download = "ksb-project-summary.png";
      document.body.appendChild(download);
      download.click();
      download.remove();
      URL.revokeObjectURL(objectUrl);
      setExportState("idle");
    } catch {
      setExportState("error");
    }
  }

  async function requestConsultation() {
    if (!onRequestConsultation || consultationState === "loading") return;
    consultationController.current?.abort();
    const controller = new AbortController();
    consultationController.current = controller;
    setConsultationState("loading");
    try {
      await onRequestConsultation(controller.signal);
      if (controller.signal.aborted) return;
      setConsultationState("success");
      onConsultationRequested?.();
    } catch {
      if (!controller.signal.aborted) setConsultationState("error");
    } finally {
      if (consultationController.current === controller) consultationController.current = null;
    }
  }

  return (
    <main className={styles.page} aria-labelledby="full-report-title">
      <header className={styles.masthead}>
        <p>KSB ARCHITECT / SMART HOME</p>
        <p>PRIVATE PROJECT REPORT</p>
      </header>

      <section className={styles.intro}>
        <p className={styles.eyebrow}>FULL REPORT / SNAPSHOT</p>
        <h1 id="full-report-title">สรุปโครงการฉบับเต็ม</h1>
        <p>กรอบงบและข้อสังเกตจากข้อมูลโครงการชุดนี้ เพื่อใช้คุยต่อกับสถาปนิกอย่างมีทิศทาง</p>
      </section>

      <ProjectSummaryCard ref={summaryRef} report={report} />
      <div className={styles.actions}>
        <button type="button" className={styles.secondaryAction} onClick={exportSummary} disabled={exportState === "exporting"}>
          {exportState === "exporting" ? "กำลังสร้างภาพสรุป" : "บันทึกภาพสรุปโครงการ"}
        </button>
        {onRequestConsultation ? <button type="button" className={styles.primaryAction} onClick={requestConsultation} disabled={consultationState === "loading"}>
          {consultationState === "loading" ? "กำลังส่งคำขอ" : "ขอนัดปรึกษากับสถาปนิก"}
        </button> : null}
      </div>
      {exportState === "error" ? <p className={styles.error} role="alert">ยังสร้างภาพสรุปไม่ได้ กรุณาลองอีกครั้ง</p> : null}
      {consultationState === "success" ? <p className={styles.success} role="status">ส่งคำขอนัดปรึกษาแล้ว</p> : null}
      {consultationState === "error" ? <p className={styles.error} role="alert">ยังส่งคำขอนัดปรึกษาไม่ได้ กรุณาลองอีกครั้ง</p> : null}

      <section className={styles.estimate} aria-labelledby="estimate-title">
        <div className={styles.sectionHeading}><p>ESTIMATE SCHEDULE</p><h2 id="estimate-title">โครงสร้างงบประมาณ</h2></div>
        <BudgetComparison report={report} />
        <div className={styles.tableWrap}>
          <table>
            <thead><tr><th scope="col">รายการ</th>{rangeLabels.map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead>
            <tbody>{report.lines.map((line) => <tr key={line.code}><th scope="row">{line.label}</th><td>{formatMoney(line.amount.low)}</td><td>{formatMoney(line.amount.expected)}</td><td>{formatMoney(line.amount.high)}</td></tr>)}</tbody>
            <tfoot><tr><th scope="row">รวมโดยประมาณ</th><td>{formatMoney(report.total.low)}</td><td>{formatMoney(report.total.expected)}</td><td>{formatMoney(report.total.high)}</td></tr></tfoot>
          </table>
        </div>
      </section>

      <div className={styles.notesGrid}>
        <ListSection title="สมมติฐานในการประเมิน" items={report.assumptions} />
        <ListSection title="รายการที่รวม" items={report.includedItems} />
        <ListSection title="รายการที่ยังไม่รวม" items={report.excludedItems} />
      </div>

      <section className={styles.nextStep}><p className={styles.eyebrow}>NEXT STEP</p><h2>วางแผนต่ออย่างมั่นใจ</h2><p>{report.nextStepAdvice}</p></section>
      <footer className={styles.metadata}><span>CONFIDENCE {report.confidence}</span><span>PRICING {report.pricingVersion}</span><span>REFERENCE {report.referenceDate}</span><p>{report.disclaimer}</p></footer>
    </main>
  );
}
