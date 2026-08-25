# Photoshop-Assisted Material Mask Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ทำ Pilot `nordic-2f` ที่เปลี่ยนหลังคา ผนังภายนอก กรอบหน้าต่าง ประตูทางเข้า และพื้นด้วย Photoshop-authored semantic overlays ที่ตรงกับภาพฐานทุกพิกเซล และใช้ภาพเดียวกันต่อเนื่องใน Step 4, Step 5, Preliminary Summary และ Full Report

**Architecture:** Photoshop สร้าง Mask และ transparent source overlays ที่ผ่านการตรวจด้วยคนเพียงครั้งเดียวต่อ Scene จากนั้น Node/Sharp ตรวจ Asset Contract และเผยแพร่เป็น lossless WebP ฝั่งเว็บประกอบ base + 5 selected overlays จาก `HouseConfiguration.materialSelections` ชุดเดิม ส่วน Full Report ใช้ server compositor จาก descriptor เดียวกันเพื่อสร้างภาพรวมแบบ deterministic โดยไม่สร้าง state หรือ price engine ใหม่

**Tech Stack:** Photoshop, Next.js 16, React 19, TypeScript 5, Next Image, Sharp 0.35, Vitest 4, Playwright 1.62, CSS Modules

## Global Constraints

- Pilot รองรับเฉพาะ `nordic-2f` จนกว่าจะผ่าน Quality Gate
- ใช้ Canvas `1672 × 941 px` ตรงกับ `base-nordic-2f-master.webp` ทุกไฟล์
- เว็บไซต์ใช้ `HouseConfiguration.materialSelections` เดิมเป็น source of truth เท่านั้น
- รองรับ 5 หมวดตามลำดับ `flooring → wall → roof → window → door`
- แต่ละหมวดมี 4 Stable IDs จาก `MATERIAL_CATALOG` รวม 20 overlays
- เปลี่ยนเฉพาะผิว สี และลวดลาย ไม่เปลี่ยน Geometry ของบ้าน
- Mask หลังคาไม่รวมหน้าจั่ว ผนังใต้หน้าจั่ว เชิงชาย รางน้ำ กระจก เสา หรือท้องหลังคา
- Mask หน้าต่างรวมเฉพาะกรอบ วงกบ และ Mullion ไม่รวมกระจก
- Transparent overlays ต้องปิดวัสดุเดิมภายใน Mask และโปร่งใสนอก Mask
- ห้ามใช้ Polygon หรือการกรองสีเพื่อเดา Semantic Mask ใน production pipeline
- Crossfade ใช้เวลา 180 ms และต้องปิด motion เมื่อ `prefers-reduced-motion: reduce`
- Asset โหลดไม่สำเร็จต้องคงภาพก่อนหน้า ห้ามเกิด broken image หรือ preview ว่าง
- Source PSD เป็น working file ภายนอกแอป; source masks/overlays ที่ใช้ build ต้องอยู่ใน repository
- ไม่ทำ Mask Editor, Geometry Swap หรือ rollout ทุก Style/Floor ใน Pilot นี้

---

## File Structure

### Photoshop source package

- Create: `web/assets/material-previews/nordic/2f/source-manifest.json` — ขนาด Scene, Stable IDs และเส้นทาง Asset ที่อนุญาต
- Create: `web/assets/material-previews/nordic/2f/masks/{roof,wall,window,door,flooring}.png` — merged grayscale semantic masks
- Create: `web/assets/material-previews/nordic/2f/overlays/<category>/<option-id>.png` — Photoshop-exported transparent RGBA overlays จำนวน 20 ไฟล์
- Working file outside app runtime: `picture/material-preview-working/nordic-2f/Nordic-2F-Material-Master.psd`

### Asset pipeline

- Modify: `web/scripts/generate-material-preview-assets.mjs` — เลิกสร้าง Polygon masks และเปลี่ยนเป็น validate/publish source exports
- Create: `web/scripts/lib/material-preview-contract.mjs` — ตรวจ dimension, alpha coverage, mask equality และ mask overlap
- Create: `web/scripts/lib/material-preview-contact-sheet.mjs` — สร้างภาพ QA ที่แสดง mask/debug และ 20 combinations
- Modify: `web/package.json` — เพิ่ม `assets:material-preview:validate` และคง `assets:material-preview` สำหรับ publish
- Modify: `web/src/features/configurator/presentation/material-preview-assets.test.ts` — ทดสอบ source + published assets

