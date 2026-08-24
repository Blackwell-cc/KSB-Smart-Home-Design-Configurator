import { expect, test } from "@playwright/test";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
] as const;

for (const viewport of viewports) {
  test(`keeps the premium step-one workspace usable on ${viewport.name}`, async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/configurator");

    await expect(page.getByRole("heading", { name: "เลือกรูปแบบบ้าน" })).toBeVisible();
    await expect(page.getByRole("radiogroup", { name: "เลือกสไตล์บ้าน" })).toBeVisible();
    await expect(page.getByLabel("พื้นที่แสดงแบบบ้าน")).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

    await page.screenshot({ fullPage: true, path: testInfo.outputPath(`step-one-${viewport.name}.png`) });
    expect(consoleErrors).toEqual([]);
  });
}

test("fits desktop to one viewport with a full-bleed preview and an independently scrolling style list", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/configurator");

  const pageMetrics = await page.evaluate(() => ({
    innerHeight: window.innerHeight,
    scrollHeight: document.documentElement.scrollHeight,
  }));
  expect(pageMetrics.scrollHeight).toBeLessThanOrEqual(pageMetrics.innerHeight);

  const styleList = page.getByRole("radiogroup", { name: "เลือกสไตล์บ้าน" });
  const listMetrics = await styleList.evaluate((element) => ({
    clientHeight: element.clientHeight,
    overflowY: getComputedStyle(element).overflowY,
    scrollHeight: element.scrollHeight,
  }));
  expect(listMetrics.overflowY).toBe("auto");
  expect(listMetrics.scrollHeight).toBeGreaterThan(listMetrics.clientHeight);

  const stage = page.locator('[data-render-size="860x520"]');
  const house = stage.locator("[data-preview-tone]");
  const [stageBox, houseBox] = await Promise.all([stage.boundingBox(), house.boundingBox()]);
  expect(stageBox).not.toBeNull();
  expect(houseBox).not.toBeNull();
  expect(Math.abs(stageBox!.width - houseBox!.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(stageBox!.height - houseBox!.height)).toBeLessThanOrEqual(1);

  await expect(page.getByText("โซนสวน")).toHaveCount(0);
  await expect(page.getByText("โซนสระว่ายน้ำ")).toHaveCount(0);
  await expect(page.getByText("32.00 ม.")).toHaveCount(0);
  await expect(page.getByText("TROPICAL RESORT 02")).toHaveCount(0);
});

test("updates only the dynamic house mockup when a style is selected", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/configurator");

  const stage = page.getByLabel("พื้นที่แสดงแบบบ้าน");
  const modernLuxury = page.getByRole("radio", { name: "Modern Style" });
  await modernLuxury.locator("..").click();
  await expect(modernLuxury).toBeChecked();
  await expect(stage).toHaveAttribute("data-preview-style", "modern-style");
  await expect(page.getByRole("button", { name: "ถัดไป" })).toBeEnabled();

  const tropical = page.getByRole("radio", { name: "Tropical" });
  await tropical.locator("..").click();
  await expect(tropical).toBeChecked();
  await expect(stage).toHaveAttribute("data-preview-style", "luxury-style");
  await expect(page.getByText("โซนสวน")).toHaveCount(0);
  await expect(page.getByText("โซนสระว่ายน้ำ")).toHaveCount(0);
});

test("keeps the compact workspace after leaving step one", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/configurator");

  const style = page.getByRole("radio", { name: "Modern Style" });
  await style.locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByLabel("จังหวัด").selectOption("10");
  await page.getByRole("button", { name: "ถัดไป" }).click();

  const layout = page.getByTestId("configurator-layout");
  await expect(layout).toHaveAttribute("data-step", "materials");
  const metrics = await layout.evaluate((element) => ({
    documentHeight: document.documentElement.scrollHeight,
    overflowY: getComputedStyle(element).overflowY,
    viewportHeight: window.innerHeight,
  }));
  expect(metrics.overflowY).toBe("hidden");
  expect(metrics.documentHeight).toBeLessThanOrEqual(metrics.viewportHeight);
  await page.screenshot({ fullPage: true, path: testInfo.outputPath("step-four-compact.png") });
});
