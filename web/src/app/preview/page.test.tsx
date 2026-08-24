import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import { createDefaultConfiguration } from "@/features/configurator/domain/configuration";
import type { FreePreviewPayload } from "@/features/preview/application/build-free-preview";
import PreviewPage from "./page";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const preview: FreePreviewPayload = {
  conceptAssetId: "contemporary-warm-luxury",
  styleLabel: "Contemporary Warm Luxury",
  floors: 2,
  bedrooms: 3,
  bathrooms: 3,
  parkingSpaces: 2,
  usableAreaM2: 164,
  constructionFloorAreaM2: 198,
  materialLevel: "premium",
  constructionRange: { low: 4_880_304, high: 6_898_320 },
  designFeeRange: { low: 244_015, high: 586_357 },
  budgetRange: { low: 5_124_319, high: 7_634_677 },
  confidence: "C",
  estimateMode: "published",
  disclaimer: "ข้อมูลเบื้องต้น",
};

function saveValidDraft() {
  window.localStorage.setItem("ksb-configurator-draft-v1", JSON.stringify({
    draftVersion: 1,
    currentStep: 4,
    configuration: {
      ...createDefaultConfiguration(),
      styleId: "contemporary-warm-luxury",
      provinceCode: "10",
      district: "เขตทดสอบ",
      targetBudget: { min: 5_000_000, max: 8_000_000 },
      materialSelections: {
        ...createDefaultConfiguration().materialSelections,
        roof: "metal-roof",
      },
      materialQualityId: "bespoke",
      materialLevel: "signature",
      specialFeatures: ["pool", "internal-garden"],
      privateNotes: "ข้อความส่วนตัวที่ห้ามส่ง",
    },
  }));
}

beforeEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
  push.mockReset();
  vi.stubGlobal("fetch", vi.fn());
});

test("restores a validated anonymous draft and requests its server preview", async () => {
  saveValidDraft();
  const fetchMock = vi.mocked(fetch);
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ preview }), { status: 200 }));
  render(<PreviewPage />);

  expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
  expect(await screen.findByRole("heading", { name: "ภาพรวมบ้านที่คุณกำลังวางแผน" })).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledWith("/api/estimate", expect.objectContaining({ method: "POST" }));
  const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
  expect(JSON.parse(request.body as string)).toEqual(expect.objectContaining({ styleId: "contemporary-warm-luxury", provinceCode: "10" }));
  expect(JSON.parse(request.body as string)).not.toHaveProperty("privateNotes");
  expect(JSON.parse(request.body as string)).not.toHaveProperty("district");
  expect(JSON.parse(request.body as string)).not.toHaveProperty("targetBudget");

  await userEvent.setup().click(screen.getByRole("button", { name: "กลับไปแก้ไขข้อมูลบ้าน" }));
  expect(push).toHaveBeenCalledWith("/configurator");
});

test("clears the current draft and returns home when starting over", async () => {
  saveValidDraft();
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ preview }), { status: 200 }));
  const user = userEvent.setup();
  render(<PreviewPage />);

  await screen.findByRole("heading", { name: "ภาพรวมบ้านที่คุณกำลังวางแผน" });
  await user.click(screen.getByRole("button", { name: "เริ่มทำใหม่" }));

  expect(window.localStorage.length).toBe(0);
  expect(push).toHaveBeenCalledWith("/");
});

test("opens the full-report dialog over the current result and restores the CTA after Escape", async () => {
  saveValidDraft();
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ preview }), { status: 200 }));
  const user = userEvent.setup();
  render(<PreviewPage />);

  await screen.findByRole("heading", { name: "ภาพรวมบ้านที่คุณกำลังวางแผน" });
  const trigger = screen.getByRole("button", { name: "รับข้อมูลฉบับเต็ม" });
  await user.click(trigger);

  const dialog = screen.getByRole("dialog", { name: "รับข้อมูลฉบับเต็ม" });
  expect(dialog).toBeVisible();
  expect(screen.getByRole("heading", { name: "ภาพรวมบ้านที่คุณกำลังวางแผน" })).toBeInTheDocument();
  expect(within(dialog).getByText("Modern Luxury")).toBeVisible();
  expect(within(dialog).getByText("กรุงเทพมหานคร")).toBeVisible();
  expect(within(dialog).getByText("พื้นที่ใช้สอย 164 ตร.ม.")).toBeVisible();
  expect(push).not.toHaveBeenCalled();

  await user.type(within(dialog).getByLabelText("ชื่อ–นามสกุล *"), "ข้อมูลที่กรอกค้างไว้");
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  await user.click(trigger);
  expect(screen.getByLabelText("ชื่อ–นามสกุล *")).toHaveValue("ข้อมูลที่กรอกค้างไว้");
});

