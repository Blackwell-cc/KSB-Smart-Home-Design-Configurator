"use client";

import Image from "next/image";
import { useState } from "react";
import { FieldError } from "@/components/ui/field-error";
import { VISIBLE_CONCEPT_CATALOG } from "@/features/preview/domain/concept-catalog";
import styles from "./configurator-shell.module.css";

type StyleStepProps = {
  error?: string;
  errorId?: string;
  selectedStyleId: string | null;
  onChange(styleId: string): void;
};

const STYLE_FILTERS = [
  { id: "all", label: "ทั้งหมด" },
  { id: "modern", label: "โมเดิร์น" },
  { id: "contemporary", label: "คอนเทมโพรารี" },
  { id: "tropical", label: "ทรอปิคอล" },
  { id: "classic", label: "คลาสสิก" },
] as const;

type StyleFilter = (typeof STYLE_FILTERS)[number]["id"];

export function StyleStep({ error, errorId, selectedStyleId, onChange }: StyleStepProps) {
  const [activeFilter, setActiveFilter] = useState<StyleFilter>("all");
  const visibleConcepts = activeFilter === "all"
    ? VISIBLE_CONCEPT_CATALOG
    : VISIBLE_CONCEPT_CATALOG.filter((concept) => concept.category === activeFilter);

  return (
    <fieldset aria-describedby={error ? errorId : undefined} className={styles.choiceFieldset}>
      <legend className={styles.visuallyHidden}>เลือกรูปแบบบ้านที่ใกล้กับความต้องการของคุณ</legend>
      <div aria-label="กรองรูปแบบบ้าน" className={styles.styleFilters} role="group">
        {STYLE_FILTERS.map((filter) => (
          <button
            aria-pressed={activeFilter === filter.id}
            className={styles.filterChip}
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Placeholder thumbnail contract: render about 116×78 px; replace with 1200×800 px (3:2) production assets. */}
      <div aria-describedby={error ? errorId : undefined} aria-label="เลือกสไตล์บ้าน" className={styles.conceptGrid} data-style-layout="vertical-list" role="radiogroup">
        {visibleConcepts.map((concept) => {
          const originalIndex = VISIBLE_CONCEPT_CATALOG.findIndex((item) => item.id === concept.id);
          return (
            <label className={styles.conceptOption} data-continuation={originalIndex === 5} data-selected={selectedStyleId === concept.id} data-style-card="true" key={concept.id}>
              <input
                aria-label={concept.label}
                checked={selectedStyleId === concept.id}
                name="style"
                onChange={() => onChange(concept.id)}
                type="radio"
                value={concept.id}
              />
              <span className={styles.conceptThumbnail} data-render-size="116x78" data-source-size="1200x800">
                <Image alt="" aria-hidden="true" fill loading={originalIndex < 2 ? "eager" : "lazy"} sizes="116px" src={concept.image} />
              </span>
              <span className={styles.conceptCopy}>
                <span className={styles.conceptIndex}>{String(originalIndex + 1).padStart(2, "0")}</span>
                <span className={styles.conceptThai}>{concept.thaiLabel}</span>
                <span className={styles.conceptEnglish}>{concept.englishLabel}</span>
                <span className={styles.conceptDescription}>{concept.description}</span>
                <span className={styles.conceptSpecs}>
                  <span>{concept.specs.floors}</span>
                  <span>{concept.specs.bedrooms}นอน</span>
                  <span>{concept.specs.bathrooms}น้ำ</span>
                </span>
              </span>
              <span aria-hidden="true" className={styles.selectionDot}>{selectedStyleId === concept.id ? "✓" : ""}</span>
            </label>
          );
        })}
      </div>

      {error ? <FieldError className={styles.error} id={errorId}>{error}</FieldError> : null}
    </fieldset>
  );
}
