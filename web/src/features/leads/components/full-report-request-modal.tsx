"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { DesignBriefConfiguration } from "@/features/configurator/domain/configuration";
import { THAI_PROVINCES } from "@/features/configurator/domain/provinces";
import type { FreePreviewPayload } from "@/features/preview/application/build-free-preview";
import { CONCEPT_CATALOG, resolveConceptImage } from "@/features/preview/domain/concept-catalog";
import type { RequestPurposeId } from "@/features/leads/domain/lead";
import styles from "./full-report-request-modal.module.css";

const INTENT_STORAGE_KEY = "ksb-soft-gate-intent-v1";
const CONSENT_VERSION = "project-contact-v1";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Intent = { configurationId: string; idempotencyKey: string };
type SubmissionStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type FormValues = { fullName: string; phone: string; email: string; lineId: string; requestPurpose: "" | RequestPurposeId; consent: boolean };
type FormErrors = Partial<Record<keyof FormValues | "submit", string>>;

const REQUEST_PURPOSE_OPTIONS: ReadonlyArray<{ id: RequestPurposeId; label: string }> = [
  { id: "view_full_report", label: "ต้องการดูรายละเอียดบ้านและงบประมาณเพิ่มเติม" },
  { id: "planning_to_build", label: "กำลังวางแผนสร้างบ้าน" },
  { id: "compare_options", label: "ต้องการเปรียบเทียบแนวทางก่อนตัดสินใจ" },
  { id: "architect_consultation", label: "ต้องการปรึกษาสถาปนิก" },
  { id: "budget_planning", label: "ต้องการข้อมูลเพื่อวางแผนงบประมาณ" },
  { id: "design_service", label: "สนใจบริการออกแบบบ้าน" },
  { id: "other", label: "อื่น ๆ" },
];

const BENEFITS = [
  ["รายงานรายละเอียดโครงการฉบับเต็ม", "ข้อมูลครบถ้วนจากตัวเลือกทั้งหมดของคุณ"],
  ["ประมาณการงบประมาณโดยละเอียด", "แยกหมวดค่าใช้จ่ายและสมมติฐานสำคัญ"],
  ["แบบแปลนและการวิเคราะห์พื้นที่", "แนวทางผังพื้นที่และรายละเอียดการออกแบบ"],
  ["คำแนะนำและแนวทางการออกแบบ", "อ้างอิงจากสไตล์ ฟังก์ชัน และความต้องการของคุณ"],
  ["มุมมองบ้านเพิ่มเติม", "ดูบ้านจากหลายมุมมากกว่า Preview เบื้องต้น"],
] as const;

function isIntent(value: unknown): value is Intent {
  return typeof value === "object" && value !== null
    && "configurationId" in value && "idempotencyKey" in value
    && typeof value.configurationId === "string" && UUID_PATTERN.test(value.configurationId)
    && typeof value.idempotencyKey === "string" && UUID_PATTERN.test(value.idempotencyKey);
}

export function getOrCreateSubmissionIntent(storage: SubmissionStorage, createUuid: () => string): Intent {
  try {
    const raw = storage.getItem(INTENT_STORAGE_KEY);
    if (raw !== null) {
      try { const parsed: unknown = JSON.parse(raw); if (isIntent(parsed)) return parsed; } catch { /* regenerate below */ }
      storage.removeItem(INTENT_STORAGE_KEY);
    }
    const next = { configurationId: createUuid(), idempotencyKey: createUuid() };
    storage.setItem(INTENT_STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return { configurationId: createUuid(), idempotencyKey: createUuid() };
  }
}

function clearIntent() {
  try { window.sessionStorage.removeItem(INTENT_STORAGE_KEY); } catch { /* retry metadata is optional */ }
}

function Icon({ name }: { name: "download" | "close" | "shield" | "gift" | "report" | "location" | "area" | "arrow" }) {
  const paths = {
    download: <><path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M5 21h14"/></>,
    close: <><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>,
    shield: <><path d="M12 3 5.5 6v5.2c0 4.3 2.6 7.8 6.5 9.8 3.9-2 6.5-5.5 6.5-9.8V6L12 3Z"/><rect x="9" y="10" width="6" height="5" rx="1"/><path d="M10.5 10V8.8a1.5 1.5 0 0 1 3 0V10"/></>,
    gift: <><path d="M4 10h16v10H4z"/><path d="M12 10v10M3 7h18v3H3z"/><path d="M12 7H8.5a2 2 0 1 1 2-2c0 1.4 1.5 2 1.5 2Zm0 0h3.5a2 2 0 1 0-2-2c0 1.4-1.5 2-1.5 2Z"/></>,
    report: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    location: <><path d="M12 21s6-5 6-11a6 6 0 1 0-12 0c0 6 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></>,
    area: <><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 4v16M16 4v16"/></>,
    arrow: <><path d="M5 12h14"/><path d="m15 8 4 4-4 4"/></>,
  } as const;
  return <svg aria-hidden="true" viewBox="0 0 24 24">{paths[name]}</svg>;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.fullName.trim()) errors.fullName = "กรุณาระบุชื่อ–นามสกุล";
  if (!/^[0-9+()\-\s]{9,20}$/.test(values.phone.trim())) errors.phone = "กรุณาระบุเบอร์โทรศัพท์";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "กรุณาระบุอีเมลให้ถูกต้อง";
  if (!values.requestPurpose) errors.requestPurpose = "กรุณาเลือกวัตถุประสงค์ในการขอข้อมูล";
  if (!values.consent) errors.consent = "กรุณายืนยันความยินยอมในการใช้ข้อมูล";
  return errors;
}

