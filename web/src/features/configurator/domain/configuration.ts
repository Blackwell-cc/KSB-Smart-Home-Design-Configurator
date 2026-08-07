import { z } from "zod";
import { THAI_PROVINCE_CODES } from "./provinces";

export const SPECIAL_FEATURE_CODES = [
  "pool",
  "lift",
  "smart-home",
  "solar",
  "ev-charger",
  "double-volume",
  "large-glazing",
] as const;

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
    materialLevel: z.enum(["select", "premium", "signature"]),
    specialFeatures: z
      .array(z.enum(SPECIAL_FEATURE_CODES))
      .refine((features) => new Set(features).size === features.length, {
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
    materialLevel: "premium",
    specialFeatures: [],
    privateNotes: "",
  };
}
