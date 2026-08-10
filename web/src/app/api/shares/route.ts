import { z } from "zod";
import { createPublicShare } from "@/features/sharing/application/create-public-share";
import type { PublicPreviewPayload } from "@/features/sharing/domain/public-preview";
import { createSupabasePublicShareRepositoryFromEnvironment } from "@/features/sharing/infrastructure/supabase-public-share-repository";
import { createSupabasePrivateProjectRepositoryFromEnvironment } from "@/features/project-access/infrastructure/supabase-private-project-repository";
import { PROJECT_SESSION_COOKIE, readProjectSession } from "@/features/project-access/domain/project-session";
import { resolvePrivateProjectSession } from "@/features/project-access/application/resolve-private-project";

const MAX_BODY_BYTES = 4_096;
const ShareRequestSchema = z.object({ projectId: z.string().uuid() }).strict();
type Dependencies = { authorizeAndLoad(request: Request, projectId: string): Promise<unknown>; createShare(source: unknown): Promise<PublicPreviewPayload> };
const noStore = { "cache-control": "no-store" };
const error = (status: number) => Response.json({ error: { code: "PUBLIC_SHARE_UNAVAILABLE" } }, { status, headers: noStore });

async function readBody(request: Request): Promise<unknown | Response> {
  if (request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !== "application/json") return error(415);
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return error(413);
  const text = await request.text(); if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) return error(413);
  try { return JSON.parse(text); } catch { return error(400); }
}

export function createSharePostHandler({ authorizeAndLoad, createShare }: Dependencies) {
  return async (request: Request): Promise<Response> => {
    if (request.headers.get("origin") !== new URL(request.url).origin) return error(403);
    const raw = await readBody(request); if (raw instanceof Response) return raw;
    const input = ShareRequestSchema.safeParse(raw); if (!input.success) return error(400);
    try {
      const source = await authorizeAndLoad(request, input.data.projectId);
      const share = await createShare(source);
      return Response.json({ slug: share.slug, shareUrl: `/share/${share.slug}` }, { status: 201, headers: noStore });
    } catch { return error(404); }
  };
}

function cookieValue(request: Request) {
  return request.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${PROJECT_SESSION_COOKIE}=([^;]+)`))?.[1];
}

export async function POST(request: Request) {
  try {
    const privateRepository = createSupabasePrivateProjectRepositoryFromEnvironment();
    const shareRepository = createSupabasePublicShareRepositoryFromEnvironment();
    return createSharePostHandler({
      authorizeAndLoad: async (current, projectId) => {
        const session = readProjectSession(cookieValue(current), process.env.PROJECT_SESSION_SECRET ?? "", new Date());
        const { project } = await resolvePrivateProjectSession(session, projectId, privateRepository, new Date());
        const snapshot = project.snapshot as Record<string, unknown>; const concept = snapshot.concept as Record<string, unknown>; const configuration = snapshot.configuration as Record<string, unknown>; const area = snapshot.area as Record<string, unknown>;
        return { id: project.id, conceptAssetId: concept?.id, styleLabel: concept?.label, floors: configuration?.floors, bedrooms: configuration?.bedrooms, bathrooms: configuration?.bathrooms, parkingSpaces: configuration?.parkingSpaces, usableAreaM2: area?.usableAreaM2 };
      },
      createShare: (source) => createPublicShare(source, shareRepository),
    })(request);
  } catch { return error(404); }
}
