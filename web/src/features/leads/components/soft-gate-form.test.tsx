import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { createDefaultConfiguration, projectDesignBriefConfiguration } from "@/features/configurator/domain/configuration";
import { DEFAULT_MATERIAL_SELECTIONS } from "@/features/configurator/domain/material-catalog";
import { getOrCreateSubmissionIntent, SoftGateForm } from "./soft-gate-form";

const configuration = projectDesignBriefConfiguration({
  ...createDefaultConfiguration(),
  styleId: "contemporary-warm-luxury",
  provinceCode: "10",
  materialSelections: { ...DEFAULT_MATERIAL_SELECTIONS, roof: "metal-roof" },
  materialQualityId: "bespoke",
  materialLevel: "signature",
  specialFeatures: ["pool", "internal-garden"],
  privateNotes: "ห้ามส่งข้อความส่วนตัวนี้",
});

test("reveals the value first, changes contact field, submits once, and keeps PII out of web storage", async () => {
  const user = userEvent.setup(); const onSuccess = vi.fn(); const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ leadId: "lead", projectId: "project", reportUrl: "/report/access#project=project&token=token" }), { status: 201 }));
  vi.stubGlobal("fetch", fetchMock);
  render(<SoftGateForm configuration={configuration as never} onSuccess={onSuccess} />);
  expect(screen.getByText("Detailed Project Summary")).toBeVisible();
  expect(screen.getByText("ข้อมูลของคุณจะใช้สำหรับจัดทำสรุปโครงการและติดต่อกลับเกี่ยวกับโครงการนี้เท่านั้น โดยจะจัดการข้อมูลตามนโยบายความเป็นส่วนตัวของบริษัท")).toBeVisible();
  await user.selectOptions(screen.getByLabelText("ช่องทางติดต่อที่ต้องการ"), "email");
  expect(screen.getByLabelText("อีเมล")).toBeVisible();
  await user.type(screen.getByLabelText("ชื่อ"), "ผู้ทดสอบ");
  await user.type(screen.getByLabelText("อีเมล"), "owner@example.test");
  await user.click(screen.getByLabelText(/ยินยอม/));
  await user.click(screen.getByRole("button", { name: "ส่ง Project Report ฉบับเต็มให้ฉัน" }));
  expect(screen.getByRole("button", { name: /กำลังจัดทำ/ })).toBeDisabled();
  await waitFor(() => expect(onSuccess).toHaveBeenCalledWith("/report/access#project=project&token=token"));
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const body = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string) as { configuration: Record<string, unknown> };
  expect(body.configuration).toMatchObject({
    materialSelections: { roof: "metal-roof" },
    materialQualityId: "bespoke",
    specialFeatures: ["pool", "internal-garden"],
  });
  expect(body.configuration).not.toHaveProperty("privateNotes");
  expect(Array.from({ length: sessionStorage.length }, (_value, index) => sessionStorage.getItem(sessionStorage.key(index) ?? "")).join("\n")).not.toContain("owner@example.test");
  expect(JSON.stringify({ ...sessionStorage, ...localStorage })).not.toContain("owner@example.test");
});

test("replaces corrupt session intent values with a fresh UUID pair", () => {
  sessionStorage.setItem("ksb-soft-gate-intent-v1", "{\"configurationId\":\"not-a-uuid\",\"idempotencyKey\":\"also-not-a-uuid\"}");
  const intent = getOrCreateSubmissionIntent(sessionStorage, () => "11111111-1111-4111-8111-111111111111");
  expect(intent).toEqual({ configurationId: "11111111-1111-4111-8111-111111111111", idempotencyKey: "11111111-1111-4111-8111-111111111111" });
  expect(sessionStorage.getItem("ksb-soft-gate-intent-v1")).toBe(JSON.stringify(intent));
});
