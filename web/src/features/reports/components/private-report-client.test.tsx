import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { PrivateReportClient } from "./private-report-client";
import type { FullReportViewModel } from "../application/build-full-report";

const report = { projectId: "11111111-1111-4111-8111-111111111111" } as FullReportViewModel;
vi.mock("./full-report", () => ({ FullReport: ({ onRequestConsultation, onConsultationRequested }: { onRequestConsultation: (signal: AbortSignal) => Promise<void>; onConsultationRequested: () => void }) => <button onClick={() => { void onRequestConsultation(new AbortController().signal).then(onConsultationRequested).catch(() => undefined); }}>consult</button> }));
test("uses authenticated consultation and PDF endpoints and emits only after consultation success", async () => {
  const emit = vi.fn(); vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
  render(<PrivateReportClient report={report} eventHandoff={{ emit }} />);
  expect(screen.getByRole("button", { name: "consult" })).toBeVisible();
  expect(screen.getByRole("link", { name: "ดาวน์โหลด PDF รายงานโครงการ" })).toHaveAttribute("href", "/api/reports/11111111-1111-4111-8111-111111111111/pdf");
  expect(emit).not.toHaveBeenCalled();
  await userEvent.setup().click(screen.getByRole("button", { name: "consult" }));
  expect(emit).toHaveBeenCalledWith({ name: "consultation_requested", projectId: report.projectId });
});

test("does not emit a handoff event when the consultation request fails", async () => {
  const emit = vi.fn(); vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 500 })));
  render(<PrivateReportClient report={report} eventHandoff={{ emit }} />);
  await userEvent.setup().click(screen.getByRole("button", { name: "consult" }));
  expect(emit).not.toHaveBeenCalled();
});
