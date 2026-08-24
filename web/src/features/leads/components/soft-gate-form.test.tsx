import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, expect, test, vi } from "vitest";
import { createDefaultConfiguration, projectDesignBriefConfiguration } from "@/features/configurator/domain/configuration";
import type { FreePreviewPayload } from "@/features/preview/application/build-free-preview";
import { getOrCreateSubmissionIntent, SoftGateForm } from "./soft-gate-form";

const configuration = projectDesignBriefConfiguration({
  ...createDefaultConfiguration(),
  styleId: "classic-style",
  provinceCode: "10",
  usableAreaOverrideM2: 450,
});

const preview: FreePreviewPayload = {
  conceptAssetId: "timeless-contemporary-luxury",
  styleLabel: "Classic Style",
  floors: 2,
  bedrooms: 4,
  bathrooms: 4,
  parkingSpaces: 2,
  usableAreaM2: 450,
  constructionFloorAreaM2: 520,
  materialLevel: "premium",
  constructionRange: { low: 12_000_000, high: 14_000_000 },
  designFeeRange: { low: 600_000, high: 900_000 },
  budgetRange: { low: 12_600_000, high: 14_900_000 },
  confidence: "C",
  estimateMode: "published",
  disclaimer: "ข้อมูลเบื้องต้น",
};

beforeEach(() => {
  window.sessionStorage.clear();
  document.body.removeAttribute("style");
  vi.restoreAllMocks();
});

test("renders one premium dialog with the existing project data and additional-view teaser", () => {
  render(<SoftGateForm configuration={configuration} preview={preview} open onClose={vi.fn()} onSuccess={vi.fn()} />);

  const dialog = screen.getByRole("dialog", { name: "รับข้อมูลฉบับเต็ม" });
  expect(dialog).toHaveAttribute("aria-modal", "true");
  expect(within(dialog).getByRole("heading", { name: "ข้อมูลติดต่อของคุณ" })).toBeVisible();
  expect(within(dialog).getByRole("heading", { name: "สิ่งที่คุณจะได้รับ" })).toBeVisible();
  expect(within(dialog).getByRole("heading", { name: "โครงการที่คุณเลือก" })).toBeVisible();
  expect(within(dialog).getByText("Classic Style")).toBeVisible();
  expect(within(dialog).getByText("กรุงเทพมหานคร")).toBeVisible();
  expect(within(dialog).getByText("พื้นที่ใช้สอย 450 ตร.ม.")).toBeVisible();
  expect(within(dialog).getByRole("img", { name: "ภาพหลัก Classic Style" })).toHaveAttribute("src", expect.stringContaining("base-classic-2f-master"));
  expect(within(dialog).getAllByTestId("additional-house-view")).toHaveLength(3);
  expect(within(dialog).getByText("+12 มุมเพิ่มเติม")).toBeVisible();
  expect(within(dialog).queryByLabelText(/ที่อยู่/)).not.toBeInTheDocument();
  expect(within(dialog).queryByText(/Step 1|Premium Member|Concierge/)).not.toBeInTheDocument();
  expect(document.body.style.overflow).toBe("hidden");
});

test("validates inline and submits only contact request fields beside the original configuration", async () => {
  const user = userEvent.setup();
  const onSuccess = vi.fn();
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ leadId: "lead", projectId: "project", reportUrl: "/report/access#project=project&token=token" }), { status: 201 }));
  vi.stubGlobal("fetch", fetchMock);
  render(<SoftGateForm configuration={configuration} preview={preview} open onClose={vi.fn()} onSuccess={onSuccess} />);

  await user.click(screen.getByRole("button", { name: "รับรายงานฉบับเต็ม" }));
  expect(screen.getByText("กรุณาระบุชื่อ–นามสกุล")).toBeVisible();
  expect(screen.getByText("กรุณาระบุเบอร์โทรศัพท์")).toBeVisible();
  expect(screen.getByText("กรุณาระบุอีเมลให้ถูกต้อง")).toBeVisible();
  expect(document.getElementById("full-report-requestPurpose-error")).toHaveTextContent("กรุณาเลือกวัตถุประสงค์ในการขอข้อมูล");
  expect(fetchMock).not.toHaveBeenCalled();

  await user.type(screen.getByRole("textbox", { name: /^ชื่อ–นามสกุล/ }), "คุณบ้านดี");
  await user.type(screen.getByRole("textbox", { name: /^เบอร์โทรศัพท์/ }), "0812345678");
  await user.type(screen.getByRole("textbox", { name: /^อีเมล/ }), "owner@example.test");
  await user.type(screen.getByLabelText("ไลน์ไอดี (ถ้ามี)"), "owner.line");
  await user.selectOptions(screen.getByRole("combobox", { name: /^วัตถุประสงค์ในการขอข้อมูล/ }), "planning_to_build");
  await user.click(screen.getByLabelText(/ยินยอมให้ใช้ข้อมูล/));
  await user.click(screen.getByRole("button", { name: "รับรายงานฉบับเต็ม" }));

  await waitFor(() => expect(onSuccess).toHaveBeenCalledWith("/report/access#project=project&token=token"));
  const body = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string) as Record<string, unknown>;
  expect(body).toMatchObject({
    configuration,
    name: "คุณบ้านดี",
    preferredContactMethod: "phone",
    phone: "0812345678",
    email: "owner@example.test",
    lineId: "owner.line",
    requestPurpose: "planning_to_build",
    consentAccepted: true,
  });
  expect(body).not.toHaveProperty("houseStyle");
  expect(body).not.toHaveProperty("previewImage");
  expect(body).not.toHaveProperty("usableArea");
});

test("closes accessibly, restores focus, traps keyboard focus, and preserves unfinished values", async () => {
  const user = userEvent.setup();
  function Harness() {
    const [open, setOpen] = useState(false);
    return <>
      <button onClick={() => setOpen(true)} type="button">เปิดรับข้อมูลฉบับเต็ม</button>
      <SoftGateForm configuration={configuration} preview={preview} open={open} onClose={() => setOpen(false)} onSuccess={vi.fn()} />
    </>;
  }
  render(<Harness />);

  const trigger = screen.getByRole("button", { name: "เปิดรับข้อมูลฉบับเต็ม" });
  await user.click(trigger);
  const name = screen.getByLabelText("ชื่อ–นามสกุล *");
  expect(name).toHaveFocus();
  await user.type(name, "ข้อมูลที่ยังกรอกไม่เสร็จ");

  const close = screen.getByRole("button", { name: "ปิดหน้าต่างรับข้อมูลฉบับเต็ม" });
  close.focus();
  await user.keyboard("{Shift>}{Tab}{/Shift}");
  expect(screen.getByRole("button", { name: "รับรายงานฉบับเต็ม" })).toHaveFocus();

  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  await user.click(trigger);
  expect(screen.getByLabelText("ชื่อ–นามสกุล *")).toHaveValue("ข้อมูลที่ยังกรอกไม่เสร็จ");
  await user.click(screen.getByRole("button", { name: /ย้อนกลับ/ }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("replaces corrupt session intent values with a fresh UUID pair", () => {
  sessionStorage.setItem("ksb-soft-gate-intent-v1", "{\"configurationId\":\"not-a-uuid\",\"idempotencyKey\":\"also-not-a-uuid\"}");
  const intent = getOrCreateSubmissionIntent(sessionStorage, () => "11111111-1111-4111-8111-111111111111");
  expect(intent).toEqual({ configurationId: "11111111-1111-4111-8111-111111111111", idempotencyKey: "11111111-1111-4111-8111-111111111111" });
});
