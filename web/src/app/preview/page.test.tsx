import { render, screen, waitFor } from "@testing-library/react";
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
      privateNotes: "ข้อความส่วนตัวที่ห้ามส่ง",
    },
  }));
}

beforeEach(() => {
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
