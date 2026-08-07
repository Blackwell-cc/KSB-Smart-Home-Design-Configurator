import { expect, test } from "@playwright/test";

test("explains the free preview on the Thai landing page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("KSB Architect | Smart Home Design Configurator");
  await expect(page.locator("html")).toHaveAttribute("lang", "th");
  await expect(page.getByRole("heading", { name: "รู้พื้นที่และงบประมาณบ้านก่อนเริ่มสร้าง" })).toBeVisible();
  await expect(page.getByText("ดู Preview ได้โดยไม่ต้องกรอกข้อมูลส่วนตัว")).toBeVisible();
  await expect(page.getByRole("link", { name: "เริ่มออกแบบบ้าน" })).toHaveAttribute("href", "/configurator");
});
