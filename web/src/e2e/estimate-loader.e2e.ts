import { expect, test } from "@playwright/test";

test("shows the branded loader for at least three seconds before revealing the estimate", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/configurator");
  await page.getByRole("radio", { name: "Nordic Style" }).locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  const province = page.getByRole("combobox", { name: "จังหวัด" });
  await province.fill("กรุงเทพมหานคร");
  await page.getByRole("option", { name: "กรุงเทพมหานคร" }).click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await expect(page.getByRole("heading", { name: "ตรวจสอบความถูกต้อง" })).toBeVisible();

  const loader = page.getByRole("status", { name: "กำลังประเมินงบประมาณ" });
  const loadingStartedAt = Date.now();
  const navigation = page.getByRole("button", { name: "ไปยังหน้าสรุปค่าใช้จ่าย" }).click();
  await expect(loader).toBeVisible();
  await expect(loader.getByTestId("ai-loader-ring")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("estimate-loader.png") });
  await navigation;
  await expect(page.getByRole("heading", { name: /ภาพรวมบ้าน/ })).toBeVisible();
  expect(Date.now() - loadingStartedAt).toBeGreaterThanOrEqual(3_000);
});
