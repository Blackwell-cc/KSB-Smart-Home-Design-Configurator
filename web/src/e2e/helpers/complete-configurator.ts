import { expect, type Page } from "@playwright/test";

export const previewFixture = Object.freeze({
  conceptAssetId: "contemporary-warm-luxury",
  styleLabel: "Modern Style",
  floors: 2,
  bedrooms: 3,
  bathrooms: 3,
  parkingSpaces: 2,
  usableAreaM2: 164,
  constructionFloorAreaM2: 198,
  materialLevel: "premium",
  constructionRange: { low: 4_880_304, high: 6_898_320 },
  designFeeRange: { low: 244_015, high: 586_357 },
  budgetRange: { low: 5_400_000, high: 7_200_000 },
  confidence: "C",
  estimateMode: "development-demo",
  disclaimer: "กรอบงบประมาณนี้เป็นข้อมูลเบื้องต้นสำหรับการวางแผนเท่านั้น",
});

export async function mockEstimate(page: Page) {
  await page.route("**/api/estimate", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ preview: previewFixture }) });
  });
}

export async function selectStyleWithKeyboard(page: Page, style: string) {
  const choice = page.getByRole("radio", { name: style });
  if (!(await choice.isChecked())) {
    await choice.focus();
    await page.keyboard.press("Space");
  }
  await expect(choice).toBeChecked();
}

export async function selectProvince(page: Page, name = "กรุงเทพมหานคร") {
  const province = page.getByRole("combobox", { name: "จังหวัด" });
  await province.fill(name);
  await page.getByRole("option", { name, exact: true }).click();
  await expect(province).toHaveValue(name);
}

export async function completeConfigurator(page: Page) {
  await selectStyleWithKeyboard(page, "Modern Style");
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await expect(page.getByRole("heading", { name: "พื้นที่และฟังก์ชัน", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await selectProvince(page);
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("radio", { name: /PREMIUM/i }).click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: "ไปยังหน้าสรุปค่าใช้จ่าย" }).click();
}
