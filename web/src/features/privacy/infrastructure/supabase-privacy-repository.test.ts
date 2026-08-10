import { expect, test, vi } from "vitest";
import { SupabasePrivacyRepository } from "./supabase-privacy-repository";

const leadId = "11111111-1111-4111-8111-111111111111";

test("uses service-only RPCs for export, immediate deletion, and retention", async () => {
  const rpc = vi.fn().mockImplementation((name: string) => {
    if (name === "export_project_data") return Promise.resolve({ data: { contact: {}, consent: {}, configuration: {}, snapshot: {} }, error: null });
    return Promise.resolve({ data: [{ deleted_lead_id: leadId }], error: null });
  });
  const repository = new SupabasePrivacyRepository({ rpc });

  await expect(repository.exportByLeadId(leadId)).resolves.toEqual({ contact: {}, consent: {}, configuration: {}, snapshot: {} });
  await expect(repository.deleteByLeadId(leadId)).resolves.toEqual({ deletedLeadIds: [leadId] });
  await expect(repository.deleteOlderThan(new Date("2026-07-08T00:00:00.000Z"))).resolves.toEqual({ deletedLeadIds: [leadId] });
  expect(rpc).toHaveBeenCalledWith("delete_project_data", { p_lead_id: leadId });
  expect(rpc).toHaveBeenCalledWith("run_pii_retention", { p_cutoff: "2026-07-08T00:00:00.000Z" });
});

test("fails closed on malformed RPC output", async () => {
  const repository = new SupabasePrivacyRepository({ rpc: vi.fn().mockResolvedValue({ data: [{ deleted_lead_id: "not-a-uuid" }], error: null }) });
  await expect(repository.deleteByLeadId(leadId)).rejects.toThrow("PRIVACY_OPERATION_UNAVAILABLE");
});
