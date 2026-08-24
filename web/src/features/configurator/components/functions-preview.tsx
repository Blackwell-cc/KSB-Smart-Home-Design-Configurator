import Image from "next/image";
import type { AreaRecommendation } from "@/features/area-planning/domain/calculate-area";
import type { HouseConfiguration } from "../domain/configuration";
import type { LivePreviewModel } from "../presentation/live-preview";
import { ADDITIONAL_REQUIREMENT_LABELS } from "../presentation/additional-requirements";
import styles from "./configurator-shell.module.css";

type FunctionsPreviewProps = {
  area: AreaRecommendation;
  areaError?: string;
  configuration: HouseConfiguration;
  livePreview: LivePreviewModel;
};

const FUNCTION_LABELS = {
  office: "ห้องทำงาน",
  elderlyRoom: "ห้องผู้สูงอายุ",
  thaiKitchen: "ครัวไทย",
  multipurposeRoom: "ห้องอเนกประสงค์",
} as const satisfies Record<keyof HouseConfiguration["functions"], string>;

function SummaryIcon({ name }: { name: "residents" | "floors" | "bedrooms" | "bathrooms" | "parking" | "area" }) {
  const paths = {
    residents: "M4 20v-2a5 5 0 0 1 10 0v2M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 1a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm0 2a4 4 0 0 1 4 4v1",
    floors: "M5 20V5h14v15M8 9h3M13 9h3M8 13h3M13 13h3M3 20h18",
    bedrooms: "M4 18v-7h16v7M4 14h16M7 11V8h4a3 3 0 0 1 3 3M4 20v-2M20 20v-2",
    bathrooms: "M5 12h14v3a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM8 12V6a2 2 0 0 1 4 0",
    parking: "M4 16v-4l2-4h12l2 4v4M6 16v2M18 16v2M6 12h12M8 15h.01M16 15h.01",
    area: "M5 20V5h14v15M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2",
  } as const;
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d={paths[name]} /></svg>;
}

export function FunctionsPreview({ area, areaError, configuration, livePreview }: FunctionsPreviewProps) {
  const selectedFunctions = Object.entries(configuration.functions)
    .filter((entry): entry is [keyof HouseConfiguration["functions"], true] => entry[1])
    .map(([key]) => FUNCTION_LABELS[key]);
  const selectedRequirements = configuration.additionalRequirements.map((code) => ADDITIONAL_REQUIREMENT_LABELS[code]);
  const selectedItems = [...selectedFunctions, ...selectedRequirements];
  const floorPreviewImages = Object.values(livePreview.concept.floorImages ?? {});
  const metrics = [
    { icon: "residents" as const, label: "ผู้อยู่อาศัย", value: `${configuration.residents} คน` },
    { icon: "floors" as const, label: "ชั้น", value: `${configuration.floors} ชั้น` },
    { icon: "bedrooms" as const, label: "ห้องนอน", value: `${configuration.bedrooms} ห้อง` },
    { icon: "bathrooms" as const, label: "ห้องน้ำ", value: `${configuration.bathrooms} ห้อง` },
    { icon: "parking" as const, label: "ที่จอดรถ", value: `${configuration.parkingSpaces} คัน` },
    { icon: "area" as const, label: "พื้นที่ใช้สอย", value: `${area.usableAreaM2} ตร.ม.` },
  ];

  return (
    <aside aria-label="ภาพตัวอย่างพื้นที่และฟังก์ชัน" className={styles.functionsPreview}>
      <div className={styles.functionsPreviewImage} data-preview-tone={livePreview.material.level}>
        <Image
          alt={`ภาพอ้างอิง ${livePreview.concept.thaiLabel} (${livePreview.concept.englishLabel})`}
          fill
          key={`${livePreview.concept.id}-${configuration.floors}`}
          preload
          sizes="(max-width: 899px) 100vw, 57vw"
          src={livePreview.concept.image}
        />
      </div>
      <div aria-hidden="true" className={styles.floorImagePreloads}>
        {floorPreviewImages.map((src) => (
          <Image
            alt=""
            data-floor-image-preload
            height={1080}
            key={src}
            sizes="(max-width: 899px) 100vw, 57vw"
            src={src}
            width={1920}
          />
        ))}
      </div>
      <span aria-live="polite" className={styles.visuallyHidden}>
        {areaError ? "พื้นที่ใช้สอยที่กำลังกรอกไม่ถูกต้อง" : `พื้นที่ใช้สอย ${area.usableAreaM2} ตร.ม. ${configuration.usableAreaOverrideM2 ? "(กำหนดเอง)" : "(แนะนำ)"}`}
      </span>
      <section aria-label="สรุปรายการพื้นที่และฟังก์ชัน" className={styles.functionsSummary}>
        <h2>สรุปรายการพื้นที่และฟังก์ชัน</h2>
        <dl className={styles.functionsSummaryMetrics}>
          {metrics.map((metric) => (
            <div key={metric.label}>
              <dt><SummaryIcon name={metric.icon} /><span>{metric.label}</span></dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>
        <div className={styles.selectedFunctions}>
          <h3>ฟังก์ชันเพิ่มเติมที่เลือก</h3>
          {selectedItems.length > 0 ? <ul>{selectedItems.map((label) => <li key={label}><span aria-hidden="true">✓</span><span>{label}</span></li>)}</ul> : <p>ยังไม่ได้เลือกฟังก์ชันเพิ่มเติม</p>}
        </div>
      </section>
    </aside>
  );
}
