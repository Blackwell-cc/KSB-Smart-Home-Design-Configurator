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
  await expect(styleCards).toHaveCount(7);
  await expect(styleCards.locator("img")).toHaveCount(7);
  await expect(styleCards.first().locator("img")).toHaveAttribute("src", /base-classic-2f-master\.webp/);

  const stylePreview = page.getByRole("complementary", { name: "พื้นที่แสดงแบบบ้าน" });
  await expect(stylePreview).toContainText("จำนวนชั้น");
  await expect(stylePreview).toContainText("2 ชั้น");
  await selectStyleWithKeyboard(page, "Nordic Style");
  await expect(stylePreview.getByRole("img", { name: /Nordic Style/i })).toBeVisible();
  await selectStyleWithKeyboard(page, "Modern Style");
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: "จำนวนห้องนอน เพิ่ม" }).click();
  await expect(page.getByRole("spinbutton", { name: "จำนวนห้องนอน" })).toHaveValue("4");
  await page.getByRole("button", { name: "ย้อนกลับ" }).click();
  await completeConfigurator(page);

  await expect(page.getByRole("heading", { name: /ภาพรวมบ้าน\s+ที่คุณกำลังวางแผน/ })).toBeVisible();
  await expect(page.getByLabel("กรอบงบประมาณเบื้องต้น")).toContainText("5,400,000");
  await expect(page.getByText("ข้อมูลทดสอบเพื่อพัฒนาระบบ")).toBeVisible();
  await expect(page.getByText("บ้านแบบนี้เหมาะกับคนแบบไหน")).toBeVisible();
  await expect(page.getByText("เหตุผลที่ค่าออกแบบมีคุณค่า")).toBeVisible();
  await expect(page.getByText("แชร์ผลลัพธ์นี้ให้เพื่อนของคุณ")).toBeVisible();
  await expect(page.getByText("สรุปข้อมูลแบบคร่าว ๆ ยังไม่ใช่ฉบับสมบูรณ์")).toBeVisible();
  await expect(page.getByText("เลือกสไตล์บ้าน", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel(/เบอร์โทรศัพท์|อีเมล|LINE ID/)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "รับข้อมูลฉบับเต็ม" })).toBeVisible();
  await expect(page.getByRole("button", { name: "แชร์ผ่าน LINE" })).toBeVisible();
  await expect(page.getByRole("button", { name: "แชร์ผ่าน Instagram" })).toBeVisible();
  await expect(page.getByRole("button", { name: "แชร์ผ่าน Facebook" })).toBeVisible();
  await expect(page.getByRole("button", { name: "คัดลอกลิงก์" })).toBeVisible();
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", await page.locator("html").evaluate((element) => element.clientWidth));

  const fullReportCta = page.getByRole("button", { name: "รับข้อมูลฉบับเต็ม" });
  await fullReportCta.click();
  const dialog = page.getByRole("dialog", { name: "รับข้อมูลฉบับเต็ม" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Modern Style");
  await expect(dialog).toContainText("กรุงเทพมหานคร");
  await expect(dialog).toContainText("พื้นที่ใช้สอย 164 ตร.ม.");
  await expect(dialog.getByTestId("additional-house-view")).toHaveCount(3);
  await expect(dialog).toContainText("+12 มุมเพิ่มเติม");
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  await dialog.getByRole("button", { name: "รับรายงานฉบับเต็ม" }).click();
  await expect(dialog.getByText("กรุณาระบุชื่อ–นามสกุล")).toBeVisible();
  await expect(dialog.getByText("กรุณาระบุเบอร์โทรศัพท์")).toBeVisible();
  await expect(dialog.getByText("กรุณาระบุอีเมลให้ถูกต้อง")).toBeVisible();
  await expect(dialog.locator("#full-report-requestPurpose-error")).toHaveText("กรุณาเลือกวัตถุประสงค์ในการขอข้อมูล");

  const fullName = dialog.getByLabel("ชื่อ–นามสกุล *");
  await fullName.fill("เจ้าของบ้านทดสอบ");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(fullReportCta).toBeFocused();
  await fullReportCta.click();
  await expect(dialog.getByLabel("ชื่อ–นามสกุล *")).toHaveValue("เจ้าของบ้านทดสอบ");

  await page.setViewportSize({ width: 1377, height: 858 });
  const contactPanel = dialog.getByRole("region", { name: "ข้อมูลติดต่อของคุณ" });
  const purposeField = dialog.getByLabel("วัตถุประสงค์ในการขอข้อมูล *");
  const privacyCard = dialog.getByRole("heading", { name: "มั่นใจในความปลอดภัยของข้อมูล" }).locator("..").locator("..");
  const [contactBox, purposeBox, privacyBox] = await Promise.all([
    contactPanel.boundingBox(),
    purposeField.boundingBox(),
    privacyCard.boundingBox(),
  ]);
  expect(contactBox).not.toBeNull();
  expect(purposeBox).not.toBeNull();
  expect(privacyBox).not.toBeNull();
  expect(purposeBox!.y + purposeBox!.height).toBeLessThanOrEqual(contactBox!.y + contactBox!.height - 16);
  expect(contactBox!.y + contactBox!.height + 12).toBeLessThanOrEqual(privacyBox!.y);

  for (const viewport of [
    { width: 375, height: 812 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
    { width: 1672, height: 940 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(dialog).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
  expect(invalidImageWarnings).toEqual([]);
});
