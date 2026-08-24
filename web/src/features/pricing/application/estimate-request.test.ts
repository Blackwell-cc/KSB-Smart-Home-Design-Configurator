import { expect, test } from "vitest";
import { createDefaultConfiguration } from "@/features/configurator/domain/configuration";
import { DEFAULT_MATERIAL_SELECTIONS } from "@/features/configurator/domain/material-catalog";
import { projectEstimateRequest, toCalculationConfiguration } from "./estimate-request";

test("maps bespoke and removes unpriced design-only features", () => {
  const request = projectEstimateRequest({
    ...createDefaultConfiguration(),
    styleId: "contemporary-warm-luxury",
    provinceCode: "10",
    materialQualityId: "bespoke",
    materialLevel: "signature",
    specialFeatures: ["pool", "internal-garden"],
  });

  expect(request.materialLevel).toBe("signature");
  expect(request.specialFeatures).toEqual(["pool"]);
});

test("derives pricing material level from the selected material quality", () => {
  const request = projectEstimateRequest({
    ...createDefaultConfiguration(),
    styleId: "contemporary-warm-luxury",
    provinceCode: "10",
    materialQualityId: "bespoke",
    materialLevel: "select",
  });

  expect(request.materialLevel).toBe("signature");
});

test.each([
  ["classic-style", "timeless-contemporary-luxury"],
  ["modern-style", "contemporary-warm-luxury"],
  ["natural-style", "modern-tropical-resort"],
  ["loft-style", "contemporary-warm-luxury"],
  ["minimalist-style", "contemporary-warm-luxury"],
  ["luxury-style", "timeless-contemporary-luxury"],
  ["vintage-style", "timeless-contemporary-luxury"],
] as const)("maps %s to the supported %s pricing family", (styleId, expectedPricingStyleId) => {
  const request = projectEstimateRequest({
    ...createDefaultConfiguration(),
    styleId,
    provinceCode: "10",
  });

  expect(request.styleId).toBe(expectedPricingStyleId);
});

test("expands pricing requests with catalog defaults and a matching display quality", () => {
  const configuration = toCalculationConfiguration({
    ...projectEstimateRequest({
      ...createDefaultConfiguration(),
      styleId: "contemporary-warm-luxury",
      provinceCode: "10",
      materialQualityId: "standard",
      materialLevel: "select",
    }),
    materialLevel: "select",
  });

  expect(configuration).toMatchObject({
    materialQualityId: "standard",
    materialLevel: "select",
    materialSelections: DEFAULT_MATERIAL_SELECTIONS,
    additionalRequirements: [],
    budgetRangeId: "unspecified",
  });
});
