import { createHmac, timingSafeEqual } from "node:crypto";

export const PROJECT_SESSION_COOKIE = "ksb_project_session";
export const PROJECT_SESSION_MAX_AGE_SECONDS = 15 * 60;
export const PROJECT_SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  path: "/",
};

export type ProjectSession = { projectId: string; tokenHash: string; expiresAt: Date };

export class ProjectSessionSecretError extends Error {
  constructor() { super("PROJECT_SESSION_SECRET_UNAVAILABLE"); }
}

function assertSecret(secret: string) {
  if (Buffer.byteLength(secret, "utf8") < 32) throw new ProjectSessionSecretError();
}

function signature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeSignatureEqual(left: string, right: string) {
  const leftBytes = Buffer.from(left); const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

export function createProjectSession(session: ProjectSession, secret: string) {
  assertSecret(secret);
  if (!/^[0-9a-f]{64}$/i.test(session.tokenHash) || !Number.isFinite(session.expiresAt.getTime())) throw new Error("INVALID_PROJECT_SESSION");
  const payload = Buffer.from(JSON.stringify({ projectId: session.projectId, tokenHash: session.tokenHash.toLowerCase(), exp: session.expiresAt.getTime() })).toString("base64url");
  return `${payload}.${signature(payload, secret)}`;
}

export function readProjectSession(value: string | undefined, secret: string, now: Date): ProjectSession | null {
  try {
    assertSecret(secret);
    if (!value) return null;
    const [payload, providedSignature, ...rest] = value.split(".");
    if (!payload || !providedSignature || rest.length > 0 || !safeSignatureEqual(providedSignature, signature(payload, secret))) return null;
    const decoded: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!decoded || typeof decoded !== "object") return null;
    const { projectId, tokenHash, exp } = decoded as Record<string, unknown>;
    if (typeof projectId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(projectId) || typeof tokenHash !== "string" || !/^[0-9a-f]{64}$/i.test(tokenHash) || typeof exp !== "number" || !Number.isFinite(exp) || exp <= now.getTime()) return null;
    return { projectId, tokenHash: tokenHash.toLowerCase(), expiresAt: new Date(exp) };
  } catch {
    return null;
  }
}
