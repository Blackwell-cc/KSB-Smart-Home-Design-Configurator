"use client";

import { useState } from "react";
import type { PriceBookDraft } from "../application/publish-price-book";
import styles from "./price-book-editor.module.css";

export type GoldenCaseDiff = { code: string; currentTotal: number; candidateTotal: number };
const money = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });
const percent = (current: number, candidate: number) => current === 0 ? "—" : `${candidate >= current ? "+" : ""}${(((candidate - current) / current) * 100).toFixed(1)}%`;

async function publishThroughApi(draft: PriceBookDraft) {
  const response = await fetch("/api/admin/pricing/publish", { method: "POST", credentials: "same-origin", cache: "no-store", headers: { "content-type": "application/json" }, body: JSON.stringify(draft) });
  if (!response.ok) throw new Error("PRICE_BOOK_PUBLISH_FAILED");
}

export function PriceBookEditor({ draft, goldenCases, onPublish = publishThroughApi }: { draft: PriceBookDraft; goldenCases: readonly GoldenCaseDiff[]; onPublish?: (draft: PriceBookDraft) => Promise<void> }) {
  const [confirmed, setConfirmed] = useState(false); const [state, setState] = useState<"idle" | "publishing" | "published" | "error">("idle");
  async function publish() { if (!confirmed || state === "publishing") return; setState("publishing"); try { await onPublish(draft); setState("published"); } catch { setState("error"); } }
  return <section className={styles.panel} aria-labelledby="candidate-heading">
    <div className={styles.header}><div><p>REVIEW CANDIDATE</p><h2 id="candidate-heading">{draft.version}</h2></div><dl><div><dt>Reference date</dt><dd>{draft.referenceDate}</dd></div><div><dt>จังหวัด</dt><dd>{draft.provinceEntries.length}/77</dd></div><div><dt>แหล่งข้อมูล</dt><dd>{draft.sources.length}</dd></div></dl></div>
    <div className={styles.tableWrap}><table><caption>ผลต่าง Golden Cases เทียบ Price Book ปัจจุบัน</caption><thead><tr><th>Case</th><th>ปัจจุบัน</th><th>Candidate</th><th>เปลี่ยนแปลง</th></tr></thead><tbody>{goldenCases.map((item) => <tr key={item.code}><th scope="row">{item.code}</th><td>{money.format(item.currentTotal)}</td><td>{money.format(item.candidateTotal)}</td><td className={item.candidateTotal > item.currentTotal ? styles.up : styles.down}>{percent(item.currentTotal, item.candidateTotal)}</td></tr>)}</tbody></table></div>
    <label className={styles.confirm}><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />ยืนยันว่าได้ตรวจ Golden Cases, แหล่งข้อมูล และการอนุมัติจากสถาปนิกแล้ว</label>
    <button className={styles.publish} type="button" disabled={!confirmed || state === "publishing" || state === "published"} onClick={() => void publish()}>{state === "publishing" ? "กำลังเผยแพร่…" : state === "published" ? "เผยแพร่แล้ว" : "เผยแพร่ Price Book เวอร์ชันนี้"}</button>
    {state === "error" ? <p role="alert">เผยแพร่ไม่สำเร็จ กรุณาตรวจสถานะ Candidate และลองใหม่</p> : null}
  </section>;
}
