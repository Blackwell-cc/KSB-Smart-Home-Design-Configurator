"use client";

import type { FullReportViewModel } from "../application/build-full-report";
import { emitConsultationRequested, type ReportEventHandoff } from "../application/report-event-handoff";
import { FullReport } from "./full-report";

export function PrivateReportClient({ report, eventHandoff }: { report: FullReportViewModel; eventHandoff?: ReportEventHandoff }) {
  async function createPublicPreview() {
    const response = await fetch("/api/shares", { method: "POST", credentials: "same-origin", cache: "no-store", headers: { "content-type": "application/json" }, body: JSON.stringify({ projectId: report.projectId }) });
    const body: unknown = await response.json(); const shareUrl = body && typeof body === "object" ? (body as Record<string, unknown>).shareUrl : null;
    if (!response.ok || typeof shareUrl !== "string" || !/^\/share\/[A-Za-z0-9_-]{12,100}$/.test(shareUrl)) throw new Error("PUBLIC_SHARE_UNAVAILABLE");
    return shareUrl;
  }

  return <FullReport
    report={report}
    pdfHref={`/api/reports/${report.projectId}/pdf`}
    onCreateShare={createPublicPreview}
    onRequestConsultation={async (signal) => { const response = await fetch(`/api/projects/${report.projectId}/consultation`, { method: "POST", credentials: "same-origin", signal, cache: "no-store" }); if (!response.ok) throw new Error("CONSULTATION_UNAVAILABLE"); }}
    onConsultationRequested={() => emitConsultationRequested(report.projectId, eventHandoff)}
  />;
}
