import { expect, test, vi } from "vitest";
import { deleteProjectData } from "./delete-project-data";
import { exportProjectData } from "./export-project-data";
import { runRetention } from "./run-retention";

const leadId = "11111111-1111-4111-8111-111111111111";
const operator = { userId: "22222222-2222-4222-8222-222222222222", roles: ["privacy-operator"] as const };
const bundle = { contact: { name: "ผู้ทดสอบ", email: "owner@example.test" }, consent: { version: "v1", consentedAt: "2026-01-01T00:00:00.000Z" }, configuration: { floors: 2 }, snapshot: { total: 5_000_000 } };

test("exports authorized project data and rejects non-privacy operators", async () => {
  const repository = { exportByLeadId: vi.fn().mockResolvedValue(bundle), deleteByLeadId: vi.fn(), deleteOlderThan: vi.fn() };
  await expect(exportProjectData(leadId, operator, repository)).resolves.toEqual(bundle);
  await expect(exportProjectData(leadId, { userId: operator.userId, roles: [] }, repository)).rejects.toMatchObject({ code: "PRIVACY_OPERATION_FORBIDDEN" });
});

test("deletes the complete project cascade through one atomic repository operation", async () => {
  const repository = { exportByLeadId: vi.fn(), deleteByLeadId: vi.fn().mockResolvedValue({ deletedLeadIds: [leadId] }), deleteOlderThan: vi.fn() };
  await expect(deleteProjectData(leadId, operator, repository)).resolves.toEqual({ deletedLeadIds: [leadId] });
  expect(repository.deleteByLeadId).toHaveBeenCalledWith(leadId);
});

test("uses an approved positive retention window and leaves data unchanged on transaction failure", async () => {
  const rows = new Map([[leadId, bundle]]);
  const repository = {
    exportByLeadId: vi.fn(), deleteByLeadId: vi.fn(),
    deleteOlderThan: vi.fn().mockImplementation(async () => { const transactionRows = new Map(rows); transactionRows.clear(); throw new Error("ROLLBACK"); }),
  };
  await expect(runRetention(new Date("2026-08-07T00:00:00.000Z"), { nodeEnv: "production", retentionDays: "30" }, repository)).rejects.toThrow("ROLLBACK");
  expect(rows.has(leadId)).toBe(true);
  expect(repository.deleteOlderThan).toHaveBeenCalledWith(new Date("2026-07-08T00:00:00.000Z"));
  expect(() => runRetention(new Date(), { nodeEnv: "production", retentionDays: "0" }, repository)).toThrow("PII_RETENTION_DAYS_INVALID");
});
