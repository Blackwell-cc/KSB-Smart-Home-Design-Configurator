"use client";

import type { FullReportViewModel } from "../application/build-full-report";
import { FullReport } from "./full-report";

export function PrivateReportClient({ report }: { report: FullReportViewModel }) {
  return <FullReport report={report} onRequestConsultation={async (signal) => { const response = await fetch(`/api/projects/${report.projectId}/consultation`, { method: "POST", credentials: "same-origin", signal, cache: "no-store" }); if (!response.ok) throw new Error("CONSULTATION_UNAVAILABLE"); }} />;
}
