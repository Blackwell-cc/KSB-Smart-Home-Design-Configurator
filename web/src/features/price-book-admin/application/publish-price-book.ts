import { z } from "zod";
import { SPECIAL_FEATURE_CODES } from "@/features/configurator/domain/configuration";
import { THAI_PROVINCE_CODES } from "@/features/configurator/domain/provinces";

const range = z.object({ low: z.number().finite().nonnegative(), expected: z.number().finite().nonnegative(), high: z.number().finite().nonnegative() }).strict().refine((value) => value.low <= value.expected && value.expected <= value.high);
export const PriceBookDraftSchema = z.object({
  candidateId: z.string().uuid(), version: z.string().trim().min(3).max(80), referenceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  provinceEntries: z.array(z.object({ code: z.string() }).strict()), materialLevels: z.array(z.string()), specialFeatures: z.array(z.string()), featureAllowances: z.record(z.string(), range),
  goldenCasesPassed: z.boolean(), approvedBy: z.string().nullable(), approvedAt: z.string().nullable(), sources: z.array(z.string()),
}).strict();
export type PriceBookDraft = z.infer<typeof PriceBookDraftSchema>;
export type PricingAdminContext = { userId: string; email: string; roles: readonly string[] };
export type PriceBookPublishRepository = { publish(input: { candidateId: string; version: string; actorUserId: string }): Promise<{ previousStatus: "retired" | "none"; publishedStatus: "published" }> };

export class PriceBookPublishError extends Error {
  constructor(readonly code: "PRICE_BOOK_NOT_READY" | "PRICE_BOOK_FORBIDDEN") { super(code); }
}

function exactSet(actual: readonly string[], expected: readonly string[]) {
  return actual.length === expected.length && new Set(actual).size === expected.length && expected.every((value) => actual.includes(value));
}

export async function publishPriceBook(rawDraft: unknown, admin: PricingAdminContext, repository: PriceBookPublishRepository) {
  if (!admin.roles.includes("pricing-approver")) throw new PriceBookPublishError("PRICE_BOOK_FORBIDDEN");
  const result = PriceBookDraftSchema.safeParse(rawDraft);
  if (!result.success) throw new PriceBookPublishError("PRICE_BOOK_NOT_READY");
  const draft = result.data; const provinceCodes = draft.provinceEntries.map((entry) => entry.code);
  const approvedAt = draft.approvedAt ? new Date(draft.approvedAt) : null;
  const sources = draft.sources.map((source) => source.trim()).filter(Boolean);
  const ready = exactSet(provinceCodes, THAI_PROVINCE_CODES)
    && exactSet(draft.materialLevels, ["select", "premium", "signature"])
    && exactSet(draft.specialFeatures, SPECIAL_FEATURE_CODES)
    && exactSet(Object.keys(draft.featureAllowances), SPECIAL_FEATURE_CODES)
    && draft.goldenCasesPassed && Boolean(draft.approvedBy?.trim())
    && Boolean(approvedAt && Number.isFinite(approvedAt.getTime()))
    && sources.length > 0 && new Set(sources).size === sources.length
    && Number.isFinite(new Date(`${draft.referenceDate}T00:00:00.000Z`).getTime());
  if (!ready) throw new PriceBookPublishError("PRICE_BOOK_NOT_READY");
  return repository.publish({ candidateId: draft.candidateId, version: draft.version, actorUserId: admin.userId });
}
