import { z } from "zod";
import {
  DEFAULT_MATERIAL_SELECTIONS,
  MATERIAL_CATEGORY_IDS,
  MATERIAL_QUALITY_IDS,
  SPECIAL_FEATURE_CATALOG,
  type MaterialSelections,
  type SpecialFeatureId,
} from "./material-catalog";
import { THAI_PROVINCE_CODES } from "./provinces";

export const SPECIAL_FEATURE_CODES = SPECIAL_FEATURE_CATALOG.map(({ id }) => id) as [
  SpecialFeatureId,
  ...SpecialFeatureId[],
];

const MaterialSelectionsSchema: z.ZodType<MaterialSelections> = z.record(
  z.enum(MATERIAL_CATEGORY_IDS),
  z.string(),
);

function hasUniqueValues(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}

export const HouseConfigurationSchema = z
  .object({
    schemaVersion: z.literal(1),
    projectType: z.literal("new-house"),
    styleId: z.string().nullable(),
    residents: z.number().int().min(1).max(20),
    floors: z.number().int().min(1).max(3),
    bedrooms: z.number().int().min(1).max(12),
    bathrooms: z.number().int().min(1).max(15),
    parkingSpaces: z.number().int().min(0).max(10),
    functions: z
      .object({
        office: z.boolean(),
        elderlyRoom: z.boolean(),
        thaiKitchen: z.boolean(),
        multipurposeRoom: z.boolean(),
      })
      .strict(),
    usableAreaOverrideM2: z.number().min(60).max(1500).nullable(),
    provinceCode: z.enum(THAI_PROVINCE_CODES).nullable(),
    district: z.string().max(100).nullable(),
    siteAccess: z.enum(["normal", "restricted", "very-restricted"]),
    targetBudget: z.object({ min: z.number().positive(), max: z.number().positive() }).strict().nullable(),
    materialSelections: MaterialSelectionsSchema.default(DEFAULT_MATERIAL_SELECTIONS),
    materialQualityId: z.enum(MATERIAL_QUALITY_IDS).default("premium"),
    materialLevel: z.enum(["select", "premium", "signature"]),
    specialFeatures: z
      .array(z.enum(SPECIAL_FEATURE_CODES))
      .refine(hasUniqueValues, {
        message: "เลือกรายการพิเศษซ้ำไม่ได้",
      }),
    privateNotes: z.string().max(1000),
  })
  .strict()
  .superRefine((configuration, context) => {
    if (configuration.targetBudget && configuration.targetBudget.min > configuration.targetBudget.max) {
      context.addIssue({ code: "custom", path: ["targetBudget", "max"], message: "งบประมาณสูงสุดต้องไม่น้อยกว่างบเริ่มต้น" });
    }
  });

export type HouseConfiguration = z.infer<typeof HouseConfigurationSchema>;

export function createDefaultConfiguration(): HouseConfiguration {
  return {
    schemaVersion: 1,
    projectType: "new-house",
    styleId: null,
    residents: 4,
    floors: 2,
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 2,
    functions: {
      office: false,
      elderlyRoom: false,
      thaiKitchen: false,
      multipurposeRoom: false,
    },
    usableAreaOverrideM2: null,
    provinceCode: null,
    district: null,
    siteAccess: "normal",
    targetBudget: null,
    materialSelections: DEFAULT_MATERIAL_SELECTIONS,
    materialQualityId: "premium",
    materialLevel: "premium",
    specialFeatures: [],
    privateNotes: "",
  };
}
