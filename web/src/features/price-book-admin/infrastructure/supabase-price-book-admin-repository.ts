import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { PriceBookDraftSchema, type PriceBookPublishRepository } from "../application/publish-price-book";
import type { AdminDirectory, PricingAdminIdentity } from "../application/authorize-pricing-admin";
import type { GoldenCaseDiff } from "../components/price-book-editor";

type Result = { data: unknown; error: unknown };
type QueryClient = {
  from(table: "admin_users"): { select(columns: string): { eq(column: string, value: string): Promise<Result> } };
  rpc(name: "load_price_book_review_dashboard" | "publish_price_book", args?: Record<string, unknown>): Promise<Result>;
};
const adminRow = z.object({ user_id: z.string().uuid(), email: z.string().email(), role: z.enum(["pricing-admin", "pricing-approver"]) }).strict();
const goldenCase = z.object({ code: z.string().min(1).max(80), currentTotal: z.number().finite().nonnegative(), candidateTotal: z.number().finite().nonnegative() }).strict();
const dashboard = z.object({ draft: PriceBookDraftSchema, goldenCases: z.array(goldenCase) }).strict();

export class SupabasePriceBookAdminRepository implements AdminDirectory, PriceBookPublishRepository {
  constructor(private readonly client: QueryClient) {}

  async findByEmail(email: string): Promise<PricingAdminIdentity | null> {
    const result = await this.client.from("admin_users").select("user_id,email,role").eq("email", email);
    const parsed = z.array(adminRow).safeParse(result.data);
    if (result.error || !parsed.success || parsed.data.length === 0) return null;
    const [first] = parsed.data;
    if (parsed.data.some((row) => row.user_id !== first.user_id || row.email !== first.email)) return null;
    const roles = [...new Set(parsed.data.map((row) => row.role))];
    return { userId: first.user_id, email: first.email, roles };
  }

  async loadReviewDashboard(): Promise<{ draft: z.infer<typeof PriceBookDraftSchema>; goldenCases: GoldenCaseDiff[] } | null> {
    const result = await this.client.rpc("load_price_book_review_dashboard");
    if (result.error) throw new Error("PRICE_BOOK_ADMIN_UNAVAILABLE");
    if (result.data === null) return null;
    const parsed = dashboard.safeParse(result.data);
    if (!parsed.success) throw new Error("PRICE_BOOK_ADMIN_UNAVAILABLE");
    return parsed.data;
  }

  async publish(input: { candidateId: string; version: string; actorUserId: string }) {
    const result = await this.client.rpc("publish_price_book", { p_candidate_id: input.candidateId, p_version: input.version, p_actor_user_id: input.actorUserId });
    const row = Array.isArray(result.data) && result.data.length === 1 && typeof result.data[0] === "object" && result.data[0] !== null ? result.data[0] as Record<string, unknown> : null;
    if (result.error || !row || (row.previous_status !== "retired" && row.previous_status !== "none") || row.published_status !== "published") throw new Error("PRICE_BOOK_PUBLISH_FAILED");
    return { previousStatus: row.previous_status, publishedStatus: row.published_status } as const;
  }
}

export function createSupabasePriceBookAdminRepositoryFromEnvironment() {
  const url = process.env.SUPABASE_URL; const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("PRICE_BOOK_ADMIN_UNAVAILABLE");
  return new SupabasePriceBookAdminRepository(createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } }) as unknown as QueryClient);
}
