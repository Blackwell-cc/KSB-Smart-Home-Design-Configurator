import { LeadSubmissionSchema, type LeadSubmissionInput } from "@/features/leads/domain/lead";
import { createDeterministicAccessToken, ProjectAccessTokenSecretError, submitLead } from "@/features/leads/application/submit-lead";
import { createSupabaseLeadRepositoryFromEnvironment } from "@/features/leads/infrastructure/supabase-lead-repository";
import { createSupabasePriceBookRepositoryFromEnvironment } from "@/features/pricing/infrastructure/supabase-price-book-repository";

const MAX_BODY_BYTES = 32 * 1024;
type Submit = (input: LeadSubmissionInput) => Promise<{ leadId: string; projectId: string; reportUrl: string }>;

function errorResponse(status: number, code: "INVALID_JSON" | "INVALID_LEAD" | "LEAD_UNAVAILABLE" | "UNSUPPORTED_MEDIA_TYPE" | "PAYLOAD_TOO_LARGE") { return Response.json({ error: { code } }, { status }); }
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

export function createLeadPostHandler({ submit }: { submit: Submit }) {
  return async function POST(request: Request) {
    const parsedBody = await readJson(request); if (!parsedBody.ok) return parsedBody.response;
    const parsed = LeadSubmissionSchema.safeParse(parsedBody.body); if (!parsed.success) return errorResponse(400, "INVALID_LEAD");
    try { const result = await submit(parsed.data); return Response.json({ leadId: result.leadId, projectId: result.projectId, reportUrl: result.reportUrl }, { status: 201 }); }
    catch (error) { if (error instanceof ProjectAccessTokenSecretError) return errorResponse(503, "LEAD_UNAVAILABLE"); return errorResponse(503, "LEAD_UNAVAILABLE"); }
  };
}

const secret = process.env.PROJECT_ACCESS_TOKEN_SECRET ?? "";
export const POST = createLeadPostHandler({ submit: (input) => submitLead(input, { repository: createSupabaseLeadRepositoryFromEnvironment(), priceBookRepository: createSupabasePriceBookRepositoryFromEnvironment(), createAccessToken: (key) => createDeterministicAccessToken(key, secret), now: () => new Date() }) });
