import { expect, test, vi } from "vitest";
import { SupabasePrivateProjectRepository } from "./supabase-private-project-repository";

test("requests consultation through the service-only idempotent RPC without a direct project update", async () => {
  const rpc = vi.fn().mockResolvedValue({ data: [{ consultation_requested_at: "2026-08-10T00:00:00.000Z" }], error: null });
  const from = vi.fn();
  const repository = new SupabasePrivateProjectRepository({ from, rpc });

  await expect(repository.requestConsultation("11111111-1111-4111-8111-111111111111")).resolves.toEqual(new Date("2026-08-10T00:00:00.000Z"));
  expect(rpc).toHaveBeenCalledWith("request_consultation_once", { p_project_id: "11111111-1111-4111-8111-111111111111" });
  expect(from).not.toHaveBeenCalled();
});

test("fails closed when the consultation RPC does not return an existing timestamp", async () => {
  const repository = new SupabasePrivateProjectRepository({ from: vi.fn(), rpc: vi.fn().mockResolvedValue({ data: [], error: null }) });
  await expect(repository.requestConsultation("11111111-1111-4111-8111-111111111111")).rejects.toThrow("CONSULTATION_UNAVAILABLE");
});
