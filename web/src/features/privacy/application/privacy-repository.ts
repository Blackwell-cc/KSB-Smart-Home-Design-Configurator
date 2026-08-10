export type PrivacyOperator = { userId: string; roles: readonly string[] };
export type PrivacyRepository = {
  exportByLeadId(leadId: string): Promise<unknown | null>;
  deleteByLeadId(leadId: string): Promise<{ deletedLeadIds: string[] }>;
  deleteOlderThan(cutoff: Date): Promise<{ deletedLeadIds: string[] }>;
};
export class PrivacyOperationError extends Error {
  constructor(readonly code: "PRIVACY_OPERATION_FORBIDDEN" | "PRIVACY_DATA_NOT_FOUND") { super(code); }
}
export function assertPrivacyOperator(operator: PrivacyOperator) { if (!operator.roles.includes("privacy-operator")) throw new PrivacyOperationError("PRIVACY_OPERATION_FORBIDDEN"); }
export function validLeadId(leadId: string) { if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(leadId)) throw new PrivacyOperationError("PRIVACY_DATA_NOT_FOUND"); return leadId; }
