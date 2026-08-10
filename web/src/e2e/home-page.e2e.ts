import { expect, test } from "@playwright/test";

test("explains the planning value and enters the Thai configurator", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");

  await expect(page).toHaveTitle("KSB Architect | Smart Home Design Configurator");
  await expect(page.locator("html")).toHaveAttribute("lang", "th");
  await expect(page.getByRole("heading", { name: "รู้พื้นที่และงบประมาณบ้าน ก่อนเริ่มสร้าง" })).toBeVisible();
  await expect(page.getByText(/Preview แรกไม่ต้องกรอกข้อมูลส่วนตัว/)).toBeVisible();
  await expect(page.getByRole("img", { name: "โลโก้ KSB Architect" })).toBeVisible();
  await expect(page.getByAltText(/ภาพแนวคิดบ้านสไตล์ Contemporary Warm Luxury/)).toBeVisible();

  const primaryCta = page.getByRole("link", { name: "เริ่มวางแผนบ้าน" });
  await expect(primaryCta).toBeInViewport();
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

  const primaryCta = page.getByRole("link", { name: "เริ่มวางแผนบ้าน" });
  const box = await primaryCta.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);

  await expect(page.getByRole("link", { name: "ปรึกษาฟรี" })).toHaveAttribute("href", "tel:0919914592");
});
