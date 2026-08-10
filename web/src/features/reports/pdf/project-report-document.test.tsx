import { renderToBuffer } from "@react-pdf/renderer";
import { expect, test } from "vitest";
import { ProjectReportDocument } from "./project-report-document";
import type { FullReportViewModel } from "../application/build-full-report";

const report = {
  projectId: "11111111-1111-4111-8111-111111111111", snapshotId: "snapshot", concept: { styleId: null, label: "แนวคิดบ้าน" }, configuration: { floors: 2, bedrooms: 3, bathrooms: 3, parkingSpaces: 2, materialLevel: "premium", specialFeatures: [] }, area: { usableAreaM2: 164, constructionFloorAreaM2: 198 }, lines: ["core-construction", "special-features", "site-risk", "design-professional-fee", "tax-fees"].map((code) => ({ code, label: code, amount: { low: 0, expected: 0, high: 0 } })), total: { low: 1, expected: 2, high: 3 }, assumptions: [], includedItems: [], excludedItems: ["ค่าควบคุมงานก่อสร้าง"], confidence: "B", pricingVersion: "TH-2026Q2-QA-0.1", referenceDate: "2026-06-30", disclaimer: "ไม่ใช่ราคาสุดท้าย", nextStepAdvice: "ปรึกษาสถาปนิก", budgetComparison: { status: "no-target" },
} as unknown as FullReportViewModel;

test("renders a local-font Thai PDF document from the same report view model", async () => {
  const buffer = await renderToBuffer(<ProjectReportDocument report={report} />);
  expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
  expect(buffer.byteLength).toBeGreaterThan(1_000);
});
