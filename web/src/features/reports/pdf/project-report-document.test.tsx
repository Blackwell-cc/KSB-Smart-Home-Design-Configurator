import { renderToBuffer } from "@react-pdf/renderer";
import { expect, test } from "vitest";
import { ProjectReportDocument, resolvePdfConceptImage, resolvePdfConceptImagePath } from "./project-report-document";
import type { FullReportViewModel } from "../application/build-full-report";

const report = {
  projectId: "11111111-1111-4111-8111-111111111111", snapshotId: "snapshot", concept: { styleId: null, label: "แนวคิดบ้าน", imageSrc: "/concepts/contemporary-warm-luxury.png" }, configuration: { floors: 2, bedrooms: 3, bathrooms: 3, parkingSpaces: 2, materialLevel: "premium", specialFeatures: [] }, area: { usableAreaM2: 164, constructionFloorAreaM2: 198 }, lines: ["core-construction", "special-features", "site-risk", "design-professional-fee", "tax-fees"].map((code) => ({ code, label: code, amount: { low: 0, expected: 0, high: 0 } })), total: { low: 1, expected: 2, high: 3 }, assumptions: [], includedItems: [], excludedItems: ["ค่าควบคุมงานก่อสร้าง"], confidence: "B", pricingVersion: "TH-2026Q2-QA-0.1", referenceDate: "2026-06-30", disclaimer: "ไม่ใช่ราคาสุดท้าย", nextStepAdvice: "ปรึกษาสถาปนิก", budgetComparison: { status: "no-target" },
} as unknown as FullReportViewModel;

test("renders a local-font Thai PDF document from the same report view model", async () => {
  expect(resolvePdfConceptImagePath("/concepts/contemporary-warm-luxury.png")).toMatch(/public[\\/]concepts[\\/]contemporary-warm-luxury\.png$/);
  expect(resolvePdfConceptImage("/concepts/contemporary-warm-luxury.png")?.data).toBeInstanceOf(Buffer);
  expect(resolvePdfConceptImage("https://attacker.test/concept.png")).toBeNull();
  const buffer = await renderToBuffer(<ProjectReportDocument report={report} />);
  const fallbackBuffer = await renderToBuffer(<ProjectReportDocument report={{ ...report, concept: { ...report.concept, imageSrc: undefined } }} />);
  expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
  expect(buffer.byteLength).toBeGreaterThan(1_000);
  expect(buffer.byteLength).toBeGreaterThan(fallbackBuffer.byteLength);
});

test("uses the matching PDF-safe derivative for a selected WebP house image", () => {
  const imageSrc = "/concepts/base-classic-2f-master.webp";

  expect(resolvePdfConceptImagePath(imageSrc)).toMatch(/public[\\/]concepts[\\/]pdf[\\/]base-classic-2f-master\.jpg$/);
  expect(resolvePdfConceptImage(imageSrc)).toEqual(expect.objectContaining({
    data: expect.any(Buffer),
    format: "jpg",
  }));
});

test.each([
  "/concepts/base-classic-1f-master.webp",
  "/concepts/base-modern-3f-master-2.webp",
  "/concepts/base-nordic-1f-master.webp",
  "/concepts/base-loft-3f-master.webp",
  "/concepts/base-tropical-1f-master.webp",
  "/concepts/base-contemporary-3f-master.webp",
])("keeps the floor-specific house image available in PDF reports: %s", (imageSrc) => {
  expect(resolvePdfConceptImage(imageSrc)).toEqual(expect.objectContaining({
    data: expect.any(Buffer),
    format: "jpg",
  }));
});
