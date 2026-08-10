"use client";

import { useState } from "react";
import type { FullReportViewModel } from "../application/build-full-report";
import { emitConsultationRequested, type ReportEventHandoff } from "../application/report-event-handoff";
import { FullReport } from "./full-report";

export function PrivateReportClient({ report, eventHandoff }: { report: FullReportViewModel; eventHandoff?: ReportEventHandoff }) {
  const [shareState, setShareState] = useState<{ status: "idle" | "creating" | "ready" | "error"; url?: string }>({ status: "idle" });

  async function createPublicPreview() {
    if (shareState.status === "creating") return;
    setShareState({ status: "creating" });
    try {
      const response = await fetch("/api/shares", { method: "POST", credentials: "same-origin", cache: "no-store", headers: { "content-type": "application/json" }, body: JSON.stringify({ projectId: report.projectId }) });
      const body: unknown = await response.json(); const shareUrl = body && typeof body === "object" ? (body as Record<string, unknown>).shareUrl : null;
      if (!response.ok || typeof shareUrl !== "string" || !/^\/share\/[A-Za-z0-9_-]{12,100}$/.test(shareUrl)) throw new Error("PUBLIC_SHARE_UNAVAILABLE");
      setShareState({ status: "ready", url: shareUrl });
    } catch { setShareState({ status: "error" }); }
  }

  return <>
    <p><a href={`/api/reports/${report.projectId}/pdf`}>ดาวน์โหลด PDF รายงานโครงการ</a></p>
    <section aria-label="Public Preview">
      <button type="button" onClick={() => void createPublicPreview()} disabled={shareState.status === "creating"}>{shareState.status === "creating" ? "กำลังสร้างลิงก์…" : "สร้างลิงก์ Public Preview"}</button>
      {shareState.status === "ready" && shareState.url ? <p><a href={shareState.url}>เปิด Public Preview</a></p> : null}
      {shareState.status === "error" ? <p role="alert">ยังไม่สามารถสร้างลิงก์ได้ กรุณาลองอีกครั้ง</p> : null}
    </section>
    <FullReport report={report} onRequestConsultation={async (signal) => { const response = await fetch(`/api/projects/${report.projectId}/consultation`, { method: "POST", credentials: "same-origin", signal, cache: "no-store" }); if (!response.ok) throw new Error("CONSULTATION_UNAVAILABLE"); }} onConsultationRequested={() => emitConsultationRequested(report.projectId, eventHandoff)} />
  </>;
}
