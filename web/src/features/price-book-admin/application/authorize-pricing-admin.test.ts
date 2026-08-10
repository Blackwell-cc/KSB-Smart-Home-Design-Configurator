import { expect, test, vi } from "vitest";
import { resolvePricingAdmin } from "./authorize-pricing-admin";

test("accepts only verified Supabase users listed in the server-side admin directory", async () => {
  const getUser = vi.fn().mockResolvedValue({ data: { user: { id: "11111111-1111-4111-8111-111111111111", email: "admin@ksb.test" } }, error: null });
  const findByEmail = vi.fn().mockResolvedValue({ userId: "11111111-1111-4111-8111-111111111111", email: "admin@ksb.test", roles: ["pricing-admin"] });

  await expect(resolvePricingAdmin({ getUser }, { findByEmail })).resolves.toEqual({ userId: "11111111-1111-4111-8111-111111111111", email: "admin@ksb.test", roles: ["pricing-admin"] });
  expect(findByEmail).toHaveBeenCalledWith("admin@ksb.test");
});

test("fails closed for missing auth, unlisted email, or mismatched user identity", async () => {
  await expect(resolvePricingAdmin({ getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) }, { findByEmail: vi.fn() })).rejects.toMatchObject({ code: "PRICING_ADMIN_FORBIDDEN" });
  await expect(resolvePricingAdmin({ getUser: vi.fn().mockResolvedValue({ data: { user: { id: "11111111-1111-4111-8111-111111111111", email: "admin@ksb.test" } }, error: null }) }, { findByEmail: vi.fn().mockResolvedValue({ userId: "22222222-2222-4222-8222-222222222222", email: "admin@ksb.test", roles: ["pricing-admin"] }) })).rejects.toMatchObject({ code: "PRICING_ADMIN_FORBIDDEN" });
});
