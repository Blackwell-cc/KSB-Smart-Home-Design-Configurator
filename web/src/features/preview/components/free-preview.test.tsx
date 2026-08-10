import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import type { FreePreviewPayload } from "../application/build-free-preview";
import { FreePreview } from "./free-preview";

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
  constructionRange: { low: 4_600_000, high: 6_100_000 },
  designFeeRange: { low: 250_000, high: 400_000 },
  budgetRange: { low: 5_124_319, high: 7_634_677 },
  confidence: "C",
  estimateMode: "development-demo",
  disclaimer: "ข้อมูลเบื้องต้น",
};

test("renders the complete PII-free free preview and semantic CTA handoffs", async () => {
  const user = userEvent.setup();
  const onBack = vi.fn();
  const onFullReport = vi.fn();
  const onShare = vi.fn();
  render(<FreePreview status="ready" preview={preview} onBack={onBack} onFullReport={onFullReport} onShare={onShare} />);

  expect(screen.getByRole("img", { name: /Contemporary Warm Luxury/i })).toHaveAttribute("src", expect.stringContaining("contemporary-warm-luxury"));
  expect(screen.getByText("2 ชั้น")).toBeInTheDocument();
  expect(screen.getByText("3 ห้องนอน")).toBeInTheDocument();
  expect(screen.getByText("3 ห้องน้ำ")).toBeInTheDocument();
  expect(screen.getByText("2 คัน")).toBeInTheDocument();
  expect(screen.getByText("164 ตร.ม.")).toBeInTheDocument();
  expect(screen.getByText("CFA (พื้นที่ก่อสร้างรวม)")).toBeInTheDocument();
  expect(screen.getByText("198 ตร.ม.")).toBeInTheDocument();
  expect(screen.getByText("Premium")).toBeInTheDocument();
  expect(screen.getByText("ค่าก่อสร้าง")).toBeVisible();
  expect(screen.getByText("ค่าออกแบบและบริการวิชาชีพ")).toBeVisible();
  expect(screen.getByText("งบรวมโดยประมาณ")).toBeVisible();
  expect(screen.getByText(/4,600,000/)).toBeInTheDocument();
  expect(screen.getByText(/6,100,000/)).toBeInTheDocument();
  expect(screen.getByText(/250,000/)).toBeInTheDocument();
  expect(screen.getByText(/400,000/)).toBeInTheDocument();
  expect(screen.getByText(/5,124,319/)).toBeInTheDocument();
  expect(screen.getByText(/7,634,677/)).toBeInTheDocument();
  expect(screen.getByText("ระดับความเชื่อมั่น C")).toBeInTheDocument();
  expect(screen.getByText("ข้อมูลเบื้องต้น")).toBeInTheDocument();
  expect(screen.getByText("ข้อมูลทดสอบเพื่อพัฒนาระบบ")).toBeVisible();
  expect(screen.getByText("เป็นกรอบประมาณการช่วงกว้าง ไม่ใช่ราคาสุดท้าย")).toBeVisible();
  expect(screen.getByText("งบรวมรวมค่าออกแบบและบริการวิชาชีพแล้ว และไม่รวมค่าควบคุมงานก่อสร้าง")).toBeVisible();
  expect(screen.queryByLabelText(/ชื่อ|อีเมล|เบอร์โทร|LINE/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/รายละเอียดราคา|สมมติฐาน|รายการที่รวม|รายการที่ไม่รวม/i)).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "รับสรุปโครงการฉบับเต็ม" }));
  await user.click(screen.getByRole("button", { name: "แชร์ภาพ Preview" }));
  await user.click(screen.getByRole("button", { name: "กลับไปแก้ไขข้อมูลบ้าน" }));

  expect(onFullReport).toHaveBeenCalledOnce();
  expect(onShare).toHaveBeenCalledOnce();
  expect(onBack).toHaveBeenCalledOnce();
});

test("renders accessible loading and service-unavailable guidance", () => {
  const { rerender } = render(<FreePreview status="loading" onBack={vi.fn()} onFullReport={vi.fn()} onShare={vi.fn()} />);

  expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
  rerender(<FreePreview status="unavailable" onBack={vi.fn()} onFullReport={vi.fn()} onShare={vi.fn()} />);
  expect(screen.getByRole("alert")).toHaveTextContent(/ยังไม่สามารถประเมิน/);
  expect(screen.getByRole("button", { name: "กลับไปแก้ไขข้อมูลบ้าน" })).toBeVisible();
});

test("renders accessible no-draft and invalid-draft states", () => {
  const { rerender } = render(<FreePreview status="no-draft" onBack={vi.fn()} onFullReport={vi.fn()} onShare={vi.fn()} />);

  expect(screen.getByRole("alert")).toHaveTextContent(/ไม่พบข้อมูลบ้าน/);
  rerender(<FreePreview status="invalid-draft" onBack={vi.fn()} onFullReport={vi.fn()} onShare={vi.fn()} />);
  expect(screen.getByRole("alert")).toHaveTextContent(/ข้อมูลบ้านไม่สมบูรณ์/);
});
