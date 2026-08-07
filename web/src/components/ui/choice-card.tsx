import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./choice-card.module.css";

type ChoiceCardProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  title: string;
  description?: string;
  icon?: ReactNode;
  selected?: boolean;
  selectionRole?: "button" | "radio";
};

export function ChoiceCard({
  title,
  description,
  icon,
  selected = false,
  selectionRole = "button",
  type = "button",
  className = "",
  ...props
}: ChoiceCardProps) {
  const selectionState =
    selectionRole === "radio"
      ? { role: "radio" as const, "aria-checked": selected, "aria-pressed": undefined }
      : { "aria-pressed": selected };

  return (
    <button
      className={`${styles.card} ${className}`}
      data-selected={selected}
      {...props}
      {...selectionState}
      aria-label={`${title} ${selected ? "เลือกแล้ว" : "ยังไม่ได้เลือก"}`}
      type={type}
    >
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.content}>
        <span className={styles.title}>{title}</span>
        {description ? <span className={styles.description}>{description}</span> : null}
      </span>
      <span className={styles.selection}>
        <span aria-hidden="true" className={styles.indicator}>
          {selected ? "✓" : "○"}
        </span>
        <span>{selected ? "เลือกแล้ว" : "ยังไม่ได้เลือก"}</span>
      </span>
    </button>
  );
}
