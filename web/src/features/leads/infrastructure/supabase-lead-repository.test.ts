import { expect, test, vi } from "vitest";
import { SupabaseLeadRepository } from "./supabase-lead-repository";

test("calls the lead RPC without caller-controlled price metadata", async () => {
  const rpc = vi.fn().mockResolvedValue({ data: [{ lead_id: "lead", project_id: "project" }], error: null });
  const repository = new SupabaseLeadRepository({ rpc });
  await expect(repository.submitOnce({ configurationId: "configuration", configuration: {}, calculationSnapshot: { pricingVersion: "v1", referenceDate: "2026-08-07" }, priceBookId: "book", idempotencyKey: "key", name: "Name", preferredContactMethod: "phone", phone: "0812345678", email: "owner@example.test", lineId: "owner.line", requestPurpose: "planning_to_build", consentVersion: "project-contact-v1", tokenHash: "a".repeat(64), expiresAt: "2026-09-06T00:00:00.000Z" })).resolves.toEqual({ leadId: "lead", projectId: "project" });
  const args = rpc.mock.calls[0]?.[1] as Record<string, unknown>;
  expect(args).toMatchObject({ p_price_book_id: "book", p_snapshot: { pricingVersion: "v1", referenceDate: "2026-08-07" }, p_phone: "0812345678", p_email: "owner@example.test", p_line_id: "owner.line", p_request_purpose: "planning_to_build" });
  expect(args).not.toHaveProperty("p_pricing_version");
  expect(args).not.toHaveProperty("p_reference_date");
});
