import { assertPrivacyOperator, validLeadId, type PrivacyOperator, type PrivacyRepository } from "./privacy-repository";

export function deleteProjectData(leadId: string, operator: PrivacyOperator, repository: PrivacyRepository) {
  assertPrivacyOperator(operator); return repository.deleteByLeadId(validLeadId(leadId));
}
