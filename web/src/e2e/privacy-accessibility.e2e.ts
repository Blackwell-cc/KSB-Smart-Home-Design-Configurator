import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { mockEstimate, selectStyleWithKeyboard } from "./helpers/complete-configurator";

async function expectNoSeriousAxeViolations(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(result.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical")).toEqual([]);
}

test("keeps the public journey accessible from landing through the Soft Gate", async ({ page }) => {
  await mockEstimate(page);
  await page.goto("/");
  await expectNoSeriousAxeViolations(page);

  await page.goto("/configurator");
  await expectNoSeriousAxeViolations(page);
  await selectStyleWithKeyboard(page, "Modern Style");
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await expectNoSeriousAxeViolations(page);
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByLabel("จังหวัด").selectOption("10");
  await expectNoSeriousAxeViolations(page);
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await expectNoSeriousAxeViolations(page);
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await expectNoSeriousAxeViolations(page);
  await page.getByRole("button", { name: "ไปยังหน้าสรุปค่าใช้จ่าย" }).click();
  await expect(page.getByRole("heading", { name: /ภาพรวมบ้าน\s+ที่คุณกำลังวางแผน/ })).toBeVisible();
  await expect(page.getByText("ข้อมูลทดสอบเพื่อพัฒนาระบบ")).toBeVisible();
  await expectNoSeriousAxeViolations(page);
  await page.getByRole("button", { name: "รับข้อมูลฉบับเต็ม" }).click();
  await expectNoSeriousAxeViolations(page);
});

test("renders the real public-share page without private or pricing data", async ({ page }) => {
  await page.goto("/share/public-example-7f3k");
  await expect(page.getByRole("heading", { name: "Contemporary Warm Luxury" })).toBeVisible();
  await expect(page.getByRole("link", { name: "ลองออกแบบบ้านของคุณ" })).toHaveAttribute("href", "/configurator?source=shared-preview");

  const html = await page.content();
  expect(html).not.toContain("owner@example.test");
  expect(html).not.toContain("0919914592");
  expect(html).not.toMatch(/budgetRange|pricingVersion|targetBudget|privateNotes|tokenHash/i);
  await expectNoSeriousAxeViolations(page);
});
