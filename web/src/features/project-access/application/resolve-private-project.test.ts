import { expect, test } from "vitest";
import { createHash } from "node:crypto";
import { resolvePrivateProject, PrivateProjectAccessError } from "./resolve-private-project";

const now = new Date("2026-08-10T00:00:00.000Z");
const token = "x".repeat(24);
const hash = createHash("sha256").update(token).digest("hex");
const repository = { findAccessByTokenHash: async () => ({ projectId: "11111111-1111-4111-8111-111111111111", tokenHash: hash, expiresAt: new Date("2026-08-10T01:00:00.000Z"), revokedAt: null }), loadProject: async () => ({ id: "11111111-1111-4111-8111-111111111111", targetBudget: null, snapshot: { id: "snapshot" } }) };

test("resolves only an active hash that belongs to the presented project", async () => {
  await expect(resolvePrivateProject({ projectId: "11111111-1111-4111-8111-111111111111", token }, repository, now)).resolves.toMatchObject({ project: { id: "11111111-1111-4111-8111-111111111111" }, access: { tokenHash: hash } });
  await expect(resolvePrivateProject({ projectId: "22222222-2222-4222-8222-222222222222", token }, repository, now)).rejects.toBeInstanceOf(PrivateProjectAccessError);
});

test.each([
  ["unknown", null],
  ["expired", { projectId: "11111111-1111-4111-8111-111111111111", tokenHash: hash, expiresAt: new Date("2026-08-09T23:00:00.000Z"), revokedAt: null }],
  ["revoked", { projectId: "11111111-1111-4111-8111-111111111111", tokenHash: hash, expiresAt: new Date("2026-08-10T01:00:00.000Z"), revokedAt: new Date("2026-08-09T00:00:00.000Z") }],
])("rejects %s project access", async (_label, access) => {
  await expect(resolvePrivateProject({ projectId: "11111111-1111-4111-8111-111111111111", token }, { ...repository, findAccessByTokenHash: async () => access }, now)).rejects.toMatchObject({ code: "PROJECT_LINK_INVALID" });
});
