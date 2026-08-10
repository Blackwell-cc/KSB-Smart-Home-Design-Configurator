import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { PriceBookEditor } from "./price-book-editor";

const draft = { candidateId: "11111111-1111-4111-8111-111111111111", version: "TH-2026Q3-1.0", referenceDate: "2026-08-01", provinceEntries: Array.from({ length: 77 }, (_, index) => ({ code: String(index) })), materialLevels: ["select", "premium", "signature"], specialFeatures: ["pool"], featureAllowances: { pool: { low: 1, expected: 2, high: 3 } }, goldenCasesPassed: true, approvedBy: "architect-1", approvedAt: "2026-08-07T00:00:00.000Z", sources: ["KSB"] };
const goldenCases = [
  { code: "KSB-01", currentTotal: 5_000_000, candidateTotal: 5_500_000 },
  { code: "KSB-02", currentTotal: 8_000_000, candidateTotal: 7_600_000 },
];

test("shows golden-case percentage diffs and requires explicit confirmation before publish", async () => {
  const onPublish = vi.fn().mockResolvedValue(undefined); const user = userEvent.setup();
  render(<PriceBookEditor draft={draft} goldenCases={goldenCases} onPublish={onPublish} />);

  expect(screen.getByText("+10.0%")).toBeVisible(); expect(screen.getByText("-5.0%")).toBeVisible();
  const publishButton = screen.getByRole("button", { name: "เผยแพร่ Price Book เวอร์ชันนี้" });
  expect(publishButton).toBeDisabled();
  await user.click(screen.getByRole("checkbox", { name: /ยืนยันว่าได้ตรวจ Golden Cases/ }));
  expect(publishButton).toBeEnabled();
  await user.click(publishButton);
  expect(onPublish).toHaveBeenCalledWith(draft);
});
