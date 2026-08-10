import { expect, type Page } from "@playwright/test";

export const previewFixture = Object.freeze({
  conceptAssetId: "contemporary-warm-luxury",
  styleLabel: "Contemporary Warm Luxury",
  floors: 2,
  bedrooms: 3,
  bathrooms: 3,
  parkingSpaces: 2,
  usableAreaM2: 164,
  constructionFloorAreaM2: 198,
  materialLevel: "premium",
  budgetRange: { low: 5_400_000, high: 7_200_000 },
  confidence: "C",
  disclaimer: "กรอบงบประมาณนี้เป็นข้อมูลเบื้องต้นสำหรับการวางแผนเท่านั้น",
});

export async function mockEstimate(page: Page) {
  await page.route("**/api/estimate", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ preview: previewFixture }) });
  });
}

export async function completeConfigurator(page: Page) {
  await page.getByRole("radio", { name: "Contemporary Warm Luxury" }).check();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await expect(page.getByRole("heading", { name: "พื้นที่และฟังก์ชัน" })).toBeVisible();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByLabel("จังหวัด").selectOption("10");
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("radio", { name: /Premium/ }).click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: "ดู Preview" }).click();
}
