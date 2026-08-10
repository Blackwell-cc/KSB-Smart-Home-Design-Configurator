import { z } from "zod";
import { THAI_PROVINCE_CODES } from "@/features/configurator/domain/provinces";

export const ANALYTICS_EVENT_NAMES = [
  "preview_viewed", "full_report_cta_clicked", "lead_form_started", "lead_form_abandoned", "lead_submitted",
  "full_report_unlocked", "pdf_downloaded", "summary_image_downloaded", "preview_shared", "consultation_requested",
] as const;

const campaignValue = z.string().trim().min(1).max(120).regex(/^[^\u0000-\u001f\u007f]*$/);
export const AnalyticsPropertiesSchema = z.object({
  sessionId: z.string().trim().min(1).max(128),
  projectId: z.string().trim().min(1).max(128).optional(),
  configuratorVersion: z.string().trim().min(1).max(40),
  pricingVersion: z.string().trim().min(1).max(80),
  deviceClass: z.enum(["mobile", "tablet", "desktop"]),
  timestamp: z.string().datetime({ offset: true }),
  utmSource: campaignValue.optional(), utmMedium: campaignValue.optional(), utmCampaign: campaignValue.optional(), utmContent: campaignValue.optional(), utmTerm: campaignValue.optional(),
  currentStep: z.number().int().min(0).max(5).optional(),
  materialLevel: z.enum(["select", "premium", "signature"]).optional(),
  provinceCode: z.enum(THAI_PROVINCE_CODES).optional(),
}).strict();

export const AnalyticsEventSchema = z.object({ name: z.enum(ANALYTICS_EVENT_NAMES), properties: AnalyticsPropertiesSchema }).strict();
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;
