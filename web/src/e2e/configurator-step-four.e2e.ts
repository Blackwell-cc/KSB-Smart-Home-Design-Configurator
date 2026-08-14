import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "reference", width: 1672, height: 941 },
  { name: "wide", width: 1920, height: 1080 },
] as const;

async function openStepFour(page: Page) {
  await page.goto("/configurator");
  await page.getByRole("radio", { name: "Contemporary Warm Luxury" }).locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByLabel("จังหวัด").selectOption("10");
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await expect(page.getByRole("heading", { exact: true, level: 1, name: "วัสดุและส่วนพิเศษ" })).toBeVisible();
}

for (const viewport of viewports) {
  test(`keeps Step 4 usable at ${viewport.name}`, async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", (error) => { pageErrors.push(error.message); });
    await page.setViewportSize(viewport);
    await openStepFour(page);

    const dimensions = await page.evaluate(() => ({
      clientHeight: document.documentElement.clientHeight,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    if (viewport.width >= 1200) expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.clientHeight);

    await expect(page.getByTestId("main-house-preview-placeholder")).toBeVisible();
    await expect(page.getByRole("complementary", { name: "ภาพตัวอย่างวัสดุ" }).getByRole("img")).toHaveCount(0);
    await page.screenshot({ fullPage: true, path: testInfo.outputPath(`step-four-${viewport.name}.png`) });
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
}

test("matches the reference desktop structure while only the catalog scrolls", async ({ page }) => {
  await page.setViewportSize({ width: 1672, height: 941 });
  await openStepFour(page);

  const layout = page.getByTestId("configurator-layout");
  const shell = layout.locator(':scope > div[data-step="materials"]');
  const form = shell.locator(":scope > section").first();
  const preview = page.getByRole("complementary", { name: "ภาพตัวอย่างวัสดุ" });
  const header = layout.locator("header");
  const [formBox, headerBox, previewBox] = await Promise.all([form.boundingBox(), header.boundingBox(), preview.boundingBox()]);
  expect(formBox).not.toBeNull();
  expect(headerBox).not.toBeNull();
  expect(previewBox).not.toBeNull();
  expect(headerBox!.height).toBeGreaterThanOrEqual(72);
  expect(headerBox!.height).toBeLessThanOrEqual(80);
  expect(formBox!.width / (formBox!.width + previewBox!.width)).toBeGreaterThanOrEqual(0.43);
  expect(formBox!.width / (formBox!.width + previewBox!.width)).toBeLessThanOrEqual(0.45);

  const materialCards = page.getByTestId("material-asset-placeholder");
  await expect(materialCards).toHaveCount(32);
  for (const label of ["หลังคา", "ผนังภายนอก", "หน้าต่าง", "ประตูทางเข้า", "พื้น", "ฝ้าเพดาน", "รายละเอียดฟาซาด", "แสงและบรรยากาศ"]) {
    const materialGroup = page.getByRole("radiogroup", { name: label });
    await expect(materialGroup).toHaveCount(1);
    await expect(materialGroup.getByRole("radio")).toHaveCount(4);
  }
  const firstRow = await Promise.all([0, 1, 2, 3].map((index) => materialCards.nth(index).boundingBox()));
  expect(firstRow.every((box) => box !== null && Math.abs(box.y - firstRow[0]!.y) < 1)).toBe(true);
  expect(firstRow[0]!.width).toBeGreaterThanOrEqual(110);
  expect(firstRow[0]!.width).toBeLessThanOrEqual(125);

  const featureCards = page.getByTestId("feature-asset-placeholder");
  await expect(featureCards).toHaveCount(15);
  const featureRow = await Promise.all([0, 1, 2, 3, 4].map((index) => featureCards.nth(index).boundingBox()));
  expect(featureRow.every((box) => box !== null && Math.abs(box.y - featureRow[0]!.y) < 1)).toBe(true);
  expect(featureRow[0]!.width).toBeGreaterThanOrEqual(95);
  expect(featureRow[0]!.width).toBeLessThanOrEqual(110);

  const previewPlaceholder = page.getByTestId("main-house-preview-placeholder");
  const previewPlaceholderBox = await previewPlaceholder.boundingBox();
  expect(previewPlaceholderBox).not.toBeNull();
  expect(previewPlaceholderBox!.width / previewPlaceholderBox!.height).toBeCloseTo(1.6, 1);
  expect(previewPlaceholderBox!.width).toBeGreaterThanOrEqual(760);

  const allPlaceholders = page.locator("[data-placeholder-type]");
  const placeholderStates = await allPlaceholders.evaluateAll((nodes) => nodes.map((node) => ({
    backgroundImage: window.getComputedStyle(node).backgroundImage,
    childElementCount: node.childElementCount,
    descendantImages: node.querySelectorAll("img").length,
    text: node.textContent?.trim() ?? "",
  })));
  expect(placeholderStates.length).toBeGreaterThanOrEqual(48);
  for (const state of placeholderStates) {
    expect(state.childElementCount).toBe(0);
    expect(state.descendantImages).toBe(0);
    expect(state.text).toBe("");
    expect(state.backgroundImage.toLowerCase()).not.toContain("url(");
  }

  await expect(preview.locator("img, button, input, select, [role=toolbar], [data-preview-control], [data-overlay]")).toHaveCount(0);
  const summary = preview.getByRole("region", { name: "สรุปวัสดุที่เลือก" });
  await expect(summary).toBeVisible();
  await expect(preview.locator(":scope > section")).toHaveCount(1);
  await expect(previewPlaceholder.locator("section")).toHaveCount(0);
  expect(await previewPlaceholder.evaluate((node) => !node.contains(node.closest("aside")?.querySelector("section") ?? null))).toBe(true);

  const scrollArea = page.getByTestId("material-scroll-area");
  const quality = page.getByRole("radiogroup", { name: "ระดับคุณภาพวัสดุ" });
  const backAction = page.getByRole("button", { name: "ย้อนกลับ" });
  const nextAction = page.getByRole("button", { name: "ถัดไป" });
  const scrollMetrics = await scrollArea.evaluate((node) => ({
    clientHeight: node.clientHeight,
    scrollHeight: node.scrollHeight,
  }));
  expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight);
  const before = await quality.boundingBox();
  expect(before).not.toBeNull();
  const resultingScrollTop = await scrollArea.evaluate((node) => {
    node.scrollTop = node.scrollHeight;
    return node.scrollTop;
  });
  expect(resultingScrollTop).toBeGreaterThan(0);
  await expect(page.getByRole("checkbox", { name: "พื้นที่สำหรับสัตว์เลี้ยง" })).toBeInViewport();
  await expect(quality).toBeVisible();
  await expect(backAction).toBeVisible();
  await expect(nextAction).toBeVisible();
  const after = await quality.boundingBox();
  expect(after).not.toBeNull();
  expect(after!.y).toBeCloseTo(before!.y, 0);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(941);
});

test("supports keyboard material selection and persists special features", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => { pageErrors.push(error.message); });
  await page.setViewportSize({ width: 1440, height: 900 });
  await openStepFour(page);

  const roof = page.getByRole("radiogroup", { name: "หลังคา" });
  const firstRoof = roof.getByRole("radio").first();
  await firstRoof.focus();
  await page.keyboard.press("ArrowRight");
  await expect(roof.getByRole("radio").nth(1)).toBeChecked();

  const pool = page.getByRole("checkbox", { name: "สระว่ายน้ำ" });
  await pool.check();
  await expect(page.getByRole("complementary", { name: "ภาพตัวอย่างวัสดุ" })).toContainText("สระว่ายน้ำ");

  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: "แก้ไขวัสดุและส่วนพิเศษ" }).click();
  await expect(pool).toBeChecked();
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
