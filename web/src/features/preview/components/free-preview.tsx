"use client";

import Image from "next/image";
import { AiLoader } from "@/components/ui/ai-loader";
import type { DesignBriefConfiguration } from "@/features/configurator/domain/configuration";
import { MaterialHousePreview } from "@/features/configurator/components/material-house-preview";
import { buildMaterialPreviewScene } from "@/features/configurator/presentation/material-preview-scene";
import type { FreePreviewPayload } from "../application/build-free-preview";
import { CONCEPT_CATALOG } from "../domain/concept-catalog";
import { buildProjectInsight } from "../presentation/project-insight";
import styles from "./free-preview.module.css";

type PreviewStatus = "loading" | "ready" | "no-draft" | "invalid-draft" | "unavailable";
export type PreviewShareChannel = "line" | "instagram" | "facebook" | "copy";

type FreePreviewProps = {
  status: PreviewStatus;
  preview?: FreePreviewPayload;
  configuration?: DesignBriefConfiguration;
  shareStatus?: string;
  shareStatusKey?: number;
  onBack: () => void;
  onFullReport: () => void;
  onShare: (channel: PreviewShareChannel) => void;
  onStartOver: () => void;
};

const money = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });

function formatRange(range: { low: number; high: number }) {
  return `${money.format(range.low)} – ${money.format(range.high)} บาท`;
}

function PreviewIcon({ name }: { name: "info" | "floors" | "bed" | "bath" | "car" | "area" | "check" | "share" | "arrow" | "restart" }) {
  const paths = {
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5h.01" /></>,
    floors: <><path d="M4 20h16M6 20V9l6-5 6 5v11M9 12h6M9 16h6" /></>,
    bed: <><path d="M3 18v-8M21 18v-6H8a4 4 0 0 0-4 4v2M4 12h4V8H5a1 1 0 0 0-1 1v3M3 18h18" /></>,
    bath: <><path d="M4 13h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2ZM7 13V6a2 2 0 0 1 4 0" /><path d="M14 7h3" /></>,
    car: <><path d="M4 17h16l-1.5-6h-13L4 17ZM6 11l2-4h8l2 4M7 17v2M17 17v2" /><circle cx="8" cy="15" r="1" /><circle cx="16" cy="15" r="1" /></>,
    area: <><rect x="4" y="4" width="6" height="16" rx="1" /><rect x="14" y="4" width="6" height="16" rx="1" /><path d="M7 8h1M7 12h1M7 16h1M17 8h1M17 12h1M17 16h1" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    share: <><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5M8 13l8 5" /></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
    restart: <><path d="M4 7v5h5" /><path d="M5.6 16.5A8 8 0 1 0 6 6.4L4 8" /></>,
  } as const;

  return <svg aria-hidden="true" viewBox="0 0 24 24">{paths[name]}</svg>;
}

