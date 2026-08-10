import { randomBytes } from "node:crypto";
import { z } from "zod";
import { CONCEPT_CATALOG } from "@/features/preview/domain/concept-catalog";
import { PUBLIC_SHARE_SLUG_PATTERN, PublicPreviewContentSchema, PublicPreviewPayloadSchema, type PublicPreviewPayload, type PublicShareRepository } from "../domain/public-preview";

const PrivateShareSourceSchema = PublicPreviewContentSchema.extend({ id: z.string().uuid() }).strip();

export async function createPublicShare(
  rawSource: unknown,
  repository: PublicShareRepository,
  createSlug: () => string = () => randomBytes(18).toString("base64url"),
): Promise<PublicPreviewPayload> {
  const parsed = PrivateShareSourceSchema.safeParse(rawSource);
  if (!parsed.success) throw new Error("INVALID_PUBLIC_SHARE_SOURCE");
  const { id: projectId, ...publicPayload } = parsed.data;
  const concept = CONCEPT_CATALOG.find((item) => item.id === publicPayload.conceptAssetId);
  if (!concept || concept.label !== publicPayload.styleLabel) throw new Error("INVALID_PUBLIC_SHARE_SOURCE");

  const slug = createSlug();
  if (!PUBLIC_SHARE_SLUG_PATTERN.test(slug)) throw new Error("PUBLIC_SHARE_UNAVAILABLE");
  const saved = await repository.save({ projectId, slug, publicPayload });
  const result = PublicPreviewPayloadSchema.safeParse({ ...publicPayload, slug: saved.slug });
  if (!result.success || saved.slug !== slug) throw new Error("PUBLIC_SHARE_UNAVAILABLE");
  return Object.freeze(result.data);
}
