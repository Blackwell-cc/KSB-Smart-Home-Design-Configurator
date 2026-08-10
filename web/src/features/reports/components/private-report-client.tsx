"use client";

import type { FullReportViewModel } from "../application/build-full-report";
import { emitConsultationRequested, type ReportEventHandoff } from "../application/report-event-handoff";
import { FullReport } from "./full-report";

export function PrivateReportClient({ report, eventHandoff }: { report: FullReportViewModel; eventHandoff?: ReportEventHandoff }) {
  return <>
    <p><a href={`/api/reports/${report.projectId}/pdf`}>ดาวน์โหลด PDF รายงานโครงการ</a></p>
    <FullReport report={report} onRequestConsultation={async (signal) => { const response = await fetch(`/api/projects/${report.projectId}/consultation`, { method: "POST", credentials: "same-origin", signal, cache: "no-store" }); if (!response.ok) throw new Error("CONSULTATION_UNAVAILABLE"); }} onConsultationRequested={() => emitConsultationRequested(report.projectId, eventHandoff)} />
  </>;
}
