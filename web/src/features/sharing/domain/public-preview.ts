import { z } from "zod";
import { CONCEPT_CATALOG } from "@/features/preview/domain/concept-catalog";

const conceptIds = CONCEPT_CATALOG.map((concept) => concept.id) as [string, ...string[]];

export const PublicPreviewContentSchema = z.object({
  conceptAssetId: z.enum(conceptIds),
  styleLabel: z.string().trim().min(1).max(120),
  floors: z.number().int().min(1).max(3),
  bedrooms: z.number().int().min(1).max(12),
  bathrooms: z.number().int().min(1).max(15),
  parkingSpaces: z.number().int().min(0).max(10),
  usableAreaM2: z.number().finite().min(1).max(1_500),
}).strict();

export const PUBLIC_SHARE_SLUG_PATTERN = /^[A-Za-z0-9_-]{12,100}$/;
export const PublicPreviewPayloadSchema = PublicPreviewContentSchema.extend({
  slug: z.string().regex(PUBLIC_SHARE_SLUG_PATTERN),
}).strict();

export type PublicPreviewContent = z.infer<typeof PublicPreviewContentSchema>;
export type PublicPreviewPayload = z.infer<typeof PublicPreviewPayloadSchema>;

export type PublicShareRepository = {
  save(input: { projectId: string; slug: string; publicPayload: PublicPreviewContent }): Promise<{ slug: string }>;
  findBySlug?(slug: string): Promise<PublicPreviewPayload | null>;
};
