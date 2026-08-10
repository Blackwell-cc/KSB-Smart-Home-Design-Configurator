import { assertPrivacyOperator, PrivacyOperationError, validLeadId, type PrivacyOperator, type PrivacyRepository } from "./privacy-repository";

export async function exportProjectData(leadId: string, operator: PrivacyOperator, repository: PrivacyRepository) {
  assertPrivacyOperator(operator); const data = await repository.exportByLeadId(validLeadId(leadId));
  if (data === null) throw new PrivacyOperationError("PRIVACY_DATA_NOT_FOUND");
  return data;
}
