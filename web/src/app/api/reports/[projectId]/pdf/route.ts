import { renderProjectReportPdf } from "@/features/reports/pdf/project-report-document";
import { buildFullReport, type FullReportViewModel } from "@/features/reports/application/build-full-report";
import { createRuntimePrivateProjectRepository, runtimeProjectSessionSecret } from "@/features/project-access/infrastructure/runtime-project-repository";
import { readProjectSession, PROJECT_SESSION_COOKIE } from "@/features/project-access/domain/project-session";
import { resolvePrivateProjectSession } from "@/features/project-access/application/resolve-private-project";

type Context = { params: Promise<{ projectId: string }> };
type Authorized = { project: { id: string; targetBudget: { min: number; max: number } | null; snapshot: unknown } };
type Dependencies = { authorize: (request: Request, projectId: string) => Promise<Authorized>; buildReport: (project: Authorized["project"], snapshot: unknown) => FullReportViewModel; renderPdf: (report: FullReportViewModel) => Promise<Uint8Array> };
const noStore = { "cache-control": "no-store" };
const invalid = () => Response.json({ error: { code: "PROJECT_LINK_INVALID" } }, { status: 404, headers: noStore });
const generationFailed = (error: unknown) => Response.json({ error: {
  code: "PDF_GENERATION_FAILED",
  ...(process.env.NODE_ENV === "production" ? {} : { detail: error instanceof Error ? error.message : String(error) }),
} }, { status: 500, headers: noStore });
export function createProjectPdfHandler({ authorize, buildReport, renderPdf }: Dependencies) {
  return async (request: Request, context: Context): Promise<Response> => {
    const { projectId } = await context.params;
    let project: Authorized["project"];
    try {
      ({ project } = await authorize(request, projectId));
    } catch {
      return invalid();
    }
    try {
      const report = buildReport(project, project.snapshot);
      const pdf = await renderPdf(report);
      const bytes = Uint8Array.from(pdf);
      return new Response(bytes, { headers: { ...noStore, "content-length": String(bytes.byteLength), "content-type": "application/pdf", "content-disposition": "attachment; filename=\"ksb-project-report.pdf\"" } });
    } catch (error) {
      console.error("PDF_GENERATION_FAILED", error);
      return generationFailed(error);
    }
  };
}
export async function GET(request: Request, context: Context) {
  try {
    const repository = createRuntimePrivateProjectRepository();
    return createProjectPdfHandler({ authorize: async (current, projectId) => { const session = readProjectSession(current.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${PROJECT_SESSION_COOKIE}=([^;]+)`))?.[1], runtimeProjectSessionSecret(), new Date()); return resolvePrivateProjectSession(session, projectId, repository, new Date()); }, buildReport: buildFullReport, renderPdf: renderProjectReportPdf })(request, context);
  } catch { return invalid(); }
}