### Client preview

- Modify: `web/src/features/configurator/presentation/material-preview-scene.ts` — base เดียว + 5 transparent overlays
- Modify: `web/src/features/configurator/presentation/material-preview-scene.test.ts` — ตรวจ path และ layer order
- Modify: `web/src/features/configurator/components/material-house-preview.tsx` — two-buffer crossfade และ load fallback
- Modify: `web/src/features/configurator/components/material-house-preview.module.css` — stacked layers, transition, reduced motion
- Modify: `web/src/features/configurator/components/material-house-preview.test.tsx` — ตรวจ 5 layers และ fallback

### Full Report flattened image

- Create: `web/src/features/configurator/server/render-material-preview.ts` — Sharp compositor จาก descriptor เดียวกัน
- Create: `web/src/features/configurator/server/render-material-preview.test.ts` — ตรวจลำดับ composite และ output
- Create: `web/src/features/configurator/presentation/material-preview-url.ts` — สร้าง URL จาก selected Stable IDs โดยไม่มีข้อมูลส่วนบุคคล
- Create: `web/src/features/configurator/presentation/material-preview-url.test.ts` — ตรวจ URL, fallback และ encoding
- Create: `web/src/app/api/previews/material/route.ts` — validate stable IDs และคืน WebP
- Create: `web/src/app/api/previews/material/route.test.ts` — valid/invalid query, headers และ path traversal
- Modify: `web/src/features/reports/application/build-full-report.ts` — ใช้ material preview URL ใน gallery item แรกเมื่อ Scene พร้อม
- Modify: `web/src/features/reports/application/build-full-report.test.ts` — ตรวจ continuity ของ selected materials

### Integration and visual QA

- Modify: `web/src/features/configurator/components/configurator-shell.test.tsx`
- Modify: `web/src/features/preview/components/free-preview.test.tsx`
- Modify: `web/src/e2e/configurator-step-four.e2e.ts`
- Modify: `web/src/e2e/configurator-step-five.e2e.ts`
- Create: `web/src/e2e/material-preview-continuity.e2e.ts`
- Generated, do not commit: `web/test-results/material-preview-qa/nordic-2f-contact-sheet.png`

---

### Task 1: Create the Photoshop source contract and failing asset test

**Files:**
- Create: `web/assets/material-previews/nordic/2f/source-manifest.json`
- Modify: `web/src/features/configurator/presentation/material-preview-assets.test.ts`

**Interfaces:**
- Consumes: Stable IDs from `MATERIAL_CATALOG`
- Produces: source paths for five masks and twenty Photoshop overlays

- [ ] **Step 1: Add the exact source manifest**

```json
{
  "sceneId": "nordic-2f",
  "width": 1672,
  "height": 941,
  "base": "public/concepts/base-nordic-2f-master.webp",
  "layerOrder": ["flooring", "wall", "roof", "window", "door"],
  "categories": {
    "roof": ["concrete-tile", "ceramic-tile", "metal-roof", "natural-slate"],
    "wall": ["smooth-plaster", "natural-stone", "exterior-timber", "exposed-concrete"],
    "window": ["black-aluminium", "natural-aluminium", "solid-wood", "upvc"],
    "door": ["teak", "engineered-wood", "aluminium-glass", "metal-frame"],
    "flooring": ["natural-marble", "engineered-wood", "porcelain-tile", "terrazzo"]
  }
}
```

- [ ] **Step 2: Replace the current full-roof-scene test with a failing semantic-source contract test**

```ts
async function dimensions(file: string) {
  const metadata = await sharp(file).metadata();
  return [metadata.width, metadata.height];
}

test("provides five reviewed masks and twenty pixel-locked Photoshop overlays", async () => {
  const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "nordic", "2f");
  const expectedSize = [1672, 941];

  for (const category of MATERIAL_CATALOG) {
    const mask = path.join(sourceRoot, "masks", `${category.id}.png`);
    await expect(access(mask), mask).resolves.toBeUndefined();
    expect(await dimensions(mask)).toEqual(expectedSize);

    for (const option of category.options) {
      const overlay = path.join(sourceRoot, "overlays", category.id, `${option.id}.png`);
      await expect(access(overlay), overlay).resolves.toBeUndefined();
      expect(await dimensions(overlay)).toEqual(expectedSize);
      expect((await sharp(overlay).metadata()).hasAlpha, overlay).toBe(true);
    }
  }
});
```

