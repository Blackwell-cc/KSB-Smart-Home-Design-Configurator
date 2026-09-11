import { expect, test, type Page } from "@playwright/test";
import { selectProvince } from "./helpers/complete-configurator";

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "reference", width: 1672, height: 941 },
  { name: "wide", width: 1920, height: 1080 },
] as const;

async function openStepFour(page: Page) {
  await page.goto("/configurator");
  await page.getByRole("radio", { name: "Modern Style" }).locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await selectProvince(page);
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await expect(page.getByRole("heading", { exact: true, level: 1, name: "วัสดุและส่วนพิเศษ" })).toBeVisible();
}

for (const viewport of viewports) {
  test(`keeps Step 4 usable at ${viewport.name}`, async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", (error) => { pageErrors.push(error.message); });
    await page.setViewportSize(viewport);
    await openStepFour(page);

    const dimensions = await page.evaluate(() => ({
      clientHeight: document.documentElement.clientHeight,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    if (viewport.width >= 1200) expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.clientHeight);

    const scene = page.getByTestId("material-preview-scene");
    await expect(scene).toBeVisible();
    await expect(scene).toHaveAttribute("data-scene", "modern-2f");
    await expect(scene.getByRole("img", { name: "Modern Style 2 ชั้น" })).toBeVisible();
    await page.screenshot({ fullPage: true, path: testInfo.outputPath(`step-four-${viewport.name}.png`) });
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
}

test("matches the reference desktop structure while only the catalog scrolls", async ({ page }) => {
  await page.setViewportSize({ width: 1672, height: 941 });
  await openStepFour(page);

  const layout = page.getByTestId("configurator-layout");
  const shell = layout.locator(':scope > div[data-step="materials"]');
  const form = shell.locator(":scope > section").first();
  const preview = page.getByRole("complementary", { name: "ภาพตัวอย่างวัสดุ" });
  const header = layout.locator("header");
  const [formBox, headerBox, previewBox] = await Promise.all([form.boundingBox(), header.boundingBox(), preview.boundingBox()]);
  expect(formBox).not.toBeNull();
  expect(headerBox).not.toBeNull();
  expect(previewBox).not.toBeNull();
  expect(headerBox!.height).toBeGreaterThanOrEqual(72);
  expect(headerBox!.height).toBeLessThanOrEqual(80);
  expect(formBox!.width / (formBox!.width + previewBox!.width)).toBeGreaterThanOrEqual(0.43);
  expect(formBox!.width / (formBox!.width + previewBox!.width)).toBeLessThanOrEqual(0.45);

  const materialCards = page.getByTestId("material-asset-placeholder");
  await expect(materialCards).toHaveCount(0);
  for (const label of ["หลังคา", "ผนังภายนอก", "หน้าต่าง", "ประตูทางเข้า"]) {
    const materialGroup = page.getByRole("radiogroup", { name: label });
    await expect(materialGroup).toHaveCount(1);
    await expect(materialGroup.getByRole("radio")).toHaveCount(4);
  }
  for (const removedLabel of ["ฝ้าเพดาน", "รายละเอียดฟาซาด", "แสงและบรรยากาศ"]) {
    await expect(page.getByText(removedLabel, { exact: true })).toHaveCount(0);
  }
  const roofImages = page.getByRole("radiogroup", { name: "หลังคา" }).locator("img");
  await expect(roofImages).toHaveCount(4);
  await expect(roofImages.nth(0)).toHaveAttribute("src", /materials%2Froof%2F1\.png|materials\/roof\/1\.png/);
  await expect(roofImages.nth(3)).toHaveAttribute("src", /materials%2Froof%2F4\.png|materials\/roof\/4\.png/);
  const wallImages = page.getByRole("radiogroup", { name: "ผนังภายนอก" }).locator("img");
  await expect(wallImages).toHaveCount(4);
  await expect(wallImages.nth(0)).toHaveAttribute("src", /materials%2Fwall%2F1\.png|materials\/wall\/1\.png/);
  await expect(wallImages.nth(3)).toHaveAttribute("src", /materials%2Fwall%2F4\.png|materials\/wall\/4\.png/);
  const windowImages = page.getByRole("radiogroup", { name: "หน้าต่าง" }).locator("img");
  await expect(windowImages).toHaveCount(4);
  await expect(windowImages.nth(0)).toHaveAttribute("src", /materials%2Fwindow%2F1\.png|materials\/window\/1\.png/);
  await expect(windowImages.nth(2)).toHaveAttribute("src", /materials%2Fwindow%2F4\.png|materials\/window\/4\.png/);
  await expect(windowImages.nth(3)).toHaveAttribute("src", /materials%2Fwindow%2F3\.png|materials\/window\/3\.png/);
  const doorImages = page.getByRole("radiogroup", { name: "ประตูทางเข้า" }).locator("img");
  await expect(doorImages).toHaveCount(4);
  await expect(doorImages.nth(0)).toHaveAttribute("src", /materials%2Fdoor%2F4\.png|materials\/door\/4\.png/);
  await expect(doorImages.nth(3)).toHaveAttribute("src", /materials%2Fdoor%2F3\.png|materials\/door\/3\.png/);
  await expect(page.getByRole("radiogroup", { name: "พื้น" })).toHaveCount(0);
  const allMaterialImages = page.getByTestId("material-scroll-area").getByRole("radiogroup").locator("img");
  await expect(allMaterialImages).toHaveCount(16);
  const firstRow = await Promise.all([0, 1, 2, 3].map((index) => allMaterialImages.nth(index).boundingBox()));
  expect(firstRow.every((box) => box !== null && Math.abs(box.y - firstRow[0]!.y) < 1)).toBe(true);
  expect(firstRow[0]!.width).toBeGreaterThanOrEqual(110);
  expect(firstRow[0]!.width).toBeLessThanOrEqual(125);

  const featureCards = page.getByTestId("feature-asset-placeholder");
  await expect(featureCards).toHaveCount(0);
  const featureImages = page.getByRole("group", { name: "ส่วนพิเศษที่อยากพิจารณา" }).locator("img");
  await expect(featureImages).toHaveCount(10);
  await expect(featureImages.nth(0)).toHaveAttribute("src", /materials\/special-features\/1\.png/);
  await expect(featureImages.nth(9)).toHaveAttribute("src", /materials\/special-features\/10\.png/);
  await featureImages.first().scrollIntoViewIfNeeded();
  await expect.poll(() => featureImages.evaluateAll((images) => images.every((image) => {
    const element = image as HTMLImageElement;
    return element.complete && element.naturalWidth > 0;
  }))).toBe(true);
  const featureRow = await Promise.all([0, 1, 2, 3, 4].map((index) => featureImages.nth(index).boundingBox()));
  expect(featureRow.every((box) => box !== null && Math.abs(box.y - featureRow[0]!.y) < 1)).toBe(true);
  expect(featureRow[0]!.width).toBeGreaterThanOrEqual(95);
  expect(featureRow[0]!.width).toBeLessThanOrEqual(110);

  const previewScene = page.getByTestId("material-preview-scene");
  const previewSceneBox = await previewScene.boundingBox();
  expect(previewSceneBox).not.toBeNull();
  expect(previewSceneBox!.width / previewSceneBox!.height).toBeCloseTo(1.6, 1);
  expect(previewSceneBox!.width).toBeGreaterThanOrEqual(760);
  await expect(previewScene).toHaveAttribute("data-scene", "modern-2f");
  const previewImage = previewScene.getByRole("img", { name: "Modern Style 2 ชั้น" });
  await expect(previewImage).toHaveAttribute(
    "src",
    /material-previews%2Fmodern%2F2f%2Fbase\.webp|material-previews\/modern\/2f\/base\.webp/,
  );
  await expect.poll(() => previewImage.evaluate((image) => {
    const element = image as HTMLImageElement;
    return element.complete && element.naturalWidth > 0;
  })).toBe(true);
  await expect(preview.locator("button, input, select, [role=toolbar], [data-preview-control], [data-overlay]")).toHaveCount(0);
  const summary = preview.getByRole("region", { name: "สรุปวัสดุที่เลือก" });
  await expect(summary).toBeVisible();
  await expect(preview.locator(":scope > section")).toHaveCount(1);
  await expect(previewScene.locator("section")).toHaveCount(0);
  expect(await previewScene.evaluate((node) => !node.contains(node.closest("aside")?.querySelector("section") ?? null))).toBe(true);

  const scrollArea = page.getByTestId("material-scroll-area");
  const quality = page.getByRole("radiogroup", { name: "ระดับคุณภาพวัสดุ" });
  const backAction = page.getByRole("button", { name: "ย้อนกลับ" });
  const nextAction = page.getByRole("button", { name: "ถัดไป" });
  const scrollMetrics = await scrollArea.evaluate((node) => ({
    clientHeight: node.clientHeight,
    scrollHeight: node.scrollHeight,
  }));
  expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight);
  const before = await quality.boundingBox();
  expect(before).not.toBeNull();
  const resultingScrollTop = await scrollArea.evaluate((node) => {
    node.scrollTop = node.scrollHeight;
    return node.scrollTop;
  });
  expect(resultingScrollTop).toBeGreaterThan(0);
  await expect(page.getByRole("checkbox", { name: "ห้องออกกำลังกาย" })).toBeInViewport();
  await expect(quality).toBeVisible();
  await expect(backAction).toBeVisible();
  await expect(nextAction).toBeVisible();
  const after = await quality.boundingBox();
  expect(after).not.toBeNull();
  expect(after!.y).toBeCloseTo(before!.y, 0);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(941);
});

test("supports keyboard material selection and persists special features", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => { pageErrors.push(error.message); });
  await page.setViewportSize({ width: 1440, height: 900 });
  await openStepFour(page);

  const roof = page.getByRole("radiogroup", { name: "หลังคา" });
  const firstRoof = roof.getByRole("radio").first();
  await firstRoof.focus();
  await page.keyboard.press("ArrowRight");
  await expect(roof.getByRole("radio").nth(1)).toBeChecked();

  const pool = page.getByRole("checkbox", { name: "สระว่ายน้ำ" });
  await pool.check();
  await expect(page.getByRole("complementary", { name: "ภาพตัวอย่างวัสดุ" })).toContainText("สระว่ายน้ำ");

  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: "แก้ไขวัสดุและส่วนพิเศษ" }).first().click();
  await expect(pool).toBeChecked();
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("composes the pool and outdoor pavilion at shared preview positions", async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => { pageErrors.push(error.message); });
  await page.setViewportSize({ width: 1672, height: 941 });
  await openStepFour(page);

  const scene = page.getByTestId("material-preview-scene");
  const pool = page.getByRole("checkbox", { name: "สระว่ายน้ำ" });
  const pavilion = page.getByRole("checkbox", { name: "ศาลานั่งเล่นภายนอก" });

  await pool.check();
  await pavilion.check();

  const featureLayers = scene.getByTestId("special-feature-preview-layer");
  await expect(featureLayers).toHaveCount(2);
  await expect(featureLayers.nth(0)).toHaveAttribute("data-feature", "pool");
  await expect(featureLayers.nth(1)).toHaveAttribute("data-feature", "outdoor-pavilion");
  await expect(featureLayers.nth(0)).toHaveAttribute(
    "src",
    /material-previews%2Fshared%2Fspecial-features%2Fpool\.png|material-previews\/shared\/special-features\/pool\.png/,
  );
  await expect(featureLayers.nth(1)).toHaveAttribute(
    "src",
    /material-previews%2Fshared%2Fspecial-features%2Foutdoor-pavilion\.png|material-previews\/shared\/special-features\/outdoor-pavilion\.png/,
  );
  await expect.poll(() => featureLayers.evaluateAll((images) => images.every((image) => {
    const element = image as HTMLImageElement;
    return element.complete
      && element.naturalWidth > 0
      && window.getComputedStyle(element).opacity === "1";
  }))).toBe(true);

  const [sceneBox, poolBox, pavilionBox] = await Promise.all([
    scene.boundingBox(),
    featureLayers.nth(0).boundingBox(),
    featureLayers.nth(1).boundingBox(),
  ]);
  expect(sceneBox).not.toBeNull();
  for (const layerBox of [poolBox, pavilionBox]) {
    expect(layerBox).not.toBeNull();
    expect(layerBox!.x).toBeCloseTo(sceneBox!.x + 1, 0);
    expect(layerBox!.y).toBeCloseTo(sceneBox!.y + 1, 0);
    expect(layerBox!.width).toBeCloseTo(sceneBox!.width - 2, 0);
    expect(layerBox!.height).toBeCloseTo(sceneBox!.height - 2, 0);
  }

  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath("special-features-pool-and-pavilion.png"),
  });

  await pool.uncheck();
  await pavilion.uncheck();
  await expect(featureLayers).toHaveCount(0);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("keeps the Nordic 2-floor base fixed while crossfading every reviewed material layer", async ({ page }) => {
  await page.goto("/configurator");
  await page.getByRole("radio", { name: "Nordic Style" }).locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await selectProvince(page);
  await page.getByRole("button", { name: "ถัดไป" }).click();

  const scene = page.getByTestId("material-preview-scene");
  const layers = scene.getByTestId("material-preview-layer");
  await expect(scene).toHaveAttribute("data-scene", "nordic-2f");
  await expect(scene).toHaveAttribute("data-available", "true");
  await expect(layers).toHaveCount(4);
  const house = scene.getByRole("img", { name: "Nordic Style 2 ชั้น" });
  await expect(house).toHaveAttribute(
    "src",
    /material-previews%2Fnordic%2F2f%2Fbase\.webp/,
  );
  const roofLayers = scene.locator('[data-testid="material-preview-layer"][data-category="roof"]');
  const wallLayers = scene.locator('[data-testid="material-preview-layer"][data-category="wall"]');
  const windowLayers = scene.locator('[data-testid="material-preview-layer"][data-category="window"]');
  const doorLayers = scene.locator('[data-testid="material-preview-layer"][data-category="door"]');
  await expect(roofLayers).toHaveCount(1);
  await expect(wallLayers).toHaveCount(1);
  await expect(windowLayers).toHaveCount(1);
  await expect(doorLayers).toHaveCount(1);
  await expect(roofLayers.first()).toHaveAttribute("data-option", "concrete-tile");
  await expect(wallLayers.first()).toHaveAttribute("data-option", "smooth-plaster");
  await page.getByRole("radio", { name: "กระเบื้องเซรามิก" }).locator("..").click();
  await expect(scene.locator('[data-option="ceramic-tile"]')).toHaveAttribute("data-ready", "true");
  await expect(layers).toHaveCount(4);
  await expect(roofLayers.first()).toHaveAttribute("data-option", "ceramic-tile");
  await page.getByRole("radio", { name: "หินธรรมชาติ" }).locator("..").click();
  await expect(scene.locator('[data-option="natural-stone"]')).toHaveAttribute("data-ready", "true");
  await expect(layers).toHaveCount(4);
  await expect(wallLayers.first()).toHaveAttribute("data-option", "natural-stone");
  await page.getByRole("radio", { name: "ไม้จริง" }).locator("..").click();
  await expect(scene.locator('[data-option="solid-wood"]')).toHaveAttribute("data-ready", "true");
  await expect(layers).toHaveCount(4);
  await expect(windowLayers.first()).toHaveAttribute("data-option", "solid-wood");
  await page.getByRole("radio", { name: "อะลูมิเนียมซิลเวอร์" }).locator("..").click();
  await expect(scene.locator('[data-option="metal-frame"]')).toHaveAttribute("data-ready", "true");
  await expect(scene.locator('[data-option="metal-frame"]')).toHaveAttribute(
    "src",
    /material-previews%2Fnordic%2F2f%2Fdoor%2Faluminium-glass\.webp|material-previews\/nordic\/2f\/door\/aluminium-glass\.webp/,
  );
  await expect(layers).toHaveCount(4);
  await expect(doorLayers.first()).toHaveAttribute("data-option", "metal-frame");
  await expect(house).toHaveAttribute("src", /material-previews%2Fnordic%2F2f%2Fbase\.webp/);
});

