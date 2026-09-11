import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { completeConfigurator, mockEstimate } from "./helpers/complete-configurator";

test("downloads an openable PDF containing the selected house report", async ({ page }) => {
  await mockEstimate(page);
  await page.goto("/configurator");
  await completeConfigurator(page);

  await page.getByRole("button", { name: "รับข้อมูลฉบับเต็ม" }).click();
  const dialog = page.getByRole("dialog", { name: "รับข้อมูลฉบับเต็ม" });
  await dialog.getByLabel("ชื่อ–นามสกุล *").fill("ผู้ทดสอบดาวน์โหลด PDF");
  await dialog.getByLabel("เบอร์โทรศัพท์ *").fill("0812345678");
  await dialog.getByLabel("อีเมล *").fill("pdf@example.test");
  await dialog.getByLabel("วัตถุประสงค์ในการขอข้อมูล *").selectOption("view_full_report");
  await dialog.getByLabel(/ยินยอมให้ใช้ข้อมูล/).check();
  await dialog.getByRole("button", { name: "รับรายงานฉบับเต็ม" }).click();

  await expect(page).toHaveURL(/\/report\/[0-9a-f-]+$/i);
  const pdfLink = page.getByRole("link", { name: "ดาวน์โหลดเอกสารฉบับเต็ม (PDF)" });
  const pdfHref = await pdfLink.getAttribute("href");
  const directResponse = await page.evaluate(async (href) => {
    const response = await fetch(href, { credentials: "same-origin" });
    const body = await response.arrayBuffer();
    return { status: response.status, contentType: response.headers.get("content-type"), body: Array.from(new Uint8Array(body).slice(0, 160)) };
  }, pdfHref!);
  expect(directResponse.status, new TextDecoder().decode(Uint8Array.from(directResponse.body))).toBe(200);
  expect(directResponse.contentType).toContain("application/pdf");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    pdfLink.click(),
  ]);
  const downloadPath = await download.path();

  expect(download.suggestedFilename()).toBe("ksb-project-report.pdf");
  await expect(download.failure()).resolves.toBeNull();
  expect(downloadPath).not.toBeNull();
  const bytes = await readFile(downloadPath!);
  expect(bytes.subarray(0, 4).toString()).toBe("%PDF");
  expect(bytes.byteLength).toBeGreaterThan(100_000);
  if (process.env.PDF_QA_OUTPUT) await download.saveAs(process.env.PDF_QA_OUTPUT);
});

test("accepts the completed report request form and opens the private report", async ({ page }) => {
  await mockEstimate(page);
  await page.goto("/configurator");
  await completeConfigurator(page);

  await page.getByRole("button", { name: "รับข้อมูลฉบับเต็ม" }).click();
  const dialog = page.getByRole("dialog", { name: "รับข้อมูลฉบับเต็ม" });
  await dialog.getByLabel("ชื่อ–นามสกุล *").fill("dw");
  await dialog.getByLabel("เบอร์โทรศัพท์ *").fill("0812345678");
  await dialog.getByLabel("อีเมล *").fill("dwad@fwf.dw");
  await dialog.getByLabel("วัตถุประสงค์ในการขอข้อมูล *").selectOption("view_full_report");
  await dialog.getByLabel(/ยินยอมให้ใช้ข้อมูล/).check();
  await dialog.getByRole("button", { name: "รับรายงานฉบับเต็ม" }).click();

  await expect(page).toHaveURL(/\/report\/[0-9a-f-]+$/i);
  await expect(page.getByRole("heading", { name: /รายงานฉบับเต็ม/ })).toBeVisible();
});
