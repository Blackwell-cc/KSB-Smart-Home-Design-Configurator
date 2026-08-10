import { expect, test } from "@playwright/test";
import { completeConfigurator, mockEstimate } from "./helpers/complete-configurator";

const projectId = "11111111-1111-4111-8111-111111111111";

test("keeps the same submission intent when the first Lead response is lost", async ({ page }) => {
  await page.goto("/report/access");
  await expect(page.getByRole("heading", { name: "ไม่สามารถเปิดสรุปโครงการนี้ได้" })).toBeVisible();

  await mockEstimate(page);
  const submittedBodies: Record<string, unknown>[] = [];
  let attempts = 0;
  await page.route("**/api/leads", async (route) => {
    submittedBodies.push(route.request().postDataJSON() as Record<string, unknown>);
    attempts += 1;
    if (attempts === 1) {
      await route.abort("failed");
      return;
    }
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ leadId: "lead-once", projectId, reportUrl: `/report/access#project=${projectId}&token=${"a".repeat(48)}` }),
    });
  });

  let releaseExchange!: () => void;
  const exchangeGate = new Promise<void>((resolve) => { releaseExchange = resolve; });
  const exchangeBodies: unknown[] = [];
  await page.route("**/api/reports/exchange", async (route) => {
    exchangeBodies.push(route.request().postDataJSON());
    await exchangeGate;
    await route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ error: { code: "PROJECT_LINK_INVALID" } }) });
  });

  await page.goto("/configurator");
  await completeConfigurator(page);
  await page.getByRole("button", { name: "รับสรุปโครงการฉบับเต็ม" }).click();
  await page.getByLabel("ชื่อ").fill("ผู้ทดสอบระบบ");
  await page.getByLabel("ช่องทางติดต่อที่ต้องการ").selectOption("email");
  await page.getByLabel("อีเมล").fill("owner@example.test");
  await page.getByLabel(/ยินยอมให้ใช้ข้อมูล/).check();

  await page.getByRole("button", { name: "ส่ง Project Report ฉบับเต็มให้ฉัน" }).click();
  await expect(page.getByText(/ยังจัดทำสรุปโครงการไม่ได้/)).toBeVisible();
  await page.getByRole("button", { name: "ส่ง Project Report ฉบับเต็มให้ฉัน" }).click();

  await expect(page).toHaveURL(/\/report\/access$/);
  await expect(page.getByRole("heading", { name: "กำลังเปิดสรุปโครงการ" })).toBeVisible();
  await expect.poll(() => exchangeBodies.length).toBeGreaterThan(0);
  expect(submittedBodies).toHaveLength(2);
  expect(submittedBodies[0]?.idempotencyKey).toBe(submittedBodies[1]?.idempotencyKey);
  expect(submittedBodies[0]?.configurationId).toBe(submittedBodies[1]?.configurationId);
  expect(new Set(submittedBodies.map((body) => body.idempotencyKey)).size).toBe(1);
  expect(exchangeBodies.every((body) => JSON.stringify(body) === JSON.stringify({ projectId, token: "a".repeat(48) }))).toBe(true);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("ksb-configurator-draft-v1"))).toBeNull();
  releaseExchange();
});
