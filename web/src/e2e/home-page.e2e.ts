import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const qaScreenshotPaths = [
  "consumer-hero-desktop-1440x900.png",
  "consumer-hero-tablet-768x1024.png",
  "consumer-hero-mobile-375x812.png",
].map((filename) => resolve(process.cwd(), "..", "docs", "qa", "screenshots", filename));

test("communicates the consumer value and enters the configurator", async ({ page }) => {
  expect(qaScreenshotPaths.every(existsSync)).toBe(true);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "บ้านในฝันของคุณ ราคาเท่าไหร่?" })).toBeVisible();
  await expect(page.getByRole("img", { name: /บ้านร่วมสมัยแสงอบอุ่น/ })).toBeVisible();
  await expect(page.getByText("ตัวอย่างหน้าจอ · ไม่ใช่ราคาประเมิน")).toBeVisible();
  await expect(page.getByRole("heading", { name: "3 ขั้นตอนง่าย ๆ เพื่อบ้านในฝัน" })).toBeInViewport();

  const primary = page.getByRole("link", { name: "เริ่มประเมินฟรี" });
  await expect(primary).toBeInViewport();
  await primary.click();
  await expect(page).toHaveURL(/\/configurator$/);
  await expect(page.getByRole("heading", { name: "เลือกสไตล์บ้าน" })).toBeVisible();
});

for (const viewport of [{ width: 960, height: 1024 }, { width: 768, height: 1024 }, { width: 375, height: 812 }]) {
  test(`keeps the hero usable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

    await expect(page.getByRole("heading", { name: "บ้านในฝันของคุณ ราคาเท่าไหร่?" })).toBeVisible();
    const primary = page.getByRole("link", { name: "เริ่มประเมินฟรี" });
    await expect(primary).toBeInViewport();
    expect((await primary.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(48);
    for (const icon of await primary.locator("svg").all()) {
      expect((await icon.boundingBox())?.height ?? 0).toBeLessThanOrEqual(32);
    }
    await expect(page.getByRole("group", { name: "ตัวอย่างหน้าจอวางแผนบ้าน" })).toBeVisible();
  });
}

for (const [width, expectedPosition] of [[1023, "static"], [1024, "absolute"]] as const) {
  test(`switches preview cards to ${expectedPosition} positioning at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1024 });
    await page.goto("/");

    const card = page.getByRole("group", { name: "ตัวอย่างหน้าจอวางแผนบ้าน" }).locator("[class*='cardFloat']").first();
    await expect(card).toBeVisible();
    expect(await card.evaluate((element) => getComputedStyle(element).position)).toBe(expectedPosition);
  });
}

test("contains split-boundary hero actions before the house preview", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 1024 });
  await page.goto("/");

  const [primary, secondary, house] = await Promise.all([
    page.getByRole("link", { name: "เริ่มประเมินฟรี" }).boundingBox(),
    page.getByRole("link", { name: "ดูตัวอย่างบ้าน" }).boundingBox(),
    page.locator("#house-preview").boundingBox(),
  ]);

  expect(primary).not.toBeNull();
  expect(secondary).not.toBeNull();
  expect(house).not.toBeNull();
  expect(primary!.y).toBe(secondary!.y);
  expect(primary!.x + primary!.width).toBeLessThanOrEqual(house!.x);
  expect(secondary!.x + secondary!.width).toBeLessThanOrEqual(house!.x);
  expect(primary!.height).toBeGreaterThanOrEqual(48);
  expect(secondary!.height).toBeGreaterThanOrEqual(48);
});

test("exposes focus and disables decorative motion when requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const focusTargets = [
    page.getByRole("link", { name: "KSB Architect หน้าแรก" }),
    page.getByRole("link", { name: "เริ่มต้น" }),
    page.getByRole("link", { name: "โทรปรึกษา 091 991 4592" }),
    page.getByRole("link", { name: "ลองประเมินฟรี" }),
    page.getByRole("link", { name: "เริ่มประเมินฟรี" }),
    page.getByRole("link", { name: "ดูตัวอย่างบ้าน" }),
  ];

  for (const target of focusTargets) {
    await target.focus();
    expect(await target.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
  }

  const animation = await page.locator("[class*='cardFloat']").first().evaluate((element) => getComputedStyle(element).animationName);
  expect(animation).toBe("none");

  await page.setViewportSize({ width: 375, height: 812 });
  const mobileMenu = page.locator("header details > summary");
  await mobileMenu.focus();
  expect(await mobileMenu.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
});
