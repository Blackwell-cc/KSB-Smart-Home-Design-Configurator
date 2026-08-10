import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { ProjectReportDocument } from "@/features/reports/pdf/project-report-document";
import { buildFullReport, type FullReportViewModel } from "@/features/reports/application/build-full-report";
import { createSupabasePrivateProjectRepositoryFromEnvironment } from "@/features/project-access/infrastructure/supabase-private-project-repository";
import { readProjectSession, PROJECT_SESSION_COOKIE } from "@/features/project-access/domain/project-session";
import { resolvePrivateProjectSession } from "@/features/project-access/application/resolve-private-project";

type Context = { params: Promise<{ projectId: string }> };
type Authorized = { project: { id: string; targetBudget: { min: number; max: number } | null; snapshot: unknown } };
type Dependencies = { authorize: (request: Request, projectId: string) => Promise<Authorized>; buildReport: (project: Authorized["project"], snapshot: unknown) => FullReportViewModel; renderPdf: (report: FullReportViewModel) => Promise<Uint8Array> };
const noStore = { "cache-control": "no-store" };
const invalid = () => Response.json({ error: { code: "PROJECT_LINK_INVALID" } }, { status: 404, headers: noStore });
export function createProjectPdfHandler({ authorize, buildReport, renderPdf }: Dependencies) {
  return async (request: Request, context: Context): Promise<Response> => {
    const { projectId } = await context.params;
    try { const { project } = await authorize(request, projectId); const report = buildReport(project, project.snapshot); const pdf = await renderPdf(report); const bytes = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer; return new Response(bytes, { headers: { ...noStore, "content-type": "application/pdf", "content-disposition": "attachment; filename=\"ksb-project-report.pdf\"" } }); } catch { return invalid(); }
  };
}
export async function GET(request: Request, context: Context) {
  try {
    const repository = createSupabasePrivateProjectRepositoryFromEnvironment();
    return createProjectPdfHandler({ authorize: async (current, projectId) => { const session = readProjectSession(current.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${PROJECT_SESSION_COOKIE}=([^;]+)`))?.[1], process.env.PROJECT_SESSION_SECRET ?? "", new Date()); return resolvePrivateProjectSession(session, projectId, repository, new Date()); }, buildReport: buildFullReport, renderPdf: async (report) => renderToBuffer(createElement(ProjectReportDocument, { report }) as never) })(request, context);
  } catch { return invalid(); }
}
