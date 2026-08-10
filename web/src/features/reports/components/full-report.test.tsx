import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import type { FullReportViewModel } from "../application/build-full-report";
import { FullReport } from "./full-report";

vi.mock("html-to-image", () => ({ toPng: vi.fn().mockResolvedValue("data:image/png;base64,summary") }));

const report: FullReportViewModel = {
  snapshotId: "snapshot-1",
  projectId: "project-1",
  concept: {
    styleId: "contemporary-warm-luxury",
    label: "Contemporary Warm Luxury",
    imageSrc: "/concepts/contemporary-warm-luxury.png",
  },
  configuration: {
    floors: 2,
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 2,
    materialLevel: "premium",
    specialFeatures: [],
  },
  area: {
    usableAreaM2: 164,
    constructionFloorAreaM2: 198,
  },
  total: { low: 4_725_000, expected: 5_871_250, high: 7_052_500 },
  lines: [
    { code: "core-construction", label: "ค่าก่อสร้างหลัก", amount: { low: 4_500_000, expected: 5_500_000, high: 6_500_000 } },
    { code: "design-professional-fee", label: "ค่าออกแบบและบริการวิชาชีพ", amount: { low: 225_000, expected: 371_250, high: 552_500 } },
  ],
  assumptions: ["ประเมินจากข้อมูลเบื้องต้น"],
  includedItems: ["งานโครงสร้าง"],
  excludedItems: ["ค่าควบคุมงานก่อสร้าง: ยังไม่รวม"],
  confidence: "B",
  pricingVersion: "TH-2026Q2-QA-0.1",
  referenceDate: "2026-06-30",
  budgetComparison: { status: "within-target" },
  disclaimer: "เป็นกรอบงบประมาณเพื่อใช้วางแผนเบื้องต้น",
  nextStepAdvice: "นัดพูดคุยกับสถาปนิกเพื่อยืนยันรายละเอียดโครงการ",
};

test("renders a PII-free full report with the architectural price-range triptych", () => {
  render(<FullReport report={report} />);

  expect(screen.getByRole("heading", { name: "สรุปโครงการฉบับเต็ม" })).toBeVisible();
  expect(screen.getAllByText("4,725,000 บาท").length).toBeGreaterThan(0);
  expect(screen.getAllByText("5,871,250 บาท").length).toBeGreaterThan(0);
  expect(screen.getAllByText("7,052,500 บาท").length).toBeGreaterThan(0);
  expect(screen.getByText("ค่าออกแบบและบริการวิชาชีพ")).toBeVisible();
  expect(screen.getByText("ค่าควบคุมงานก่อสร้าง: ยังไม่รวม")).toBeVisible();
  expect(screen.getByText(/TH-2026Q2-QA-0\.1/)).toBeVisible();
  expect(screen.queryByLabelText(/ชื่อ|อีเมล|เบอร์โทร|LINE/i)).not.toBeInTheDocument();
});

test("exports the project summary as a local PNG without uploading it", async () => {
  const user = userEvent.setup();
  const createObjectUrl = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:summary");
  const revokeObjectUrl = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  const { toPng } = await import("html-to-image");
  render(<FullReport report={report} />);

  await user.click(screen.getByRole("button", { name: "บันทึกภาพสรุปโครงการ" }));

  await waitFor(() => expect(toPng).toHaveBeenCalledOnce());
  expect(click).toHaveBeenCalledOnce();
  expect(createObjectUrl).toHaveBeenCalledOnce();
  expect(revokeObjectUrl).toHaveBeenCalledWith("blob:summary");
});

test("hands a consultation request to the host after its server-confirmed success", async () => {
  const user = userEvent.setup();
  const onRequestConsultation = vi.fn().mockResolvedValue(undefined);
  const onConsultationRequested = vi.fn();
  render(<FullReport report={report} onRequestConsultation={onRequestConsultation} onConsultationRequested={onConsultationRequested} />);

  await user.click(screen.getByRole("button", { name: "ขอนัดปรึกษากับสถาปนิก" }));

  await waitFor(() => expect(onRequestConsultation).toHaveBeenCalledOnce());
  expect(onRequestConsultation.mock.calls[0][0]).toBeInstanceOf(AbortSignal);
  expect(onConsultationRequested).toHaveBeenCalledOnce();
  expect(screen.getByRole("status")).toHaveTextContent("ส่งคำขอนัดปรึกษาแล้ว");
});

test("keeps failures generic and aborts an in-flight consultation request when unmounted", async () => {
  const user = userEvent.setup();
  let signal: AbortSignal | undefined;
  const onRequestConsultation = vi.fn().mockImplementation((requestSignal: AbortSignal) => {
    signal = requestSignal;
    return new Promise<void>(() => undefined);
  });
  const { unmount } = render(<FullReport report={report} onRequestConsultation={onRequestConsultation} />);

  await user.click(screen.getByRole("button", { name: "ขอนัดปรึกษากับสถาปนิก" }));
  await waitFor(() => expect(onRequestConsultation).toHaveBeenCalledOnce());
  unmount();

  expect(signal?.aborted).toBe(true);
});
