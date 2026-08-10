import { cookies } from "next/headers";
import { PrivateReportClient } from "@/features/reports/components/private-report-client";
import { buildFullReport } from "@/features/reports/application/build-full-report";
import { createSupabasePrivateProjectRepositoryFromEnvironment } from "@/features/project-access/infrastructure/supabase-private-project-repository";
import { readProjectSession, PROJECT_SESSION_COOKIE } from "@/features/project-access/domain/project-session";
import { resolvePrivateProjectSession } from "@/features/project-access/application/resolve-private-project";

export const dynamic = "force-dynamic";
export default async function PrivateReportPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  let report;
  try {
    const repository = createSupabasePrivateProjectRepositoryFromEnvironment(); const store = await cookies();
    const session = readProjectSession(store.get(PROJECT_SESSION_COOKIE)?.value, process.env.PROJECT_SESSION_SECRET ?? "", new Date());
    const { project } = await resolvePrivateProjectSession(session, projectId, repository, new Date());
    report = buildFullReport({ id: project.id, targetBudget: project.targetBudget }, project.snapshot);
  } catch { return <main><h1>ไม่สามารถเปิดสรุปโครงการนี้ได้</h1><p>ลิงก์นี้ไม่พร้อมใช้งาน กรุณาติดต่อ KSB Architect เพื่อขอความช่วยเหลือ</p></main>; }
  return <PrivateReportClient report={report} />;
}
