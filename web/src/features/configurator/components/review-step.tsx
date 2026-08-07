import { calculateArea } from "@/features/area-planning/domain/calculate-area";
import { CONCEPT_CATALOG } from "@/features/preview/domain/concept-catalog";
import type { HouseConfiguration } from "../domain/configuration";
import styles from "./configurator-shell.module.css";

export function ReviewStep({ configuration }: { configuration: HouseConfiguration }) {
  const concept = CONCEPT_CATALOG.find((item) => item.id === configuration.styleId);
  const area = calculateArea(configuration);

  return (
    <dl className={styles.reviewList}>
      <div><dt>สไตล์บ้าน</dt><dd>{concept?.label ?? "ยังไม่ได้เลือก"}</dd></div>
      <div><dt>ผู้อยู่อาศัย</dt><dd>{configuration.residents} คน · {configuration.floors} ชั้น</dd></div>
      <div><dt>ห้องนอน / ห้องน้ำ</dt><dd>{configuration.bedrooms} / {configuration.bathrooms}</dd></div>
      <div><dt>พื้นที่ใช้งานแนะนำ</dt><dd>{area.recommendedUsableAreaM2.toLocaleString("th-TH")} ตร.ม.</dd></div>
      <div><dt>วัสดุ</dt><dd>{configuration.materialLevel}</dd></div>
    </dl>
  );
}
