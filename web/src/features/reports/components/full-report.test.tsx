import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import type { FullReportViewModel } from "../application/build-full-report";
import { FullReport } from "./full-report";

const report = {
  snapshotId: "snapshot-1", projectId: "project-1", generatedAt: "2026-08-19T08:00:00.000Z",
  concept: { styleId: "classic-style", label: "Classic Style", thaiLabel: "บ้านสไตล์คลาสสิก", imageSrc: "/concepts/timeless-contemporary-luxury.png", direction: { title: "ภูมิฐาน ประณีต เหนือกาลเวลา", description: "บ้านที่ให้ความสำคัญกับสัดส่วน รายละเอียด และบรรยากาศสง่างาม" } },
  configuration: { residents: 5, floors: 2, bedrooms: 4, bathrooms: 4, parkingSpaces: 3, materialLevel: "signature", materialQuality: "SIGNATURE", materialSelections: { roof: "natural-slate", wall: "natural-stone", window: "black-aluminium", door: "teak", flooring: "natural-marble" }, functions: ["ห้องทำงาน", "ครัวไทย"], specialFeatures: ["pool", "smart-home"] },
  location: { province: "กรุงเทพมหานคร", district: "บางรัก", siteAccess: "เข้าถึงสะดวก" },
  area: { usableAreaM2: 615, constructionFloorAreaM2: 650 },
  materials: [
    { categoryId: "roof", categoryLabel: "หลังคา", optionLabel: "Slate / หินธรรมชาติ" },
    { categoryId: "wall", categoryLabel: "ผนังภายนอก", optionLabel: "หินธรรมชาติ" },
    { categoryId: "window", categoryLabel: "หน้าต่าง", optionLabel: "อลูมิเนียมสีดำ" },
    { categoryId: "flooring", categoryLabel: "พื้น", optionLabel: "หินอ่อนธรรมชาติ" },
  ],
  specialFeatures: [
    { id: "pool", label: "สระว่ายน้ำ", description: "พื้นที่พักผ่อนพร้อมระบบสระ" },
    { id: "smart-home", label: "ระบบ Smart Home", description: "ควบคุมระบบสำคัญภายในบ้าน" },
  ],
  additionalRequirements: ["ห้องทำงาน", "ครัวไทย"],
  gallery: Array.from({ length: 12 }, (_, index) => ({ id: `view-${index + 1}`, label: `มุมมอง ${index + 1}`, imageSrc: "/concepts/timeless-contemporary-luxury.png", objectPosition: `${30 + index * 3}% 50%`, placeholder: true })),
  total: { low: 4_725_000, expected: 5_871_250, high: 7_052_500 },
  lines: [],
  detailedBudget: {
    categories: [
      { code: "structure", label: "งานโครงสร้าง", description: "ฐานราก เสา คาน พื้น", amount: { low: 4_000_000, expected: 5_000_000, high: 6_000_000 } },
      { code: "design-professional-fee", label: "ค่าออกแบบและบริการวิชาชีพ", description: "งานออกแบบและเอกสาร", amount: { low: 525_000, expected: 671_250, high: 852_500 } },
    ],
    subtotal: { low: 4_525_000, expected: 5_671_250, high: 6_852_500 },
    contingency: { code: "contingency", label: "สำรองประมาณการ / ความเสี่ยงหน้างาน", description: "ค่าเผื่อหน้างาน", amount: { low: 200_000, expected: 200_000, high: 200_000 } },
    total: { low: 4_725_000, expected: 5_871_250, high: 7_052_500 },
  },
  assumptions: ["ประเมินจากข้อมูลเบื้องต้น"], includedItems: ["งานโครงสร้าง"], excludedItems: ["ค่าควบคุมงานก่อสร้าง: ยังไม่รวม"], confidence: "B", pricingVersion: "TH-2026Q2-QA-0.1", referenceDate: "2026-06-30",
  budgetComparison: { status: "within-target" }, disclaimer: "เป็นกรอบงบประมาณเพื่อใช้วางแผนเบื้องต้น", nextStepAdvice: "นัดพูดคุยกับสถาปนิกเพื่อยืนยันรายละเอียดโครงการ",
} satisfies FullReportViewModel;

