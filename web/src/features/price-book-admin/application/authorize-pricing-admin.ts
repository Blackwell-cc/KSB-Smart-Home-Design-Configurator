export type PricingAdminIdentity = { userId: string; email: string; roles: readonly ("pricing-admin" | "pricing-approver")[] };
type AuthClient = { getUser(): Promise<{ data: { user: { id: string; email?: string } | null }; error: unknown }> };
export type AdminDirectory = { findByEmail(email: string): Promise<PricingAdminIdentity | null> };

export class PricingAdminAccessError extends Error {
  readonly code = "PRICING_ADMIN_FORBIDDEN";
  constructor() { super("PRICING_ADMIN_FORBIDDEN"); }
}

export async function resolvePricingAdmin(auth: AuthClient, directory: AdminDirectory): Promise<PricingAdminIdentity> {
  const result = await auth.getUser(); const user = result.data.user; const email = user?.email?.trim().toLowerCase();
  if (result.error || !user || !email) throw new PricingAdminAccessError();
  const admin = await directory.findByEmail(email);
  if (!admin || admin.userId !== user.id || admin.email.toLowerCase() !== email || admin.roles.length === 0 || admin.roles.some((role) => role !== "pricing-admin" && role !== "pricing-approver")) throw new PricingAdminAccessError();
  return Object.freeze({ ...admin, roles: Object.freeze([...admin.roles]) });
}
