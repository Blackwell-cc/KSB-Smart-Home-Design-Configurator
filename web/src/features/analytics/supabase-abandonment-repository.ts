import { createClient } from "@supabase/supabase-js";
import type { AbandonmentRepository } from "./abandonment-tracker";

type RpcName = "start_lead_form_session" | "submit_lead_form_session" | "abandon_lead_form_session" | "expire_lead_form_sessions";
type RpcClient = { rpc(name: RpcName, args: Record<string, unknown>): Promise<{ data: unknown; error: unknown }> };

export class SupabaseAbandonmentRepository implements AbandonmentRepository {
  constructor(private readonly client: RpcClient) {}
  start(sessionId: string, startedAt: Date) { return this.call("start_lead_form_session", { p_session_id: sessionId, p_started_at: startedAt.toISOString() }); }
  markSubmitted(sessionId: string, submittedAt: Date) { return this.call("submit_lead_form_session", { p_session_id: sessionId, p_submitted_at: submittedAt.toISOString() }); }
  markAbandoned(sessionId: string, abandonedAt: Date, reason: "explicit-leave") { return this.call("abandon_lead_form_session", { p_session_id: sessionId, p_abandoned_at: abandonedAt.toISOString(), p_reason: reason }); }
  async expireUnsubmittedBefore(cutoff: Date, expiredAt: Date) {
    const result = await this.client.rpc("expire_lead_form_sessions", { p_cutoff: cutoff.toISOString(), p_expired_at: expiredAt.toISOString() });
    if (result.error || typeof result.data !== "number" || !Number.isSafeInteger(result.data) || result.data < 0) throw new Error("ABANDONMENT_TRACKING_UNAVAILABLE");
    return result.data;
  }
  private async call(name: Exclude<RpcName, "expire_lead_form_sessions">, args: Record<string, unknown>) {
    const result = await this.client.rpc(name, args); if (result.error) throw new Error("ABANDONMENT_TRACKING_UNAVAILABLE");
  }
}

export function createSupabaseAbandonmentRepositoryFromEnvironment() {
  const url = process.env.SUPABASE_URL; const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("ABANDONMENT_TRACKING_UNAVAILABLE");
  return new SupabaseAbandonmentRepository(createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } }) as unknown as RpcClient);
}
