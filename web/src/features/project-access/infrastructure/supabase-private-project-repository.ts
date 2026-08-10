import { createClient } from "@supabase/supabase-js";
import type { ActiveProjectAccess, PrivateProjectRecord, PrivateProjectRepository } from "../application/resolve-private-project";

type Query = { select(columns: string): Query; eq(column: string, value: unknown): Query; is(column: string, value: null): Query; update(values: Record<string, unknown>): Query; maybeSingle(): Promise<{ data: unknown; error: unknown }>; };
type QueryClient = { from(table: string): Query };
const asRecord = (value: unknown): Record<string, unknown> | null => typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null;

export class SupabasePrivateProjectRepository implements PrivateProjectRepository {
  constructor(private readonly client: QueryClient, private readonly now: () => Date = () => new Date()) {}

  async findAccessByTokenHash(tokenHash: string): Promise<ActiveProjectAccess | null> {
    const { data, error } = await this.client.from("project_access_tokens").select("project_id, token_hash, expires_at, revoked_at").eq("token_hash", `\\x${tokenHash}`).maybeSingle();
    const row = asRecord(data); if (error || !row || typeof row.project_id !== "string" || typeof row.expires_at !== "string") return null;
    const expiresAt = new Date(row.expires_at); const revokedAt = row.revoked_at === null ? null : typeof row.revoked_at === "string" ? new Date(row.revoked_at) : null;
    if (!Number.isFinite(expiresAt.getTime()) || (revokedAt !== null && !Number.isFinite(revokedAt.getTime()))) return null;
    return { projectId: row.project_id, tokenHash, expiresAt, revokedAt };
  }

  async loadProject(projectId: string): Promise<PrivateProjectRecord | null> {
    const projectResult = await this.client.from("projects").select("id, configuration_id, calculation_snapshot_id").eq("id", projectId).maybeSingle();
    const project = asRecord(projectResult.data); if (projectResult.error || !project || typeof project.id !== "string" || typeof project.configuration_id !== "string" || typeof project.calculation_snapshot_id !== "string") return null;
    const [configurationResult, snapshotResult] = await Promise.all([
      this.client.from("configurations").select("payload").eq("id", project.configuration_id).maybeSingle(),
      this.client.from("calculation_snapshots").select("id, payload, pricing_version, reference_date").eq("id", project.calculation_snapshot_id).maybeSingle(),
    ]);
    const configurationRow = asRecord(configurationResult.data); const snapshotRow = asRecord(snapshotResult.data); const configuration = asRecord(configurationRow?.payload); const payload = asRecord(snapshotRow?.payload);
    if (configurationResult.error || snapshotResult.error || !configuration || !payload || typeof snapshotRow?.id !== "string") return null;
    const target = asRecord(configuration.targetBudget); const targetBudget = target && typeof target.min === "number" && typeof target.max === "number" && Number.isFinite(target.min) && Number.isFinite(target.max) && target.min <= target.max ? { min: target.min, max: target.max } : null;
    return { id: project.id, targetBudget, snapshot: { ...payload, id: snapshotRow.id, configuration } };
  }

  async requestConsultation(projectId: string): Promise<Date> {
    const requestedAt = this.now().toISOString();
    const updated = await this.client.from("projects").update({ consultation_requested_at: requestedAt }).eq("id", projectId).is("consultation_requested_at", null).select("consultation_requested_at").maybeSingle();
    const updatedRow = asRecord(updated.data);
    if (!updated.error && updatedRow && typeof updatedRow.consultation_requested_at === "string") return new Date(updatedRow.consultation_requested_at);
    const current = await this.client.from("projects").select("consultation_requested_at").eq("id", projectId).maybeSingle(); const currentRow = asRecord(current.data);
    if (current.error || !currentRow || typeof currentRow.consultation_requested_at !== "string") throw new Error("CONSULTATION_UNAVAILABLE");
    return new Date(currentRow.consultation_requested_at);
  }
}

export function createSupabasePrivateProjectRepositoryFromEnvironment() {
  const url = process.env.SUPABASE_URL; const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("PRIVATE_PROJECT_UNAVAILABLE");
  return new SupabasePrivateProjectRepository(createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } }) as unknown as QueryClient);
}
