import { describe, expect, test } from "vitest";
import {
  isPricingSpecialFeature,
  MATERIAL_CATALOG,
  MATERIAL_QUALITY_CATALOG,
  materialLevelForQuality,
} from "./material-catalog";

describe("material catalog", () => {
  test("defines eight categories with exactly four unique options", () => {
    expect(MATERIAL_CATALOG).toHaveLength(8);
    for (const category of MATERIAL_CATALOG) {
      expect(category.options).toHaveLength(4);
      expect(new Set(category.options.map((option) => option.id)).size).toBe(4);
      expect(category.label).not.toMatch(/^\d/);
    }
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
});
