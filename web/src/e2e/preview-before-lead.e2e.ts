import { expect, test } from "@playwright/test";
import { completeConfigurator, mockEstimate } from "./helpers/complete-configurator";

test("shows a useful free preview before asking for contact details", async ({ page }) => {
  const invalidImageWarnings: string[] = [];
  page.on("console", (message) => {
    if (message.text().includes("parent element with invalid \"position\"")) invalidImageWarnings.push(message.text());
  });
  await mockEstimate(page);
  await page.goto("/configurator");
  await completeConfigurator(page);

  await expect(page.getByRole("heading", { name: "ภาพรวมบ้านที่คุณกำลังวางแผน" })).toBeVisible();
  await expect(page.getByLabel("กรอบงบประมาณเบื้องต้น")).toContainText("5,400,000");
  await expect(page.getByLabel(/เบอร์โทรศัพท์|อีเมล|LINE ID/)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "รับสรุปโครงการฉบับเต็ม" })).toBeVisible();
  expect(invalidImageWarnings).toEqual([]);
});