test("renders the premium dynamic report, existing PDF action and a reconciled detailed budget", () => {
  render(<FullReport report={report} pdfHref="/api/reports/project-1/pdf" />);

  expect(screen.getByRole("heading", { name: "รายงานฉบับเต็ม ภาพรวมบ้านที่คุณกำลังวางแผน" })).toBeVisible();
  expect(screen.getByRole("link", { name: "ดาวน์โหลดเอกสารฉบับเต็ม (PDF)" })).toHaveAttribute("href", "/api/reports/project-1/pdf");
  expect(screen.getByRole("link", { name: "ดาวน์โหลดเอกสารฉบับเต็ม (PDF)" })).toHaveAttribute("download", "ksb-project-report.pdf");
  expect(screen.queryByRole("button", { name: "แชร์รายงานนี้" })).not.toBeInTheDocument();
  expect(screen.getByText("บ้านสไตล์คลาสสิก 2 ชั้น")).toBeVisible();
  expect(screen.getByText("กรุงเทพมหานคร")).toBeVisible();
  expect(screen.getByText("งานโครงสร้าง")).toBeVisible();
  expect(screen.getAllByText(/7,052,500/).length).toBeGreaterThan(0);
  expect(screen.getByText(/Slate \/ หินธรรมชาติ/)).toBeVisible();
  expect(screen.getByText("ระบบ Smart Home")).toBeVisible();
  expect(screen.queryByText(/classic-style|smart-home/)).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/ชื่อ|อีเมล|เบอร์โทร|LINE/i)).not.toBeInTheDocument();
});

test("changes the accessible main gallery view from thumbnails and arrow controls", async () => {
  const user = userEvent.setup();
  render(<FullReport report={report} pdfHref="/api/reports/project-1/pdf" />);

  expect(screen.getByText("01 / 12")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "แสดงมุมมอง 4" }));
  expect(screen.getByText("04 / 12")).toBeVisible();
  expect(screen.getByRole("img", { name: "มุมมอง 4 ของบ้านสไตล์ Classic Style" })).toBeVisible();
  await user.click(screen.getByRole("button", { name: "ภาพถัดไป" }));
  expect(screen.getByText("05 / 12")).toBeVisible();
});

test("reports consultation status only after server success without offering report sharing", async () => {
  const user = userEvent.setup();
  const onRequestConsultation = vi.fn().mockResolvedValue(undefined);
  const onConsultationRequested = vi.fn();
  render(<FullReport report={report} pdfHref="/api/reports/project-1/pdf" onRequestConsultation={onRequestConsultation} onConsultationRequested={onConsultationRequested} />);

  expect(screen.queryByRole("button", { name: "แชร์รายงานนี้" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "ปรึกษาสถาปนิก" }));
  await waitFor(() => expect(onRequestConsultation).toHaveBeenCalledOnce());
  expect(onConsultationRequested).toHaveBeenCalledOnce();
  expect(screen.getByText("ส่งคำขอนัดปรึกษาแล้ว")).toBeVisible();
});

test("aborts an in-flight consultation request when unmounted", async () => {
  const user = userEvent.setup();
  let signal: AbortSignal | undefined;
  const onRequestConsultation = vi.fn().mockImplementation((requestSignal: AbortSignal) => { signal = requestSignal; return new Promise<void>(() => undefined); });
  const { unmount } = render(<FullReport report={report} pdfHref="/api/reports/project-1/pdf" onRequestConsultation={onRequestConsultation} />);
  await user.click(screen.getByRole("button", { name: "ปรึกษาสถาปนิก" }));
  await waitFor(() => expect(onRequestConsultation).toHaveBeenCalledOnce());
  unmount();
  expect(signal?.aborted).toBe(true);
});
