"use client";

import styles from "./counter.module.css";

type CounterProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange(value: number): void;
  helpText?: string;
};

export function Counter({ label, value, min, max, onChange, helpText }: CounterProps) {
  const id = `counter-${label.replace(/\s+/g, "-")}`;
  const setValue = (nextValue: number) => onChange(Math.min(max, Math.max(min, nextValue)));

  return (
    <div className={styles.counter}>
      <label htmlFor={id}>{label}</label>
      {helpText ? <p id={`${id}-help`}>{helpText}</p> : null}
      <div className={styles.controls}>
        <button aria-label={`${label} ลด`} disabled={value <= min} onClick={() => setValue(value - 1)} type="button">
          −
        </button>
        <input
          aria-describedby={helpText ? `${id}-help` : undefined}
          id={id}
          max={max}
          min={min}
          onChange={(event) => {
            const parsed = Number(event.target.value);
            if (Number.isFinite(parsed)) setValue(parsed);
          }}
          type="number"
          value={value}
        />
        <button aria-label={`${label} เพิ่ม`} disabled={value >= max} onClick={() => setValue(value + 1)} type="button">
          +
        </button>
      </div>
    </div>
  );
}
