import Image from "next/image";
import type { HouseConfiguration } from "../domain/configuration";
import type { LivePreviewModel } from "../presentation/live-preview";
import styles from "./configurator-shell.module.css";

type StylePreviewStageProps = {
  configuration: HouseConfiguration;
  isValid: boolean;
  livePreview: LivePreviewModel;
  onNext(): void;
  onReset(): void;
};

function PlanningIcon({ name }: { name: "land" | "floor" | "bed" | "bath" | "car" | "family" }) {
  const paths = {
    land: "M4 19V7l8-4 8 4v12M8 19v-6h8v6M3 19h18",
    floor: "M5 20V5h14v15M8 9h3M13 9h3M8 13h3M13 13h3M3 20h18",
    bed: "M4 18v-7h16v7M4 14h16M7 11V8h4a3 3 0 0 1 3 3M4 20v-2M20 20v-2",
    bath: "M5 12h14v3a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM8 12V6a2 2 0 0 1 4 0",
    car: "M4 16v-4l2-4h12l2 4v4M6 16v2M18 16v2M6 12h12M8 15h.01M16 15h.01",
    family: "M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm8 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM3 20v-2a5 5 0 0 1 10 0v2M11 20v-2a5 5 0 0 1 10 0v2",
  } as const;
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d={paths[name]} /></svg>;
}

function UtilityIcon({ name }: { name: "share" | "reset" | "arrow" }) {
  if (name === "share") return <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="6" cy="12" r="2" /><circle cx="17" cy="6" r="2" /><circle cx="17" cy="18" r="2" /><path d="m8 11 7-4M8 13l7 4" /></svg>;
  if (name === "reset") return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 8V4m0 0h4M5 4l3 3a7 7 0 1 1-2 7" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m8 5 7 7-7 7" /></svg>;
}

export function StylePreviewStage({ configuration, isValid, livePreview, onNext, onReset }: StylePreviewStageProps) {
  const specs = livePreview.concept.specs;
  const specItems = [
    { icon: "land" as const, label: "ขนาดที่ดินแนะนำ", value: specs.land },
    { icon: "floor" as const, label: "จำนวนชั้น", value: specs.floors },
    { icon: "bed" as const, label: "ห้องนอน", value: specs.bedrooms },
    { icon: "bath" as const, label: "ห้องน้ำ", value: specs.bathrooms },
    { icon: "car" as const, label: "ที่จอดรถ", value: specs.parking },
    { icon: "family" as const, label: "เหมาะสำหรับ", value: specs.suitableFor },
  ];

  return (
    <aside
      aria-label="พื้นที่แสดงแบบบ้าน"
      className={styles.stylePreview}
      data-mobile-preview-ratio="16:10"
      data-preview-material={livePreview.material.level}
      data-preview-style={livePreview.concept.id}
    >
      <div className={styles.previewStage} data-render-size="860x520" data-source-size="2000x1250">
        <div aria-hidden="true" className={styles.blueprintGrid} />
        {/* Replace this mockup image later with a dynamic house-type visual while preserving the same preview stage layout.
            Production source: minimum 1600×1000 px, ideal 2000×1250 px, 16:10 or 5:3. */}
        <div className={styles.mainHousePreviewPlaceholder} data-preview-tone={livePreview.material.level}>
          <Image
            alt={`ภาพจำลองบ้านสไตล์ ${livePreview.concept.thaiLabel} (${livePreview.concept.label})`}
            fill
            key={livePreview.concept.id}
            preload
            sizes="(max-width: 899px) 100vw, calc(100vw - 450px)"
            src={livePreview.concept.image}
          />
        </div>

        {/* Future environment overlays use the same 2000×1250 canvas: pool, garden, driveway, courtyard and pavilion. */}
        <div className={`${styles.reservedZone} ${styles.gardenZone}`}><span>โซนสวน</span><small>GARDEN AREA</small></div>
        <div className={`${styles.reservedZone} ${styles.poolZone}`}><span>โซนสระว่ายน้ำ</span><small>POOL AREA</small></div>
        <span aria-hidden="true" className={styles.plotDimension}>32.00 ม.</span>

        <section aria-labelledby="style-info-title" className={styles.previewInfoCard}>
          <span className={styles.infoIcon} aria-hidden="true">⌂</span>
          <div>
            <p>ประเภทบ้าน</p>
            <h2 id="style-info-title">{livePreview.concept.thaiLabel}</h2>
            <span>{livePreview.concept.description}</span>
            <small data-preview-disclaimer="always-visible">ภาพ Mockup สำหรับวางแผนเบื้องต้น ไม่ใช่แบบก่อสร้าง</small>
          </div>
        </section>

        <section aria-labelledby="recommended-specs-title" className={styles.recommendedSpecsCard}>
          <h2 id="recommended-specs-title"><span aria-hidden="true">⌑</span>สเป็กที่แนะนำสำหรับบ้านสไตล์นี้</h2>
          <ul>
            {specItems.map((item) => (
              <li key={item.label}>
                <span className={styles.specIcon}><PlanningIcon name={item.icon} /></span>
                <div><span>{item.label}</span><strong>{item.value}</strong></div>
              </li>
            ))}
          </ul>
        </section>

        <div aria-hidden="true" className={styles.compass}><span>N</span><i /></div>
      </div>

      <footer className={styles.stylePreviewFooter}>
        <div className={styles.utilityActions}>
          <button disabled title="เปิดใช้งานหลังสร้าง Preview" type="button"><UtilityIcon name="share" />แชร์แบบร่าง</button>
          <button disabled={configuration.styleId === null} onClick={onReset} type="button"><UtilityIcon name="reset" />รีเซ็ตตัวเลือก</button>
        </div>
        <button aria-label="ถัดไป" className={styles.nextStepButton} disabled={!isValid} onClick={onNext} type="button">
          <span><strong>ถัดไป</strong><small>ขั้นตอนที่ 2</small></span>
          <i><UtilityIcon name="arrow" /></i>
        </button>
      </footer>
    </aside>
  );
}
