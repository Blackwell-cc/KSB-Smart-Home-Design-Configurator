import { createHash, createHmac } from "node:crypto";
import { calculateArea } from "@/features/area-planning/domain/calculate-area";
import { calculateEstimate } from "@/features/pricing/domain/calculate-estimate";
import type { PriceBookRepository } from "@/features/pricing/application/estimate-project";
import { toCalculationConfiguration } from "@/features/pricing/application/estimate-request";
import { LeadSubmissionSchema, type LeadSubmissionResult } from "../domain/lead";
import { buildPrivateAccessExchangeUrl } from "../domain/private-access";

export type LeadRepository = {
  submitOnce(input: {
    configurationId: string; configuration: unknown; calculationSnapshot: unknown; priceBookId: string;
    idempotencyKey: string; name: string;
    preferredContactMethod: "phone" | "email" | "line"; phone?: string; email?: string; lineId?: string;
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
};

export async function submitLead(rawInput: unknown, dependencies: SubmitLeadDependencies): Promise<LeadSubmissionResult> {
  const input = LeadSubmissionSchema.parse(rawInput);
  const { priceBookId, priceBook, areaCatalog } = await dependencies.priceBookRepository.loadPublished();
  const configuration = toCalculationConfiguration(input.configuration);
  const area = calculateArea(configuration, areaCatalog);
  const estimate = calculateEstimate({ configuration, constructionFloorAreaM2: area.constructionFloorAreaM2, production: true }, priceBook);
  const access = dependencies.createAccessToken(input.idempotencyKey);
  const expiresAt = new Date(dependencies.now().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const row = await dependencies.repository.submitOnce({
    configurationId: input.configurationId, configuration: input.configuration,
    calculationSnapshot: { configuration: input.configuration, area, estimate, pricingVersion: priceBook.version, referenceDate: priceBook.referenceDate, assumptions: estimate.assumptions, includedItems: estimate.includedItems, excludedItems: estimate.excludedItems },
    priceBookId,
    idempotencyKey: input.idempotencyKey, name: input.name, preferredContactMethod: input.preferredContactMethod,
    ...(input.preferredContactMethod === "phone" ? { phone: input.phone } : input.preferredContactMethod === "email" ? { email: input.email } : { lineId: input.lineId }),
    consentVersion: input.consentVersion, tokenHash: access.hash, expiresAt,
  });
  return { ...row, privateToken: access.plainText, reportUrl: buildPrivateAccessExchangeUrl({ projectId: row.projectId, token: access.plainText }) };
}
