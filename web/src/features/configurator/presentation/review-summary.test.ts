import { describe, expect, test } from "vitest";
import { createDefaultConfiguration } from "../domain/configuration";
import { buildReviewSummary } from "./review-summary";

describe("buildReviewSummary", () => {
  test("derives readable Step 1–4 labels without exposing internal ids", () => {
    const summary = buildReviewSummary({
      ...createDefaultConfiguration(),
      styleId: "modern-tropical-resort",
      residents: 5,
      floors: 2,
      bedrooms: 5,
      bathrooms: 4,
      parkingSpaces: 3,
      functions: {
        office: true,
        elderlyRoom: true,
        thaiKitchen: false,
        multipurposeRoom: false,
      },
      additionalRequirements: ["home-theater"],
      usableAreaOverrideM2: 530,
      provinceCode: "10",
      district: "บางรัก",
      siteAccess: "restricted",
      budgetRangeId: "40m_80m",
      targetBudget: { min: 40_000_000, max: 80_000_000 },
      materialSelections: {
        roof: "concrete-tile",
        wall: "natural-stone",
        window: "black-aluminium",
        door: "teak",
        flooring: "natural-marble",
      },
      materialQualityId: "signature",
      materialLevel: "signature",
      specialFeatures: ["pool", "smart-home", "ev-charger"],
    });

    expect(summary.concept).toMatchObject({
      thaiLabel: "ทรอปิคอล รีสอร์ต",
      label: "Modern Tropical Resort",
    });
    expect(summary.functionLabels).toEqual(["ห้องทำงาน", "ห้องผู้สูงอายุ", "ห้องดูหนัง"]);
    expect(summary.location).toMatchObject({
      province: "กรุงเทพมหานคร",
      district: "บางรัก",
      access: "ถนนค่อนข้างแคบ",
    });
    expect(summary.budgetLabel).toBe("40–80 ล้านบาท");
    expect(summary.materials).toEqual(expect.arrayContaining([
      expect.objectContaining({ categoryLabel: "หลังคา", imageSrc: "/materials/roof/1.png", optionLabel: "กระเบื้องคอนกรีต" }),
      expect.objectContaining({ categoryLabel: "ผนังภายนอก", imageSrc: "/materials/wall/2.png", optionLabel: "หินธรรมชาติ" }),
      expect.objectContaining({ categoryLabel: "หน้าต่าง", imageSrc: "/materials/window/1.png", optionLabel: "อลูมิเนียมสีดำ" }),
      expect.objectContaining({ categoryLabel: "ประตูทางเข้า", imageSrc: "/materials/door/4.png", optionLabel: "โมเดิร์น" }),
    ]));
    expect(summary.materials).toHaveLength(4);
    expect(summary.specialFeatureLabels).toEqual(["สระว่ายน้ำ", "ระบบ Smart Home", "ที่ชาร์จรถ EV"]);
    expect(summary.specialFeatures).toEqual([
      { id: "pool", label: "สระว่ายน้ำ", imageSrc: "/materials/special-features/1.png" },
      { id: "smart-home", label: "ระบบ Smart Home", imageSrc: "/materials/special-features/3.png" },
      { id: "ev-charger", label: "ที่ชาร์จรถ EV", imageSrc: "/materials/special-features/5.png" },
    ]);
    expect(summary.quality).toMatchObject({ label: "SIGNATURE", thaiLabel: "ซิกเนเจอร์" });
    expect(summary.isReady).toBe(true);

    const serialized = JSON.stringify(summary);
    for (const internalId of ["elderlyRoom", "home-theater", "natural-stone", "black-aluminium"]) {
      expect(serialized).not.toContain(internalId);
    }
  });

  test("uses friendly fallback text and treats optional budget and features as review-ready", () => {
    const summary = buildReviewSummary({
      ...createDefaultConfiguration(),
      styleId: "contemporary-warm-luxury",
      provinceCode: "10",
    });

    expect(summary.location.district).toBe("ยังไม่ได้ระบุอำเภอ / เขต");
    expect(summary.budgetLabel).toBe("ยังไม่ระบุช่วงงบประมาณ");
    expect(summary.functionLabels).toEqual([]);
    expect(summary.specialFeatureLabels).toEqual([]);
    expect(summary.specialFeatures).toEqual([]);
    expect(summary.isReady).toBe(true);
  });

  test("keeps Step 5 material names identical to the selected Step 4 options", () => {
    const summary = buildReviewSummary({
      ...createDefaultConfiguration(),
      materialSelections: {
        roof: "ceramic-tile",
        wall: "natural-stone",
        window: "natural-aluminium",
        door: "engineered-wood",
        flooring: "porcelain-tile",
      },
    });

    expect(summary.materials.map((material) => material.optionLabel)).toEqual([
      "กระเบื้องเซรามิก",
      "หินธรรมชาติ",
      "อลูมิเนียมสีธรรมชาติ",
      "วอลนัทธรรมชาติ",
    ]);
  });

  test("carries the locked Loft roof and wall policy into Step 5 and the full report", () => {
    const summary = buildReviewSummary({
      ...createDefaultConfiguration(),
      styleId: "loft-style",
      floors: 1,
      materialSelections: {
        roof: "ceramic-tile",
        wall: "natural-stone",
        window: "natural-aluminium",
        door: "engineered-wood",
        flooring: "porcelain-tile",
      },
    });

    expect(summary.materials).toEqual([
      expect.objectContaining({ categoryLabel: "หลังคา", imageSrc: null, optionLabel: "คงรูปแบบต้นฉบับ Loft" }),
      expect.objectContaining({ categoryLabel: "ผนังภายนอก", imageSrc: null, optionLabel: "คงรูปแบบต้นฉบับ Loft" }),
      expect.objectContaining({ categoryLabel: "หน้าต่าง", optionLabel: "อลูมิเนียมสีธรรมชาติ" }),
      expect.objectContaining({ categoryLabel: "ประตูทางเข้า", optionLabel: "วอลนัทธรรมชาติ" }),
    ]);
  });

  test("carries the locked Classic wall policy into Step 5 and the full report", () => {
    const summary = buildReviewSummary({
      ...createDefaultConfiguration(),
      styleId: "classic-style",
      floors: 3,
      materialSelections: {
        ...createDefaultConfiguration().materialSelections,
        wall: "natural-stone",
      },
    });

    expect(summary.materials).toContainEqual(expect.objectContaining({
      categoryLabel: "ผนังภายนอก",
      imageSrc: null,
      optionLabel: "คงรูปแบบต้นฉบับ Classic",
    }));
  });

  test("carries the Contemporary roof colors and locked wall policy into Step 5 and the full report", () => {
    const summary = buildReviewSummary({
      ...createDefaultConfiguration(),
      styleId: "vintage-style",
      floors: 1,
      materialSelections: {
        ...createDefaultConfiguration().materialSelections,
        roof: "metal-roof",
        wall: "natural-stone",
      },
    });

    expect(summary.materials).toContainEqual(expect.objectContaining({
      categoryLabel: "หลังคา",
      imageSrc: "/materials/roof/minimal/roof-soft-greige.png",
      optionLabel: "สีซอฟต์เกรจ",
    }));
    expect(summary.materials).toContainEqual(expect.objectContaining({
      categoryLabel: "ผนังภายนอก",
      imageSrc: null,
      optionLabel: "คงรูปแบบต้นฉบับ Contemporary",
    }));
  });

  test("keeps the selected Minimal roof color and thumbnail in Step 5", () => {
    const summary = buildReviewSummary({
      ...createDefaultConfiguration(),
      styleId: "minimalist-style",
      floors: 1,
      materialSelections: {
        ...createDefaultConfiguration().materialSelections,
        roof: "metal-roof",
      },
    });

    expect(summary.materials).toContainEqual(expect.objectContaining({
      categoryLabel: "หลังคา",
      imageSrc: "/materials/roof/minimal/roof-soft-greige.png",
      optionLabel: "สีซอฟต์เกรจ",
    }));
  });

  test("identifies the required section that still needs review", () => {
    const summary = buildReviewSummary(createDefaultConfiguration());

    expect(summary.isReady).toBe(false);
    expect(summary.missingSections).toContain("สไตล์บ้าน");
    expect(summary.missingSections).toContain("ทำเลที่ตั้ง");
    expect(summary.missingSections).not.toContain("งบประมาณ");
    expect(summary.missingSections).not.toContain("ส่วนพิเศษ");
  });

  test("keeps the floor-specific layered preview base in the Step 5 summary", () => {
    const summary = buildReviewSummary({
      ...createDefaultConfiguration(),
      styleId: "vintage-style",
      floors: 3,
    });

    expect(summary.concept?.image).toBe(
      "/material-previews/contemporary/3f/base.webp?v=20260910-contemporary-base-v3",
    );
  });
});
