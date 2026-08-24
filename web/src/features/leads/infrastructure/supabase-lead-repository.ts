import { createClient } from "@supabase/supabase-js";
import type { LeadRepository } from "../application/submit-lead";

type RpcClient = { rpc(name: "submit_lead_once", args: Record<string, unknown>): Promise<{ data: unknown; error: unknown }> };

export class SupabaseLeadRepository implements LeadRepository {
  constructor(private readonly client: RpcClient) {}

  async submitOnce(input: Parameters<LeadRepository["submitOnce"]>[0]) {
    const { data, error } = await this.client.rpc("submit_lead_once", {
      p_configuration_id: input.configurationId, p_configuration: input.configuration, p_schema_version: 1,
      p_price_book_id: input.priceBookId,
      p_snapshot: input.calculationSnapshot, p_idempotency_key: input.idempotencyKey, p_name: input.name,
      p_preferred_contact_method: input.preferredContactMethod, p_phone: input.phone ?? null, p_email: input.email ?? null,
      p_line_id: input.lineId ?? null, p_request_purpose: input.requestPurpose, p_consent_version: input.consentVersion, p_token_hash_hex: input.tokenHash,
      p_expires_at: input.expiresAt,
    });
    if (error || !Array.isArray(data) || data.length !== 1) throw new Error("LEAD_SUBMISSION_UNAVAILABLE");
    const row = data[0] as { lead_id?: unknown; project_id?: unknown };
    if (typeof row.lead_id !== "string" || typeof row.project_id !== "string") throw new Error("LEAD_SUBMISSION_UNAVAILABLE");
    return { leadId: row.lead_id, projectId: row.project_id };
  }
}

export function createSupabaseLeadRepositoryFromEnvironment() {
  const url = process.env.SUPABASE_URL; const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("LEAD_SUBMISSION_UNAVAILABLE");
  return new SupabaseLeadRepository(createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } }) as unknown as RpcClient);
}
