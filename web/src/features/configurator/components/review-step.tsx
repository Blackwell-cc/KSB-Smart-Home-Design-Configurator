import Image from "next/image";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import type { HouseConfiguration } from "../domain/configuration";
import { buildReviewSummary } from "../presentation/review-summary";
import { AssetPlaceholder } from "./asset-placeholder";
import { MaterialHousePreview } from "./material-house-preview";
import styles from "./review-step.module.css";

type ReviewStepProps = {
  configuration: HouseConfiguration;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onBack(): void;
  onContinue(): void;
  onEdit(step: number): void;
};

type ReviewIconName =
  | "home"
  | "space"
  | "budget"
  | "materials"
  | "feature"
  | "quality"
  | "check"
  | "arrow";

function ReviewIcon({ name }: { name: ReviewIconName }) {
  const paths: Record<ReviewIconName, React.ReactNode> = {
    home: <><path d="m4 11 8-7 8 7" /><path d="M6.5 10v9h11v-9M10 19v-5h4v5" /></>,
    space: <><rect height="6" rx="1" width="6" x="4" y="4" /><rect height="6" rx="1" width="6" x="14" y="4" /><rect height="6" rx="1" width="6" x="4" y="14" /><rect height="6" rx="1" width="6" x="14" y="14" /></>,
    budget: <><circle cx="12" cy="12" r="8" /><path d="M14.5 8.5h-3a2 2 0 0 0 0 4h1a2 2 0 0 1 0 4h-3M12 6.5v11" /></>,
    materials: <><path d="m12 3 8 4-8 4-8-4 8-4Z" /><path d="m4 12 8 4 8-4M4 17l8 4 8-4" /></>,
    feature: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><circle cx="12" cy="12" r="4" /><path d="m5.6 5.6 2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" /></>,
    quality: <><path d="m12 3 2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8L12 3Z" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.6 2.7L16.5 9" /></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
  };

  return <svg aria-hidden="true" viewBox="0 0 24 24">{paths[name]}</svg>;
}

function EditButton({ label, onClick }: { label: string; onClick(): void }) {
  return <button aria-label={`แก้ไข${label}`} className={styles.editButton} onClick={onClick} type="button">แก้ไข</button>;
}

