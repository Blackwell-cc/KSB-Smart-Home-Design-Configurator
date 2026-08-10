import { z } from "zod";
import { createProjectSession, PROJECT_SESSION_COOKIE } from "@/features/project-access/domain/project-session";
import { resolvePrivateProject, type ResolvedPrivateProject } from "@/features/project-access/application/resolve-private-project";
import { createSupabasePrivateProjectRepositoryFromEnvironment } from "@/features/project-access/infrastructure/supabase-private-project-repository";

const MAX_BODY_BYTES = 4 * 1024;
const ExchangeSchema = z.object({ projectId: z.uuid(), token: z.string().min(24).max(512) }).strict();
const noStore = { "cache-control": "no-store" };
type HandlerDependencies = { resolve: (input: z.infer<typeof ExchangeSchema>) => Promise<Pick<ResolvedPrivateProject, "access">>; secret: string; now: () => Date };
const error = (status: number, code: "UNSUPPORTED_MEDIA_TYPE" | "PAYLOAD_TOO_LARGE" | "INVALID_JSON" | "PROJECT_LINK_INVALID") => Response.json({ error: { code } }, { status, headers: noStore });

async function readJson(request: Request): Promise<unknown | Response> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type")?.trim() ?? "")) return error(415, "UNSUPPORTED_MEDIA_TYPE");
  const length = Number(request.headers.get("content-length")); if (Number.isFinite(length) && length > MAX_BODY_BYTES) return error(413, "PAYLOAD_TOO_LARGE");
  try { const text = await request.text(); if (Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) return error(413, "PAYLOAD_TOO_LARGE"); return JSON.parse(text); } catch { return error(400, "INVALID_JSON"); }
}
export function createPrivateAccessExchangeHandler({ resolve, secret, now }: HandlerDependencies) {
  return async (request: Request): Promise<Response> => {
    const raw = await readJson(request); if (raw instanceof Response) return raw;
    const input = ExchangeSchema.safeParse(raw); if (!input.success) return error(400, "PROJECT_LINK_INVALID");
    try {
      const { access } = await resolve(input.data); const expiresAt = new Date(Math.min(access.expiresAt.getTime(), now().getTime() + 15 * 60 * 1000));
      const response = Response.json({ projectId: access.projectId }, { headers: noStore });
      const value = createProjectSession({ projectId: access.projectId, tokenHash: access.tokenHash, expiresAt }, secret);
      response.headers.append("set-cookie", `${PROJECT_SESSION_COOKIE}=${value}; HttpOnly; Path=/; Secure; SameSite=Strict; Max-Age=${Math.max(0, Math.floor((expiresAt.getTime() - now().getTime()) / 1000))}`);
      return response;
    } catch { return error(404, "PROJECT_LINK_INVALID"); }
  };
}
export async function POST(request: Request) {
  try { const repository = createSupabasePrivateProjectRepositoryFromEnvironment(); return createPrivateAccessExchangeHandler({ resolve: (input) => resolvePrivateProject(input, repository, new Date()), secret: process.env.PROJECT_SESSION_SECRET ?? "", now: () => new Date() })(request); } catch { return error(503, "PROJECT_LINK_INVALID"); }
}
