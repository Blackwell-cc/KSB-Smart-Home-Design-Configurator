import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SHARE_SLUG_PATTERN, PublicPreviewPayloadSchema, type PublicPreviewContent, type PublicPreviewPayload, type PublicShareRepository } from "../domain/public-preview";

type Result = { data: unknown; error: unknown };
type Query = {
  insert(values: Record<string, unknown>): Query;
  select(columns: string): Query;
  eq(column: string, value: unknown): Query;
  is(column: string, value: null): Query;
  single(): Promise<Result>;
  maybeSingle(): Promise<Result>;
};
type QueryClient = { from(table: "public_previews"): Query };
const record = (value: unknown): Record<string, unknown> | null => typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null;

export class SupabasePublicShareRepository implements PublicShareRepository {
  constructor(private readonly client: QueryClient) {}

  async save(input: { projectId: string; slug: string; publicPayload: PublicPreviewContent }): Promise<{ slug: string }> {
    const result = await this.client.from("public_previews").insert({ project_id: input.projectId, slug: input.slug, public_payload: input.publicPayload }).select("slug").single();
    const row = record(result.data);
    if (result.error || !row || typeof row.slug !== "string" || row.slug !== input.slug || !PUBLIC_SHARE_SLUG_PATTERN.test(row.slug)) throw new Error("PUBLIC_SHARE_UNAVAILABLE");
    return { slug: row.slug };
  }

  async findBySlug(slug: string): Promise<PublicPreviewPayload | null> {
    if (!PUBLIC_SHARE_SLUG_PATTERN.test(slug)) return null;
    const result = await this.client.from("public_previews").select("slug, public_payload").eq("slug", slug).is("revoked_at", null).maybeSingle();
    const row = record(result.data); const payload = record(row?.public_payload);
    if (result.error || !row || !payload) return null;
    const parsed = PublicPreviewPayloadSchema.safeParse({ ...payload, slug: row.slug });
    return parsed.success ? parsed.data : null;
  }
}

export function createSupabasePublicShareRepositoryFromEnvironment() {
  const url = process.env.SUPABASE_URL; const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("PUBLIC_SHARE_UNAVAILABLE");
  return new SupabasePublicShareRepository(createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } }) as unknown as QueryClient);
}
