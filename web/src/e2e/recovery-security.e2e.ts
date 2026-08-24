import { expect, test } from "@playwright/test";

const validEstimateRequest = {
  styleId: "contemporary-warm-luxury",
  residents: 4,
  floors: 2,
  bedrooms: 3,
  bathrooms: 3,
  parkingSpaces: 2,
  functions: { office: false, elderlyRoom: false, thaiKitchen: false, multipurposeRoom: false },
  usableAreaOverrideM2: null,
  provinceCode: "10",
  siteAccess: "normal",
  materialLevel: "premium",
  specialFeatures: [],
};

test("restores an offline draft after refresh and preserves Back navigation", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/configurator");
  await page.getByRole("radio", { name: "Modern Style" }).locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await expect(page.getByRole("heading", { name: "พื้นที่และฟังก์ชัน", exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("ksb-configurator-draft-v1"))).not.toBeNull();

  await page.reload();
  await expect(page.getByRole("heading", { name: "พื้นที่และฟังก์ชัน", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "ย้อนกลับ" }).click();
  await expect(page.getByRole("radio", { name: "Modern Style" })).toBeChecked();
  expect(pageErrors.filter((message) => message.includes("Hydration failed"))).toEqual([]);
});

test("rejects unsafe API inputs and private-link failures while marking development estimates", async ({ page, request }) => {
  const invalidEnum = await request.post("/api/estimate", { data: { ...validEstimateRequest, materialLevel: "platinum" } });
  expect(invalidEnum.status()).toBe(400);
  expect(await invalidEnum.json()).toEqual({ error: { code: "INVALID_CONFIGURATION" } });

  const oversizedNotes = await request.post("/api/estimate", { data: { ...validEstimateRequest, privateNotes: "x".repeat(1_001) } });
  expect(oversizedNotes.status()).toBe(400);
  expect(await oversizedNotes.json()).toEqual({ error: { code: "INVALID_CONFIGURATION" } });

  const developmentEstimate = await request.post("/api/estimate", { data: validEstimateRequest });
  expect(developmentEstimate.status()).toBe(200);
  expect(await developmentEstimate.json()).toEqual({ preview: expect.objectContaining({ estimateMode: "development-demo" }) });

  await page.goto("/");
  for (const token of ["e".repeat(48), "r".repeat(48)]) {
    const access = await page.evaluate(async (privateToken) => {
      const response = await fetch("/api/reports/exchange", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ projectId: "11111111-1111-4111-8111-111111111111", token: privateToken }) });
      return { status: response.status, body: await response.json() };
    }, token);
    expect(access.status).toBe(404);
    expect(access.body).toEqual({ error: { code: "PROJECT_LINK_INVALID" } });
  }

  const pdf = await request.get("/api/reports/11111111-1111-4111-8111-111111111111/pdf");
  expect(pdf.status()).toBe(404);
  expect(await pdf.json()).toEqual({ error: { code: "PROJECT_LINK_INVALID" } });

  const leadResponses = [];
  for (let index = 0; index < 6; index += 1) leadResponses.push(await request.post("/api/leads", { data: {} }));
  expect(leadResponses.slice(0, 5).every((response) => response.status() === 400)).toBe(true);
  expect(leadResponses[5]?.status()).toBe(429);
  expect(leadResponses[5]?.headers()["retry-after"]).toBeTruthy();
  expect(await leadResponses[5]?.json()).toEqual({ error: { code: "RATE_LIMITED" } });
});