test("shares the current result without exposing detailed budget data", async () => {
  saveValidDraft();
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ preview }), { status: 200 }));
  const open = vi.spyOn(window, "open").mockImplementation(() => null);
  const writeText = vi.fn().mockResolvedValue(undefined);
  const user = userEvent.setup();
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  render(<PreviewPage />);

  await screen.findByRole("heading", { name: "ภาพรวมบ้านที่คุณกำลังวางแผน" });
  await user.click(screen.getByRole("button", { name: "แชร์ผ่าน LINE" }));
  await user.click(screen.getByRole("button", { name: "แชร์ผ่าน Instagram" }));
  await user.click(screen.getByRole("button", { name: "แชร์ผ่าน Facebook" }));
  await user.click(screen.getByRole("button", { name: "คัดลอกลิงก์" }));

  expect(open).toHaveBeenNthCalledWith(1, expect.stringContaining("social-plugins.line.me"), "_blank", "noopener,noreferrer");
  expect(open).toHaveBeenNthCalledWith(2, expect.stringContaining("instagram.com"), "_blank", "noopener,noreferrer");
  expect(open).toHaveBeenNthCalledWith(3, expect.stringContaining("facebook.com/sharer"), "_blank", "noopener,noreferrer");
  await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining("ลองออกแบบบ้านในฝันของคุณกับ KSB Architect")));
  expect(writeText.mock.calls[0]?.[0]).not.toContain("5,124,319");
  expect(await screen.findByText("คัดลอกลิงก์แล้ว")).toHaveAttribute("aria-live", "polite");
});

test("opens Instagram even when clipboard access is denied and reports the fallback", async () => {
  saveValidDraft();
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ preview }), { status: 200 }));
  const callOrder: string[] = [];
  const open = vi.spyOn(window, "open").mockImplementation(() => { callOrder.push("open"); return null; });
  const writeText = vi.fn().mockImplementation(() => { callOrder.push("copy"); return Promise.reject(new DOMException("denied", "NotAllowedError")); });
  const user = userEvent.setup();
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  render(<PreviewPage />);

  await screen.findByRole("heading", { name: "ภาพรวมบ้านที่คุณกำลังวางแผน" });
  await user.click(screen.getByRole("button", { name: "แชร์ผ่าน Instagram" }));

  expect(open).toHaveBeenCalledWith("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
  expect(callOrder).toEqual(["copy", "open"]);
  expect(await screen.findByText("เปิด Instagram แล้ว แต่ยังคัดลอกลิงก์ไม่ได้")).toBeVisible();
});

test("keeps an older clipboard failure from replacing the latest copy success", async () => {
  saveValidDraft();
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ preview }), { status: 200 }));
  let rejectFirstCopy: (reason?: unknown) => void = () => undefined;
  const firstCopy = new Promise<void>((_resolve, reject) => { rejectFirstCopy = reject; });
  const writeText = vi.fn()
    .mockImplementationOnce(() => firstCopy)
    .mockResolvedValueOnce(undefined);
  const user = userEvent.setup();
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  render(<PreviewPage />);

  await screen.findByRole("heading", { name: "ภาพรวมบ้านที่คุณกำลังวางแผน" });
  await user.click(screen.getByRole("button", { name: "คัดลอกลิงก์" }));
  await user.click(screen.getByRole("button", { name: "คัดลอกลิงก์" }));
  expect(await screen.findByText("คัดลอกลิงก์แล้ว")).toBeVisible();

  await act(async () => { rejectFirstCopy(new DOMException("denied", "NotAllowedError")); });
  expect(screen.getByText("คัดลอกลิงก์แล้ว")).toBeVisible();
  expect(screen.queryByText("ยังคัดลอกลิงก์ไม่ได้ กรุณาคัดลอกจากแถบที่อยู่")).not.toBeInTheDocument();
});

