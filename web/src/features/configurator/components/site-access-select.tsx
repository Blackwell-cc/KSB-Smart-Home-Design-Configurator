"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { HouseConfiguration } from "../domain/configuration";
import styles from "./configurator-shell.module.css";

type SiteAccess = HouseConfiguration["siteAccess"];

type SiteAccessSelectProps = {
  onChange(value: SiteAccess): void;
  value: SiteAccess;
};

const OPTIONS: ReadonlyArray<{ label: string; value: SiteAccess }> = [
  { value: "normal", label: "เข้าถึงปกติ" },
  { value: "restricted", label: "ถนนค่อนข้างแคบ" },
  { value: "very-restricted", label: "รถขนาดใหญ่เข้าถึงยาก" },
];

const LISTBOX_ID = "site-access-options";

export function SiteAccessSelect({ onChange, value }: SiteAccessSelectProps) {
  const selectedIndex = Math.max(OPTIONS.findIndex((option) => option.value === value), 0);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, []);

  const selectOption = (option: (typeof OPTIONS)[number]) => {
    setActiveIndex(OPTIONS.indexOf(option));
    setOpen(false);
    onChange(option.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, OPTIONS.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(event.key === "Home" ? 0 : OPTIONS.length - 1);
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      selectOption(OPTIONS[activeIndex]);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className={styles.siteAccessSelect} ref={rootRef}>
      <button
        aria-activedescendant={open ? `site-access-option-${OPTIONS[activeIndex].value}` : undefined}
        aria-controls={LISTBOX_ID}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={styles.siteAccessTrigger}
        data-open={open ? "true" : "false"}
        id="site-access"
        onClick={() => {
          setActiveIndex(selectedIndex);
          setOpen((current) => !current);
        }}
        onKeyDown={handleKeyDown}
        role="combobox"
        type="button"
      >
        <span>{OPTIONS[selectedIndex].label}</span>
        <svg aria-hidden="true" fill="none" viewBox="0 0 16 16"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>
      </button>

      {open ? (
        <div className={`${styles.provinceDropdown} ${styles.siteAccessDropdown}`}>
          <ul aria-label="ตัวเลือกสภาพการเข้าถึงหน้างาน" id={LISTBOX_ID} role="listbox">
            {OPTIONS.map((option, index) => (
              <li
                aria-selected={option.value === value}
                data-active={index === activeIndex ? "true" : "false"}
                id={`site-access-option-${option.value}`}
                key={option.value}
                onClick={() => selectOption(option)}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                role="option"
              >
                <span>{option.label}</span>
                {option.value === value ? <span aria-hidden="true" className={styles.provinceCheck}>✓</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
