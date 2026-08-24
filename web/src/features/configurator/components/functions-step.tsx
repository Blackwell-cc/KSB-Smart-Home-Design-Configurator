"use client";

import { useRef } from "react";
import { Counter } from "@/components/ui/counter";
import { FieldError } from "@/components/ui/field-error";
import type { HouseConfiguration } from "../domain/configuration";
import { ADDITIONAL_REQUIREMENT_OPTIONS } from "../presentation/additional-requirements";
import styles from "./configurator-shell.module.css";

type FunctionsStepProps = {
  areaDraft: string;
  areaError?: string;
  configuration: HouseConfiguration;
  recommendedAreaM2: number;
  onAreaChange(value: string): void;
  onChange(patch: Partial<HouseConfiguration>): void;
};

const FUNCTION_CHOICES = [
  ["office", "ห้องทำงาน", "พื้นที่เงียบสงบสำหรับการทำงาน", "desk"],
  ["elderlyRoom", "ห้องผู้สูงอายุ", "ออกแบบเพื่อความปลอดภัยและสะดวกสบาย", "elderly"],
  ["thaiKitchen", "ครัวไทย", "แยกสัดส่วน ระบายอากาศ ใช้งานได้จริง", "kitchen"],
  ["multipurposeRoom", "ห้องอเนกประสงค์", "ปรับเปลี่ยนได้ตามความต้องการ", "multi"],
] as const;

type FunctionIconName = (typeof FUNCTION_CHOICES)[number][3] | (typeof ADDITIONAL_REQUIREMENT_OPTIONS)[number]["icon"];

const FIELD_ICONS = {
  residents: "M4 20v-2a5 5 0 0 1 10 0v2M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 1a2.5 2.5 0 0 1 4 2v6M16 5a3 3 0 0 1 0 6",
  floors: "M5 20V5h14v15M8 9h3M13 9h3M8 13h3M13 13h3M3 20h18",
  bedrooms: "M4 18v-7h16v7M4 14h16M7 11V8h4a3 3 0 0 1 3 3M4 20v-2M20 20v-2",
  bathrooms: "M5 12h14v3a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM8 12V6a2 2 0 0 1 4 0",
  parking: "M4 16v-4l2-4h12l2 4v4M6 16v2M18 16v2M6 12h12M8 15h.01M16 15h.01",
} as const;