test("keeps the full PII-safe design brief for lead submission after pricing projection", async () => {
  saveValidDraft();
  const fetchMock = vi.mocked(fetch);
  fetchMock
    .mockResolvedValueOnce(new Response(JSON.stringify({ preview }), { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({
      leadId: "lead",
      projectId: "project",
      reportUrl: "/report/access#project=project&token=token",
    }), { status: 201 }));
  const user = userEvent.setup();
  render(<PreviewPage />);

  await screen.findByRole("heading", { name: "ภาพรวมบ้านที่คุณกำลังวางแผน" });
  await user.click(screen.getByRole("button", { name: "รับข้อมูลฉบับเต็ม" }));
  await user.type(screen.getByLabelText("ชื่อ–นามสกุล *"), "ผู้ทดสอบ");
  await user.type(screen.getByLabelText("เบอร์โทรศัพท์ *"), "0812345678");
  await user.type(screen.getByLabelText("อีเมล *"), "owner@example.test");
  await user.selectOptions(screen.getByLabelText("วัตถุประสงค์ในการขอข้อมูล *"), "planning_to_build");
  await user.click(screen.getByLabelText(/ยินยอม/));
  await user.click(screen.getByRole("button", { name: "รับรายงานฉบับเต็ม" }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

  const estimateBody = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string) as Record<string, unknown>;
  const leadBody = JSON.parse(fetchMock.mock.calls[1]?.[1]?.body as string) as {
    configuration: Record<string, unknown>;
  };
  expect(estimateBody).toMatchObject({ materialLevel: "signature", specialFeatures: ["pool"] });
  expect(estimateBody).not.toHaveProperty("materialSelections");
  expect(leadBody.configuration).toMatchObject({
    materialSelections: { roof: "metal-roof" },
    materialQualityId: "bespoke",
    materialLevel: "signature",
    specialFeatures: ["pool", "internal-garden"],
  });
  expect(leadBody.configuration).not.toHaveProperty("privateNotes");
  expect(window.localStorage.getItem("ksb-configurator-draft-v1")).not.toBeNull();
  expect(push).toHaveBeenCalledWith("/report/access#project=project&token=token");
});

test("rejects a preview response that omits either separated estimate range", async () => {
  saveValidDraft();
  const missingRanges: Record<string, unknown> = { ...preview };
  delete missingRanges.constructionRange;
  delete missingRanges.designFeeRange;
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ preview: missingRanges }), { status: 200 }));
  render(<PreviewPage />);

  expect(await screen.findByRole("alert")).toHaveTextContent(/ยังไม่สามารถประเมิน/);
});

test("does not call the server for missing or incompatible drafts", async () => {
  const fetchMock = vi.mocked(fetch);
  const first = render(<PreviewPage />);

  expect(await screen.findByRole("alert")).toHaveTextContent(/ไม่พบข้อมูลบ้าน/);
  expect(fetchMock).not.toHaveBeenCalled();
  first.unmount();
  window.localStorage.setItem("ksb-configurator-draft-v1", "{");
  render(<PreviewPage />);
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/ข้อมูลบ้านไม่สมบูรณ์/));
  expect(fetchMock).not.toHaveBeenCalled();
});

test("shows a service-unavailable state when local draft storage cannot be read", async () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementationOnce(() => { throw new Error("blocked"); });
  render(<PreviewPage />);

  expect(await screen.findByRole("alert")).toHaveTextContent(/ยังไม่สามารถประเมิน/);
  expect(vi.mocked(fetch)).not.toHaveBeenCalled();
});

test("aborts an in-flight preview request when the page unmounts", async () => {
  saveValidDraft();
  const fetchMock = vi.mocked(fetch);
  fetchMock.mockImplementation(() => new Promise(() => {}));
  const view = render(<PreviewPage />);
  await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
  const request = fetchMock.mock.calls[0]?.[1] as RequestInit;

  view.unmount();

  expect((request.signal as AbortSignal).aborted).toBe(true);
});