type FullReportRequestModalProps = {
  configuration: DesignBriefConfiguration;
  preview: FreePreviewPayload;
  open: boolean;
  onClose: () => void;
  onSuccess: (reportUrl: string) => void;
};

export function FullReportRequestModal({ configuration, preview, open, onClose, onSuccess }: FullReportRequestModalProps) {
  const [intent] = useState<Intent>(() => getOrCreateSubmissionIntent(window.sessionStorage, () => crypto.randomUUID()));
  const [values, setValues] = useState<FormValues>({ fullName: "", phone: "", email: "", lineId: "", requestPurpose: "", consent: false });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const concept = CONCEPT_CATALOG.find((item) => item.id === configuration.styleId);
  const projectName = concept?.englishLabel ?? preview.styleLabel;
  const imageSrc = concept ? resolveConceptImage(concept, configuration.floors) : `/concepts/${preview.conceptAssetId}.png`;
  const province = THAI_PROVINCES.find((item) => item.code === configuration.provinceCode)?.name ?? "ยังไม่ได้ระบุจังหวัด";

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    queueMicrotask(() => nameRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])"));
      if (focusable.length === 0) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [onClose, open]);

  const update = <Key extends keyof FormValues>(key: Key, value: FormValues[Key]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, submit: undefined }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstInvalid = (["fullName", "phone", "email", "requestPurpose", "consent"] as const).find((key) => nextErrors[key]);
      queueMicrotask(() => document.getElementById(`full-report-${firstInvalid}`)?.focus());
      return;
    }
    setIsSubmitting(true); setErrors({});
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...intent,
          configuration,
          preferredContactMethod: "phone",
          name: values.fullName.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          ...(values.lineId.trim() ? { lineId: values.lineId.trim() } : {}),
          requestPurpose: values.requestPurpose,
          consentAccepted: true,
          consentVersion: CONSENT_VERSION,
        }),
      });
      const payload = await response.json();
      if (response.status === 429) {
        setErrors({ submit: "ส่งคำขอหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่" });
        setIsSubmitting(false);
        return;
      }
      if (!response.ok || typeof payload?.reportUrl !== "string" || !payload.reportUrl.startsWith("/report/access#")) throw new Error("SUBMISSION_FAILED");
      clearIntent(); onSuccess(payload.reportUrl);
    } catch {
      setErrors({ submit: "ยังไม่สามารถจัดทำรายงานได้ในขณะนี้ กรุณาลองอีกครั้ง" });
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return <div className={styles.overlay} data-testid="full-report-modal-backdrop">
    <div aria-labelledby="full-report-title" aria-modal="true" className={styles.dialog} ref={dialogRef} role="dialog">
      <header className={styles.header}>
        <span className={styles.headerIcon}><Icon name="download" /></span>
        <div><h2 id="full-report-title">รับข้อมูลฉบับเต็ม</h2><p>กรอกข้อมูลติดต่อเพียงเล็กน้อย เพื่อรับรายงานบ้านของคุณที่จัดทำจากข้อมูลที่เลือกไว้</p></div>
        <button aria-label="ปิดหน้าต่างรับข้อมูลฉบับเต็ม" className={styles.close} onClick={onClose} type="button"><Icon name="close" /></button>
      </header>

      <form className={styles.form} noValidate onSubmit={submit}>
        <div className={styles.contactColumn}>
          <section className={styles.contactPanel} aria-labelledby="contact-information-title">
            <div className={styles.sectionHeading}><h3 id="contact-information-title">ข้อมูลติดต่อของคุณ</h3><p>เพื่อให้ทีมงานสามารถจัดทำรายงานฉบับเต็มให้เหมาะกับโครงการของคุณ</p></div>
            <div className={styles.fields}>
              <label className={styles.field} htmlFor="full-report-fullName"><span>ชื่อ–นามสกุล *</span><input aria-describedby={errors.fullName ? "full-report-fullName-error" : undefined} aria-invalid={Boolean(errors.fullName)} autoComplete="name" id="full-report-fullName" maxLength={120} onChange={(event) => update("fullName", event.target.value)} placeholder="กรุณาระบุชื่อ–นามสกุล" ref={nameRef} value={values.fullName} />{errors.fullName ? <small id="full-report-fullName-error">{errors.fullName}</small> : null}</label>
              <label className={styles.field} htmlFor="full-report-phone"><span>เบอร์โทรศัพท์ *</span><input aria-describedby={errors.phone ? "full-report-phone-error" : undefined} aria-invalid={Boolean(errors.phone)} autoComplete="tel" id="full-report-phone" inputMode="tel" maxLength={20} onChange={(event) => update("phone", event.target.value)} placeholder="กรุณาระบุเบอร์โทรศัพท์" value={values.phone} />{errors.phone ? <small id="full-report-phone-error">{errors.phone}</small> : null}</label>
              <label className={styles.field} htmlFor="full-report-email"><span>อีเมล *</span><input aria-describedby={errors.email ? "full-report-email-error" : undefined} aria-invalid={Boolean(errors.email)} autoComplete="email" id="full-report-email" maxLength={254} onChange={(event) => update("email", event.target.value)} placeholder="กรุณาระบุอีเมล" type="email" value={values.email} />{errors.email ? <small id="full-report-email-error">{errors.email}</small> : null}</label>
              <label className={styles.field} htmlFor="full-report-lineId"><span>ไลน์ไอดี (ถ้ามี)</span><input autoComplete="off" id="full-report-lineId" maxLength={100} onChange={(event) => update("lineId", event.target.value)} placeholder="กรุณาระบุไลน์ไอดี" value={values.lineId} /></label>
              <label className={`${styles.field} ${styles.purpose}`} htmlFor="full-report-requestPurpose"><span>วัตถุประสงค์ในการขอข้อมูล *</span><select aria-describedby={errors.requestPurpose ? "full-report-requestPurpose-error" : undefined} aria-invalid={Boolean(errors.requestPurpose)} id="full-report-requestPurpose" onChange={(event) => update("requestPurpose", event.target.value as FormValues["requestPurpose"])} value={values.requestPurpose}><option value="">กรุณาเลือกวัตถุประสงค์ในการขอข้อมูล</option>{REQUEST_PURPOSE_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select>{errors.requestPurpose ? <small id="full-report-requestPurpose-error">{errors.requestPurpose}</small> : null}</label>
            </div>
          </section>
          <div className={styles.trustCard}>
            <span className={styles.trustIcon}><Icon name="shield" /></span>
            <div><h4>มั่นใจในความปลอดภัยของข้อมูล</h4><p>ข้อมูลของคุณจะใช้เพื่อจัดทำรายงานและติดต่อเกี่ยวกับโครงการนี้เท่านั้น และจะไม่เปิดเผยให้บุคคลภายนอกโดยไม่ได้รับอนุญาต</p><label className={styles.consent} htmlFor="full-report-consent"><input aria-describedby={errors.consent ? "full-report-consent-error" : undefined} aria-invalid={Boolean(errors.consent)} checked={values.consent} id="full-report-consent" onChange={(event) => update("consent", event.target.checked)} type="checkbox" /><span>ยินยอมให้ใช้ข้อมูลเพื่อจัดทำรายงานและติดต่อเกี่ยวกับโครงการนี้</span></label>{errors.consent ? <small className={styles.consentError} id="full-report-consent-error">{errors.consent}</small> : null}</div>
          </div>
        </div>

        <aside className={styles.informationPanel}>
          <section className={styles.benefits} aria-labelledby="report-benefits-title" tabIndex={0}><h3 id="report-benefits-title"><Icon name="gift" />สิ่งที่คุณจะได้รับ</h3><ul>{BENEFITS.map(([title, copy]) => <li key={title}><span><Icon name="report" /></span><div><strong>{title}</strong><small>{copy}</small></div></li>)}</ul></section>
          <section className={styles.project} aria-labelledby="selected-project-title"><h3 id="selected-project-title">โครงการที่คุณเลือก</h3><div className={styles.projectMain}><div className={styles.mainThumbnail}><Image alt={`ภาพหลัก ${projectName}`} fill sizes="145px" src={imageSrc} /></div><div className={styles.projectCopy}><strong>{projectName}</strong><span><Icon name="location" />{province}</span><span><Icon name="area" />พื้นที่ใช้สอย {preview.usableAreaM2.toLocaleString("th-TH")} ตร.ม.</span></div></div><div className={styles.gallery}>{["มุมด้านหน้า", "มุมด้านข้าง", "มุมภายใน"].map((label, index) => <div className={styles.miniThumbnail} data-testid="additional-house-view" key={label}><Image alt={`${label} (ภาพตัวอย่าง)`} fill sizes="70px" src={imageSrc} style={{ objectPosition: `${36 + index * 14}% center`, transform: `scale(${1.04 + index * 0.05})` }} /></div>)}<div className={styles.moreViews}><strong>+12 มุมเพิ่มเติม</strong><span>ในรายงานฉบับเต็ม</span></div></div></section>
        </aside>

        <div className={styles.actions}>{errors.submit ? <p className={styles.submitError} role="alert">{errors.submit}</p> : null}<button className={styles.back} onClick={onClose} type="button">←&nbsp; ย้อนกลับ</button><button className={styles.submit} disabled={isSubmitting} type="submit">{isSubmitting ? "กำลังจัดทำรายงาน…" : "รับรายงานฉบับเต็ม"}<Icon name="arrow" /></button></div>
      </form>
    </div>
  </div>;
}