test("composes every reviewed Minimal 1-floor material and uses roof color choices", async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => { pageErrors.push(error.message); });
  await page.setViewportSize({ width: 1672, height: 941 });
  await page.goto("/configurator");
  await page.getByRole("radio", { name: "Minimalist Style" }).locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: /จำนวนชั้น.*ลด/ }).click();
  await expect(page.getByRole("spinbutton", { name: "จำนวนชั้น" })).toHaveValue("1");
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await selectProvince(page);
  await page.getByRole("button", { name: "ถัดไป" }).click();

  const scene = page.getByTestId("material-preview-scene");
  const layers = scene.getByTestId("material-preview-layer");
  await expect(scene).toHaveAttribute("data-scene", "minimal-1f");
  await expect(scene).toHaveAttribute("data-available", "true");
  await expect(layers).toHaveCount(4);
  await expect(scene.getByRole("img", { name: "Minimalist Style 1 ชั้น" })).toHaveAttribute(
    "src",
    /material-previews(?:%2F|\/)minimal(?:%2F|\/)1f(?:%2F|\/)base\.webp.*20260827-minimal-1f-ai-v1/,
  );

  const roof = page.getByRole("radiogroup", { name: "หลังคา" });
  await expect(roof.getByRole("radio")).toHaveCount(4);
  for (const label of ["สีชาร์โคล", "สีโอลีฟเกรย์", "สีซอฟต์เกรจ", "สีวอร์มเทาป์"]) {
    await expect(roof.getByRole("radio", { name: label })).toBeVisible();
  }
  await roof.getByRole("radio", { name: "สีซอฟต์เกรจ" }).locator("..").click();
  await expect(scene.locator('[data-category="roof"][data-option="metal-roof"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "หินธรรมชาติ" }).locator("..").click();
  await expect(scene.locator('[data-category="wall"][data-option="natural-stone"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "ไม้จริง" }).locator("..").click();
  await expect(scene.locator('[data-category="window"][data-option="solid-wood"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "อะลูมิเนียมซิลเวอร์" }).locator("..").click();
  await expect(scene.locator('[data-category="door"][data-option="metal-frame"]')).toHaveAttribute("data-ready", "true");
  await expect(layers).toHaveCount(4);

  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath("minimal-1f-material-preview.png"),
  });
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("shows locked Loft roof and wall choices while compositing only the 2-floor window and door masks", async ({ page }) => {
  await page.goto("/configurator");
  await page.getByRole("radio", { name: "Loft Style" }).locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await expect(page.getByRole("spinbutton", { name: "จำนวนชั้น" })).toHaveValue("2");
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await selectProvince(page);
  await page.getByRole("button", { name: "ถัดไป" }).click();

  await expect(page.getByText("ล็อกตามดีไซน์ Loft")).toBeVisible();
  const roofChoices = page.getByRole("radiogroup", { name: "หลังคา" }).getByRole("radio");
  const wallChoices = page.getByRole("radiogroup", { name: "ผนังภายนอก" }).getByRole("radio");
  await expect(roofChoices).toHaveCount(4);
  await expect(wallChoices).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) {
    await expect(roofChoices.nth(index)).toBeDisabled();
    await expect(wallChoices.nth(index)).toBeDisabled();
  }
  await expect(page.getByRole("radiogroup", { name: "หน้าต่าง" }).getByRole("radio")).toHaveCount(4);
  await expect(page.getByRole("radiogroup", { name: "ประตูทางเข้า" }).getByRole("radio")).toHaveCount(4);

  const scene = page.getByTestId("material-preview-scene");
  await expect(scene).toHaveAttribute("data-scene", "loft-2f");
  await expect(scene).toHaveAttribute("data-available", "true");
  await expect(scene.getByTestId("material-preview-layer")).toHaveCount(2);
  await expect(scene.locator('[data-category="roof"], [data-category="wall"]')).toHaveCount(0);
  await expect(scene.getByRole("img", { name: "Loft Style 2 ชั้น" })).toHaveAttribute(
    "src",
    /material-previews(?:%2F|\/)loft(?:%2F|\/)2f(?:%2F|\/)base\.webp.*20260827-loft-2f-ai-v1/,
  );

  await page.getByRole("radio", { name: "ไม้จริง" }).locator("..").click();
  await expect(scene.locator('[data-category="window"][data-option="solid-wood"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "วอลนัทธรรมชาติ" }).locator("..").click();
  await expect(scene.locator('[data-category="door"][data-option="engineered-wood"]')).toHaveAttribute("data-ready", "true");
  await expect(scene.getByTestId("material-preview-layer")).toHaveCount(2);
});

test("keeps the Loft identity locked while compositing the reviewed 3-floor window and door masks", async ({ page }, testInfo) => {
  await page.goto("/configurator");
  await page.getByRole("radio", { name: "Loft Style" }).locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: /จำนวนชั้น.*เพิ่ม/ }).click();
  await expect(page.getByRole("spinbutton", { name: "จำนวนชั้น" })).toHaveValue("3");
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await selectProvince(page);
  await page.getByRole("button", { name: "ถัดไป" }).click();

  await expect(page.getByText("ล็อกตามดีไซน์ Loft")).toBeVisible();
  const roofChoices = page.getByRole("radiogroup", { name: "หลังคา" }).getByRole("radio");
  const wallChoices = page.getByRole("radiogroup", { name: "ผนังภายนอก" }).getByRole("radio");
  await expect(roofChoices).toHaveCount(4);
  await expect(wallChoices).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) {
    await expect(roofChoices.nth(index)).toBeDisabled();
    await expect(wallChoices.nth(index)).toBeDisabled();
  }

  const scene = page.getByTestId("material-preview-scene");
  const layers = scene.getByTestId("material-preview-layer");
  await expect(scene).toHaveAttribute("data-scene", "loft-3f");
  await expect(scene).toHaveAttribute("data-available", "true");
  await expect(layers).toHaveCount(2);
  await expect(scene.locator('[data-category="roof"], [data-category="wall"]')).toHaveCount(0);
  await expect(scene.getByRole("img", { name: "Loft Style 3 ชั้น" })).toHaveAttribute(
    "src",
    /material-previews(?:%2F|\/)loft(?:%2F|\/)3f(?:%2F|\/)base\.webp.*20260827-loft-3f-ai-v1/,
  );

  await page.getByRole("radio", { name: "uPVC" }).locator("..").click();
  await expect(scene.locator('[data-category="window"][data-option="upvc"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "อะลูมิเนียมซิลเวอร์" }).locator("..").click();
  await expect(scene.locator('[data-category="door"][data-option="metal-frame"]')).toHaveAttribute("data-ready", "true");
  await expect(scene.locator('[data-category="door"][data-option="metal-frame"]')).toHaveAttribute(
    "src",
    /material-previews(?:%2F|\/)loft(?:%2F|\/)3f(?:%2F|\/)door(?:%2F|\/)aluminium-glass\.webp/,
  );
  await expect(layers).toHaveCount(2);
  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath("loft-3f-material-preview.png"),
  });
});

test("composes the Classic 2-floor roof, window, and door while keeping the wall locked", async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => { pageErrors.push(error.message); });
  await page.setViewportSize({ width: 1672, height: 941 });
  await page.goto("/configurator");
  await page.getByRole("radio", { name: "Classic Style" }).locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await expect(page.getByRole("spinbutton", { name: "จำนวนชั้น" })).toHaveValue("2");
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await selectProvince(page);
  await page.getByRole("button", { name: "ถัดไป" }).click();

  const wallChoices = page.getByRole("radiogroup", { name: "ผนังภายนอก" }).getByRole("radio");
  await expect(wallChoices).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) await expect(wallChoices.nth(index)).toBeDisabled();
  await expect(page.getByText("ล็อกตามดีไซน์ Classic")).toBeVisible();

  for (const groupName of ["หลังคา", "หน้าต่าง", "ประตูทางเข้า"]) {
    const choices = page.getByRole("radiogroup", { name: groupName }).getByRole("radio");
    await expect(choices).toHaveCount(4);
    for (let index = 0; index < 4; index += 1) await expect(choices.nth(index)).toBeEnabled();
  }

  const scene = page.getByTestId("material-preview-scene");
  await expect(scene).toHaveAttribute("data-scene", "classic-2f");
  await expect(scene).toHaveAttribute("data-available", "true");
  await expect(scene.getByTestId("material-preview-layer")).toHaveCount(3);
  await expect(scene.locator('[data-category="wall"]')).toHaveCount(0);
  await expect(scene.getByRole("img", { name: "Classic Style 2 ชั้น" })).toHaveAttribute(
    "src",
    /material-previews(?:%2F|\/)classic(?:%2F|\/)2f(?:%2F|\/)base\.webp.*20260911-classic-2f-ai-v1/,
  );

  await page.getByRole("radio", { name: "สีโอลีฟเกรย์" }).locator("..").click();
  await expect(scene.locator('[data-category="roof"][data-option="ceramic-tile"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "ไม้จริง" }).locator("..").click();
  await expect(scene.locator('[data-category="window"][data-option="solid-wood"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "วอลนัทธรรมชาติ" }).locator("..").click();
  await expect(scene.locator('[data-category="door"][data-option="engineered-wood"]')).toHaveAttribute("data-ready", "true");

  await page.getByRole("button", { name: "รีเซ็ตหลังคาเป็น Original" }).click();
  await expect(scene.locator('[data-category="roof"]')).toHaveCount(0);
  await expect(scene.getByTestId("material-preview-layer")).toHaveCount(2);
  await expect(page.getByRole("complementary", { name: "ภาพตัวอย่างวัสดุ" }).getByText("Original / แบบตั้งต้น", { exact: true })).toBeVisible();

  await page.screenshot({ fullPage: true, path: testInfo.outputPath("classic-2f-material-preview.png") });
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("composes the Classic 3-floor roof, window, and door while keeping the wall locked", async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => { pageErrors.push(error.message); });
  await page.setViewportSize({ width: 1672, height: 941 });
  await page.goto("/configurator");
  await page.getByRole("radio", { name: "Classic Style" }).locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: /จำนวนชั้น.*เพิ่ม/ }).click();
  await expect(page.getByRole("spinbutton", { name: "จำนวนชั้น" })).toHaveValue("3");
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await selectProvince(page);
  await page.getByRole("button", { name: "ถัดไป" }).click();

  const wallChoices = page.getByRole("radiogroup", { name: "ผนังภายนอก" }).getByRole("radio");
  await expect(wallChoices).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) await expect(wallChoices.nth(index)).toBeDisabled();
  await expect(page.getByText("ล็อกตามดีไซน์ Classic")).toBeVisible();

  const scene = page.getByTestId("material-preview-scene");
  await expect(scene).toHaveAttribute("data-scene", "classic-3f");
  await expect(scene).toHaveAttribute("data-available", "true");
  await expect(scene.getByTestId("material-preview-layer")).toHaveCount(3);
  await expect(scene.locator('[data-category="wall"]')).toHaveCount(0);
  await expect(scene.getByRole("img", { name: "Classic Style 3 ชั้น" })).toHaveAttribute(
    "src",
    /material-previews(?:%2F|\/)classic(?:%2F|\/)3f(?:%2F|\/)base\.webp.*20260909-classic-3f-ai-v1/,
  );

  await page.getByRole("radio", { name: "สีวอร์มเทาป์" }).locator("..").click();
  await expect(scene.locator('[data-category="roof"][data-option="natural-slate"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "uPVC" }).locator("..").click();
  await expect(scene.locator('[data-category="window"][data-option="upvc"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "อะลูมิเนียมซิลเวอร์" }).locator("..").click();
  await expect(scene.locator('[data-category="door"][data-option="metal-frame"]')).toHaveAttribute("data-ready", "true");
  await expect(scene.getByTestId("material-preview-layer")).toHaveCount(3);

  await page.screenshot({ fullPage: true, path: testInfo.outputPath("classic-3f-material-preview.png") });
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("composes the Contemporary 1-floor roof, window, and door while keeping the wall locked", async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => { pageErrors.push(error.message); });
  await page.setViewportSize({ width: 1672, height: 941 });
  await page.goto("/configurator");
  await page.getByRole("radio", { name: "Contemporary" }).locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: /จำนวนชั้น.*ลด/ }).click();
  await expect(page.getByRole("spinbutton", { name: "จำนวนชั้น" })).toHaveValue("1");
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await selectProvince(page);
  await page.getByRole("button", { name: "ถัดไป" }).click();

  const roofChoices = page.getByRole("radiogroup", { name: "หลังคา" }).getByRole("radio");
  const wallChoices = page.getByRole("radiogroup", { name: "ผนังภายนอก" }).getByRole("radio");
  await expect(roofChoices).toHaveCount(4);
  await expect(page.getByRole("radio", { name: "สีชาร์โคล" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "สีโอลีฟเกรย์" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "สีซอฟต์เกรจ" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "สีวอร์มเทาป์" })).toBeVisible();
  await expect(wallChoices).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) await expect(wallChoices.nth(index)).toBeDisabled();
  await expect(page.getByText("ล็อกตามดีไซน์ Contemporary")).toBeVisible();

  const scene = page.getByTestId("material-preview-scene");
  await expect(scene).toHaveAttribute("data-scene", "contemporary-1f");
  await expect(scene).toHaveAttribute("data-available", "true");
  await expect(scene.getByTestId("material-preview-layer")).toHaveCount(3);
  await expect(scene.locator('[data-category="wall"]')).toHaveCount(0);
  await expect(scene.getByRole("img", { name: "Contemporary 1 ชั้น" })).toHaveAttribute(
    "src",
    /material-previews(?:%2F|\/)contemporary(?:%2F|\/)1f(?:%2F|\/)base\.webp.*20260910-contemporary-base-v3/,
  );

  await page.getByRole("radio", { name: "สีวอร์มเทาป์" }).locator("..").click();
  await expect(scene.locator('[data-category="roof"][data-option="natural-slate"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "uPVC" }).locator("..").click();
  await expect(scene.locator('[data-category="window"][data-option="upvc"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "อะลูมิเนียมซิลเวอร์" }).locator("..").click();
  await expect(scene.locator('[data-category="door"][data-option="metal-frame"]')).toHaveAttribute("data-ready", "true");
  await expect(scene.getByTestId("material-preview-layer")).toHaveCount(3);

  await page.screenshot({ fullPage: true, path: testInfo.outputPath("contemporary-1f-material-preview.png") });
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("composes the Contemporary 2-floor roof, window, and door while keeping the wall locked", async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => { pageErrors.push(error.message); });
  await page.setViewportSize({ width: 1672, height: 941 });
  await page.goto("/configurator");
  await page.getByRole("radio", { name: "Contemporary" }).locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await expect(page.getByRole("spinbutton", { name: "จำนวนชั้น" })).toHaveValue("2");
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await selectProvince(page);
  await page.getByRole("button", { name: "ถัดไป" }).click();

  const wallChoices = page.getByRole("radiogroup", { name: "ผนังภายนอก" }).getByRole("radio");
  await expect(wallChoices).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) await expect(wallChoices.nth(index)).toBeDisabled();
  await expect(page.getByText("ล็อกตามดีไซน์ Contemporary")).toBeVisible();

  const scene = page.getByTestId("material-preview-scene");
  await expect(scene).toHaveAttribute("data-scene", "contemporary-2f");
  await expect(scene).toHaveAttribute("data-available", "true");
  await expect(scene.getByTestId("material-preview-layer")).toHaveCount(3);
  await expect(scene.locator('[data-category="wall"]')).toHaveCount(0);
  await expect(scene.getByRole("img", { name: "Contemporary 2 ชั้น" })).toHaveAttribute(
    "src",
    /material-previews(?:%2F|\/)contemporary(?:%2F|\/)2f(?:%2F|\/)base\.webp.*20260910-contemporary-base-v3/,
  );

  await page.getByRole("radio", { name: "สีโอลีฟเกรย์" }).locator("..").click();
  await expect(scene.locator('[data-category="roof"][data-option="ceramic-tile"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "ไม้จริง" }).locator("..").click();
  await expect(scene.locator('[data-category="window"][data-option="solid-wood"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "วอลนัทธรรมชาติ" }).locator("..").click();
  await expect(scene.locator('[data-category="door"][data-option="engineered-wood"]')).toHaveAttribute("data-ready", "true");
  await expect(scene.getByTestId("material-preview-layer")).toHaveCount(3);

  await page.screenshot({ fullPage: true, path: testInfo.outputPath("contemporary-2f-material-preview.png") });
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("composes the Contemporary 3-floor roof, window, and door while keeping the wall locked", async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => { pageErrors.push(error.message); });
  await page.setViewportSize({ width: 1672, height: 941 });
  await page.goto("/configurator");
  await page.getByRole("radio", { name: "Contemporary" }).locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: /จำนวนชั้น.*เพิ่ม/ }).click();
  await expect(page.getByRole("spinbutton", { name: "จำนวนชั้น" })).toHaveValue("3");
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await selectProvince(page);
  await page.getByRole("button", { name: "ถัดไป" }).click();

  const wallChoices = page.getByRole("radiogroup", { name: "ผนังภายนอก" }).getByRole("radio");
  await expect(wallChoices).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) await expect(wallChoices.nth(index)).toBeDisabled();
  await expect(page.getByText("ล็อกตามดีไซน์ Contemporary")).toBeVisible();
  const scene = page.getByTestId("material-preview-scene");
  await expect(scene).toHaveAttribute("data-scene", "contemporary-3f");
  await expect(scene).toHaveAttribute("data-available", "true");
  await expect(scene.getByTestId("material-preview-layer")).toHaveCount(3);
  await expect(scene.locator('[data-category="wall"]')).toHaveCount(0);
  await expect(scene.getByRole("img", { name: "Contemporary 3 ชั้น" })).toHaveAttribute(
    "src",
    /material-previews(?:%2F|\/)contemporary(?:%2F|\/)3f(?:%2F|\/)base\.webp.*20260910-contemporary-base-v3/,
  );

  await page.getByRole("radio", { name: "สีวอร์มเทาป์" }).locator("..").click();
  await expect(scene.locator('[data-category="roof"][data-option="natural-slate"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "uPVC" }).locator("..").click();
  await expect(scene.locator('[data-category="window"][data-option="upvc"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "อะลูมิเนียมซิลเวอร์" }).locator("..").click();
  await expect(scene.locator('[data-category="door"][data-option="metal-frame"]')).toHaveAttribute("data-ready", "true");
  await page.screenshot({ fullPage: true, path: testInfo.outputPath("contemporary-3f-material-preview.png") });
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("composes all Tropical 1-floor material layers", async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => { pageErrors.push(error.message); });
  await page.setViewportSize({ width: 1672, height: 941 });
  await page.goto("/configurator");
  await page.getByRole("radio", { name: "Tropical" }).locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: /จำนวนชั้น.*ลด/ }).click();
  await expect(page.getByRole("spinbutton", { name: "จำนวนชั้น" })).toHaveValue("1");
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await selectProvince(page);
  await page.getByRole("button", { name: "ถัดไป" }).click();

  const scene = page.getByTestId("material-preview-scene");
  await expect(scene).toHaveAttribute("data-scene", "tropical-1f");
  await expect(scene).toHaveAttribute("data-available", "true");
  await expect(scene.getByTestId("material-preview-layer")).toHaveCount(4);
  await expect(scene.getByRole("img", { name: "Tropical 1 ชั้น" })).toHaveAttribute(
    "src",
    /material-previews(?:%2F|\/)tropical(?:%2F|\/)1f(?:%2F|\/)base\.webp.*20260910-tropical-1f-ai-v1/,
  );

  for (const groupName of ["หลังคา", "ผนังภายนอก", "หน้าต่าง", "ประตูทางเข้า"]) {
    const choices = page.getByRole("radiogroup", { name: groupName }).getByRole("radio");
    await expect(choices).toHaveCount(4);
    for (let index = 0; index < 4; index += 1) await expect(choices.nth(index)).toBeEnabled();
  }

  await page.getByRole("radio", { name: "กระเบื้องเซรามิก" }).locator("..").click();
  await expect(scene.locator('[data-category="roof"][data-option="ceramic-tile"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "ไม้ตกแต่งภายนอก" }).locator("..").click();
  await expect(scene.locator('[data-category="wall"][data-option="exterior-timber"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "ไม้จริง" }).locator("..").click();
  await expect(scene.locator('[data-category="window"][data-option="solid-wood"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "วอลนัทธรรมชาติ" }).locator("..").click();
  await expect(scene.locator('[data-category="door"][data-option="engineered-wood"]')).toHaveAttribute("data-ready", "true");
  await expect(scene.getByTestId("material-preview-layer")).toHaveCount(4);

  await page.screenshot({ fullPage: true, path: testInfo.outputPath("tropical-1f-material-preview.png") });
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("composes all Tropical 2-floor material layers", async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => { pageErrors.push(error.message); });
  await page.setViewportSize({ width: 1672, height: 941 });
  await page.goto("/configurator");
  await page.getByRole("radio", { name: "Tropical" }).locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await expect(page.getByRole("spinbutton", { name: "จำนวนชั้น" })).toHaveValue("2");
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await selectProvince(page);
  await page.getByRole("button", { name: "ถัดไป" }).click();

  const scene = page.getByTestId("material-preview-scene");
  await expect(scene).toHaveAttribute("data-scene", "tropical-2f");
  await expect(scene).toHaveAttribute("data-available", "true");
  await expect(scene.getByTestId("material-preview-layer")).toHaveCount(4);
  await expect(scene.getByRole("img", { name: "Tropical 2 ชั้น" })).toHaveAttribute(
    "src",
    /material-previews(?:%2F|\/)tropical(?:%2F|\/)2f(?:%2F|\/)base\.webp.*20260910-tropical-2f-ai-v1/,
  );

  for (const groupName of ["หลังคา", "ผนังภายนอก", "หน้าต่าง", "ประตูทางเข้า"]) {
    const choices = page.getByRole("radiogroup", { name: groupName }).getByRole("radio");
    await expect(choices).toHaveCount(4);
    for (let index = 0; index < 4; index += 1) await expect(choices.nth(index)).toBeEnabled();
  }

  await page.getByRole("radio", { name: "หินชนวนธรรมชาติ" }).locator("..").click();
  await expect(scene.locator('[data-category="roof"][data-option="natural-slate"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "หินธรรมชาติ" }).locator("..").click();
  await expect(scene.locator('[data-category="wall"][data-option="natural-stone"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "uPVC" }).locator("..").click();
  await expect(scene.locator('[data-category="window"][data-option="upvc"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "วอลนัทธรรมชาติ" }).locator("..").click();
  await expect(scene.locator('[data-category="door"][data-option="engineered-wood"]')).toHaveAttribute("data-ready", "true");

  await page.screenshot({ fullPage: true, path: testInfo.outputPath("tropical-2f-material-preview.png") });
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("composes all Tropical 3-floor material layers", async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => { pageErrors.push(error.message); });
  await page.setViewportSize({ width: 1672, height: 941 });
  await page.goto("/configurator");
  await page.getByRole("radio", { name: "Tropical" }).locator("..").click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: /จำนวนชั้น.*เพิ่ม/ }).click();
  await expect(page.getByRole("spinbutton", { name: "จำนวนชั้น" })).toHaveValue("3");
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await selectProvince(page);
  await page.getByRole("button", { name: "ถัดไป" }).click();

  const scene = page.getByTestId("material-preview-scene");
  await expect(scene).toHaveAttribute("data-scene", "tropical-3f");
  await expect(scene).toHaveAttribute("data-available", "true");
  await expect(scene.getByTestId("material-preview-layer")).toHaveCount(4);
  await expect(scene.getByRole("img", { name: "Tropical 3 ชั้น" })).toHaveAttribute(
    "src",
    /material-previews(?:%2F|\/)tropical(?:%2F|\/)3f(?:%2F|\/)base\.webp.*20260911-tropical-3f-ai-v1/,
  );

  for (const groupName of ["หลังคา", "ผนังภายนอก", "หน้าต่าง", "ประตูทางเข้า"]) {
    const choices = page.getByRole("radiogroup", { name: groupName }).getByRole("radio");
    await expect(choices).toHaveCount(4);
    for (let index = 0; index < 4; index += 1) await expect(choices.nth(index)).toBeEnabled();
  }

  await page.getByRole("radio", { name: "หลังคาเมทัลชีท" }).locator("..").click();
  await expect(scene.locator('[data-category="roof"][data-option="metal-roof"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "คอนกรีตเปลือย" }).locator("..").click();
  await expect(scene.locator('[data-category="wall"][data-option="exposed-concrete"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "อลูมิเนียมสีธรรมชาติ" }).locator("..").click();
  await expect(scene.locator('[data-category="window"][data-option="natural-aluminium"]')).toHaveAttribute("data-ready", "true");
  await page.getByRole("radio", { name: "โอ๊คธรรมชาติ" }).locator("..").click();
  await expect(scene.locator('[data-category="door"][data-option="aluminium-glass"]')).toHaveAttribute("data-ready", "true");

  await page.screenshot({ fullPage: true, path: testInfo.outputPath("tropical-3f-material-preview.png") });
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
