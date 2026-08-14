import { z } from "zod";
import { DesignBriefConfigurationSchema } from "@/features/configurator/domain/configuration";

const shared = {
  configurationId: z.uuid(),
  idempotencyKey: z.uuid(),
  configuration: DesignBriefConfigurationSchema,
  name: z.string().trim().min(1).max(120),
  consentAccepted: z.literal(true),
  consentVersion: z.string().trim().min(1).max(120),
};

export const LeadSubmissionSchema = z.discriminatedUnion("preferredContactMethod", [
  z.object({ ...shared, preferredContactMethod: z.literal("phone"), phone: z.string().trim().min(9).max(20) }).strict(),
  z.object({ ...shared, preferredContactMethod: z.literal("email"), email: z.string().trim().email().max(254) }).strict(),
  z.object({ ...shared, preferredContactMethod: z.literal("line"), lineId: z.string().trim().min(1).max(100) }).strict(),
]);

export type LeadSubmissionInput = z.infer<typeof LeadSubmissionSchema>;
export type LeadSubmissionResult = { leadId: string; projectId: string; privateToken: string; reportUrl: string };
