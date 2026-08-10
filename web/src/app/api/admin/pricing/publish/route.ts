import { createAuthenticatedSupabaseServerClient } from "@/lib/supabase/server-client";
import { resolvePricingAdmin, type PricingAdminIdentity } from "@/features/price-book-admin/application/authorize-pricing-admin";
import { publishPriceBook } from "@/features/price-book-admin/application/publish-price-book";
import { createSupabasePriceBookAdminRepositoryFromEnvironment } from "@/features/price-book-admin/infrastructure/supabase-price-book-admin-repository";

const MAX_BODY_BYTES = 64 * 1024;
type Dependencies = { authorize(request: Request): Promise<PricingAdminIdentity>; publish(draft: unknown, admin: PricingAdminIdentity): Promise<{ previousStatus: "retired" | "none"; publishedStatus: "published" }> };
const headers = { "cache-control": "no-store" };
const error = (status: number) => Response.json({ error: { code: "PRICE_BOOK_PUBLISH_FAILED" } }, { status, headers });

async function body(request: Request): Promise<unknown | Response> {
  if (request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !== "application/json") return error(415);
  const declared = Number(request.headers.get("content-length")); if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return error(413);
  const text = await request.text(); if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) return error(413);
  try { return JSON.parse(text); } catch { return error(400); }
}

export function createPublishPriceBookPostHandler({ authorize, publish }: Dependencies) {
  return async (request: Request): Promise<Response> => {
    if (request.headers.get("origin") !== new URL(request.url).origin) return error(403);
    const draft = await body(request); if (draft instanceof Response) return draft;
    let admin: PricingAdminIdentity;
    try { admin = await authorize(request); } catch { return error(403); }
    try { return Response.json(await publish(draft, admin), { headers }); } catch { return error(409); }
  };
}

export async function POST(request: Request) {
  try {
    const auth = await createAuthenticatedSupabaseServerClient(); const repository = createSupabasePriceBookAdminRepositoryFromEnvironment();
    return createPublishPriceBookPostHandler({ authorize: () => resolvePricingAdmin(auth.auth, repository), publish: (draft, admin) => publishPriceBook(draft, admin, repository) })(request);
  } catch { return error(503); }
}
