import { expect, test, vi } from "vitest";
import { SupabaseAbandonmentRepository } from "./supabase-abandonment-repository";

test("maps abandonment lifecycle methods to service-only RPCs", async () => {
  const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
  const repository = new SupabaseAbandonmentRepository({ rpc }); const now = new Date("2026-08-07T12:00:00.000Z");
  await repository.start("session-1", now); await repository.markSubmitted("session-1", now); await repository.markAbandoned("session-2", now, "explicit-leave");
  rpc.mockResolvedValueOnce({ data: 4, error: null });
  await expect(repository.expireUnsubmittedBefore(new Date("2026-08-07T11:30:00.000Z"), now)).resolves.toBe(4);
  expect(rpc).toHaveBeenCalledWith("expire_lead_form_sessions", { p_cutoff: "2026-08-07T11:30:00.000Z", p_expired_at: now.toISOString() });
});

test("surfaces persistence errors without including session data", async () => {
  const repository = new SupabaseAbandonmentRepository({ rpc: vi.fn().mockResolvedValue({ data: null, error: { message: "db" } }) });
  await expect(repository.start("session-secret", new Date())).rejects.toThrow("ABANDONMENT_TRACKING_UNAVAILABLE");
});
