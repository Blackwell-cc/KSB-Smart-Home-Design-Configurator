import { z } from "zod";
import type { HouseConfiguration } from "@/features/configurator/domain/configuration";
import { THAI_PROVINCE_CODES } from "@/features/configurator/domain/provinces";

export const EstimateRequestSchema = z.object({
  styleId: z.enum(["contemporary-warm-luxury", "modern-tropical-resort", "timeless-contemporary-luxury", "not-sure"]),
  residents: z.number().int().min(1).max(20),
  floors: z.number().int().min(1).max(3),
  bedrooms: z.number().int().min(1).max(12),
  bathrooms: z.number().int().min(1).max(15),
  parkingSpaces: z.number().int().min(0).max(10),
  functions: z.object({ office: z.boolean(), elderlyRoom: z.boolean(), thaiKitchen: z.boolean(), multipurposeRoom: z.boolean() }).strict(),
  usableAreaOverrideM2: z.number().min(60).max(1500).nullable(),
  provinceCode: z.enum(THAI_PROVINCE_CODES),
  siteAccess: z.enum(["normal", "restricted", "very-restricted"]),
  materialLevel: z.enum(["select", "premium", "signature"]),
  specialFeatures: z.array(z.enum(["pool", "lift", "smart-home", "solar", "ev-charger", "double-volume", "large-glazing"])).refine((items) => new Set(items).size === items.length),
}).strict();

export type EstimateRequest = z.infer<typeof EstimateRequestSchema>;

export function projectEstimateRequest(configuration: HouseConfiguration): EstimateRequest {
  const request = EstimateRequestSchema.safeParse({
    styleId: configuration.styleId ?? "not-sure",
    residents: configuration.residents, floors: configuration.floors, bedrooms: configuration.bedrooms,
    bathrooms: configuration.bathrooms, parkingSpaces: configuration.parkingSpaces, functions: configuration.functions,
    usableAreaOverrideM2: configuration.usableAreaOverrideM2, provinceCode: configuration.provinceCode!,
    siteAccess: configuration.siteAccess, materialLevel: configuration.materialLevel, specialFeatures: configuration.specialFeatures,
  });
  if (!request.success) throw new Error("INVALID_CONFIGURATION");
  return request.data;
}

export function toCalculationConfiguration(request: EstimateRequest): HouseConfiguration {
  return {
    schemaVersion: 1, projectType: "new-house", styleId: request.styleId, residents: request.residents,
    floors: request.floors, bedrooms: request.bedrooms, bathrooms: request.bathrooms, parkingSpaces: request.parkingSpaces,
    functions: request.functions, usableAreaOverrideM2: request.usableAreaOverrideM2, provinceCode: request.provinceCode,
    district: null, siteAccess: request.siteAccess, targetBudget: null, materialLevel: request.materialLevel,
    specialFeatures: request.specialFeatures, privateNotes: "",
  };
}