- [ ] **Step 3: Run the focused test and confirm missing source assets fail**

Run: `cd web && npm test -- src/features/configurator/presentation/material-preview-assets.test.ts`

Expected: FAIL naming the first missing `assets/material-previews/nordic/2f/masks/*.png` file.

- [ ] **Step 4: Do not commit the failing state; proceed directly to Task 2**

Expected: manifest and test remain local until Photoshop exports satisfy the contract.

---

### Task 2: Produce the reviewed Nordic 2F masks and source overlays in Photoshop

**Files:**
- Create outside runtime: `picture/material-preview-working/nordic-2f/Nordic-2F-Material-Master.psd`
- Create: `web/assets/material-previews/nordic/2f/masks/*.png`
- Create: `web/assets/material-previews/nordic/2f/overlays/**/*.png`
- Test: `web/src/features/configurator/presentation/material-preview-assets.test.ts`

**Interfaces:**
- Consumes: `base-nordic-2f-master.webp`, five material texture sets, `source-manifest.json`
- Produces: `1672 × 941` grayscale masks and transparent RGBA overlays

- [ ] **Step 1: Create the locked PSD master**

Open `web/public/concepts/base-nordic-2f-master.webp`, keep the document at `1672 × 941 px`, convert the base to Smart Object, name it `BASE_HOUSE_LOCKED`, and lock position plus pixels.

- [ ] **Step 2: Build the five debug mask groups**

Create `MASK_ROOF_ALL`, `MASK_WALL_ALL`, `MASK_WINDOW_FRAME_ALL`, `MASK_ENTRY_DOOR_ALL`, and `MASK_FLOORING_ALL`. Use Photoshop Object Selection for the initial selection, then use Brush/Pen Tool only for corrections. Keep roof and flooring plane submasks inside their merged groups.

- [ ] **Step 3: Verify semantic boundaries with fixed debug colours**

Use red `#ff2d2d` for roof, blue `#287cff` for wall, green `#29d36b` for window frames, yellow `#ffd33d` for door, and magenta `#ff3dd1` for flooring at 70% opacity. Confirm no debug colour covers gables, fascia, glass, vegetation, road, or unselected landscape surfaces.

- [ ] **Step 4: Export the five merged masks**

Export each mask as an 8-bit grayscale PNG with black `#000000` outside, white `#ffffff` inside, and anti-aliased edge pixels only at the actual material boundary. Preserve the complete `1672 × 941 px` canvas.

- [ ] **Step 5: Create four Photoshop material groups per category**

For every Stable ID in `source-manifest.json`, place the supplied material image as a Smart Object, transform it separately for each roof/floor plane, add an opaque undercoat inside the category mask, then restore the original luminance/shadow above the material. Window materials affect frame/mullion only; door materials affect the agreed entrance-door area only.

- [ ] **Step 6: Export twenty transparent source overlays**

Export PNG-24 with transparency to `web/assets/material-previews/nordic/2f/overlays/<category>/<option-id>.png`. Outside the category mask must have alpha `0`; the centre of the material surface must have alpha `255`.

- [ ] **Step 7: Run the source contract test**

Run: `cd web && npm test -- src/features/configurator/presentation/material-preview-assets.test.ts`

Expected: PASS for file existence, dimensions, and alpha checks.

- [ ] **Step 8: Commit the reviewed Photoshop exports and contract**

```bash
git add web/assets/material-previews/nordic/2f web/src/features/configurator/presentation/material-preview-assets.test.ts
git commit -m "assets: add reviewed Nordic material masks"
```

---

### Task 3: Replace the polygon generator with a strict validator and publisher

**Files:**
- Create: `web/scripts/lib/material-preview-contract.mjs`
- Create: `web/scripts/lib/material-preview-contact-sheet.mjs`
- Modify: `web/scripts/generate-material-preview-assets.mjs`
- Modify: `web/package.json`
- Modify: `web/src/features/configurator/presentation/material-preview-assets.test.ts`

**Interfaces:**
- Consumes: `validateMaterialPreviewSource({ sourceRoot, manifest }): Promise<ValidationResult>`
- Produces: published base + 20 lossless WebP overlays and QA contact sheet

- [ ] **Step 1: Write failing assertions for mask coverage and overlap**

Add tests that threshold every mask and overlay alpha at `>= 128`, require each overlay footprint to match its category mask within `0.1%`, and require no pixel to belong to more than one category mask at that threshold. Anti-aliased fringe below `128` is ignored for the overlap check.

