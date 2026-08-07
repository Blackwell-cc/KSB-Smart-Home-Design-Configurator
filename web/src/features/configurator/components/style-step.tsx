import { CONCEPT_CATALOG } from "@/features/preview/domain/concept-catalog";
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
          <label className={styles.conceptOption} data-selected={selectedStyleId === concept.id} key={concept.id}>
            <input
              checked={selectedStyleId === concept.id}
              name="style"
              onChange={() => onChange(concept.id)}
              type="radio"
              value={concept.id}
            />
            <span>{concept.label}</span>
          </label>
        ))}
      </div>
      {error ? <p className={styles.error} id={errorId} role="alert">{error}</p> : null}
    </fieldset>
  );
}
