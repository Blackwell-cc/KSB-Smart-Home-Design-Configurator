"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { HouseConfiguration } from "../domain/configuration";
import { THAI_PROVINCES } from "../domain/provinces";
import styles from "./configurator-shell.module.css";

type ProvinceCode = HouseConfiguration["provinceCode"];

type ProvinceComboboxProps = {
  describedBy?: string;
  onChange(value: ProvinceCode): void;
  value: ProvinceCode;
};

const LISTBOX_ID = "province-options";

export function ProvinceCombobox({ describedBy, onChange, value }: ProvinceComboboxProps) {
  const selectedProvince = THAI_PROVINCES.find((province) => province.code === value);
  const [query, setQuery] = useState(selectedProvince?.name ?? "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const committedValueRef = useRef<ProvinceCode>(value);

  useEffect(() => {
    if (value === committedValueRef.current) return;
    committedValueRef.current = value;
    setQuery(THAI_PROVINCES.find((province) => province.code === value)?.name ?? "");
  }, [value]);

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, []);

  const normalizedQuery = query.trim().toLocaleLowerCase("th-TH");
  const showAll = normalizedQuery.length === 0 || normalizedQuery === selectedProvince?.name.toLocaleLowerCase("th-TH");
  const filteredProvinces = useMemo(() => (
    showAll
      ? THAI_PROVINCES
      : THAI_PROVINCES.filter((province) => province.name.toLocaleLowerCase("th-TH").includes(normalizedQuery))
  ), [normalizedQuery, showAll]);

  const selectProvince = (code: ProvinceCode, name: string) => {
    committedValueRef.current = code;
    setQuery(name);
    setOpen(false);
    onChange(code);
    inputRef.current?.focus();
  };

  const handleInput = (nextQuery: string) => {
    setQuery(nextQuery);
    setOpen(true);
    setActiveIndex(0);
    if (committedValueRef.current !== null) {
      committedValueRef.current = null;
      onChange(null);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + (open ? 1 : 0), Math.max(filteredProvinces.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Enter" && open && filteredProvinces[activeIndex]) {
      event.preventDefault();
      const province = filteredProvinces[activeIndex];
      selectProvince(province.code, province.name);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className={styles.provinceCombobox} ref={rootRef}>
      <div className={styles.provinceInputShell} data-open={open ? "true" : "false"}>
        <svg aria-hidden="true" className={styles.provinceSearchIcon} fill="none" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
        </svg>
        <input
          aria-activedescendant={open && filteredProvinces[activeIndex] ? `province-option-${filteredProvinces[activeIndex].code}` : undefined}
          aria-autocomplete="list"
          aria-controls={LISTBOX_ID}
          aria-describedby={describedBy}
          aria-expanded={open}
          aria-haspopup="listbox"
          autoComplete="off"
          id="province"
          onChange={(event) => handleInput(event.target.value)}
          onFocus={(event) => {
            setOpen(true);
            setActiveIndex(Math.max(THAI_PROVINCES.findIndex((province) => province.code === value), 0));
            event.currentTarget.select();
          }}
          onKeyDown={handleKeyDown}
          placeholder="พิมพ์ค้นหาหรือเลือกจังหวัด"
          ref={inputRef}
          role="combobox"
          type="text"
          value={query}
        />
        <button
          aria-label={open ? "ปิดรายชื่อจังหวัด" : "เปิดรายชื่อจังหวัด"}
          className={styles.provinceToggle}
          onClick={() => {
            if (open) {
              setOpen(false);
            } else {
              inputRef.current?.focus();
            }
          }}
          type="button"
        >
          <svg aria-hidden="true" fill="none" viewBox="0 0 16 16"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>
        </button>
      </div>

      {open ? (
        <div className={styles.provinceDropdown}>
          {filteredProvinces.length > 0 ? (
            <ul aria-label="รายชื่อจังหวัด" id={LISTBOX_ID} role="listbox">
              {filteredProvinces.map((province, index) => (
                <li
                  aria-selected={province.code === value}
                  data-active={index === activeIndex ? "true" : "false"}
                  id={`province-option-${province.code}`}
                  key={province.code}
                  onClick={() => selectProvince(province.code, province.name)}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  role="option"
                >
                  <span>{province.name}</span>
                  {province.code === value ? <span aria-hidden="true" className={styles.provinceCheck}>✓</span> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.provinceEmpty}>ไม่พบจังหวัดที่ค้นหา</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
