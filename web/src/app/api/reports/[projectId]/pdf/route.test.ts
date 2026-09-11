// @vitest-environment node
import { NextRequest } from "next/server";
import { expect, test, vi } from "vitest";
import { createDefaultConfiguration, projectDesignBriefConfiguration } from "@/features/configurator/domain/configuration";
import { POST as submitLeadPost } from "@/app/api/leads/route";
import { POST as exchangeReportAccess } from "@/app/api/reports/exchange/route";
import { createProjectPdfHandler, GET } from "./route";

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

test("returns a server error instead of disguising a PDF rendering failure as a missing file", async () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
  const response = await createProjectPdfHandler({
    authorize: vi.fn().mockResolvedValue({ project: { id: "11111111-1111-4111-8111-111111111111", targetBudget: null, snapshot: {} } }),
    buildReport: vi.fn().mockReturnValue(report),
    renderPdf: vi.fn().mockRejectedValue(new Error("render failed")),
  })(new NextRequest("https://ksb.test/api/reports/11111111-1111-4111-8111-111111111111/pdf"), { params: Promise.resolve({ projectId: "11111111-1111-4111-8111-111111111111" }) });

  expect(response.status).toBe(500);
  await expect(response.json()).resolves.toEqual({ error: expect.objectContaining({ code: "PDF_GENERATION_FAILED" }) });
  consoleError.mockRestore();
});

test("downloads a real PDF for a report created by the shared non-production runtime", async () => {
  const configuration = projectDesignBriefConfiguration({
    ...createDefaultConfiguration(),
    styleId: "contemporary-warm-luxury",
    provinceCode: "10",
  });
  const leadResponse = await submitLeadPost(new Request("http://localhost:3000/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      configurationId: crypto.randomUUID(),
      idempotencyKey: crypto.randomUUID(),
      configuration,
      preferredContactMethod: "phone",
      name: "ผู้ทดสอบ",
      phone: "0812345678",
      email: "owner@example.test",
      requestPurpose: "view_full_report",
      consentAccepted: true,
      consentVersion: "project-contact-v1",
    }),
  }));
  const lead = await leadResponse.json() as { projectId: string; reportUrl: string };
  const fragment = new URLSearchParams(lead.reportUrl.split("#")[1]);
  const exchangeResponse = await exchangeReportAccess(new NextRequest("http://localhost:3000/api/reports/exchange", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost:3000" },
    body: JSON.stringify({ projectId: lead.projectId, token: fragment.get("token") }),
  }));
  const sessionCookie = exchangeResponse.headers.get("set-cookie")?.split(";")[0] ?? "";

  const response = await GET(new NextRequest(`http://localhost:3000/api/reports/${lead.projectId}/pdf`, {
    headers: { cookie: sessionCookie },
  }), { params: Promise.resolve({ projectId: lead.projectId }) });
  const bytes = Buffer.from(await response.arrayBuffer());

  expect(leadResponse.status).toBe(201);
  expect(exchangeResponse.status).toBe(200);
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toBe("application/pdf");
  expect(bytes.subarray(0, 4).toString()).toBe("%PDF");
  expect(bytes.byteLength).toBeGreaterThan(10_000);
});
