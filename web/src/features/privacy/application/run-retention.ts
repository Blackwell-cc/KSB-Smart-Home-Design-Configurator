import type { PrivacyRepository } from "./privacy-repository";

export type RetentionConfiguration = { nodeEnv: string | undefined; retentionDays: string | undefined };
export function parseRetentionDays(configuration: RetentionConfiguration) {
  if (configuration.nodeEnv !== "production" && configuration.retentionDays === undefined) return 30;
  const days = Number(configuration.retentionDays);
  if (!Number.isSafeInteger(days) || days <= 0 || days > 3_650) throw new Error("PII_RETENTION_DAYS_INVALID");
  return days;
}
export function runRetention(now: Date, configuration: RetentionConfiguration, repository: PrivacyRepository) {
  if (!Number.isFinite(now.getTime())) throw new Error("INVALID_RETENTION_DATE");
  const days = parseRetentionDays(configuration); const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return repository.deleteOlderThan(cutoff);
}