```ts
expect(maskCoverageRatio).toBeGreaterThan(0.001);
expect(maskCoverageRatio).toBeLessThan(0.35);
expect(overlayMaskDifferenceRatio).toBeLessThanOrEqual(0.001);
expect(overlappingPixelCount).toBe(0);
```

- [ ] **Step 2: Run the focused test and verify current source validation fails**

Run: `cd web && npm test -- src/features/configurator/presentation/material-preview-assets.test.ts`

Expected: FAIL until the validator exposes coverage/difference results.

- [ ] **Step 3: Implement `validateMaterialPreviewSource`**

```js
async function binaryMask(file) {
  const { data } = await sharp(file)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return Uint8Array.from(data, (value) => value >= 128 ? 1 : 0);
}

async function overlayMask(file) {
  const { data } = await sharp(file)
    .ensureAlpha()
    .extractChannel(3)
    .raw()
    .toBuffer({ resolveWithObject: true });
  return Uint8Array.from(data, (value) => value >= 128 ? 1 : 0);
}

function differenceRatio(left, right) {
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) difference += 1;
  }
  return difference / left.length;
}

async function assertOverlayMatchesMask(file, expectedMask, manifest) {
  const metadata = await sharp(file).metadata();
  if (metadata.width !== manifest.width || metadata.height !== manifest.height || !metadata.hasAlpha) {
    throw new Error(`INVALID_OVERLAY_CONTRACT:${file}`);
  }
  const actualMask = await overlayMask(file);
  if (differenceRatio(actualMask, expectedMask) > 0.001) {
    throw new Error(`OVERLAY_MASK_MISMATCH:${file}`);
  }
}

function assertMasksDoNotOverlap(maskBuffers, pixels) {
  let overlap = 0;
  for (let pixel = 0; pixel < pixels; pixel += 1) {
    let owners = 0;
    for (const mask of maskBuffers.values()) owners += mask[pixel];
    if (owners > 1) overlap += 1;
  }
  if (overlap > 0) throw new Error(`MATERIAL_MASK_OVERLAP:${overlap}`);
}

export async function validateMaterialPreviewSource({ sourceRoot, manifest }) {
  const pixels = manifest.width * manifest.height;
  const maskBuffers = new Map();
  for (const [category, optionIds] of Object.entries(manifest.categories)) {
    const mask = await binaryMask(path.join(sourceRoot, "masks", `${category}.png`));
    if (mask.length !== pixels) throw new Error(`INVALID_MASK_SIZE:${category}`);
    maskBuffers.set(category, mask);
    for (const optionId of optionIds) {
      const overlay = path.join(sourceRoot, "overlays", category, `${optionId}.png`);
      await assertOverlayMatchesMask(overlay, mask, manifest);
    }
  }
  assertMasksDoNotOverlap(maskBuffers, pixels);
  return { sceneId: manifest.sceneId, maskCount: 5, overlayCount: 20 };
}
```

- [ ] **Step 4: Rewrite `generate-material-preview-assets.mjs` as an importer**

Remove `masks`, `materialMask`, `createTintedRoofScene`, and all colour-threshold logic. Read the manifest, validate source exports, convert the selected concept base to `public/material-previews/nordic/2f/base.webp`, and convert each PNG overlay to lossless WebP without resizing.

```js
await sharp(baseSource).webp({ lossless: true, effort: 5 }).toFile(outputBase);
await sharp(sourceOverlay)
  .ensureAlpha()
  .webp({ lossless: true, effort: 5 })
  .toFile(outputOverlay);
```

- [ ] **Step 5: Generate a deterministic QA contact sheet**

Create `web/test-results/material-preview-qa/nordic-2f-contact-sheet.png` containing one base image, five coloured mask previews, and twenty material overlay composites. Every tile must include category and option ID labels.

- [ ] **Step 6: Add explicit package scripts**

```json
{
  "assets:material-preview:validate": "node scripts/generate-material-preview-assets.mjs --validate-only",
  "assets:material-preview": "node scripts/generate-material-preview-assets.mjs"
}
```

- [ ] **Step 7: Run validation, publish, and focused tests**

Run: `cd web && npm run assets:material-preview:validate`

Expected: `Validated nordic-2f: 5 masks, 20 overlays, 0 overlapping pixels`.

Run: `cd web && npm run assets:material-preview`

