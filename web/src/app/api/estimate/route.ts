import { estimateProject, type PriceBookRepository } from "@/features/pricing/application/estimate-project";
import { EstimateRequestSchema } from "@/features/pricing/application/estimate-request";
import { createSupabasePriceBookRepositoryFromEnvironment } from "@/features/pricing/infrastructure/supabase-price-book-repository";

type EstimateHandlerDependencies = { priceBookRepository: PriceBookRepository };

const MAX_BODY_BYTES = 32 * 1024;
const noStore = { "cache-control": "no-store" };

function errorResponse(status: number, code: "INVALID_JSON" | "INVALID_CONFIGURATION" | "ESTIMATE_UNAVAILABLE" | "UNSUPPORTED_MEDIA_TYPE" | "PAYLOAD_TOO_LARGE") {
  return Response.json({ error: { code } }, { status, headers: noStore });
}

async function readJson(request: Request): Promise<{ ok: true; body: unknown } | { ok: false; response: Response }> {
  const contentType = request.headers.get("content-type");
  if (!contentType || !/^application\/json(?:\s*;|$)/i.test(contentType.trim())) return { ok: false, response: errorResponse(415, "UNSUPPORTED_MEDIA_TYPE") };
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) return { ok: false, response: errorResponse(413, "PAYLOAD_TOO_LARGE") };
  if (!request.body) return { ok: false, response: errorResponse(400, "INVALID_JSON") };
  const reader = request.body.getReader(); const chunks: Uint8Array[] = []; let total = 0;
  try {
    while (true) { const { done, value } = await reader.read(); if (done) break; total += value.byteLength; if (total > MAX_BODY_BYTES) { await reader.cancel(); return { ok: false, response: errorResponse(413, "PAYLOAD_TOO_LARGE") }; } chunks.push(value); }
    const text = new TextDecoder().decode(Buffer.concat(chunks));
    return { ok: true, body: JSON.parse(text) };
  } catch { return { ok: false, response: errorResponse(400, "INVALID_JSON") }; }
}

export function createEstimatePostHandler({ priceBookRepository }: EstimateHandlerDependencies) {
  return async function postEstimate(request: Request): Promise<Response> {
    const json = await readJson(request);
    if (!json.ok) return json.response;
    const configuration = EstimateRequestSchema.safeParse(json.body);
    if (!configuration.success) return errorResponse(400, "INVALID_CONFIGURATION");

    try {
      const preview = await estimateProject(configuration.data, priceBookRepository);
      return Response.json({ preview }, { headers: noStore });
    } catch (error) {
      if (error instanceof Error && error.message === "CONFIGURATION_NOT_READY") {
        return errorResponse(400, "INVALID_CONFIGURATION");
      }
      return errorResponse(503, "ESTIMATE_UNAVAILABLE");
    }
  };
}

export async function POST(request: Request): Promise<Response> {
  try {
    return await createEstimatePostHandler({
      priceBookRepository: createSupabasePriceBookRepositoryFromEnvironment(),
    })(request);
  } catch {
    return errorResponse(503, "ESTIMATE_UNAVAILABLE");
  }
}
