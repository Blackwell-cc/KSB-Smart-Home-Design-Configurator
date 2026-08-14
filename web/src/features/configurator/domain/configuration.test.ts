import { describe, expect, test } from "vitest";
import {
  ADDITIONAL_REQUIREMENT_CODES,
  HouseConfigurationSchema,
  SPECIAL_FEATURE_CODES,
  createDefaultConfiguration,
} from "./configuration";
import { THAI_PROVINCES, THAI_PROVINCE_CODES } from "./provinces";
import { BUDGET_RANGE_IDS } from "./budget-ranges";
import { DEFAULT_MATERIAL_SELECTIONS, SPECIAL_FEATURE_CATALOG } from "./material-catalog";

describe("HouseConfigurationSchema", () => {
  test("creates complete Step 4 defaults", () => {
    const value = createDefaultConfiguration();

    expect(value.materialSelections).toEqual(DEFAULT_MATERIAL_SELECTIONS);
    expect(value.materialQualityId).toBe("premium");
    expect(value.materialLevel).toBe("premium");
  });

  test("uses an unspecified budget range by default and validates stable range identifiers", () => {
    const defaults = createDefaultConfiguration();
    expect(defaults.budgetRangeId).toBe("unspecified");
    for (const budgetRangeId of BUDGET_RANGE_IDS) {
      expect(HouseConfigurationSchema.safeParse({ ...defaults, budgetRangeId }).success).toBe(true);
    }
    expect(HouseConfigurationSchema.safeParse({ ...defaults, budgetRangeId: "custom" }).success).toBe(false);
  });

  test("accepts the default new-house configuration and rejects renovation", () => {
    expect(HouseConfigurationSchema.safeParse(createDefaultConfiguration()).success).toBe(true);
    expect(
      HouseConfigurationSchema.safeParse({
        ...createDefaultConfiguration(),
        projectType: "renovation",
      }).success,
    ).toBe(false);
  });

  test("enforces each numeric and text boundary", () => {
    const defaults = createDefaultConfiguration();

    expect(HouseConfigurationSchema.safeParse({ ...defaults, residents: 0 }).success).toBe(false);
    expect(HouseConfigurationSchema.safeParse({ ...defaults, floors: 4 }).success).toBe(false);
    expect(HouseConfigurationSchema.safeParse({ ...defaults, bedrooms: 12.5 }).success).toBe(false);
    expect(HouseConfigurationSchema.safeParse({ ...defaults, bathrooms: 16 }).success).toBe(false);
    expect(HouseConfigurationSchema.safeParse({ ...defaults, parkingSpaces: -1 }).success).toBe(false);
    expect(
      HouseConfigurationSchema.safeParse({ ...defaults, usableAreaOverrideM2: 59 }).success,
    ).toBe(false);
    expect(
      HouseConfigurationSchema.safeParse({ ...defaults, usableAreaOverrideM2: 1501 }).success,
    ).toBe(false);
    expect(
      HouseConfigurationSchema.safeParse({ ...defaults, district: "x".repeat(101) }).success,
    ).toBe(false);
    expect(
      HouseConfigurationSchema.safeParse({ ...defaults, privateNotes: "x".repeat(1001) }).success,
    ).toBe(false);
    expect(
      HouseConfigurationSchema.safeParse({ ...defaults, targetBudget: { min: 0, max: 1 } }).success,
    ).toBe(false);
  });

  test("rejects a target budget whose minimum exceeds its maximum", () => {
    expect(HouseConfigurationSchema.safeParse({
      ...createDefaultConfiguration(),
      targetBudget: { min: 20_000_000, max: 10_000_000 },
    }).success).toBe(false);
  });

  test("rejects duplicate special features so an allowance cannot be requested twice", () => {
    expect(
      HouseConfigurationSchema.safeParse({
        ...createDefaultConfiguration(),
        specialFeatures: ["pool", "pool"],
      }).success,
    ).toBe(false);
  });

  test("exports one canonical special-feature allowlist used by the schema", () => {
    expect(SPECIAL_FEATURE_CODES).toEqual(SPECIAL_FEATURE_CATALOG.map(({ id }) => id));
    expect(
      HouseConfigurationSchema.safeParse({
        ...createDefaultConfiguration(),
        specialFeatures: SPECIAL_FEATURE_CODES,
      }).success,
    ).toBe(true);
  });

  test("stores requirement-only Step 2 choices separately from area-calculated functions", () => {
    expect(ADDITIONAL_REQUIREMENT_CODES).toEqual([
      "prayer-room",
      "laundry",
      "home-theater",
      "fitness",
      "pantry",
      "pet-area",
      "maid-room",
      "separate-living",
    ]);
    expect(createDefaultConfiguration().additionalRequirements).toEqual([]);
    expect(
      HouseConfigurationSchema.safeParse({
        ...createDefaultConfiguration(),
        additionalRequirements: ADDITIONAL_REQUIREMENT_CODES,
      }).success,
    ).toBe(true);
    expect(
      HouseConfigurationSchema.safeParse({
        ...createDefaultConfiguration(),
        additionalRequirements: ["fitness", "fitness"],
      }).success,
    ).toBe(false);
    expect(
      HouseConfigurationSchema.safeParse({
        ...createDefaultConfiguration(),
        additionalRequirements: ["unknown-requirement"],
      }).success,
    ).toBe(false);
  });

  test("accepts every Thai province code and rejects values outside the allowlist", () => {
    const defaults = createDefaultConfiguration();

    expect(THAI_PROVINCE_CODES).toHaveLength(77);
    for (const provinceCode of THAI_PROVINCE_CODES) {
      expect(
        HouseConfigurationSchema.safeParse({ ...defaults, provinceCode }).success,
        provinceCode,
      ).toBe(true);
    }

    for (const provinceCode of ["00", "09", "29", "59", "68", "78", "79", "87", "89", "97", "100", "province"]) {
      expect(
        HouseConfigurationSchema.safeParse({ ...defaults, provinceCode }).success,
        provinceCode,
      ).toBe(false);
    }
  });

  test("provides one unique Thai name for every allowlisted province code", () => {
    expect(THAI_PROVINCES).toHaveLength(77);
    expect(new Set(THAI_PROVINCES.map((province) => province.code)).size).toBe(77);
    expect(THAI_PROVINCES.map((province) => province.code)).toEqual(THAI_PROVINCE_CODES);
    expect(THAI_PROVINCES.every((province) => province.name.trim().length > 0)).toBe(true);
  });

  test("has no contact fields and rejects attempts to add them", () => {
    const defaults = createDefaultConfiguration();
    const keys = Object.keys(defaults);

    expect(keys).not.toEqual(expect.arrayContaining(["name", "phone", "email", "lineId"]));
    expect(
      HouseConfigurationSchema.safeParse({
        ...defaults,
        name: "Champ",
        phone: "0919914592",
        email: "champ@example.com",
        lineId: "champ",
      }).success,
    ).toBe(false);
  });

  test("rejects unknown and PII-shaped keys in nested configuration objects", () => {
    const defaults = createDefaultConfiguration();

    expect(
      HouseConfigurationSchema.safeParse({
        ...defaults,
        functions: { ...defaults.functions, email: "champ@example.com" },
      }).success,
    ).toBe(false);
    expect(
      HouseConfigurationSchema.safeParse({
        ...defaults,
        targetBudget: { min: 1_000_000, max: 2_000_000, phone: "0919914592" },
      }).success,
    ).toBe(false);
  });
});
