import { expect, test } from "vitest";
import { PROJECT_SESSION_COOKIE, ProjectSessionSecretError, createProjectSession, readProjectSession } from "./project-session";

const secret = "s".repeat(32);
const now = new Date("2026-08-10T00:00:00.000Z");

test("signs an opaque short-lived session and rejects a tampered signature", () => {
  const value = createProjectSession({ projectId: "11111111-1111-4111-8111-111111111111", tokenHash: "a".repeat(64), expiresAt: new Date("2026-08-10T00:15:00.000Z") }, secret);

  expect(PROJECT_SESSION_COOKIE).toBe("ksb_project_session");
  expect(readProjectSession(value, secret, now)).toMatchObject({ projectId: "11111111-1111-4111-8111-111111111111", tokenHash: "a".repeat(64) });
  expect(readProjectSession(`${value}x`, secret, now)).toBeNull();
});

test("fails closed for an expired session or weak secret", () => {
  const value = createProjectSession({ projectId: "11111111-1111-4111-8111-111111111111", tokenHash: "a".repeat(64), expiresAt: new Date("2026-08-09T23:59:00.000Z") }, secret);

  expect(readProjectSession(value, secret, now)).toBeNull();
  expect(() => createProjectSession({ projectId: "11111111-1111-4111-8111-111111111111", tokenHash: "a".repeat(64), expiresAt: new Date("2026-08-10T00:15:00.000Z") }, "weak")).toThrow(ProjectSessionSecretError);
});
