"use client";

import { useRef, useState } from "react";
import type { EstimateRequest } from "@/features/pricing/application/estimate-request";
import { FieldError } from "@/components/ui/field-error";
import styles from "./soft-gate-form.module.css";

const INTENT_STORAGE_KEY = "ksb-soft-gate-intent-v1";
const CONSENT_VERSION = "project-contact-v1";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type ContactMethod = "phone" | "email" | "line";
type Intent = { configurationId: string; idempotencyKey: string };
type SubmissionStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

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

function clearIntent() { try { window.sessionStorage.removeItem(INTENT_STORAGE_KEY); } catch { /* retry metadata is optional */ } }

export function SoftGateForm({ configuration, onSuccess }: { configuration: EstimateRequest; onSuccess: (reportUrl: string) => void }) {
  const [intent] = useState<Intent>(() => getOrCreateSubmissionIntent(window.sessionStorage, () => crypto.randomUUID()));
  const [method, setMethod] = useState<ContactMethod>("phone"); const [name, setName] = useState(""); const [contact, setContact] = useState("");
  const [consentAccepted, setConsentAccepted] = useState(false); const [isSubmitting, setIsSubmitting] = useState(false); const [error, setError] = useState(""); const errorRef = useRef<HTMLParagraphElement>(null);
  const contactLabel = method === "phone" ? "เบอร์โทรศัพท์" : method === "email" ? "อีเมล" : "LINE ID"; const contactKey = method === "line" ? "lineId" : method;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (isSubmitting) return;
    if (!name.trim() || !contact.trim() || !consentAccepted) { setError("กรุณากรอกข้อมูลติดต่อและยืนยันความยินยอมให้ครบถ้วน"); queueMicrotask(() => errorRef.current?.focus()); return; }
    setError(""); setIsSubmitting(true);
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...intent, configuration, preferredContactMethod: method, name, [contactKey]: contact, consentAccepted: true, consentVersion: CONSENT_VERSION }) });
      const payload = await response.json(); if (!response.ok || typeof payload?.reportUrl !== "string" || !payload.reportUrl.startsWith("/report/access#")) throw new Error("SUBMISSION_FAILED");
      clearIntent(); onSuccess(payload.reportUrl);
    } catch { setError("ยังจัดทำสรุปโครงการไม่ได้ในขณะนี้ กรุณาลองอีกครั้ง"); queueMicrotask(() => errorRef.current?.focus()); setIsSubmitting(false); }
  }
  return <section className={styles.gate} aria-labelledby="soft-gate-title"><p className={styles.eyebrow}>PRIVATE PROJECT REPORT</p><h2 className={styles.title} id="soft-gate-title">รับรายละเอียดเพื่อคุยกับสถาปนิกได้ชัดเจนขึ้น</h2><p className={styles.intro}>สรุปฉบับเต็มจะช่วยให้คุณนำข้อมูลไปวางแผนงบและคุยรายละเอียดโครงการต่อได้อย่างเป็นระบบ</p><ul className={styles.valueList}><li>Detailed Project Summary</li><li>Detailed Budget Estimate</li><li>Material &amp; Requirement Breakdown</li><li>Downloadable PDF</li><li>Save Configuration</li><li>ข้อมูลพร้อมปรึกษาสถาปนิก</li></ul><form className={styles.form} onSubmit={submit} noValidate><div className={styles.field}><label htmlFor="lead-name">ชื่อ</label><input id="lead-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={120} /></div><div className={styles.field}><label htmlFor="lead-method">ช่องทางติดต่อที่ต้องการ</label><select id="lead-method" value={method} onChange={(event) => { setMethod(event.target.value as ContactMethod); setContact(""); }}><option value="phone">โทรศัพท์</option><option value="email">Email</option><option value="line">LINE</option></select></div><div className={styles.field}><label htmlFor="lead-contact">{contactLabel}</label><input id="lead-contact" type={method === "email" ? "email" : "text"} value={contact} onChange={(event) => setContact(event.target.value)} autoComplete={method === "email" ? "email" : method === "phone" ? "tel" : "off"} maxLength={method === "line" ? 100 : method === "phone" ? 20 : 254} /></div><p className={styles.privacy}>ข้อมูลของคุณจะใช้สำหรับจัดทำสรุปโครงการและติดต่อกลับเกี่ยวกับโครงการนี้เท่านั้น โดยจะจัดการข้อมูลตามนโยบายความเป็นส่วนตัวของบริษัท</p><label className={styles.consent}><input type="checkbox" checked={consentAccepted} onChange={(event) => setConsentAccepted(event.target.checked)} />ยินยอมให้ใช้ข้อมูลเพื่อจัดทำสรุปโครงการและติดต่อกลับเกี่ยวกับโครงการนี้</label>{error ? <FieldError className={styles.error} ref={errorRef}>{error}</FieldError> : null}<button className={styles.submit} disabled={isSubmitting} type="submit">{isSubmitting ? "กำลังจัดทำสรุปโครงการ…" : "ส่ง Project Report ฉบับเต็มให้ฉัน"}</button></form></section>;
}
