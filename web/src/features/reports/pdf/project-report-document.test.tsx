// @vitest-environment node
import { expect, test } from "vitest";
import { buildPdfBudgetRows, renderPdfHouseImage, renderProjectReportPdf, resolvePdfConceptImage, resolvePdfConceptImagePath, resolvePdfFontPath } from "./project-report-document";
import type { FullReportViewModel } from "../application/build-full-report";

const report = {
  projectId: "11111111-1111-4111-8111-111111111111", snapshotId: "snapshot", generatedAt: "2026-09-11T08:00:00.000Z", concept: { styleId: null, label: "แนวคิดบ้าน", thaiLabel: "บ้านแนวคิด", imageSrc: "/concepts/contemporary-warm-luxury.png" }, configuration: { floors: 2, bedrooms: 3, bathrooms: 3, parkingSpaces: 2, materialLevel: "premium", materialQuality: "พรีเมียม", specialFeatures: [] }, location: { province: "กรุงเทพมหานคร" }, area: { usableAreaM2: 164, constructionFloorAreaM2: 198 }, lines: ["core-construction", "special-features", "site-risk", "design-professional-fee", "tax-fees"].map((code) => ({ code, label: code, amount: { low: 0, expected: 0, high: 0 } })), detailedBudget: { categories: [{ code: "structure", label: "งานโครงสร้าง", description: "ฐานราก เสา คาน และพื้น", amount: { low: 1, expected: 2, high: 3 } }], subtotal: { low: 1, expected: 2, high: 3 }, contingency: { code: "contingency", label: "สำรองประมาณการ", description: "ความเสี่ยงหน้างาน", amount: { low: 0, expected: 0, high: 0 } }, total: { low: 1, expected: 2, high: 3 } }, total: { low: 1, expected: 2, high: 3 }, assumptions: [], includedItems: [], excludedItems: ["ค่าควบคุมงานก่อสร้าง"], confidence: "B", pricingVersion: "TH-2026Q2-QA-0.1", referenceDate: "2026-06-30", disclaimer: "ไม่ใช่ราคาสุดท้าย", nextStepAdvice: "ปรึกษาสถาปนิก", budgetComparison: { status: "no-target" },
} as unknown as FullReportViewModel;

test("renders a local-font Thai PDF document from the same report view model", async () => {
  expect(resolvePdfFontPath()).toMatch(/fonts[\\/]Sarabun-Regular\.ttf$/);
  expect(resolvePdfConceptImagePath("/concepts/contemporary-warm-luxury.png")).toMatch(/public[\\/]concepts[\\/]contemporary-warm-luxury\.png$/);
  expect(resolvePdfConceptImage("/concepts/contemporary-warm-luxury.png")?.data).toBeInstanceOf(Buffer);
  expect(resolvePdfConceptImage("https://attacker.test/concept.png")).toBeNull();
  const buffer = await renderProjectReportPdf(report);
  const fallbackBuffer = await renderProjectReportPdf({ ...report, concept: { ...report.concept, imageSrc: undefined } });
  expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
  expect(buffer.byteLength).toBeGreaterThan(1_000);
  expect(buffer.byteLength).toBeGreaterThan(fallbackBuffer.byteLength);
});

test("uses every detailed budget category and contingency row in the downloadable document", () => {
  const detailedReport = {
    ...report,
    detailedBudget: {
      categories: [
        { code: "structure", label: "งานโครงสร้าง", description: "ฐานราก เสา คาน พื้น", amount: { low: 100, expected: 150, high: 200 } },
        { code: "roof", label: "งานหลังคา", description: "โครงหลังคาและวัสดุมุง", amount: { low: 50, expected: 75, high: 100 } },
      ],
      subtotal: { low: 150, expected: 225, high: 300 },
      contingency: { code: "contingency", label: "สำรองประมาณการ", description: "ความเสี่ยงหน้างาน", amount: { low: 10, expected: 20, high: 30 } },
      total: { low: 160, expected: 245, high: 330 },
    },
  } as unknown as FullReportViewModel;

  expect(buildPdfBudgetRows(detailedReport)).toEqual([
    expect.objectContaining({ code: "structure", label: "งานโครงสร้าง", description: "ฐานราก เสา คาน พื้น" }),
    expect.objectContaining({ code: "roof", label: "งานหลังคา", description: "โครงหลังคาและวัสดุมุง" }),
    expect.objectContaining({ code: "contingency", label: "สำรองประมาณการ", description: "ความเสี่ยงหน้างาน" }),
  ]);
});

test("uses the exact selected house image instead of a separately maintained PDF derivative", () => {
  const imageSrc = "/concepts/base-classic-2f-master.webp";

  expect(resolvePdfConceptImagePath(imageSrc)).toMatch(/public[\\/]concepts[\\/]base-classic-2f-master\.webp$/);
  expect(resolvePdfConceptImage(imageSrc)).toEqual(expect.objectContaining({
    data: expect.any(Buffer),
    format: "webp",
  }));
});

test.each([
  "/concepts/base-classic-1f-master.webp",
  "/concepts/base-modern-3f-master-2.webp",
  "/concepts/base-nordic-1f-master.webp",
  "/concepts/base-loft-3f-master.webp",
  "/concepts/base-tropical-1f-master.webp?v=20260910-tropical-v3",
  "/concepts/base-contemporary-3f-master.webp?v=20260910-contemporary-v3",
])("keeps the floor-specific house image available in PDF reports: %s", (imageSrc) => {
  expect(resolvePdfConceptImage(imageSrc)).toEqual(expect.objectContaining({
    data: expect.any(Buffer),
    format: "webp",
  }));
});

test("composites the selected material scene used by the final house preview", async () => {
  const configuredReport = {
    ...report,
    concept: { ...report.concept, styleId: "classic-style", imageSrc: "/concepts/base-classic-2f-master.webp" },
    configuration: {
      ...report.configuration,
      materialSelections: { roof: "natural-slate", wall: "original", window: "black-aluminium", door: "teak", flooring: "original" },
      specialFeatures: ["pool"],
    },
  } as unknown as FullReportViewModel;

  const image = await renderPdfHouseImage(configuredReport);
  expect(image).toEqual(expect.objectContaining({ data: expect.any(Buffer), format: "jpg" }));
  expect(image?.data.byteLength).toBeGreaterThan(100_000);
});
