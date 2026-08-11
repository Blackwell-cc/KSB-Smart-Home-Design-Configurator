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

  for (const label of ["โซนสวน", "โซนสระว่ายน้ำ"]) {
    const zone = page.getByText(label).locator("..");
    const style = await zone.evaluate((element) => getComputedStyle(element));
    expect(style.borderTopWidth).toBe("0px");
    expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
  }
  await expect(page.getByText("TROPICAL RESORT 02")).toHaveCount(0);
});

test("updates only the dynamic house mockup when a style is selected", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/configurator");

  const stage = page.getByLabel("พื้นที่แสดงแบบบ้าน");
  const modernLuxury = page.getByRole("radio", { name: "Contemporary Warm Luxury" });
  await modernLuxury.locator("..").click();
  await expect(modernLuxury).toBeChecked();
  await expect(stage).toHaveAttribute("data-preview-style", "contemporary-warm-luxury");
  await expect(page.getByRole("button", { name: "ถัดไป" })).toBeEnabled();

  const courtyard = page.getByRole("radio", { name: "Luxury Courtyard" });
  await courtyard.locator("..").click();
  await expect(courtyard).toBeChecked();
  await expect(stage).toHaveAttribute("data-preview-style", "luxury-courtyard");
  await expect(page.getByText("โซนสวน")).toBeVisible();
  await expect(page.getByText("โซนสระว่ายน้ำ")).toBeVisible();
});
