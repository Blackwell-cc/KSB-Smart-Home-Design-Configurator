import { createSupabasePrivateProjectRepositoryFromEnvironment } from "@/features/project-access/infrastructure/supabase-private-project-repository";
import { readProjectSession, PROJECT_SESSION_COOKIE } from "@/features/project-access/domain/project-session";
import { resolvePrivateProjectSession } from "@/features/project-access/application/resolve-private-project";

type Context = { params: Promise<{ projectId: string }> };
type Dependencies = { authorize: (request: Request, projectId: string) => Promise<void>; requestConsultation: (projectId: string) => Promise<Date> };
const noStore = { "cache-control": "no-store" };
const invalid = () => Response.json({ error: { code: "PROJECT_LINK_INVALID" } }, { status: 404, headers: noStore });
function sameOrigin(request: Request) { const origin = request.headers.get("origin"); return !origin || origin === new URL(request.url).origin; }
export function createConsultationPostHandler({ authorize, requestConsultation }: Dependencies) {
  return async (request: Request, context: Context): Promise<Response> => {
    const { projectId } = await context.params; if (!sameOrigin(request)) return invalid();
    try { await authorize(request, projectId); const consultationRequestedAt = await requestConsultation(projectId); return Response.json({ consultationRequestedAt: consultationRequestedAt.toISOString() }, { headers: noStore }); } catch { return invalid(); }
  };
}
export async function POST(request: Request, context: Context) {
  try {
    const repository = createSupabasePrivateProjectRepositoryFromEnvironment();
    return createConsultationPostHandler({ authorize: async (current, projectId) => { const session = readProjectSession(current.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${PROJECT_SESSION_COOKIE}=([^;]+)`))?.[1], process.env.PROJECT_SESSION_SECRET ?? "", new Date()); await resolvePrivateProjectSession(session, projectId, repository, new Date()); }, requestConsultation: (projectId) => repository.requestConsultation(projectId) })(request, context);
  } catch { return invalid(); }
}