function LineIcon({ path }: { path: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d={path} /></svg>;
}

function FunctionIcon({ name }: { name: FunctionIconName }) {
  const paths = {
    desk: "M3 13h18M5 13v7M19 13v7M8 13V8h8v5M10 8V5h4v3",
    elderly: "M9 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4M9 7v6l-3 7M9 13l4 7M12 9h4l2 3M18 12v8M16 20h4",
    kitchen: "M5 11h14v9H5zM8 11V8a4 4 0 0 1 8 0v3M9 15h6M12 15v5",
    multi: "M4 15V9h16v6M4 15h16v4H4zM7 19v2M17 19v2M8 9V6h8v3",
    prayer: "M5 19h14M7 19c0-4 2-7 5-9 3 2 5 5 5 9M12 10V4M9 7l3-3 3 3",
    laundry: "M5 3h14v18H5zM8 6h2M13 6h3M8 14a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z",
    theater: "M3 5h18v13H3zM9 9l6 3-6 3zM7 21h10",
    fitness: "M3 10v4M6 8v8M18 8v8M21 10v4M6 12h12",
    pantry: "M6 3h12v18H6zM6 11h12M9 7h3M9 15h3M15 7h.01M15 15h.01",
    pet: "M7 13c-2.5 1-3 4-1 5.5 2.2 1.7 9.8 1.7 12 0 2-1.5 1.5-4.5-1-5.5-3-1.3-7-1.3-10 0M5 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4M19 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4M10 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4M14 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
    maid: "M12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6M7 21v-7a5 5 0 0 1 10 0v7M9 13l3 3 3-3M12 16v5",
    living: "M4 15v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M4 15h16v4H4zM7 19v2M17 19v2M8 9V6h8v3",
  } as const;
  return <LineIcon path={paths[name]} />;
}

export function FunctionsStep({ areaDraft, areaError, configuration, recommendedAreaM2, onAreaChange, onChange }: FunctionsStepProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const updateNumber = (key: "residents" | "floors" | "bedrooms" | "bathrooms" | "parkingSpaces") => (value: number) =>
    onChange({ [key]: value });
  const shownArea = areaDraft === "" || areaError ? recommendedAreaM2 : Number(areaDraft);
  const moveCarousel = (direction: -1 | 1) => {
    carouselRef.current?.scrollBy({ behavior: "auto", left: direction * carouselRef.current.clientWidth * 0.72 });
  };

  return (
    <div className={styles.stepStack}>
      <h2 className={styles.functionsSectionTitle}>จำนวนและพื้นที่ใช้งาน</h2>
      <div className={styles.counterGrid}>
        <Counter icon={<LineIcon path={FIELD_ICONS.residents} />} label="จำนวนผู้อยู่อาศัย" max={20} min={1} onChange={updateNumber("residents")} unit="คน" value={configuration.residents} />
        <Counter icon={<LineIcon path={FIELD_ICONS.floors} />} label="จำนวนชั้น" max={3} min={1} onChange={updateNumber("floors")} unit="ชั้น" value={configuration.floors} />
        <Counter icon={<LineIcon path={FIELD_ICONS.bedrooms} />} label="จำนวนห้องนอน" max={12} min={1} onChange={updateNumber("bedrooms")} unit="ห้อง" value={configuration.bedrooms} />
        <Counter icon={<LineIcon path={FIELD_ICONS.bathrooms} />} label="จำนวนห้องน้ำ" max={15} min={1} onChange={updateNumber("bathrooms")} unit="ห้อง" value={configuration.bathrooms} />
        <Counter icon={<LineIcon path={FIELD_ICONS.parking} />} label="ที่จอดรถ" max={10} min={0} onChange={updateNumber("parkingSpaces")} unit="คัน" value={configuration.parkingSpaces} />
        <div className={styles.areaSelector}>
          <label htmlFor="usable-area">พื้นที่ใช้สอยที่ต้องการ <span>(โดยประมาณ)</span></label>
          <div className={styles.areaValue}><input aria-describedby={areaError ? "usable-area-help usable-area-error" : "usable-area-help"} id="usable-area" inputMode="numeric" max="1500" min="60" onChange={(event) => onAreaChange(event.target.value)} placeholder={String(shownArea)} type="number" value={areaDraft} /><span>ตร.ม.</span></div>
          <input aria-label="เลื่อนปรับขนาดพื้นที่" className={styles.areaRange} max="1500" min="60" onChange={(event) => onAreaChange(event.target.value)} step="10" type="range" value={shownArea} />
          <div aria-hidden="true" className={styles.areaTicks}><span>60</span><span>150</span><strong>{shownArea}</strong><span>1,500</span></div>
          <p id="usable-area-help">ค่าที่แนะนำจากจำนวนห้องและผู้อยู่อาศัย (60–1,500 ตร.ม.)</p>
          {areaError ? <FieldError className={styles.error} id="usable-area-error">{areaError}</FieldError> : null}
        </div>
      </div>
      <fieldset className={styles.choiceFieldset}>
        <legend className={styles.visuallyHidden}>ฟังก์ชันเพิ่มเติม (เลือกได้หลายข้อ)</legend>
        <div className={styles.choiceHeading}>
          <div aria-hidden="true" className={styles.choiceTitle}>
            <strong>ฟังก์ชันเพิ่มเติม</strong>
            <span>(เลือกได้หลายข้อ)</span>
          </div>
          <div className={styles.carouselActions}>
            <button aria-label="เลื่อนตัวเลือกไปทางซ้าย" onClick={() => moveCarousel(-1)} type="button">←</button>
            <button aria-label="เลื่อนตัวเลือกไปทางขวา" onClick={() => moveCarousel(1)} type="button">→</button>
          </div>
        </div>
        <div aria-label="ตัวเลือกฟังก์ชันและความต้องการเพิ่มเติม" className={styles.functionCarouselTrack} ref={carouselRef} role="region" tabIndex={0}>
          {FUNCTION_CHOICES.map(([key, label, impact, icon]) => (
            <label className={styles.checkChoice} data-calculation="requirement-only" data-selected={configuration.functions[key]} key={key}>
              <input
                checked={configuration.functions[key]}
                onChange={(event) => onChange({ functions: { ...configuration.functions, [key]: event.target.checked } })}
                type="checkbox"
              />
              <span className={styles.functionIcon}><FunctionIcon name={icon} /></span>
              <span className={styles.featureCopy}><span className={styles.featureLabel}>{label}</span><span aria-hidden="true" className={styles.featureImpact}>{impact}</span></span>
              <span aria-hidden="true" className={styles.featureState}>{configuration.functions[key] ? "✓" : ""}</span>
            </label>
          ))}
          {ADDITIONAL_REQUIREMENT_OPTIONS.map(({ code, label, description, icon }) => {
            const selected = configuration.additionalRequirements.includes(code);
            return (
              <label className={styles.checkChoice} data-calculation="requirement-only" data-selected={selected} key={code}>
                <input
                  checked={selected}
                  onChange={(event) => onChange({
                    additionalRequirements: event.target.checked
                      ? [...configuration.additionalRequirements, code]
                      : configuration.additionalRequirements.filter((item) => item !== code),
                  })}
                  type="checkbox"
                />
                <span className={styles.functionIcon}><FunctionIcon name={icon} /></span>
                <span className={styles.featureCopy}><span className={styles.featureLabel}>{label}</span><span aria-hidden="true" className={styles.featureImpact}>{description}</span></span>
                <span aria-hidden="true" className={styles.featureState}>{selected ? "✓" : ""}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
