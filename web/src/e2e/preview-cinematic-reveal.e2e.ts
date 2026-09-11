import { expect, test } from "@playwright/test";

async function openResult(page: import("@playwright/test").Page) {
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
  await page.getByRole("button", { name: "ไปยังหน้าสรุปค่าใช้จ่าย" }).click();
  await expect(page.getByRole("status", { name: "กำลังประเมินงบประมาณ" })).toBeVisible();
  await expect(page.locator('main[data-result-reveal="cinematic"]')).toBeAttached({ timeout: 8_000 });
}

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 375, height: 812 },
]) {
  test(`reveals the estimate cinematically without horizontal overflow on ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await openResult(page);

    const result = page.locator('main[data-result-reveal="cinematic"]');
    const house = result.locator('[class*="materialConceptImage"]');
    await expect.poll(async () => house.evaluate((element) => getComputedStyle(element).animationName)).toContain("houseReveal");

    await page.waitForTimeout(2_000);
    await expect(page.getByRole("heading", { name: /ภาพรวมบ้าน/ })).toBeVisible();
    await expect(result.getByText("งบประมาณโดยประมาณ")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`preview-cinematic-${viewport.name}.png`), fullPage: true });
  });
}
