import { LeadSubmissionSchema, type LeadSubmissionInput } from "@/features/leads/domain/lead";
import { createDeterministicAccessToken, ProjectAccessTokenSecretError, submitLead } from "@/features/leads/application/submit-lead";
import { createRuntimePriceBookRepository } from "@/features/pricing/infrastructure/development-price-book-repository";
import { createRuntimeLeadRepository, runtimeProjectAccessTokenSecret } from "@/features/project-access/infrastructure/runtime-project-repository";
import { createWebhookLeadNotifierFromEnvironment } from "@/features/leads/infrastructure/webhook-lead-notifier";
import { createFixedWindowRateLimiter, fingerprintRequest, type RateLimitDecision } from "@/lib/api/rate-limit";

const MAX_BODY_BYTES = 32 * 1024;
type Submit = (input: LeadSubmissionInput) => Promise<{ leadId: string; projectId: string; reportUrl: string }>;
type LeadRateLimit = (request: Request) => RateLimitDecision;

const noStore = { "cache-control": "no-store" };
function errorResponse(status: number, code: "INVALID_JSON" | "INVALID_LEAD" | "LEAD_UNAVAILABLE" | "UNSUPPORTED_MEDIA_TYPE" | "PAYLOAD_TOO_LARGE" | "RATE_LIMITED", headers: HeadersInit = {}) { return Response.json({ error: { code } }, { status, headers: { ...noStore, ...headers } }); }
async function readJson(request: Request): Promise<{ ok: true; body: unknown } | { ok: false; response: Response }> {
  const contentType = request.headers.get("content-type");
  if (!contentType || !/^application\/json(?:\s*;|$)/i.test(contentType.trim())) return { ok: false, response: errorResponse(415, "UNSUPPORTED_MEDIA_TYPE") };
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > MAX_BODY_BYTES) return { ok: false, response: errorResponse(413, "PAYLOAD_TOO_LARGE") };
  if (!request.body) return { ok: false, response: errorResponse(400, "INVALID_JSON") };
  const reader = request.body.getReader(); const parts: Uint8Array[] = []; let total = 0;
  try {
    while (true) { const { done, value } = await reader.read(); if (done) break; total += value.byteLength; if (total > MAX_BODY_BYTES) { await reader.cancel(); return { ok: false, response: errorResponse(413, "PAYLOAD_TOO_LARGE") }; } parts.push(value); }
    return { ok: true, body: JSON.parse(new TextDecoder().decode(Buffer.concat(parts))) };
  } catch { return { ok: false, response: errorResponse(400, "INVALID_JSON") }; }
}

export function createLeadPostHandler({ submit, rateLimit }: { submit: Submit; rateLimit?: LeadRateLimit }) {
  return async function POST(request: Request) {
    const decision = rateLimit?.(request);
    if (decision && !decision.allowed) return errorResponse(429, "RATE_LIMITED", { "retry-after": decision.retryAfterSeconds.toString() });
    const parsedBody = await readJson(request); if (!parsedBody.ok) return parsedBody.response;
    const parsed = LeadSubmissionSchema.safeParse(parsedBody.body); if (!parsed.success) return errorResponse(400, "INVALID_LEAD");
    try { const result = await submit(parsed.data); return Response.json({ leadId: result.leadId, projectId: result.projectId, reportUrl: result.reportUrl }, { status: 201, headers: noStore }); }
    catch (error) { if (error instanceof ProjectAccessTokenSecretError) return errorResponse(503, "LEAD_UNAVAILABLE"); return errorResponse(503, "LEAD_UNAVAILABLE"); }
  };
}

const secret = runtimeProjectAccessTokenSecret();
const leadRateLimiter = createFixedWindowRateLimiter({ limit: 5, windowMs: 10 * 60 * 1_000 });
function optionalNotifier() { try { return createWebhookLeadNotifierFromEnvironment(); } catch { return undefined; } }
export const POST = createLeadPostHandler({
  rateLimit: (request) => leadRateLimiter.consume(`lead:${fingerprintRequest(request, process.env.RATE_LIMIT_SECRET ?? secret)}`),
  submit: (input) => submitLead(input, { repository: createRuntimeLeadRepository(), priceBookRepository: createRuntimePriceBookRepository(), createAccessToken: (key) => createDeterministicAccessToken(key, secret), now: () => new Date(), notifier: optionalNotifier() }),
});
