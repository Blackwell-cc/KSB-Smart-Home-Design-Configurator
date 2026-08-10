import { CONCEPT_CATALOG } from "@/features/preview/domain/concept-catalog";
import { FieldError } from "@/components/ui/field-error";
import styles from "./configurator-shell.module.css";

type StyleStepProps = {
  error?: string;
  errorId?: string;
  selectedStyleId: string | null;
  onChange(styleId: string): void;
};

export function StyleStep({ error, errorId, selectedStyleId, onChange }: StyleStepProps) {
  return (
    <fieldset aria-describedby={error ? errorId : undefined} className={styles.choiceFieldset}>
      <legend>เลือกรูปแบบที่ใกล้กับบ้านของคุณที่สุด</legend>
      <div aria-describedby={error ? errorId : undefined} aria-label="เลือกสไตล์บ้าน" className={styles.conceptGrid} role="radiogroup">
        {CONCEPT_CATALOG.map((concept) => (
          <label className={styles.conceptOption} data-selected={selectedStyleId === concept.id} data-style-card="true" key={concept.id}>
            <input
              aria-label={concept.label}
              checked={selectedStyleId === concept.id}
              name="style"
              onChange={() => onChange(concept.id)}
              type="radio"
              value={concept.id}
            />
            <span className={styles.conceptThumbnail}>
              <Image alt="" aria-hidden="true" fill sizes="(max-width: 560px) 42vw, 190px" src={concept.image} />
            </span>
            <span className={styles.conceptCopy}>
              <span className={styles.conceptIndex}>0{CONCEPT_CATALOG.indexOf(concept) + 1}</span>
              <span className={styles.conceptThai}>{concept.thaiLabel}</span>
              <span className={styles.conceptEnglish}>{concept.englishLabel}</span>
              <span className={styles.conceptDescription}>{concept.description}</span>
            </span>
          </label>
        ))}
      </div>
      {error ? <FieldError className={styles.error} id={errorId}>{error}</FieldError> : null}
    </fieldset>
  );
}
import Image from "next/image";
