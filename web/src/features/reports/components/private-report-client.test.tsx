import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { PrivateReportClient } from "./private-report-client";
import type { FullReportViewModel } from "../application/build-full-report";

const report = { projectId: "11111111-1111-4111-8111-111111111111" } as FullReportViewModel;
vi.mock("./full-report", () => ({ FullReport: ({ onRequestConsultation }: { onRequestConsultation: (signal: AbortSignal) => Promise<void> }) => <button onClick={() => void onRequestConsultation(new AbortController().signal)}>consult</button> }));
test("uses the authenticated project consultation endpoint from the client", () => {
  render(<PrivateReportClient report={report} />);
  expect(screen.getByRole("button", { name: "consult" })).toBeVisible();
});
