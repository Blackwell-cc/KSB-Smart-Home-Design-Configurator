import { expect, test, type Page } from "@playwright/test";
import { selectProvince } from "./helpers/complete-configurator";

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "reference", width: 1672, height: 941 },
  { name: "current-desktop", width: 1908, height: 896 },
  { name: "wide", width: 1920, height: 1080 },
] as const;

async function openStepFive(page: Page) {
  await page.goto("/configurator");
  await page.getByRole("radio", { name: "Nordic Style" }).locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("checkbox", { name: "ห้องทำงาน" }).check();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await selectProvince(page);
  await page.getByRole("radio", { name: "40–80 ล้านบาท" }).locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("checkbox", { name: "สระว่ายน้ำ" }).check();
  await page.getByRole("radio", { name: /SIGNATURE/i }).locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await expect(page.getByRole("heading", { exact: true, level: 1, name: "ตรวจสอบความถูกต้อง" })).toBeVisible();
}

for (const viewport of viewports) {
  test(`keeps Step 5 review usable at ${viewport.name}`, async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", (error) => { pageErrors.push(error.message); });
    await page.setViewportSize(viewport);
    await openStepFive(page);

    const dimensions = await page.evaluate(() => ({
      clientHeight: document.documentElement.clientHeight,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    if (viewport.width >= 1200) expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.clientHeight);

    if (viewport.name === "current-desktop") {
      const spaceCard = page.locator('[class*="compactStack"] article').nth(1);
      const materialList = page.locator('[class*="materialListCard"] ul');
      const confirmationCards = page.locator('[class*="confirmationCard"]');
      const actions = page.locator('[class*="actions"]');

      const spaceOverflow = await spaceCard.evaluate((element) => ({
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
      }));
      expect.soft(spaceOverflow.scrollHeight).toBeLessThanOrEqual(spaceOverflow.clientHeight);

      const [actionsBox, readinessBox, benefitsBox] = await Promise.all([
        actions.boundingBox(),
        confirmationCards.nth(0).boundingBox(),
        confirmationCards.nth(1).boundingBox(),
      ]);
      expect(actionsBox).not.toBeNull();
      expect(readinessBox).not.toBeNull();
      expect(benefitsBox).not.toBeNull();
      expect.soft(actionsBox!.y - (readinessBox!.y + readinessBox!.height)).toBeGreaterThanOrEqual(10);
      expect.soft(actionsBox!.y - (benefitsBox!.y + benefitsBox!.height)).toBeGreaterThanOrEqual(10);

      const actionButtonBoxes = await actions.getByRole("button").evaluateAll((buttons) =>
        buttons.map((button) => button.getBoundingClientRect().height),
      );
      expect.soft(Math.max(...actionButtonBoxes)).toBeLessThanOrEqual(48);

      await expect.soft(materialList).toHaveCSS("overflow-y", "auto");
    }

    await expect(page.getByTestId("step-five-preview").getByRole("img", { name: "Nordic Style 2 ชั้น" })).toBeVisible();
    await expect(page.getByText("Nordic Style")).toBeVisible();
    await expect(page.getByText("40–80 ล้านบาท")).toBeVisible();
    await expect(page.getByText("SIGNATURE", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "ไปยังหน้าสรุปค่าใช้จ่าย" })).toBeVisible();
    await expect(page.getByText(/ราคาก่อสร้าง|บาท\/ตร\.ม\.|งบประมาณโดยประมาณ/)).toHaveCount(0);
    const materialImages = page.locator('[class*="materialListCard"] img');
    await expect(materialImages).toHaveCount(4);
    await expect(materialImages.nth(0)).toHaveAttribute("src", "/materials/roof/1.png");
    await expect(materialImages.nth(1)).toHaveAttribute("src", "/materials/wall/1.png");
    await expect(materialImages.nth(2)).toHaveAttribute("src", "/materials/window/1.png");
    await expect(materialImages.nth(3)).toHaveAttribute("src", "/materials/door/4.png");
    await expect.poll(() => materialImages.evaluateAll((images) => images.every((image) => {
      const element = image as HTMLImageElement;
      return element.complete && element.naturalWidth > 0;
    }))).toBe(true);
    const specialFeatureImages = page.locator('[class*="specialFeatureList"] img');
    await expect(specialFeatureImages).toHaveCount(1);
    await expect(specialFeatureImages.first()).toHaveAttribute("src", "/materials/special-features/1.png");
    await expect.poll(() => specialFeatureImages.first().evaluate((image) => {
      const element = image as HTMLImageElement;
      return element.complete && element.naturalWidth > 0;
    })).toBe(true);
    await expect(page.getByRole("button", { name: "บันทึกแบบร่าง" })).toHaveCount(1);

    if (viewport.width < 1200) {
      const [previewBox, reviewsBox] = await Promise.all([
        page.getByTestId("step-five-preview").boundingBox(),
        page.getByTestId("step-five-review-cards").boundingBox(),
      ]);
      expect(previewBox).not.toBeNull();
      expect(reviewsBox).not.toBeNull();
      expect(previewBox!.y).toBeLessThan(reviewsBox!.y);
    }

    await page.screenshot({ fullPage: true, path: testInfo.outputPath(`step-five-${viewport.name}.png`) });
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
}

test("matches the Step 5 desktop composition at the reference viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1672, height: 941 });
  await openStepFive(page);

  const [reviewBox, previewBox] = await Promise.all([
    page.getByTestId("step-five-review-cards").boundingBox(),
    page.getByTestId("step-five-preview").boundingBox(),
  ]);
  expect(reviewBox).not.toBeNull();
  expect(previewBox).not.toBeNull();
  const leftRatio = reviewBox!.width / (reviewBox!.width + previewBox!.width);
  expect(leftRatio).toBeGreaterThanOrEqual(0.47);
  expect(leftRatio).toBeLessThanOrEqual(0.5);
  expect(previewBox!.width).toBeGreaterThan(reviewBox!.width);

  const imageBox = await page.getByTestId("step-five-preview").getByRole("img", { name: "Nordic Style 2 ชั้น" }).boundingBox();
  expect(imageBox).not.toBeNull();
  expect(imageBox!.width / imageBox!.height).toBeCloseTo(16 / 9, 1);
  await expect(page.getByRole("region", { name: "ความพร้อมก่อนสรุปค่าใช้จ่าย" })).toBeVisible();
  await expect(page.getByRole("region", { name: "สิ่งที่คุณจะได้รับหลังจากนี้" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "การดำเนินการขั้นตอนที่ 5" }).getByRole("button")).toHaveCount(2);
});
