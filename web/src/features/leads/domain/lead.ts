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

export const REQUEST_PURPOSE_IDS = [
  "view_full_report",
  "planning_to_build",
  "compare_options",
  "architect_consultation",
  "budget_planning",
  "design_service",
  "other",
] as const;

export type RequestPurposeId = (typeof REQUEST_PURPOSE_IDS)[number];

export const LeadSubmissionSchema = z.object({
  ...shared,
  preferredContactMethod: z.literal("phone"),
  phone: z.string().trim().min(9).max(20),
  email: z.string().trim().email().max(254),
  lineId: z.string().trim().min(1).max(100).optional(),
  requestPurpose: z.enum(REQUEST_PURPOSE_IDS),
}).strict();

export type LeadSubmissionInput = z.infer<typeof LeadSubmissionSchema>;
export type LeadSubmissionResult = { leadId: string; projectId: string; privateToken: string; reportUrl: string };