function StatusCard({ status, onBack }: Pick<FreePreviewProps, "status" | "onBack">) {
  if (status === "loading") return <main className={styles.statusPage}><AiLoader /></main>;
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

function ProjectMetrics({ preview }: { preview: FreePreviewPayload }) {
  const metrics = [
    { icon: "floors" as const, label: "จำนวนชั้น", value: `${preview.floors} ชั้น` },
    { icon: "bed" as const, label: "ห้องนอน", value: `${preview.bedrooms} ห้องนอน` },
    { icon: "bath" as const, label: "ห้องน้ำ", value: `${preview.bathrooms} ห้องน้ำ` },
    { icon: "car" as const, label: "ที่จอดรถ", value: `${preview.parkingSpaces} คัน` },
    { icon: "area" as const, label: "พื้นที่ใช้สอย", value: `${preview.usableAreaM2} ตร.ม.` },
  ];
  return <dl className={styles.metrics} aria-label="ข้อมูลหลักของบ้าน">{metrics.map((metric) => <div key={metric.label}><dt><PreviewIcon name={metric.icon} /><span>{metric.label}</span></dt><dd>{metric.value}</dd></div>)}</dl>;
}

function PreliminaryBudgetCard({ preview }: { preview: FreePreviewPayload }) {
  return (
    <section className={styles.budgetCard} aria-label="กรอบงบประมาณเบื้องต้น">
      <header><h2>กรอบงบประมาณเบื้องต้น</h2><span>Preliminary Budget Frame</span></header>
      {preview.estimateMode === "development-demo" ? <p className={styles.developmentBadge} role="status">ข้อมูลทดสอบเพื่อพัฒนาระบบ</p> : null}
      <dl className={styles.budgetRows}>
        <div><dt>ค่าก่อสร้าง</dt><dd>{formatRange(preview.constructionRange)}</dd></div>
        <div><dt>ค่าออกแบบและบริการวิชาชีพ</dt><dd>{formatRange(preview.designFeeRange)}</dd></div>
        <div><dt>งบประมาณโดยประมาณ</dt><dd>{formatRange(preview.budgetRange)}</dd></div>
      </dl>
      <p className={styles.disclaimer}>เป็นการประเมินเบื้องต้นจากข้อมูลที่เลือก รายละเอียดจริงอาจเปลี่ยนตามแบบ วัสดุ พื้นที่ก่อสร้าง และเงื่อนไขหน้างาน</p>
    </section>
  );
}

function DesignValueCard({ image }: { image: string }) {
  const values = [
    ["เปลี่ยนความต้องการให้เป็นบ้านที่ชัดเจน", "จากไลฟ์สไตล์ สู่พื้นที่ที่ใช้งานได้จริง"],
    ["ลดความผิดพลาดก่อนเริ่มก่อสร้าง", "แก้บนแบบ ดีกว่าแก้หน้างานที่มีต้นทุนสูงกว่า"],
    ["วางวัสดุและงบประมาณอย่างเป็นระบบ", "ช่วยตัดสินใจให้เหมาะกับคุณภาพและงบที่ตั้งไว้"],
    ["ประสานทุกระบบให้ทำงานร่วมกัน", "สถาปัตย์ โครงสร้าง และระบบไปในทิศทางเดียวกัน"],
  ];
  return (
    <section className={styles.designValueCard}>
      <Image aria-hidden="true" alt="" className={styles.designValueImage} fill sizes="25vw" src={image} />
      <div className={styles.designValueContent}><h2>เหตุผลที่ค่าออกแบบมีคุณค่า</h2><ul>{values.map(([title, description]) => <li key={title}><PreviewIcon name="check" /><span><strong>{title}</strong><small>{description}</small></span></li>)}</ul></div>
    </section>
  );
}

function PersonalityCard({ insight }: { insight: ReturnType<typeof buildProjectInsight>["personality"] }) {
  return (
    <section className={styles.personalityCard}>
      <div className={styles.personalityMark} aria-hidden="true">♡</div>
      <div className={styles.personalityContent}>
        <h2>บ้านแบบนี้เหมาะกับคนแบบไหน</h2><p>{insight.intro}</p>
        <ul>{insight.traits.map((trait) => <li key={trait.title}><strong>{trait.title}</strong><span>{trait.description}</span></li>)}</ul>
        <small>{insight.closing}</small>
      </div>
    </section>
  );
}

function AdditionalViews({ image, styleLabel }: { image: string; styleLabel: string }) {
  return (
    <div aria-label="มุมมองเพิ่มเติม" className={styles.additionalViews} role="group">
      <div className={styles.viewStack}>
        {[1, 2, 3].map((view) => (
          <span className={styles.viewThumbnail} key={view}>
            <Image alt={`มุมมองเพิ่มเติม ${view} ของบ้านสไตล์ ${styleLabel}`} fill sizes="(max-width: 560px) 70px, 106px" src={image} unoptimized />
          </span>
        ))}
      </div>
      <span className={styles.viewDetails} data-additional-view-callout="true">
        <span className={styles.viewCount}>+12</span>
        <span className={styles.viewCopy}><strong>มุมมองเพิ่มเติม</strong><small>ในรายงานฉบับเต็ม</small></span>
      </span>
    </div>
  );
}

function ShareSymbol({ channel }: { channel: PreviewShareChannel }) {
  if (channel === "copy") return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9.5 14.5 5-5M7.2 16.8l-1.4 1.4a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0M16.8 7.2l1.4-1.4a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0" /></svg>;
  if (channel === "instagram") return <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" /></svg>;
  if (channel === "facebook") return <span aria-hidden="true" className={styles.socialLetter}>f</span>;
  return <span aria-hidden="true" className={styles.lineMark}>LINE</span>;
}

function ShareAndReport({ onFullReport, onShare, shareStatus, shareStatusKey }: Pick<FreePreviewProps, "onFullReport" | "onShare" | "shareStatus" | "shareStatusKey">) {
  const shareChannels: Array<{ channel: PreviewShareChannel; accessibleLabel: string; label: string }> = [
    { channel: "copy", accessibleLabel: "คัดลอกลิงก์", label: "คัดลอกลิงก์" },
    { channel: "instagram", accessibleLabel: "แชร์ผ่าน Instagram", label: "Instagram" },
    { channel: "line", accessibleLabel: "แชร์ผ่าน LINE", label: "LINE" },
    { channel: "facebook", accessibleLabel: "แชร์ผ่าน Facebook", label: "Facebook" },
  ];
  return (
    <section className={styles.resultActions} aria-label="แชร์ผลลัพธ์และรับข้อมูลฉบับเต็ม">
      <div className={styles.shareBlock}>
        <div><h2>แชร์ผลลัพธ์นี้ให้เพื่อนของคุณ</h2><p>ให้เพื่อนคุณได้เห็นไอเดียบ้าน และลองสร้างบ้านในแบบของตัวเอง</p></div>
        <div className={styles.shareButtons}>
          {shareChannels.map(({ channel, accessibleLabel, label }) => (
            <button aria-label={accessibleLabel} key={channel} onClick={() => onShare(channel)} type="button">
              <span className={styles.shareButtonIcon}><ShareSymbol channel={channel} /></span>
              <small>{label}</small>
            </button>
          ))}
        </div>
        <p aria-live="polite" className={styles.shareStatus} key={shareStatusKey}>{shareStatus}</p>
      </div>
      <button aria-label="รับข้อมูลฉบับเต็ม" className={styles.fullReportCta} onClick={onFullReport} type="button">
        <span className={styles.reportIcon}>↓</span><span><strong>รับข้อมูลฉบับเต็ม</strong><small>กรอกข้อมูลเล็กน้อย แล้วเราจะส่งรายละเอียดทั้งหมดให้คุณ</small></span><PreviewIcon name="arrow" />
      </button>
    </section>
  );
}

export function FreePreview({ status, preview, configuration, shareStatus, shareStatusKey, onBack, onFullReport, onShare, onStartOver }: FreePreviewProps) {
  if (status !== "ready" || !preview || !configuration) return <StatusCard status={status === "ready" ? "unavailable" : status} onBack={onBack} />;
  const concept = CONCEPT_CATALOG.find((item) => item.id === configuration.styleId) ?? CONCEPT_CATALOG.find((item) => item.id === preview.conceptAssetId);
  if (!concept) return <StatusCard status="unavailable" onBack={onBack} />;
  const insight = buildProjectInsight(configuration);
  const conceptImage = buildMaterialPreviewScene(configuration).baseSrc;

  return (
    <main className={styles.page} data-result-reveal="cinematic" aria-labelledby="preview-title">
      <header className={styles.masthead}>
        <button aria-label="กลับไปแก้ไขข้อมูลบ้าน" className={styles.brandButton} onClick={onBack} type="button">
          <span className={styles.brandLogoFrame}>
            <Image alt="โลโก้ KSB Architect" className={styles.brandLogo} fill sizes="132px" src="/brand/ksb-architect-logo.png" />
          </span>
          <span className={styles.brandSubtitle}>SMART HOME DESIGN CONFIGURATOR</span>
        </button>
        <div className={styles.headerUtilities}>
          <div className={styles.statusBadge}><PreviewIcon name="info" />สรุปข้อมูลแบบคร่าว ๆ ยังไม่ใช่ฉบับสมบูรณ์</div>
          <button className={styles.startOverButton} onClick={onStartOver} type="button"><PreviewIcon name="restart" />เริ่มทำใหม่</button>
        </div>
      </header>

      <div className={styles.experience}>
        <section className={styles.conceptPanel} aria-label="ภาพคอนเซปต์บ้าน">
          <MaterialHousePreview className={styles.materialConceptImage} configuration={configuration} sizes="(max-width: 899px) 100vw, 50vw" priority />
          <div className={styles.conceptCaption}><span>CONCEPT DIRECTION</span><strong>{insight.conceptDirection.title}</strong><p>{insight.conceptDirection.description}</p></div>
          <AdditionalViews image={conceptImage} styleLabel={concept.label} />
        </section>

        <section className={styles.introBlock}><p className={styles.eyebrow}>PRELIMINARY PROJECT VIEW</p><h1 id="preview-title">ภาพรวมบ้าน<br />ที่คุณกำลังวางแผน</h1><p className={styles.intro}>ข้อมูลเบื้องต้นเพื่อให้คุณเห็นภาพรวมของบ้านและกรอบงบประมาณ ก่อนเริ่มคุยรายละเอียดกับสถาปนิก</p></section>
        <ProjectMetrics preview={preview} />
        <div className={styles.lowerCards}><PreliminaryBudgetCard preview={preview} /><DesignValueCard image={conceptImage} /></div>

        <PersonalityCard insight={insight.personality} />
        <ShareAndReport onFullReport={onFullReport} onShare={onShare} shareStatus={shareStatus} shareStatusKey={shareStatusKey} />
      </div>
    </main>
  );
}
