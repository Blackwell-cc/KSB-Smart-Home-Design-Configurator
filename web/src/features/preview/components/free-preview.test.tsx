import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { createDefaultConfiguration, projectDesignBriefConfiguration } from "@/features/configurator/domain/configuration";
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

const configuration = projectDesignBriefConfiguration({
  ...createDefaultConfiguration(),
  styleId: "contemporary-warm-luxury",
  functions: { office: true, elderlyRoom: false, thaiKitchen: false, multipurposeRoom: false },
  specialFeatures: ["pool", "smart-home"],
});

test("renders the complete PII-free free preview and semantic CTA handoffs", async () => {
  const user = userEvent.setup();
  const onBack = vi.fn();
  const onFullReport = vi.fn();
  const onShare = vi.fn();
  const onStartOver = vi.fn();
  render(<FreePreview status="ready" preview={preview} configuration={configuration} onBack={onBack} onFullReport={onFullReport} onShare={onShare} onStartOver={onStartOver} />);

  expect(screen.getByText("สรุปข้อมูลแบบคร่าว ๆ ยังไม่ใช่ฉบับสมบูรณ์")).toBeVisible();
  expect(screen.getByRole("img", { name: "โลโก้ KSB Architect" })).toHaveAttribute("src", expect.stringContaining("ksb-architect-logo.png"));
  expect(screen.getByText("SMART HOME DESIGN CONFIGURATOR")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "เริ่มทำใหม่" }));
  expect(onStartOver).toHaveBeenCalledOnce();
  expect(screen.getByRole("heading", { name: "ภาพรวมบ้านที่คุณกำลังวางแผน" })).toBeVisible();
  expect(screen.getByText("อบอุ่น เรียบหรู อยู่สบาย")).toBeVisible();
  expect(screen.getByRole("heading", { name: "บ้านแบบนี้เหมาะกับคนแบบไหน" })).toBeVisible();
  expect(screen.getByText(/ชอบความสะดวกที่เทคโนโลยีช่วยได้/)).toBeVisible();
  expect(screen.getByRole("heading", { name: "เหตุผลที่ค่าออกแบบมีคุณค่า" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "แชร์ผลลัพธ์นี้ให้เพื่อนของคุณ" })).toBeVisible();

  const additionalViews = screen.getByRole("group", { name: "มุมมองเพิ่มเติม" });
  expect(additionalViews.querySelector('[data-additional-view-callout="true"]')).toBeInTheDocument();
  expect(additionalViews).toHaveTextContent("+12");
  expect(additionalViews).toHaveTextContent("ในรายงานฉบับเต็ม");
  expect(within(additionalViews).getAllByRole("img", { name: /มุมมองเพิ่มเติม/ })).toHaveLength(3);

  expect(screen.getByRole("img", { name: /^Concept บ้านสไตล์ Contemporary Warm Luxury$/i })).toHaveAttribute("src", expect.stringContaining("contemporary-warm-luxury"));
  expect(screen.getByText("2 ชั้น")).toBeInTheDocument();
  expect(screen.getByText("3 ห้องนอน")).toBeInTheDocument();
  expect(screen.getByText("3 ห้องน้ำ")).toBeInTheDocument();
  expect(screen.getByText("2 คัน")).toBeInTheDocument();
  expect(screen.getByText("164 ตร.ม.")).toBeInTheDocument();
  expect(screen.queryByText("CFA (พื้นที่ก่อสร้างรวม)")).not.toBeInTheDocument();
  expect(screen.queryByText("ระดับความเชื่อมั่น C")).not.toBeInTheDocument();
  expect(screen.getByText("ค่าก่อสร้าง")).toBeVisible();
  expect(screen.getByText("ค่าออกแบบและบริการวิชาชีพ")).toBeVisible();
  expect(screen.getByText("งบประมาณโดยประมาณ")).toBeVisible();
  expect(screen.getByText(/4,600,000/)).toBeInTheDocument();
  expect(screen.getByText(/6,100,000/)).toBeInTheDocument();
  expect(screen.getByText(/250,000/)).toBeInTheDocument();
  expect(screen.getByText(/400,000/)).toBeInTheDocument();
  expect(screen.getByText(/5,124,319/)).toBeInTheDocument();
  expect(screen.getByText(/7,634,677/)).toBeInTheDocument();
  expect(screen.getByText("ข้อมูลทดสอบเพื่อพัฒนาระบบ")).toBeVisible();
  expect(screen.getByText(/เป็นการประเมินเบื้องต้นจากข้อมูลที่เลือก/)).toBeVisible();
  expect(screen.queryByLabelText(/^(ชื่อ|อีเมล|เบอร์โทรศัพท์|LINE ID)$/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/รายละเอียดราคา|สมมติฐาน|รายการที่รวม|รายการที่ไม่รวม/i)).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "รับข้อมูลฉบับเต็ม" }));
  await user.click(screen.getByRole("button", { name: "แชร์ผ่าน LINE" }));
  await user.click(screen.getByRole("button", { name: "แชร์ผ่าน Instagram" }));
  await user.click(screen.getByRole("button", { name: "แชร์ผ่าน Facebook" }));
  await user.click(screen.getByRole("button", { name: "คัดลอกลิงก์" }));
  await user.click(screen.getByRole("button", { name: "กลับไปแก้ไขข้อมูลบ้าน" }));

  expect(onFullReport).toHaveBeenCalledOnce();
  expect(onShare).toHaveBeenNthCalledWith(1, "line");
  expect(onShare).toHaveBeenNthCalledWith(2, "instagram");
  expect(onShare).toHaveBeenNthCalledWith(3, "facebook");
  expect(onShare).toHaveBeenNthCalledWith(4, "copy");
  expect(onBack).toHaveBeenCalledOnce();
});

test("places the preliminary status in the right-side utility group", () => {
  render(<FreePreview status="ready" preview={preview} configuration={configuration} onBack={vi.fn()} onFullReport={vi.fn()} onShare={vi.fn()} onStartOver={vi.fn()} />);

  const status = screen.getByText("สรุปข้อมูลแบบคร่าว ๆ ยังไม่ใช่ฉบับสมบูรณ์");
  const utilityGroup = screen.getByRole("button", { name: "เริ่มทำใหม่" }).parentElement;

  expect(utilityGroup).toContainElement(status);
});

test("renders accessible loading and service-unavailable guidance", () => {
  const { rerender } = render(<FreePreview status="loading" onBack={vi.fn()} onFullReport={vi.fn()} onShare={vi.fn()} onStartOver={vi.fn()} />);

  expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
  rerender(<FreePreview status="unavailable" onBack={vi.fn()} onFullReport={vi.fn()} onShare={vi.fn()} onStartOver={vi.fn()} />);
  expect(screen.getByRole("alert")).toHaveTextContent(/ยังไม่สามารถประเมิน/);
  expect(screen.getByRole("button", { name: "กลับไปแก้ไขข้อมูลบ้าน" })).toBeVisible();
});

test("renders accessible no-draft and invalid-draft states", () => {
  const { rerender } = render(<FreePreview status="no-draft" onBack={vi.fn()} onFullReport={vi.fn()} onShare={vi.fn()} onStartOver={vi.fn()} />);

  expect(screen.getByRole("alert")).toHaveTextContent(/ไม่พบข้อมูลบ้าน/);
  rerender(<FreePreview status="invalid-draft" onBack={vi.fn()} onFullReport={vi.fn()} onShare={vi.fn()} onStartOver={vi.fn()} />);
  expect(screen.getByRole("alert")).toHaveTextContent(/ข้อมูลบ้านไม่สมบูรณ์/);
});
