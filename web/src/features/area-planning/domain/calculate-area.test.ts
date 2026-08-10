import { describe, expect, test } from "vitest";
import {
  HouseConfigurationSchema,
  createDefaultConfiguration,
  type HouseConfiguration,
} from "@/features/configurator/domain/configuration";
import { calculateArea } from "./calculate-area";
import { QA_AREA_CATALOG } from "./area-catalog";

function configuration(overrides: Partial<HouseConfiguration> = {}): HouseConfiguration {
  return HouseConfigurationSchema.parse({
    ...createDefaultConfiguration(),
    ...overrides,
  });
}

const calculateQaArea = (input: HouseConfiguration) => calculateArea(input, QA_AREA_CATALOG);

function expectFiniteNonNegative(result: ReturnType<typeof calculateArea>) {
  expect(result.recommendedUsableAreaM2).toBeGreaterThanOrEqual(0);
  expect(result.usableAreaM2).toBeGreaterThanOrEqual(0);
  expect(result.constructionFloorAreaM2).toBeGreaterThanOrEqual(0);

  for (const item of result.breakdown) {
    expect(Number.isFinite(item.rawM2)).toBe(true);
    expect(Number.isFinite(item.weight)).toBe(true);
    expect(Number.isFinite(item.weightedM2)).toBe(true);
    expect(item.rawM2).toBeGreaterThanOrEqual(0);
    expect(item.weight).toBeGreaterThanOrEqual(0);
    expect(item.weightedM2).toBeGreaterThanOrEqual(0);
  }
}

describe("calculateArea", () => {
  test("returns the QA usable-area recommendation and weighted CFA for the default configuration", () => {
    const result = calculateQaArea(createDefaultConfiguration());

    expect(result.recommendedUsableAreaM2).toBe(164);
    expect(result.usableAreaM2).toBe(164);
    expect(result.constructionFloorAreaM2).toBe(198);
    expect(result.breakdown.find((item) => item.code === "covered-parking")?.weightedM2).toBe(30);
  });

  test("uses an approved user override without changing the room-program recommendation", () => {
    const result = calculateQaArea(configuration({ usableAreaOverrideM2: 220 }));

    expect(result.recommendedUsableAreaM2).toBe(164);
    expect(result.usableAreaM2).toBe(220);
    expect(result.constructionFloorAreaM2).toBe(254);
  });

  test("adds each requested optional function to the recommended usable area", () => {
    const base = calculateQaArea(createDefaultConfiguration());
    const functionAreas = {
      office: 12,
      elderlyRoom: 16,
      thaiKitchen: 12,
      multipurposeRoom: 15,
    } as const;

    for (const [functionName, expectedIncrease] of Object.entries(functionAreas) as Array<
      [keyof HouseConfiguration["functions"], number]
    >) {
      const result = calculateQaArea(
        configuration({
          functions: { ...createDefaultConfiguration().functions, [functionName]: true },
        }),
      );

      expect(result.recommendedUsableAreaM2).toBe(
        base.recommendedUsableAreaM2 + expectedIncrease,
      );
    }
  });

  test("keeps zero parking as a zero-area CFA line item", () => {
    const result = calculateQaArea(configuration({ parkingSpaces: 0 }));

    expect(result.breakdown.find((item) => item.code === "covered-parking")).toEqual({
      code: "covered-parking",
      rawM2: 0,
      weight: 1,
      weightedM2: 0,
    });
    expect(result.constructionFloorAreaM2).toBe(result.usableAreaM2 + 4);
  });

  test("calculates non-negative finite values for schema-valid minimum and maximum room programs", () => {
    const minimum = configuration({
      residents: 1,
      floors: 1,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpaces: 0,
    });
    const maximum = configuration({
      residents: 20,
      floors: 3,
      bedrooms: 12,
      bathrooms: 15,
      parkingSpaces: 10,
      functions: { office: true, elderlyRoom: true, thaiKitchen: true, multipurposeRoom: true },
      usableAreaOverrideM2: 1500,
    });

    expect(calculateQaArea(minimum)).toMatchObject({
      recommendedUsableAreaM2: 100,
      usableAreaM2: 100,
      constructionFloorAreaM2: 104,
    });
    expect(calculateQaArea(maximum)).toMatchObject({
      recommendedUsableAreaM2: 457,
      usableAreaM2: 1500,
      constructionFloorAreaM2: 1654,
    });
    expectFiniteNonNegative(calculateQaArea(minimum));
    expectFiniteNonNegative(calculateQaArea(maximum));
  });

  test("returns deterministic arithmetic where the CFA equals the breakdown sum", () => {
    const input = configuration({
      functions: { office: true, elderlyRoom: true, thaiKitchen: true, multipurposeRoom: true },
      parkingSpaces: 3,
    });
    const first = calculateQaArea(input);
    const second = calculateQaArea(input);

    expect(second).toEqual(first);
    expect(first.constructionFloorAreaM2).toBe(
      first.breakdown.reduce((sum, item) => sum + item.weightedM2, 0),
    );
    for (const item of first.breakdown) {
      expect(item.weightedM2).toBe(item.rawM2 * item.weight);
    }
  });
});
