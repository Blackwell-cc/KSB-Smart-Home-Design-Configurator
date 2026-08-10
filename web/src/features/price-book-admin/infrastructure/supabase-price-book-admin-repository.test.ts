import { expect, test, vi } from "vitest";
import { SupabasePriceBookAdminRepository } from "./supabase-price-book-admin-repository";

const draft = { candidateId: "11111111-1111-4111-8111-111111111111", version: "TH-2026Q3-1.0", referenceDate: "2026-08-01", provinceEntries: [], materialLevels: [], specialFeatures: [], featureAllowances: {}, goldenCasesPassed: false, approvedBy: null, approvedAt: null, sources: [] };

test("reads all roles for the verified email and never queries by client-supplied role", async () => {
  const eq = vi.fn().mockResolvedValue({ data: [{ user_id: "11111111-1111-4111-8111-111111111111", email: "admin@ksb.test", role: "pricing-admin" }, { user_id: "11111111-1111-4111-8111-111111111111", email: "admin@ksb.test", role: "pricing-approver" }], error: null });
  const select = vi.fn(() => ({ eq })); const from = vi.fn(() => ({ select }));
  const repository = new SupabasePriceBookAdminRepository({ from, rpc: vi.fn() });

  await expect(repository.findByEmail("admin@ksb.test")).resolves.toEqual({ userId: "11111111-1111-4111-8111-111111111111", email: "admin@ksb.test", roles: ["pricing-admin", "pricing-approver"] });
  expect(eq).toHaveBeenCalledWith("email", "admin@ksb.test");
});

test("loads strict review dashboard data and publishes only through the atomic RPC", async () => {
  const rpc = vi.fn().mockImplementation((name: string) => name === "load_price_book_review_dashboard"
    ? Promise.resolve({ data: { draft, goldenCases: [{ code: "KSB-01", currentTotal: 5_000_000, candidateTotal: 5_500_000 }] }, error: null })
    : Promise.resolve({ data: [{ previous_status: "retired", published_status: "published" }], error: null }));
  const repository = new SupabasePriceBookAdminRepository({ from: vi.fn(), rpc });

  await expect(repository.loadReviewDashboard()).resolves.toEqual({ draft, goldenCases: [{ code: "KSB-01", currentTotal: 5_000_000, candidateTotal: 5_500_000 }] });
  await expect(repository.publish({ candidateId: draft.candidateId, version: draft.version, actorUserId: "22222222-2222-4222-8222-222222222222" })).resolves.toEqual({ previousStatus: "retired", publishedStatus: "published" });
  expect(rpc).toHaveBeenCalledWith("publish_price_book", { p_candidate_id: draft.candidateId, p_version: draft.version, p_actor_user_id: "22222222-2222-4222-8222-222222222222" });
});

test("fails closed on malformed review evidence or RPC responses", async () => {
  const malformed = new SupabasePriceBookAdminRepository({ from: vi.fn(), rpc: vi.fn().mockResolvedValue({ data: { draft: { ...draft, privateNotes: "leak" }, goldenCases: [] }, error: null }) });
  await expect(malformed.loadReviewDashboard()).rejects.toThrow("PRICE_BOOK_ADMIN_UNAVAILABLE");
});