Expected: `Published nordic-2f material preview assets at 1672x941` and contact sheet path.

Run: `cd web && npm test -- src/features/configurator/presentation/material-preview-assets.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit the deterministic pipeline**

```bash
git add web/scripts web/package.json web/public/material-previews/nordic/2f web/src/features/configurator/presentation/material-preview-assets.test.ts
git commit -m "build: validate and publish material overlays"
```

---

### Task 4: Change the scene descriptor to one base plus five overlays

**Files:**
- Modify: `web/src/features/configurator/presentation/material-preview-scene.ts`
- Modify: `web/src/features/configurator/presentation/material-preview-scene.test.ts`

**Interfaces:**
- Consumes: `MaterialPreviewConfiguration`
- Produces: `buildMaterialPreviewScene(configuration): MaterialPreviewScene`

- [ ] **Step 1: Write the failing descriptor expectation**

```ts
expect(scene.baseSrc).toBe("/material-previews/nordic/2f/base.webp?v=20260826");
expect(scene.layers.map(({ category, optionId }) => [category, optionId])).toEqual([
  ["flooring", "terrazzo"],
  ["wall", "natural-stone"],
  ["roof", "metal-roof"],
  ["window", "black-aluminium"],
  ["door", "teak"],
]);
```

- [ ] **Step 2: Run the descriptor test and confirm the old roof-scene architecture fails**

Run: `cd web && npm test -- src/features/configurator/presentation/material-preview-scene.test.ts`

Expected: FAIL because base currently points to `roof-scenes/<option>.webp` and exposes only four layers.

- [ ] **Step 3: Implement the five-layer descriptor**

```ts
export const MATERIAL_LAYER_ORDER = ["flooring", "wall", "roof", "window", "door"] as const;
export const MATERIAL_PREVIEW_ASSET_VERSION = "20260826";

