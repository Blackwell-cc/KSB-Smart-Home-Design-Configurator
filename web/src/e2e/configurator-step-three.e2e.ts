import { expect, test } from "@playwright/test";
import { selectProvince } from "./helpers/complete-configurator";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "wide", width: 1920, height: 1080 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
] as const;

async function openStepThree(page: import("@playwright/test").Page) {
  await page.goto("/configurator");
  await page.getByRole("radio", { name: "Modern Style" }).locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await expect(page.getByRole("heading", { exact: true, level: 1, name: "กำหนดงบประมาณ" })).toBeVisible();
}

for (const viewport of viewports) {
  test(`keeps Step 3 usable at ${viewport.name}`, async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    await page.setViewportSize(viewport);
    await openStepThree(page);

    const dimensions = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    if (viewport.width >= 1200) {
      const verticalDimensions = await page.evaluate(() => ({ clientHeight: document.documentElement.clientHeight, scrollHeight: document.documentElement.scrollHeight }));
      expect(verticalDimensions.scrollHeight).toBeLessThanOrEqual(verticalDimensions.clientHeight);
    }
    await expect(page.getByRole("complementary", { name: "ตัวอย่างแนวคิดบ้าน" })).toBeVisible();
    await expect(page.getByRole("region", { name: "สรุปข้อมูลเบื้องต้น" })).toBeVisible();
    await expect(page.getByRole("spinbutton")).toHaveCount(0);
    await page.screenshot({ fullPage: true, path: testInfo.outputPath(`step-three-${viewport.name}.png`) });
    expect(consoleErrors).toEqual([]);
  });
}

test("searches and selects a province from the custom combobox", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openStepThree(page);

  const province = page.getByRole("combobox", { name: "จังหวัด" });
  await province.fill("เชียง");

  const options = page.getByRole("listbox", { name: "รายชื่อจังหวัด" }).getByRole("option");
  await expect(options).toHaveCount(2);
  await expect(options.nth(0)).toHaveText("เชียงใหม่");
  await expect(options.nth(1)).toHaveText("เชียงราย");
  await page.screenshot({ fullPage: true, path: testInfo.outputPath("province-search-results.png") });

  await options.nth(0).click();
  await expect(province).toHaveValue("เชียงใหม่");
  await expect(page.getByRole("listbox", { name: "รายชื่อจังหวัด" })).toBeHidden();
  await expect(page.getByRole("region", { name: "สรุปข้อมูลเบื้องต้น" })).toContainText("เชียงใหม่");
});

test("uses the same polished dropdown treatment for site access", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openStepThree(page);

  const access = page.getByRole("combobox", { name: "สภาพการเข้าถึงหน้างาน" });
  await access.click();

  const options = page.getByRole("listbox", { name: "ตัวเลือกสภาพการเข้าถึงหน้างาน" });
  await expect(options.getByRole("option")).toHaveCount(3);
  await page.screenshot({ fullPage: true, path: testInfo.outputPath("site-access-dropdown.png") });

  await options.getByRole("option", { name: "ถนนค่อนข้างแคบ" }).click();
  await expect(access).toContainText("ถนนค่อนข้างแคบ");
  await expect(options).toBeHidden();
  await expect(page.getByRole("region", { name: "สรุปข้อมูลเบื้องต้น" })).toContainText("ถนนค่อนข้างแคบ");
});

test("updates the Step 3 summary and keeps it below the clean preview", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openStepThree(page);

  const preview = page.getByRole("complementary", { name: "ตัวอย่างแนวคิดบ้าน" });
  const image = preview.getByRole("img", { name: /ภาพแนวคิดบ้าน/ });
  const summary = page.getByRole("region", { name: "สรุปข้อมูลเบื้องต้น" });
  const [imageBox, summaryBox] = await Promise.all([image.boundingBox(), summary.boundingBox()]);
  expect(imageBox).not.toBeNull();
  expect(summaryBox).not.toBeNull();
  expect(summaryBox!.y - (imageBox!.y + imageBox!.height)).toBeGreaterThanOrEqual(20);

  await selectProvince(page);
  await page.getByRole("radio", { name: "10–20 ล้านบาท" }).locator("..").click();
  await expect(summary).toContainText("กรุงเทพมหานคร");
  await expect(summary).toContainText("10–20 ล้านบาท");
  await expect(preview.getByRole("button")).toHaveCount(0);

  await page.getByRole("button", { name: "ถัดไป" }).click();
  await expect(page.getByRole("heading", { exact: true, level: 1, name: "วัสดุและส่วนพิเศษ" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "ภาพตัวอย่างวัสดุ" })).toBeVisible();
  await page.getByRole("button", { name: "ย้อนกลับ" }).click();
  await expect(page.getByRole("radio", { name: "10–20 ล้านบาท" })).toBeChecked();
});

test("supports keyboard selection for the budget radio group", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openStepThree(page);

  const unspecified = page.getByRole("radio", { name: "ยังไม่ระบุ" });
  await unspecified.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "ต่ำกว่า 5 ล้านบาท" })).toBeChecked();
  await expect(page.getByRole("region", { name: "สรุปข้อมูลเบื้องต้น" })).toContainText("ต่ำกว่า 5 ล้านบาท");
});
