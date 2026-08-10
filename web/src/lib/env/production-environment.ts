type RuntimeEnvironment = Record<string, string | undefined>;

function invalid(): never {
  throw new Error("PRODUCTION_ENVIRONMENT_INVALID");
}

function requireText(environment: RuntimeEnvironment, key: string, minimumBytes = 1): string {
  const value = environment[key];
  if (!value || value.trim() !== value || Buffer.byteLength(value, "utf8") < minimumBytes) invalid();
  return value;
}

function requireHttpsUrl(environment: RuntimeEnvironment, key: string, allowPath: boolean): string {
  const value = requireText(environment, key);
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.hash) invalid();
    if (!allowPath && (url.pathname !== "/" || url.search)) invalid();
  } catch {
    invalid();
  }
  return value;
}

export function assertProductionEnvironment(environment: RuntimeEnvironment): void {
  if (environment.NODE_ENV !== "production") return;

  requireHttpsUrl(environment, "SUPABASE_URL", false);
  requireText(environment, "SUPABASE_SERVICE_ROLE_KEY", 32);
  requireText(environment, "SUPABASE_ANON_KEY", 20);
  const accessSecret = requireText(environment, "PROJECT_ACCESS_TOKEN_SECRET", 32);
  const sessionSecret = requireText(environment, "PROJECT_SESSION_SECRET", 32);
  const rateLimitSecret = requireText(environment, "RATE_LIMIT_SECRET", 32);
  requireHttpsUrl(environment, "LEAD_WEBHOOK_URL", true);

  if (new Set([accessSecret, sessionSecret, rateLimitSecret]).size !== 3) invalid();
  const retentionDays = Number(environment.PII_RETENTION_DAYS);
  if (!Number.isSafeInteger(retentionDays) || retentionDays <= 0 || retentionDays > 3_650) invalid();
}
