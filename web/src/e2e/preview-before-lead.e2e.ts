import { expect, test } from "@playwright/test";
import { completeConfigurator, mockEstimate, selectStyleWithKeyboard } from "./helpers/complete-configurator";

test("shows a useful free preview before asking for contact details", async ({ page }) => {
  const invalidImageWarnings: string[] = [];
  page.on("console", (message) => {
    if (message.text().includes("parent element with invalid \"position\"")) invalidImageWarnings.push(message.text());
  });
  await mockEstimate(page);
  await page.goto("/configurator");

  const styleCards = page.locator('[data-style-card="true"]');
  await expect(styleCards).toHaveCount(4);
  await expect(styleCards.locator("img")).toHaveCount(4);
  await expect(styleCards.first().locator("img")).toHaveAttribute("src", /contemporary-warm-luxury/);

  const livePreview = page.getByRole("complementary", { name: "ภาพตัวอย่างบ้าน" });
  await expect(livePreview).toContainText("จำนวนชั้น 2 ชั้น");
  await selectStyleWithKeyboard(page, "Modern Tropical Resort");
  await expect(livePreview.getByRole("img", { name: /Modern Tropical Resort/i })).toBeVisible();
  await selectStyleWithKeyboard(page, "Contemporary Warm Luxury");
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: "จำนวนห้องนอน เพิ่ม" }).click();
  await expect(livePreview).toContainText("ห้องนอน 4 ห้อง");
  await page.getByRole("button", { name: "ย้อนกลับ" }).click();
  await completeConfigurator(page);

  await expect(page.getByRole("heading", { name: "ภาพรวมบ้านที่คุณกำลังวางแผน" })).toBeVisible();
  await expect(page.getByLabel("กรอบงบประมาณเบื้องต้น")).toContainText("5,400,000");
  await expect(page.getByText("ข้อมูลทดสอบเพื่อพัฒนาระบบ")).toBeVisible();
  await expect(page.getByLabel(/เบอร์โทรศัพท์|อีเมล|LINE ID/)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "รับสรุปโครงการฉบับเต็ม" })).toBeVisible();
  expect(invalidImageWarnings).toEqual([]);
});
