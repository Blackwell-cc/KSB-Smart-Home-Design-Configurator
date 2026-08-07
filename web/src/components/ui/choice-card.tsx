import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./choice-card.module.css";

type ChoiceCardProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  title: string;
  description?: string;
  icon?: ReactNode;
  selected?: boolean;
};

export function ChoiceCard({
  title,
  description,
  icon,
  selected = false,
  type = "button",
  className = "",
  ...props
}: ChoiceCardProps) {
  return (
    <button
      className={`${styles.card} ${className}`}
      data-selected={selected}
      {...props}
      aria-label={`${title} ${selected ? "เลือกแล้ว" : "ยังไม่ได้เลือก"}`}
      aria-pressed={selected}
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
