import { calculateArea } from "@/features/area-planning/domain/calculate-area";
import { QA_AREA_CATALOG } from "@/features/area-planning/domain/area-catalog";
import { CONCEPT_CATALOG } from "@/features/preview/domain/concept-catalog";
import { THAI_PROVINCES } from "../domain/provinces";
import type { HouseConfiguration } from "../domain/configuration";
import styles from "./configurator-shell.module.css";

const ACCESS_LABELS = { normal: "เข้าถึงปกติ", restricted: "เข้าถึงได้จำกัด", "very-restricted": "เข้าถึงได้จำกัดมาก" } as const;

export function ReviewStep({ configuration, onEdit }: { configuration: HouseConfiguration; onEdit(step: number): void }) {
  const concept = CONCEPT_CATALOG.find((item) => item.id === configuration.styleId);
  const area = calculateArea(configuration, QA_AREA_CATALOG);

  return (
    <dl className={styles.reviewList}>
      <div><dt>สไตล์บ้าน</dt><dd>{concept?.label ?? "ยังไม่ได้เลือก"}<button onClick={() => onEdit(0)} type="button">แก้ไขสไตล์บ้าน</button></dd></div>
      <div><dt>ผู้อยู่อาศัยและห้อง</dt><dd>{configuration.residents} คน · {configuration.floors} ชั้น · {configuration.bedrooms} ห้องนอน · {configuration.bathrooms} ห้องน้ำ · จอดรถ {configuration.parkingSpaces} คัน<br />ฟังก์ชัน: {Object.entries(configuration.functions).filter(([, enabled]) => enabled).map(([key]) => key).join(", ") || "ไม่มี"}<button onClick={() => onEdit(1)} type="button">แก้ไขพื้นที่และฟังก์ชัน</button></dd></div>
      <div><dt>พื้นที่</dt><dd>{configuration.usableAreaOverrideM2 ? `พื้นที่ใช้สอยที่เลือก ${area.usableAreaM2} ตร.ม.` : `ใช้พื้นที่แนะนำ ${area.recommendedUsableAreaM2} ตร.ม.`}<br />พื้นที่ก่อสร้างรวม (CFA) {area.constructionFloorAreaM2} ตร.ม.<button onClick={() => onEdit(1)} type="button">แก้ไขพื้นที่ใช้สอย</button></dd></div>
      <div><dt>ทำเลและงบประมาณ</dt><dd>{THAI_PROVINCES.find((province) => province.code === configuration.provinceCode)?.name ?? "ยังไม่ได้เลือก"} · {configuration.district ?? "ไม่ระบุอำเภอ/เขต"}<br />{ACCESS_LABELS[configuration.siteAccess]} · {configuration.targetBudget ? `${configuration.targetBudget.min.toLocaleString()}–${configuration.targetBudget.max.toLocaleString()} บาท` : "ยังไม่กำหนดงบ"}<button onClick={() => onEdit(2)} type="button">แก้ไขทำเลและงบประมาณ</button></dd></div>
      <div><dt>วัสดุและส่วนพิเศษ</dt><dd>{configuration.materialLevel} · {configuration.specialFeatures.join(", ") || "ไม่มี"}<br />บันทึกส่วนตัว: {configuration.privateNotes ? "มี (เก็บเฉพาะในเครื่อง)" : "ไม่มี"}<button onClick={() => onEdit(3)} type="button">แก้ไขวัสดุและส่วนพิเศษ</button></dd></div>
    </dl>
  );
}
