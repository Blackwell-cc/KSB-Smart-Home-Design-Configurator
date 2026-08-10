import { z } from "zod";

const LeadNotificationSchema = z.object({
  eventType: z.literal("lead_submitted"), leadId: z.string().uuid(), projectId: z.string().uuid(), name: z.string().trim().min(1).max(120),
  preferredContactMethod: z.enum(["phone", "email", "line"]), contact: z.string().trim().min(1).max(254),
}).strict();
export type LeadNotificationSummary = z.infer<typeof LeadNotificationSchema>;
export type LeadNotifier = { notify(summary: LeadNotificationSummary): Promise<void> };

export class WebhookLeadNotifier implements LeadNotifier {
  private readonly endpoint: URL; private readonly fetch: typeof globalThis.fetch; private readonly maxAttempts: number;
  constructor(endpoint: string, options: { fetch?: typeof globalThis.fetch; maxAttempts?: number } = {}) {
    try { this.endpoint = new URL(endpoint); } catch { throw new Error("LEAD_WEBHOOK_INVALID"); }
    if (this.endpoint.protocol !== "https:" || this.endpoint.username || this.endpoint.password) throw new Error("LEAD_WEBHOOK_INVALID");
    this.fetch = options.fetch ?? globalThis.fetch; this.maxAttempts = options.maxAttempts ?? 3;
    if (!Number.isInteger(this.maxAttempts) || this.maxAttempts < 1 || this.maxAttempts > 5) throw new Error("LEAD_WEBHOOK_INVALID");
  }
  async notify(rawSummary: LeadNotificationSummary) {
    const summary = LeadNotificationSchema.parse(rawSummary);
    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      try {
        const response = await this.fetch(this.endpoint, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": `lead:${summary.leadId}` }, body: JSON.stringify(summary), cache: "no-store", signal: AbortSignal.timeout(8_000) });
        if (response.ok) return;
      } catch { /* A later bounded attempt handles transient transport failures. */ }
    }
    throw new Error("LEAD_NOTIFICATION_FAILED");
  }
}

export function createWebhookLeadNotifierFromEnvironment() {
  const endpoint = process.env.LEAD_WEBHOOK_URL; if (!endpoint) throw new Error("LEAD_WEBHOOK_INVALID");
  return new WebhookLeadNotifier(endpoint);
}
