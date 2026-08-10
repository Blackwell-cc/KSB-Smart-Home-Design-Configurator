import { expect, test } from "@playwright/test";

test("explains the planning value and enters the Thai configurator", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("KSB Architect | Smart Home Design Configurator");
  await expect(page.locator("html")).toHaveAttribute("lang", "th");
  await expect(page.getByRole("heading", { name: "รู้พื้นที่และงบประมาณบ้านก่อนเริ่มสร้าง" })).toBeVisible();
  await expect(page.getByText(/Preview แรกไม่ต้องกรอกข้อมูลส่วนตัว/)).toBeVisible();
  await expect(page.getByAltText(/ภาพแนวคิดบ้านสไตล์ Contemporary Warm Luxury/)).toBeVisible();

  const primaryCta = page.getByRole("link", { name: "เริ่มวางแผนบ้าน" }).first();
  await expect(primaryCta).toHaveAttribute("href", "/configurator");
  await primaryCta.click();
  await expect(page).toHaveURL(/\/configurator$/);
  await expect(page.getByRole("heading", { name: "เลือกสไตล์บ้าน" })).toBeVisible();
});

test("keeps the landing usable without horizontal overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  const primaryCta = page.getByRole("link", { name: "เริ่มวางแผนบ้าน" }).first();
  const box = await primaryCta.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);

  await page.getByRole("link", { name: "ดูขั้นตอนการใช้งาน" }).click();
  await expect(page).toHaveURL(/#process$/);
  await expect(page.getByRole("region", { name: "จากความต้องการ สู่กรอบโครงการที่คุยกับสถาปนิกได้" })).toBeInViewport();
});
