import { createHash } from "node:crypto";
import type { ProjectSession } from "../domain/project-session";

export type ActiveProjectAccess = { projectId: string; tokenHash: string; expiresAt: Date; revokedAt: Date | null };
export type PrivateProjectRecord = { id: string; targetBudget: { min: number; max: number } | null; snapshot: unknown };
export type PrivateProjectRepository = {
  findAccessByTokenHash(tokenHash: string): Promise<ActiveProjectAccess | null>;
  loadProject(projectId: string): Promise<PrivateProjectRecord | null>;
  requestConsultation?(projectId: string): Promise<Date>;
};
export type ResolvedPrivateProject = { project: PrivateProjectRecord; access: ActiveProjectAccess };

export class PrivateProjectAccessError extends Error {
  readonly code = "PROJECT_LINK_INVALID";
  constructor() { super("PROJECT_LINK_INVALID"); }
}

function isProjectId(value: string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }
function hashToken(token: string) { return createHash("sha256").update(token).digest("hex"); }

async function resolve(projectId: string, tokenHash: string, repository: PrivateProjectRepository, now: Date): Promise<ResolvedPrivateProject> {
  if (!isProjectId(projectId) || !/^[0-9a-f]{64}$/i.test(tokenHash)) throw new PrivateProjectAccessError();
  const access = await repository.findAccessByTokenHash(tokenHash.toLowerCase());
  if (!access || access.projectId !== projectId || access.revokedAt !== null || access.expiresAt.getTime() <= now.getTime()) throw new PrivateProjectAccessError();
  const project = await repository.loadProject(projectId);
  if (!project || project.id !== projectId) throw new PrivateProjectAccessError();
  return { project, access };
}

export async function resolvePrivateProject(input: { projectId: string; token: string }, repository: PrivateProjectRepository, now: Date): Promise<ResolvedPrivateProject> {
  if (typeof input.token !== "string" || input.token.length < 24 || input.token.length > 512) throw new PrivateProjectAccessError();
  return resolve(input.projectId, hashToken(input.token), repository, now);
}

export async function resolvePrivateProjectSession(session: ProjectSession | null, expectedProjectId: string, repository: PrivateProjectRepository, now: Date): Promise<ResolvedPrivateProject> {
  if (!session || session.projectId !== expectedProjectId || session.expiresAt.getTime() <= now.getTime()) throw new PrivateProjectAccessError();
  return resolve(expectedProjectId, session.tokenHash, repository, now);
}
