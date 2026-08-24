import { createHash, createHmac } from "node:crypto";
import { calculateArea } from "@/features/area-planning/domain/calculate-area";
import { calculateEstimate } from "@/features/pricing/domain/calculate-estimate";
import type { PriceBookRepository } from "@/features/pricing/application/estimate-project";
import { projectEstimateRequest, toCalculationConfiguration } from "@/features/pricing/application/estimate-request";
import { LeadSubmissionSchema, type LeadSubmissionResult } from "../domain/lead";
import { buildPrivateAccessExchangeUrl } from "../domain/private-access";
import { CONCEPT_CATALOG, resolveConceptImage } from "@/features/preview/domain/concept-catalog";
import type { LeadNotifier } from "../infrastructure/webhook-lead-notifier";

export type LeadRepository = {
  submitOnce(input: {
    configurationId: string; configuration: unknown; calculationSnapshot: unknown; priceBookId: string;
    idempotencyKey: string; name: string;
    preferredContactMethod: "phone"; phone: string; email: string; lineId?: string; requestPurpose: string;
    consentVersion: string; tokenHash: string; expiresAt: string;
  }): Promise<{ leadId: string; projectId: string }>;
};

export class ProjectAccessTokenSecretError extends Error {
  constructor() { super("PROJECT_ACCESS_TOKEN_SECRET_UNAVAILABLE"); }
}

export function createDeterministicAccessToken(idempotencyKey: string, secret: string) {
  if (Buffer.byteLength(secret, "utf8") < 32) throw new ProjectAccessTokenSecretError();
  const plainText = createHmac("sha256", secret).update(idempotencyKey).digest("base64url");
  return { plainText, hash: createHash("sha256").update(plainText).digest("hex") };
}

export type SubmitLeadDependencies = {
  repository: LeadRepository;
  priceBookRepository: PriceBookRepository;
  createAccessToken: (idempotencyKey: string) => { plainText: string; hash: string };
  now: () => Date;
  notifier?: LeadNotifier;
};

export async function submitLead(rawInput: unknown, dependencies: SubmitLeadDependencies): Promise<LeadSubmissionResult> {
  const input = LeadSubmissionSchema.parse(rawInput);
  const { priceBookId, priceBook, areaCatalog, estimateMode = "published" } = await dependencies.priceBookRepository.loadPublished();
  const pricingConfiguration = projectEstimateRequest({ ...input.configuration, privateNotes: "" });
  const calculationConfiguration = toCalculationConfiguration(pricingConfiguration);
  const area = calculateArea(calculationConfiguration, areaCatalog);
  const estimate = calculateEstimate({ configuration: calculationConfiguration, constructionFloorAreaM2: area.constructionFloorAreaM2, production: estimateMode === "published" }, priceBook);
  const concept = CONCEPT_CATALOG.find((item) => item.id === input.configuration.styleId);
  if (!concept) throw new Error("CONCEPT_SNAPSHOT_UNAVAILABLE");
  const access = dependencies.createAccessToken(input.idempotencyKey);
  const expiresAt = new Date(dependencies.now().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const row = await dependencies.repository.submitOnce({
    configurationId: input.configurationId, configuration: input.configuration,
    calculationSnapshot: { configuration: input.configuration, pricingConfiguration, concept: { id: concept.id, label: concept.label, imageSrc: resolveConceptImage(concept, input.configuration.floors) }, area, estimate, estimateMode, pricingVersion: priceBook.version, referenceDate: priceBook.referenceDate, assumptions: estimate.assumptions, includedItems: estimate.includedItems, excludedItems: estimate.excludedItems },
    priceBookId,
    idempotencyKey: input.idempotencyKey, name: input.name, preferredContactMethod: input.preferredContactMethod,
    phone: input.phone, email: input.email, ...(input.lineId ? { lineId: input.lineId } : {}), requestPurpose: input.requestPurpose,
    consentVersion: input.consentVersion, tokenHash: access.hash, expiresAt,
  });
  if (dependencies.notifier) {
    try { await dependencies.notifier.notify({ eventType: "lead_submitted", leadId: row.leadId, projectId: row.projectId, name: input.name, preferredContactMethod: input.preferredContactMethod, contact: input.phone }); }
    catch { /* Notification recovery is independent from the committed Lead transaction. */ }
  }
  return { ...row, privateToken: access.plainText, reportUrl: buildPrivateAccessExchangeUrl({ projectId: row.projectId, token: access.plainText }) };
}
