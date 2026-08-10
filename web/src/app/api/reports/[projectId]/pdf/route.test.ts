import { NextRequest } from "next/server";
import { expect, test, vi } from "vitest";
import { createProjectPdfHandler } from "./route";

const report = { snapshotId: "snapshot-1", concept: { label: "Concept" } };

test("returns a no-store PDF generated from the authorized saved-report model", async () => {
  const buildReport = vi.fn().mockReturnValue(report); const renderPdf = vi.fn().mockResolvedValue(Buffer.from("%PDF-1.4"));
  const response = await createProjectPdfHandler({ authorize: vi.fn().mockResolvedValue({ project: { id: "11111111-1111-4111-8111-111111111111", targetBudget: null, snapshot: {} } }), buildReport, renderPdf })(new NextRequest("https://ksb.test/api/reports/11111111-1111-4111-8111-111111111111/pdf"), { params: Promise.resolve({ projectId: "11111111-1111-4111-8111-111111111111" }) });

  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toBe("application/pdf");
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(response.headers.get("content-disposition")).toMatch(/attachment; filename="ksb-project-report\.pdf"/);
  expect(buildReport).toHaveBeenCalledWith(expect.objectContaining({ id: "11111111-1111-4111-8111-111111111111", targetBudget: null }), {});
});

test("does not render a PDF when the session is not authorized", async () => {
  const renderPdf = vi.fn();
  const response = await createProjectPdfHandler({ authorize: vi.fn().mockRejectedValue(new Error("invalid")), buildReport: vi.fn(), renderPdf })(new NextRequest("https://ksb.test/api/reports/11111111-1111-4111-8111-111111111111/pdf"), { params: Promise.resolve({ projectId: "11111111-1111-4111-8111-111111111111" }) });

  expect(response.status).toBe(404);
  expect(renderPdf).not.toHaveBeenCalled();
});
