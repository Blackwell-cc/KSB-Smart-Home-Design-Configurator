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
