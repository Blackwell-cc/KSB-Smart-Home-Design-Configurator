import { expect, test } from "@playwright/test";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "wide", width: 1920, height: 1080 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
] as const;

async function openStepTwo(page: import("@playwright/test").Page) {
  await page.goto("/configurator");
  const style = page.getByRole("radio", { name: "Modern Style" });
  await style.locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await expect(page.getByRole("heading", { exact: true, level: 1, name: "พื้นที่และฟังก์ชัน" })).toBeVisible();
}

for (const viewport of viewports) {
  test(`keeps Step 2 usable at ${viewport.name}`, async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    await page.setViewportSize(viewport);
    await openStepTwo(page);

    const dimensions = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    if (viewport.width >= 1200) {
      const verticalDimensions = await page.evaluate(() => ({ clientHeight: document.documentElement.clientHeight, scrollHeight: document.documentElement.scrollHeight }));
      expect(verticalDimensions.scrollHeight).toBeLessThanOrEqual(verticalDimensions.clientHeight);
    }
    await expect(page.getByRole("complementary", { name: "ภาพตัวอย่างพื้นที่และฟังก์ชัน" })).toBeVisible();
    await expect(page.getByRole("region", { name: "สรุปรายการพื้นที่และฟังก์ชัน" })).toBeVisible();
    await expect(page.getByText("CONCEPT PREVIEW")).toHaveCount(0);
    await page.screenshot({ fullPage: true, path: testInfo.outputPath(`step-two-${viewport.name}.png`) });
    expect(consoleErrors).toEqual([]);
  });
}

test("keeps the Step 2 summary below the unobstructed preview image", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openStepTwo(page);

  const preview = page.getByRole("complementary", { name: "ภาพตัวอย่างพื้นที่และฟังก์ชัน" });
  const image = preview.locator("[data-preview-tone]");
  const summary = page.getByRole("region", { name: "สรุปรายการพื้นที่และฟังก์ชัน" });
  const [imageBox, summaryBox] = await Promise.all([image.boundingBox(), summary.boundingBox()]);
  expect(imageBox).not.toBeNull();
  expect(summaryBox).not.toBeNull();
  expect(summaryBox!.y - (imageBox!.y + imageBox!.height)).toBeGreaterThanOrEqual(20);

  await page.getByRole("checkbox", { name: "ห้องทำงาน" }).check();
  await expect(summary.getByText("ห้องทำงาน")).toBeVisible();
  await page.getByRole("button", { name: /จำนวนห้องนอน.*เพิ่ม/ }).click();
  await expect(summary.getByText("4 ห้อง")).toBeVisible();
});