return {
  sceneId,
  label: concept.englishLabel,
  floors,
  baseSrc: versioned(`${root}/base.webp`),
  available: true,
  layers: MATERIAL_LAYER_ORDER.map((category) => ({
    category,
    optionId: configuration.materialSelections[category],
    src: versioned(`${root}/${category}/${configuration.materialSelections[category]}.webp`),
  })),
};
```

- [ ] **Step 4: Run the descriptor tests**

Run: `cd web && npm test -- src/features/configurator/presentation/material-preview-scene.test.ts`

Expected: PASS including safe fallback for unavailable styles/floors.

- [ ] **Step 5: Commit the descriptor change**

```bash
git add web/src/features/configurator/presentation/material-preview-scene.ts web/src/features/configurator/presentation/material-preview-scene.test.ts
git commit -m "refactor: use semantic material overlay descriptor"
```

---

### Task 5: Add flicker-free two-buffer material transitions

**Files:**
- Modify: `web/src/features/configurator/components/material-house-preview.tsx`
- Modify: `web/src/features/configurator/components/material-house-preview.module.css`
- Modify: `web/src/features/configurator/components/material-house-preview.test.tsx`

**Interfaces:**
- Consumes: `MaterialPreviewLayer`
- Produces: `CrossfadeMaterialLayer({ layer, sizes }): JSX.Element`

- [ ] **Step 1: Write failing component tests for five layers and retained previous asset**

Use mocked `next/image` load events. Assert initial render contains five `data-testid="material-preview-layer"` images. Rerender with ceramic roof, assert the concrete roof remains until the ceramic image fires `load`, then assert the incoming layer receives `data-ready="true"` before the previous source is removed.

- [ ] **Step 2: Run the component test and confirm it fails**

Run: `cd web && npm test -- src/features/configurator/components/material-house-preview.test.tsx`

Expected: FAIL because the current renderer remounts the changed image immediately and has four layers.

- [ ] **Step 3: Implement `CrossfadeMaterialLayer`**

```tsx
function CrossfadeMaterialLayer({ layer, sizes }: { layer: MaterialPreviewLayer; sizes: string }) {
  const [current, setCurrent] = useState(layer);
  const [incoming, setIncoming] = useState<MaterialPreviewLayer | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (layer.src === current.src) return;
    setIncoming(layer);
    setReady(false);
  }, [current.src, layer]);

  useEffect(() => {
    if (!ready || !incoming) return;
    const timer = window.setTimeout(() => {
      setCurrent(incoming);
      setIncoming(null);
      setReady(false);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [incoming, ready]);

  return <>
    <Image
      alt=""
      aria-hidden="true"
      className={`${styles.layer} ${styles.current}`}
      data-category={current.category}
      data-option={current.optionId}
      data-testid="material-preview-layer"
      fill
      sizes={sizes}
      src={current.src}
    />
    {incoming ? <Image
      alt=""
      aria-hidden="true"
      className={`${styles.layer} ${ready ? styles.incomingReady : styles.incoming}`}
      data-category={incoming.category}
      data-option={incoming.optionId}
      fill
      onError={() => setIncoming(null)}
      onLoad={() => setReady(true)}
      sizes={sizes}
      src={incoming.src}
    /> : null}
  </>;
}
```

The `onError` handler must remove only `incoming`, leaving `current` visible.

- [ ] **Step 4: Update layer CSS**

```css
.layer { position: absolute; inset: 0; opacity: 1; pointer-events: none; }
.incoming { opacity: 0; }
.incomingReady { opacity: 1; transition: opacity 180ms ease; }
@media (prefers-reduced-motion: reduce) {
  .incomingReady { transition: none; }
}
```

Keep the base filter restrained to `brightness(1.04) saturate(1.02)` so the reviewed material colours are not distorted.

- [ ] **Step 5: Run component and configurator tests**

Run: `cd web && npm test -- src/features/configurator/components/material-house-preview.test.tsx src/features/configurator/components/configurator-shell.test.tsx`

Expected: PASS with five semantic layers and no regression in Step 4/5 rendering.

- [ ] **Step 6: Commit the transition renderer**

```bash
git add web/src/features/configurator/components/material-house-preview.tsx web/src/features/configurator/components/material-house-preview.module.css web/src/features/configurator/components/material-house-preview.test.tsx web/src/features/configurator/components/configurator-shell.test.tsx
git commit -m "feat: crossfade reviewed material layers"
```

---

### Task 6: Provide the same material composite to Full Report

**Files:**
- Create: `web/src/features/configurator/server/render-material-preview.ts`
- Create: `web/src/features/configurator/server/render-material-preview.test.ts`
- Create: `web/src/features/configurator/presentation/material-preview-url.ts`
- Create: `web/src/features/configurator/presentation/material-preview-url.test.ts`
- Create: `web/src/app/api/previews/material/route.ts`
- Create: `web/src/app/api/previews/material/route.test.ts`
- Modify: `web/src/features/reports/application/build-full-report.ts`
- Modify: `web/src/features/reports/application/build-full-report.test.ts`

**Interfaces:**
- Consumes: `MaterialPreviewScene`
- Produces: `renderMaterialPreview(scene): Promise<Buffer>` and `buildMaterialPreviewUrl(configuration): string | undefined`

- [ ] **Step 1: Write a failing server-compositor test**

Assert that `renderMaterialPreview` resolves the base and five overlays below `public/`, strips only the controlled `?v=` suffix, composites in `MATERIAL_LAYER_ORDER`, and returns `1672 × 941` WebP.

- [ ] **Step 2: Run the compositor test and confirm the module is missing**

Run: `cd web && npm test -- src/features/configurator/server/render-material-preview.test.ts`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement the server compositor with path containment**

```ts
export async function renderMaterialPreview(scene: MaterialPreviewScene): Promise<Buffer> {
  if (!scene.available) throw new Error("MATERIAL_PREVIEW_UNAVAILABLE");
  const publicRoot = path.resolve(process.cwd(), "public");
  const resolveAsset = (src: string) => {
    const pathname = src.split("?")[0].replace(/^\//, "");
    const resolved = path.resolve(publicRoot, pathname);
    if (!resolved.startsWith(`${publicRoot}${path.sep}`)) throw new Error("INVALID_MATERIAL_ASSET_PATH");
    return resolved;
  };
  return sharp(resolveAsset(scene.baseSrc))
    .composite(scene.layers.map(({ src }) => ({ input: resolveAsset(src) })))
    .webp({ quality: 90 })
    .toBuffer();
}
```

- [ ] **Step 4: Write route tests for allowlisted query values**

Valid request: `/api/previews/material?style=natural-style&floors=2&roof=ceramic-tile&wall=natural-stone&window=upvc&door=teak&flooring=terrazzo` returns `200 image/webp`.

Unknown option, unavailable Scene, duplicate parameter, and traversal strings return `400` without reading arbitrary files.

- [ ] **Step 5: Implement the GET route**

Parse query values with the following strict schema, reject duplicate keys before `Object.fromEntries`, create a `MaterialPreviewConfiguration`, call `buildMaterialPreviewScene`, then call `renderMaterialPreview`.

```ts
const querySchema = z.object({
  style: z.literal("natural-style"),
  floors: z.literal("2"),
  roof: z.enum(["concrete-tile", "ceramic-tile", "metal-roof", "natural-slate"]),
  wall: z.enum(["smooth-plaster", "natural-stone", "exterior-timber", "exposed-concrete"]),
  window: z.enum(["black-aluminium", "natural-aluminium", "solid-wood", "upvc"]),
  door: z.enum(["teak", "engineered-wood", "aluminium-glass", "metal-frame"]),
  flooring: z.enum(["natural-marble", "engineered-wood", "porcelain-tile", "terrazzo"]),
}).strict();

const searchParams = new URL(request.url).searchParams;
const keys = [...searchParams.keys()];
if (new Set(keys).size !== keys.length) return new Response(null, { status: 400 });
const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
if (!parsed.success) return new Response(null, { status: 400 });
```

Return `Cache-Control: public, max-age=31536000, immutable` because the URL contains every selected material ID and asset version.

- [ ] **Step 6: Add `buildMaterialPreviewUrl` and use it for Full Report gallery item 1**

```ts
export function buildMaterialPreviewUrl(configuration: MaterialPreviewConfiguration) {
  const scene = buildMaterialPreviewScene(configuration);
  if (!scene.available) return undefined;
  const params = new URLSearchParams({
    style: configuration.styleId ?? "",
    floors: String(configuration.floors),
    roof: configuration.materialSelections.roof,
    wall: configuration.materialSelections.wall,
    window: configuration.materialSelections.window,
    door: configuration.materialSelections.door,
    flooring: configuration.materialSelections.flooring,
  });
  return `/api/previews/material?${params.toString()}`;
}

const selectedMaterialImage = buildMaterialPreviewUrl(snapshot.configuration);
gallery: Object.freeze(GALLERY_VIEWS.map(([id, label, objectPosition], index) => Object.freeze({
  id,
  label,
  imageSrc: index === 0 && selectedMaterialImage ? selectedMaterialImage : snapshot.concept.imageSrc,
  objectPosition,
  placeholder: index !== 0,
}))),
```

Do not place contact fields or personal data in the URL.

- [ ] **Step 7: Run compositor, route, and report tests**

Run: `cd web && npm test -- src/features/configurator/server/render-material-preview.test.ts src/features/configurator/presentation/material-preview-url.test.ts src/app/api/previews/material/route.test.ts src/features/reports/application/build-full-report.test.ts`

Expected: PASS; report item 1 uses selected materials for `nordic-2f`, unavailable scenes keep the concept image.

- [ ] **Step 8: Commit report continuity**

```bash
git add web/src/features/configurator/server web/src/features/configurator/presentation/material-preview-url.ts web/src/features/configurator/presentation/material-preview-url.test.ts web/src/app/api/previews/material web/src/features/reports/application/build-full-report.ts web/src/features/reports/application/build-full-report.test.ts
git commit -m "feat: carry material composite into full report"
```

---

### Task 7: Verify Step 4 → Step 5 → Preview → Full Report continuity

**Files:**
- Modify: `web/src/features/preview/components/free-preview.test.tsx`
- Modify: `web/src/e2e/configurator-step-four.e2e.ts`
- Modify: `web/src/e2e/configurator-step-five.e2e.ts`
- Create: `web/src/e2e/material-preview-continuity.e2e.ts`

**Interfaces:**
- Consumes: shared configurator draft and published Nordic overlays
- Produces: verified client flow with no stale material image

- [ ] **Step 1: Update Step 4 E2E from full roof scene to roof overlay**

Assert base source stays `/material-previews/nordic/2f/base.webp` before and after selecting ceramic tile. Capture all five layer sources before selection, then assert only `data-category="roof"` changes from `concrete-tile` to `ceramic-tile`.

- [ ] **Step 2: Add the full continuity E2E**

Configure Nordic 2F, select ceramic roof, natural-stone wall, uPVC window, teak door, and terrazzo flooring. Continue to Step 5 and Preliminary Summary; assert every page exposes the same five `data-option` values. Submit valid Full Report contact data and assert Full Report gallery item 1 requests `/api/previews/material` with the same IDs.

- [ ] **Step 3: Run focused E2E at desktop**

Run: `cd web && npm run test:e2e -- src/e2e/configurator-step-four.e2e.ts src/e2e/configurator-step-five.e2e.ts src/e2e/material-preview-continuity.e2e.ts --project=chromium`

Expected: PASS with no console errors, page errors, broken images, or stale option IDs.

- [ ] **Step 4: Run responsive visual captures**

Capture Step 4 at `375×812`, `768×1024`, `1440×900`, `1672×941`, and `1920×1080`. At `1672×941`, compare the browser preview with the generated contact sheet for mask edges, material opacity, Perspective, and gold-border intensity.

- [ ] **Step 5: Perform one correction pass in Photoshop**

If QA finds a missing/excess region, correct only the responsible source mask/overlay, rerun `npm run assets:material-preview`, and repeat the affected visual capture. Do not compensate with CSS opacity, Polygon, or colour-threshold changes.

- [ ] **Step 6: Commit the integration verification**

```bash
git add web/src/features/preview/components/free-preview.test.tsx web/src/e2e/configurator-step-four.e2e.ts web/src/e2e/configurator-step-five.e2e.ts web/src/e2e/material-preview-continuity.e2e.ts web/assets/material-previews/nordic/2f web/public/material-previews/nordic/2f
git commit -m "test: verify Nordic material preview continuity"
```

---

### Task 8: Remove obsolete rough-mask outputs and run final verification

**Files:**
- Modify: `web/scripts/generate-material-preview-assets.mjs`
- Remove after exact path verification: `web/public/material-previews/nordic/2f/roof-scenes/`
- Remove after exact path verification: unused rough overlay files replaced by Task 3 publish output

**Interfaces:**
- Consumes: completed Pilot and passing focused tests
- Produces: production-ready branch without runtime references to rough masks

- [ ] **Step 1: Confirm no code references obsolete paths**

Run: `cd web && rg -n "roof-scenes|materialMask\(|<polygon|soft-light" src scripts`

Expected: no runtime or generator references; test fixture text is also removed.

- [ ] **Step 2: Verify exact cleanup targets before deletion**

Resolve `web/public/material-previews/nordic/2f/roof-scenes` and confirm it is a real directory inside the worktree, contains only the four obsolete roof-scene files, and is not a symbolic link or junction. Stop if any condition differs.

- [ ] **Step 3: Remove only the verified obsolete directory**

Use native PowerShell `Remove-Item -LiteralPath <verified-absolute-path> -Recurse` only after Step 2 succeeds. Do not delete `web/public/material-previews/nordic/2f` or any parent directory.

- [ ] **Step 4: Run repository-native verification**

```bash
cd web
npm run assets:material-preview:validate
npm run lint
npm run typecheck
npm test
npm run test:e2e -- src/e2e/configurator-step-four.e2e.ts src/e2e/configurator-step-five.e2e.ts src/e2e/material-preview-continuity.e2e.ts --project=chromium
npm run build
git diff --check
```

Expected: every command exits `0`; material validation reports 5 masks, 20 overlays, 0 overlaps; no console error, broken image, overflow, clipped Thai text, or stale roof-scene path.

- [ ] **Step 5: Commit cleanup**

```bash
git add web/scripts web/public/material-previews/nordic/2f web/src
git commit -m "chore: remove obsolete rough material masks"
```

## Final Acceptance Checklist

- [ ] Nordic 2F uses the same base house before and after every material selection
- [ ] Five reviewed semantic masks and twenty overlays satisfy `1672 × 941` contract
- [ ] Roof excludes gables, fascia, walls, glass, pillars, and landscaping
- [ ] Wall excludes windows, doors, roof, fixtures, and foreground objects
- [ ] Window changes frame/mullion only and preserves glass
- [ ] Door changes only the agreed entrance-door region
- [ ] Flooring changes only the agreed terrace/entrance surfaces
- [ ] Existing material does not bleed through as a faint shadow
- [ ] Texture scale and direction follow each roof/floor plane Perspective
- [ ] Selecting one category changes only that category layer
- [ ] Crossfade has no flash and respects reduced motion
- [ ] Step 5, Preliminary Summary, and Full Report retain identical material IDs
- [ ] Full Report material URL contains no personal/contact data
- [ ] Invalid material route parameters cannot read arbitrary files
- [ ] Contact sheet and responsive screenshots pass visual review
- [ ] Asset validation, lint, typecheck, unit tests, focused E2E, build, and diff check pass