export function ReviewStep({ configuration, headingRef, onBack, onContinue, onEdit }: ReviewStepProps) {
  const summary = buildReviewSummary(configuration);
  const visibleSpecialFeatures = summary.specialFeatures.slice(0, 5);
  const hiddenSpecialFeatureCount = Math.max(0, summary.specialFeatures.length - visibleSpecialFeatures.length);

  return (
    <section aria-labelledby="step-heading" className={styles.workspace}>
      <header className={styles.reviewHeader}>
        <p className={styles.eyebrow}>ขั้นตอน 5 / 5</p>
        <h1 id="step-heading" ref={headingRef} tabIndex={-1}>ตรวจสอบความถูกต้อง</h1>
        <p>ตรวจสอบรายละเอียดทั้งหมดก่อนดำเนินการสรุปค่าใช้จ่าย</p>
      </header>

      <div className={styles.reviewMosaic} data-testid="step-five-review-cards">
        <div className={styles.compactStack}>
          <article className={styles.reviewCard}>
            <div className={styles.cardHeading}>
              <span className={styles.cardIcon}><ReviewIcon name="home" /></span>
              <h2>สไตล์บ้าน</h2>
              <EditButton label="สไตล์บ้าน" onClick={() => onEdit(0)} />
            </div>
            <strong>{summary.concept?.label ?? "ยังไม่ได้เลือกสไตล์บ้าน"}</strong>
            {summary.concept ? <span>{summary.concept.thaiLabel}</span> : null}
          </article>

          <article className={styles.reviewCard}>
            <div className={styles.cardHeading}>
              <span className={styles.cardIcon}><ReviewIcon name="space" /></span>
              <h2>พื้นที่และฟังก์ชัน</h2>
              <EditButton label="พื้นที่และฟังก์ชัน" onClick={() => onEdit(1)} />
            </div>
            <p>{configuration.bedrooms} ห้องนอน · {configuration.bathrooms} ห้องน้ำ · {configuration.floors} ชั้น</p>
            <p>{configuration.residents} ผู้อยู่อาศัย · ที่จอดรถ {configuration.parkingSpaces} คัน</p>
            <strong>พื้นที่ใช้สอย {summary.area.usableAreaM2} ตร.ม.</strong>
            <p className={styles.mutedValue}>{summary.functionLabels.length > 0 ? summary.functionLabels.join(" · ") : "ไม่ได้เลือกฟังก์ชันเพิ่มเติม"}</p>
          </article>

          <article className={styles.reviewCard}>
            <div className={styles.cardHeading}>
              <span className={styles.cardIcon}><ReviewIcon name="budget" /></span>
              <h2>งบประมาณ</h2>
              <EditButton label="งบประมาณ" onClick={() => onEdit(2)} />
            </div>
            <strong>{summary.budgetLabel}</strong>
            <span>{summary.location.province} · {summary.location.district}</span>
            <span>{summary.location.access}</span>
          </article>

          <article className={styles.reviewCard}>
            <div className={styles.cardHeading}>
              <span className={styles.cardIcon}><ReviewIcon name="materials" /></span>
              <h2>วัสดุและส่วนพิเศษ</h2>
              <EditButton label="วัสดุและส่วนพิเศษ" onClick={() => onEdit(3)} />
            </div>
            <strong>วัสดุเกรด {summary.quality.label}</strong>
            <span>{summary.specialFeatureLabels.length > 0 ? `เลือกส่วนพิเศษ ${summary.specialFeatureLabels.length} รายการ` : "ไม่ได้เลือกส่วนพิเศษ"}</span>
          </article>
        </div>

        <article className={`${styles.reviewCard} ${styles.materialListCard}`}>
          <div className={styles.cardHeading}>
            <span className={styles.cardIcon}><ReviewIcon name="materials" /></span>
            <h2>สรุปรายการวัสดุหลัก</h2>
            <EditButton label="วัสดุและส่วนพิเศษ" onClick={() => onEdit(3)} />
          </div>
          <ul className={styles.materialList}>
            {summary.materials.map((material) => (
              <li key={material.categoryId}>
                <span className={styles.materialThumb}>
                  {material.imageSrc ? (
                    <Image
                      alt={`วัสดุ${material.categoryLabel} ${material.optionLabel}`}
                      height={52}
                      src={material.imageSrc}
                      unoptimized
                      width={52}
                    />
                  ) : <AssetPlaceholder type="summary" />}
                </span>
                <span><small>{material.categoryLabel}</small><strong>{material.optionLabel}</strong></span>
              </li>
            ))}
          </ul>
        </article>

        <div className={styles.detailStack}>
          <article className={`${styles.reviewCard} ${styles.specialCard}`}>
            <div className={styles.cardHeading}>
              <span className={styles.cardIcon}><ReviewIcon name="feature" /></span>
              <h2>ส่วนพิเศษที่เลือก</h2>
              <EditButton label="วัสดุและส่วนพิเศษ" onClick={() => onEdit(3)} />
            </div>
            {visibleSpecialFeatures.length > 0 ? (
              <ul className={styles.specialFeatureList}>
                {visibleSpecialFeatures.map((feature) => (
                  <li key={feature.id}>
                    <span className={styles.specialFeatureThumb}>
                      <Image
                        alt={`ส่วนพิเศษ ${feature.label}`}
                        height={48}
                        src={feature.imageSrc}
                        unoptimized
                        width={48}
                      />
                      <span aria-hidden="true" className={styles.specialFeatureCheck}>✓</span>
                    </span>
                    <strong>{feature.label}</strong>
                  </li>
                ))}
              </ul>
            ) : <p className={styles.emptyValue}>ไม่ได้เลือกส่วนพิเศษ</p>}
            {hiddenSpecialFeatureCount > 0 ? <p className={styles.moreItems}>+ อีก {hiddenSpecialFeatureCount} รายการ · ทั้งหมด {summary.specialFeatures.length} รายการ</p> : null}
          </article>

          <article className={`${styles.reviewCard} ${styles.qualityCard}`}>
            <div className={styles.cardHeading}>
              <span className={styles.cardIcon}><ReviewIcon name="quality" /></span>
              <h2>ระดับคุณภาพวัสดุ</h2>
              <EditButton label="วัสดุและส่วนพิเศษ" onClick={() => onEdit(3)} />
            </div>
            <strong>{summary.quality.label}</strong>
            <span>{summary.quality.thaiLabel}</span>
            <p>{summary.quality.description}</p>
          </article>
        </div>
      </div>

      <aside aria-label="ภาพยืนยันแบบบ้าน" className={styles.previewColumn} data-testid="step-five-preview">
        <figure className={styles.housePreview} data-preview-style={summary.concept?.id ?? "not-selected"}>
          {summary.concept ? (
            <MaterialHousePreview
              className={styles.materialHousePreview}
              configuration={configuration}
              priority
              sizes="(max-width: 899px) 100vw, 52vw"
            />
          ) : <AssetPlaceholder type="preview" />}
        </figure>

        <div className={styles.confirmationPanels}>
          <section aria-labelledby="readiness-title" className={styles.confirmationCard}>
            <h2 id="readiness-title">ความพร้อมก่อนสรุปค่าใช้จ่าย</h2>
            <p>ตรวจสอบความครบถ้วนและความถูกต้องของข้อมูล ก่อนดำเนินการไปยังหน้าสรุปค่าใช้จ่าย</p>
            {summary.isReady ? (
              <ul className={styles.checkList}>
                <li><ReviewIcon name="check" />ข้อมูลการออกแบบครบถ้วน</li>
                <li><ReviewIcon name="check" />วัสดุและฟังก์ชันถูกบันทึกแล้ว</li>
                <li><ReviewIcon name="check" />สามารถย้อนกลับไปแก้ไขได้</li>
                <li><ReviewIcon name="check" />พร้อมไปยังหน้าสรุปค่าใช้จ่าย</li>
              </ul>
            ) : (
              <div className={styles.reviewWarning}>
                <strong>มีข้อมูลบางส่วนที่ควรตรวจสอบ</strong>
                <span>{summary.missingSections.join(" · ")}</span>
              </div>
            )}
          </section>

          <section aria-labelledby="next-benefits-title" className={styles.confirmationCard}>
            <h2 id="next-benefits-title">สิ่งที่คุณจะได้รับหลังจากนี้</h2>
            <ol className={styles.benefitList}>
              <li><span>01</span>สรุปค่าใช้จ่ายโดยละเอียด</li>
              <li><span>02</span>รายการวัสดุและอุปกรณ์ทั้งหมด</li>
              <li><span>03</span>แผนการชำระเงิน</li>
              <li><span>04</span>ระยะเวลาก่อสร้างโดยประมาณ</li>
            </ol>
          </section>
        </div>
      </aside>

      <nav aria-label="การดำเนินการขั้นตอนที่ 5" className={styles.actions}>
        <Button onClick={onBack} variant="ghost">ย้อนกลับ</Button>
        <Button aria-label="ไปยังหน้าสรุปค่าใช้จ่าย" onClick={onContinue}>ดูสรุปค่าใช้จ่าย<ReviewIcon name="arrow" /></Button>
      </nav>
    </section>
  );
}
