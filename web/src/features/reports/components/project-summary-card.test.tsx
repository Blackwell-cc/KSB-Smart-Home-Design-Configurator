import { render, screen } from "@testing-library/react";
import type { FullReportViewModel } from "../application/build-full-report";
import { ProjectSummaryCard } from "./project-summary-card";

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
  lines: [],
  assumptions: [],
  includedItems: [],
  excludedItems: [],
  confidence: "B",
  pricingVersion: "TH-2026Q2-QA-0.1",
  referenceDate: "2026-06-30",
  disclaimer: "เป็นกรอบงบประมาณเพื่อใช้วางแผนเบื้องต้น",
  nextStepAdvice: "นัดพูดคุยกับสถาปนิกเพื่อยืนยันรายละเอียดโครงการ",
  budgetComparison: { status: "no-target" },
};

test("renders a self-contained, share-safe project summary card", () => {
  render(<ProjectSummaryCard report={report} />);

  expect(screen.getByRole("img", { name: /Contemporary Warm Luxury/i })).toBeVisible();
  expect(screen.getByText("ประมาณการงบโครงการ")).toBeVisible();
  expect(screen.getByText("4,725,000 – 7,052,500 บาท")).toBeVisible();
  expect(screen.getByText("เป็นกรอบงบประมาณเพื่อใช้วางแผนเบื้องต้น")).toBeVisible();
  expect(screen.queryByText(/snapshot-1|ชื่อ|อีเมล|เบอร์โทร|LINE/i)).not.toBeInTheDocument();
});
