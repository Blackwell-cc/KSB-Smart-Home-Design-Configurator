import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { PrivacyRepository } from "../application/privacy-repository";

type RpcClient = { rpc(name: "export_project_data" | "delete_project_data" | "run_pii_retention", args: Record<string, unknown>): Promise<{ data: unknown; error: unknown }> };
const id = z.string().uuid();
const exportBundle = z.object({ contact: z.unknown(), consent: z.unknown(), configuration: z.unknown(), snapshot: z.unknown() }).strict();
const deletedRows = z.array(z.object({ deleted_lead_id: id }).strict());

export class SupabasePrivacyRepository implements PrivacyRepository {
  constructor(private readonly client: RpcClient) {}
  async exportByLeadId(leadId: string) {
    const result = await this.client.rpc("export_project_data", { p_lead_id: leadId });
    if (result.error || result.data === null) return null;
    const parsed = exportBundle.safeParse(result.data); if (!parsed.success) throw new Error("PRIVACY_OPERATION_UNAVAILABLE");
    return parsed.data;
  }
  async deleteByLeadId(leadId: string) { return this.deleted("delete_project_data", { p_lead_id: leadId }); }
  async deleteOlderThan(cutoff: Date) { return this.deleted("run_pii_retention", { p_cutoff: cutoff.toISOString() }); }
  private async deleted(name: "delete_project_data" | "run_pii_retention", args: Record<string, unknown>) {
    const result = await this.client.rpc(name, args); const parsed = deletedRows.safeParse(result.data);
    if (result.error || !parsed.success) throw new Error("PRIVACY_OPERATION_UNAVAILABLE");
    return { deletedLeadIds: parsed.data.map((row) => row.deleted_lead_id) };
  }
}

export function createSupabasePrivacyRepositoryFromEnvironment() {
  const url = process.env.SUPABASE_URL; const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("PRIVACY_OPERATION_UNAVAILABLE");
  return new SupabasePrivacyRepository(createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } }) as unknown as RpcClient);
}
