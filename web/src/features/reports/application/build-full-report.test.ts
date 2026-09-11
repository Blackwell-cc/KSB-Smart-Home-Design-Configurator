import { expect, test } from "vitest";
import { createDefaultConfiguration } from "@/features/configurator/domain/configuration";
import { buildFullReport } from "./build-full-report";

const configuration = (({ privateNotes, ...rest }) => {
  void privateNotes;
  return rest;
})({
  ...createDefaultConfiguration(),
  styleId: "classic-style",
  residents: 5,
  provinceCode: "10" as const,
  district: "บางรัก",
  siteAccess: "restricted" as const,
  budgetRangeId: "20m_40m" as const,
  targetBudget: { min: 20_000_000, max: 40_000_000 },
  materialSelections: {
    roof: "natural-slate",
    wall: "natural-stone",
    window: "black-aluminium",
    door: "teak",
    flooring: "natural-marble",
  },
  materialQualityId: "signature" as const,
  materialLevel: "signature" as const,
  additionalRequirements: ["home-theater"] as const,
  specialFeatures: ["pool", "smart-home"] as const,
});

const snapshot = {
  id: "11111111-1111-4111-8111-111111111111",
  concept: { id: "contemporary-warm-luxury", label: "Saved concept", imageSrc: "/concepts/contemporary-warm-luxury.png" },
  pricingVersion: "TH-2026Q2-QA-0.1", referenceDate: "2026-06-30", confidence: "B" as const,
  configuration,
  area: { usableAreaM2: 164, constructionFloorAreaM2: 198 },
  estimate: {
    pricingVersion: "TH-2026Q2-QA-0.1", referenceDate: "2026-06-30", confidence: "B" as const,
    lines: [
      { code: "core-construction", label: "ค่าก่อสร้างหลัก", amount: { low: 4_500_000, expected: 5_500_000, high: 6_500_000 } },
      { code: "special-features", label: "รายการพิเศษ", amount: { low: 0, expected: 0, high: 0 } },
      { code: "site-risk", label: "ค่าเผื่อความเสี่ยงหน้างาน", amount: { low: 0, expected: 0, high: 0 } },
      { code: "design-professional-fee", label: "ค่าออกแบบและบริการวิชาชีพ", amount: { low: 225_000, expected: 371_250, high: 552_500 } },
      { code: "tax-fees", label: "ภาษีและค่าธรรมเนียม", amount: { low: 0, expected: 0, high: 0 } },
    ],
    total: { low: 4_725_000, expected: 5_871_250, high: 7_052_500 }, assumptions: ["ต้องตรวจสอบหน้างาน"], includedItems: ["งานออกแบบ"], excludedItems: ["ค่าควบคุมงานก่อสร้าง"],
  },
};

test("builds one immutable five-line view model from the saved snapshot", () => {
  const report = buildFullReport({ id: "22222222-2222-4222-8222-222222222222", targetBudget: null }, snapshot);

  expect(report.snapshotId).toBe(snapshot.id);
  expect(report.area).toEqual({ usableAreaM2: 164, constructionFloorAreaM2: 198 });
  expect(report.lines).toHaveLength(5);
  expect(report.lines[1].amount).toEqual({ low: 0, expected: 0, high: 0 });
  expect(report.excludedItems).toContain("ค่าควบคุมงานก่อสร้าง");
  expect(Object.isFrozen(report)).toBe(true);
  expect(Object.isFrozen(report.concept)).toBe(true);
  expect(Object.isFrozen(report.configuration.specialFeatures)).toBe(true);
  expect(report.configuration.materialSelections).toEqual(configuration.materialSelections);
  expect(Object.isFrozen(report.configuration.materialSelections)).toBe(true);
  expect(report.location).toEqual({ province: "กรุงเทพมหานคร", district: "บางรัก", siteAccess: "ถนนค่อนข้างแคบ" });
  expect(report.configuration.residents).toBe(5);
  expect(report.materials).toEqual(expect.arrayContaining([
    expect.objectContaining({ categoryLabel: "หลังคา", optionLabel: "สีวอร์มเทาป์" }),
    expect.objectContaining({ categoryLabel: "ผนังภายนอก", optionLabel: "คงรูปแบบต้นฉบับ Classic" }),
  ]));
  expect(report.specialFeatures.map(({ label }) => label)).toEqual(["สระว่ายน้ำ", "ระบบ Smart Home"]);
  expect(report.additionalRequirements).toContain("ห้องดูหนัง");
  expect(report.gallery).toHaveLength(12);
  expect(report.gallery.every((item) => item.imageSrc === snapshot.concept.imageSrc)).toBe(true);
  expect(report.concept.direction.title).toBe("ภูมิฐาน ประณีต เหนือกาลเวลา");
  expect(report.detailedBudget.total).toEqual(snapshot.estimate.total);
});

test("compares an optional target budget without changing the saved estimate", () => {
  const report = buildFullReport({ id: "22222222-2222-4222-8222-222222222222", targetBudget: { min: 4_000_000, max: 5_000_000 } }, snapshot);

  expect(report.budgetComparison.status).toBe("above-target");
  expect(report.total).toEqual(snapshot.estimate.total);
  expect(Object.isFrozen(report.budgetComparison.target)).toBe(true);
});

test("keeps the selected WebP house image throughout the full report gallery", () => {
  const imageSrc = "/concepts/base-classic-2f-master.webp";
  const report = buildFullReport(
    { id: "22222222-2222-4222-8222-222222222222", targetBudget: null },
    { ...snapshot, concept: { ...snapshot.concept, imageSrc } },
  );

  expect(report.concept.imageSrc).toBe(imageSrc);
  expect(report.gallery.every((view) => view.imageSrc === imageSrc)).toBe(true);
});

test("rejects malformed snapshots instead of returning a partial report", () => {
  expect(() => buildFullReport({ id: "22222222-2222-4222-8222-222222222222", targetBudget: null }, { ...snapshot, estimate: { ...snapshot.estimate, lines: [] } })).toThrow("INVALID_SAVED_SNAPSHOT");
  expect(() => buildFullReport({ id: "22222222-2222-4222-8222-222222222222", targetBudget: null }, { ...snapshot, concept: { id: "forged", label: "Forged", imageSrc: "https://outside.test/image.png" } })).toThrow("INVALID_SAVED_SNAPSHOT");
});
