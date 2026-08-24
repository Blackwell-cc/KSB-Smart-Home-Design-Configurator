import { describe, expect, test } from "vitest";
import {
  isPricingSpecialFeature,
  MATERIAL_CATALOG,
  MATERIAL_QUALITY_CATALOG,
  materialLevelForQuality,
  SPECIAL_FEATURE_CATALOG,
} from "./material-catalog";

describe("material catalog", () => {
  test("defines only the five customer-selectable material categories", () => {
    expect(MATERIAL_CATALOG.map(({ id }) => id)).toEqual([
      "roof",
      "wall",
      "window",
      "door",
      "flooring",
    ]);
    for (const category of MATERIAL_CATALOG) {
      expect(category.options).toHaveLength(4);
      expect(new Set(category.options.map((option) => option.id)).size).toBe(4);
      expect(category.label).not.toMatch(/^\d/);
    }

    const visibleText = MATERIAL_CATALOG.flatMap((category) => [
      category.label,
      ...category.options.map(({ label }) => label),
    ]);
    expect(visibleText).not.toEqual(expect.arrayContaining([
      "ฝ้าเพดาน",
      "รายละเอียดฟาซาด",
      "แสงและบรรยากาศ",
      "Flat Ceiling",
      "Timber Screen",
      "Warm Ambient",
    ]));
  });

  test("uses the same customer-facing Thai option names throughout the configurator", () => {
    expect(MATERIAL_CATALOG.map((category) => ({
      id: category.id,
      labels: category.options.map((option) => option.label),
    }))).toEqual([
      { id: "roof", labels: ["กระเบื้องคอนกรีต", "กระเบื้องเซรามิก", "หลังคาเมทัลชีท", "หินชนวนธรรมชาติ"] },
      { id: "wall", labels: ["ปูนฉาบเรียบ", "หินธรรมชาติ", "ไม้ตกแต่งภายนอก", "คอนกรีตเปลือย"] },
      { id: "window", labels: ["อลูมิเนียมสีดำ", "อลูมิเนียมสีธรรมชาติ", "ไม้จริง", "uPVC"] },
      { id: "door", labels: ["ไม้สัก", "ไม้เอ็นจิเนียร์", "อลูมิเนียม + กระจก", "ประตูกรอบเหล็ก"] },
      { id: "flooring", labels: ["หินอ่อนธรรมชาติ", "ไม้เอ็นจิเนียร์", "กระเบื้องพอร์ซเลน", "หินขัดเทอร์ราซโซ"] },
    ]);
  });

  test("maps display quality without inventing bespoke pricing", () => {
    expect(MATERIAL_QUALITY_CATALOG.map(({ id }) => id)).toEqual([
      "standard",
      "premium",
      "signature",
      "bespoke",
    ]);
    expect(materialLevelForQuality("standard")).toBe("select");
    expect(materialLevelForQuality("bespoke")).toBe("signature");
    expect(isPricingSpecialFeature("pool")).toBe(true);
    expect(isPricingSpecialFeature("internal-garden")).toBe(false);
  });

  test("maps the four roof choices to their supplied images from left to right", () => {
    const roof = MATERIAL_CATALOG.find(({ id }) => id === "roof");

    expect(roof?.options.map((option) => ("imageSrc" in option ? option.imageSrc : null))).toEqual([
      "/materials/roof/1.png",
      "/materials/roof/2.png",
      "/materials/roof/3.png",
      "/materials/roof/4.png",
    ]);
  });

  test("maps the four exterior-wall choices to their supplied images from left to right", () => {
    const wall = MATERIAL_CATALOG.find(({ id }) => id === "wall");

    expect(wall?.options.map((option) => ("imageSrc" in option ? option.imageSrc : null))).toEqual([
      "/materials/wall/1.png",
      "/materials/wall/2.png",
      "/materials/wall/3.png",
      "/materials/wall/4.png",
    ]);
  });

  test("maps the four window choices to their supplied images from left to right", () => {
    const window = MATERIAL_CATALOG.find(({ id }) => id === "window");

    expect(window?.options.map((option) => ("imageSrc" in option ? option.imageSrc : null))).toEqual([
      "/materials/window/1.png",
      "/materials/window/2.png",
      "/materials/window/3.png",
      "/materials/window/4.png",
    ]);
  });

  test("maps the four door choices to the explicitly requested file order", () => {
    const door = MATERIAL_CATALOG.find(({ id }) => id === "door");

    expect(door?.options.map((option) => ("imageSrc" in option ? option.imageSrc : null))).toEqual([
      "/materials/door/4.png",
      "/materials/door/1.png",
      "/materials/door/2.png",
      "/materials/door/3.png",
    ]);
  });

  test("maps the four flooring choices to their supplied images from left to right", () => {
    const flooring = MATERIAL_CATALOG.find(({ id }) => id === "flooring");

    expect(flooring?.options.map((option) => ("imageSrc" in option ? option.imageSrc : null))).toEqual([
      "/materials/flooring/1.png",
      "/materials/flooring/2.png",
      "/materials/flooring/3.png",
      "/materials/flooring/4.png",
    ]);
  });

  test("maps the ten special-feature choices to their supplied images from left to right", () => {
    expect(SPECIAL_FEATURE_CATALOG.map((feature) => ("imageSrc" in feature ? feature.imageSrc : null))).toEqual([
      "/materials/special-features/1.png",
      "/materials/special-features/2.png",
      "/materials/special-features/3.png",
      "/materials/special-features/4.png",
      "/materials/special-features/5.png",
      "/materials/special-features/6.png",
      "/materials/special-features/7.png",
      "/materials/special-features/8.png",
      "/materials/special-features/9.png",
      "/materials/special-features/10.png",
    ]);
  });
});
