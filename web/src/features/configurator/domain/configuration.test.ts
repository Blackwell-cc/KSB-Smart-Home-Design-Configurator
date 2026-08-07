import { describe, expect, test } from "vitest";
import {
  HouseConfigurationSchema,
  createDefaultConfiguration,
} from "./configuration";
import { THAI_PROVINCES, THAI_PROVINCE_CODES } from "./provinces";

describe("HouseConfigurationSchema", () => {
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
