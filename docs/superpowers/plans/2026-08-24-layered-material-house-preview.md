# Layered Material House Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ทำให้ Step 4 แสดงบ้านสไตล์และจำนวนชั้นเดียวกับ Step 2 แล้วเปลี่ยนเฉพาะหลังคา ผนังภายนอก หน้าต่าง ประตูทางเข้า และพื้นตามตัวเลือกวัสดุแบบเรียลไทม์

**Architecture:** ใช้ภาพบ้านฐานหนึ่งภาพร่วมกับภาพ WebP โปร่งใส 5 เลเยอร์ที่วางตรงพิกเซลกัน โดยแต่ละเลเยอร์มาจากตัวเลือกใน `materialSelections` เดิม ไม่สร้าง configuration หรือ state ชุดใหม่ ฝั่งเว็บประกอบเลเยอร์เพื่อให้ตอบสนองเร็ว ส่วนหน้าที่ต้องการภาพไฟล์เดียวใช้ตัวประกอบภาพฝั่งเซิร์ฟเวอร์จาก descriptor เดียวกัน

**Tech Stack:** Next.js 16, React 19, TypeScript, Zustand draft state, Next Image, CSS Modules, Vitest, Playwright, Sharp

## Global Constraints

- ใช้ `HouseConfiguration` และ `materialSelections` ชุดเดิมเป็น source of truth เท่านั้น
- รองรับ 5 หมวด: `roof`, `wall`, `window`, `door`, `flooring`
- แต่ละหมวดมี 4 ตัวเลือกจาก `MATERIAL_CATALOG` ปัจจุบัน
- บ้าน รูปทรง มุมกล้อง แสง เงา สวน และฉากหลังต้องคงเดิมเมื่อเปลี่ยนวัสดุ
- ห้ามเรียก AI image generation ตอนผู้ใช้คลิก เพราะช้า มีค่าใช้จ่าย และรูปทรงบ้านอาจเปลี่ยน
- ห้ามสร้างภาพครบทุก combination เพราะหนึ่ง scene มี `4^5 = 1,024` combinations
- เลเยอร์ทุกไฟล์ต้องมี canvas และตำแหน่งพิกเซลตรงกับภาพฐาน 100%
- ภาพฐานและเลเยอร์ production ใช้ 2000×1250 px อัตราส่วน 16:10; เลเยอร์ใช้ lossless WebP พร้อม alpha
- โหลดเฉพาะภาพฐานและ 5 เลเยอร์ที่เลือก ไม่โหลดทั้ง 20 เลเยอร์พร้อมกันบน mobile
- การเปลี่ยนวัสดุใช้ crossfade 180ms และปิด animation เมื่อ `prefers-reduced-motion: reduce`
- ถ้า scene/asset ยังไม่พร้อม ให้แสดงภาพฐานเดิมพร้อมข้อความ “ภาพวัสดุของแบบนี้อยู่ระหว่างจัดเตรียม” โดยไม่แสดง broken image
- Step 4 ที่ desktop 1200px ขึ้นไปยังต้องอยู่ภายใน viewport และไม่มี horizontal overflow

---

### Task 1: Produce and validate one pixel-locked pilot scene

**Files:**
- Create: `web/public/material-previews/nordic/2f/base.webp`
- Create: `web/public/material-previews/nordic/2f/roof/{concrete-tile,ceramic-tile,metal-roof,natural-slate}.webp`
- Create: `web/public/material-previews/nordic/2f/wall/{smooth-plaster,natural-stone,exterior-timber,exposed-concrete}.webp`
- Create: `web/public/material-previews/nordic/2f/window/{black-aluminium,natural-aluminium,solid-wood,upvc}.webp`
- Create: `web/public/material-previews/nordic/2f/door/{teak,engineered-wood,aluminium-glass,metal-frame}.webp`
- Create: `web/public/material-previews/nordic/2f/flooring/{natural-marble,engineered-wood,porcelain-tile,terrazzo}.webp`
- Modify: `web/package.json`
- Test: `web/src/features/configurator/presentation/material-preview-assets.test.ts`

**Interfaces:**
- Consumes: option IDs จาก `MATERIAL_CATALOG`
- Produces: scene `nordic/2f` ที่มี base 1 ภาพและ alpha overlays 20 ภาพ

- [ ] **Step 1: Lock the production asset specification**

ใช้กล้อง มุมมอง crop แสง เงา ต้นไม้ และ resolution เดียวกับ `base-nordic-2f-master.webp` ทุกไฟล์ ภาพ overlay ต้องโปร่งใสนอกพื้นที่วัสดุ และต้องไม่สร้างองค์ประกอบบ้านใหม่ เช่น หน้าต่างเพิ่ม เสาเลื่อน หรือแนวหลังคาเปลี่ยน

- [ ] **Step 2: Add Sharp as an explicit development dependency**

Run: `cd web && npm install --save-dev sharp`

Expected: `sharp` อยู่ใน `devDependencies` โดยตรงและ lockfile อัปเดต

- [ ] **Step 3: Write the failing asset-contract test**

```ts
import { access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, test } from "vitest";
import { MATERIAL_CATALOG } from "../domain/material-catalog";

describe("Nordic 2-floor material preview assets", () => {
  test("keeps every base and material layer pixel-aligned", async () => {
    const root = path.join(process.cwd(), "public", "material-previews", "nordic", "2f");
    const files = [
      path.join(root, "base.webp"),
      ...MATERIAL_CATALOG.flatMap((category) => category.options.map((option) =>
        path.join(root, category.id, `${option.id}.webp`),
      )),
    ];
    for (const file of files) {
      await expect(access(file)).resolves.toBeUndefined();
      const metadata = await sharp(file).metadata();
      expect([metadata.width, metadata.height]).toEqual([2000, 1250]);
      if (!file.endsWith("base.webp")) expect(metadata.hasAlpha).toBe(true);
    }
  });
});
```

- [ ] **Step 4: Run the asset test and confirm it fails before files are complete**

Run: `cd web && npm test -- src/features/configurator/presentation/material-preview-assets.test.ts`

Expected: FAIL โดยระบุชื่อไฟล์ที่ขาดหรือขนาด/alpha ไม่ตรง

- [ ] **Step 5: Export the 21 pilot assets and rerun the contract**

Expected: PASS 1 test; การเปิด overlay ทับ base ที่ opacity 50% ต้องไม่มีขอบบ้านเหลื่อม

- [ ] **Step 6: Commit the pilot assets**

```bash
git add web/package.json web/package-lock.json web/public/material-previews/nordic/2f web/src/features/configurator/presentation/material-preview-assets.test.ts
git commit -m "assets: add Nordic material preview layers"
```

### Task 2: Add a typed material-preview descriptor

**Files:**
- Create: `web/src/features/configurator/presentation/material-preview-scene.ts`
- Create: `web/src/features/configurator/presentation/material-preview-scene.test.ts`
- Modify: `web/src/features/preview/domain/concept-catalog.ts`
- Modify: `web/src/features/preview/domain/concept-catalog.test.ts`

**Interfaces:**
- Consumes: `HouseConfiguration`, `ConceptCatalogEntry`, `MaterialSelections`
- Produces: `buildMaterialPreviewScene(configuration): MaterialPreviewScene`

- [ ] **Step 1: Write failing tests for continuity, layer paths, and fallback**

```ts
import { describe, expect, test } from "vitest";
import { createDefaultConfiguration } from "../domain/configuration";
import { buildMaterialPreviewScene } from "./material-preview-scene";

test("uses the same Nordic 2-floor house and selected material IDs", () => {
  const configuration = createDefaultConfiguration();
  configuration.styleId = "natural-style";
  configuration.floors = 2;
  configuration.materialSelections = {
    roof: "metal-roof",
    wall: "natural-stone",
    window: "black-aluminium",
    door: "teak",
    flooring: "terrazzo",
  };
  const scene = buildMaterialPreviewScene(configuration);
  expect(scene.sceneId).toBe("nordic-2f");
  expect(scene.baseSrc).toBe("/material-previews/nordic/2f/base.webp");
  expect(scene.layers.map((layer) => layer.src)).toEqual([
    "/material-previews/nordic/2f/flooring/terrazzo.webp",
    "/material-previews/nordic/2f/wall/natural-stone.webp",
    "/material-previews/nordic/2f/roof/metal-roof.webp",
    "/material-previews/nordic/2f/window/black-aluminium.webp",
    "/material-previews/nordic/2f/door/teak.webp",
  ]);
  expect(scene.available).toBe(true);
});

test("falls back to the selected concept image without broken overlays", () => {
  const configuration = createDefaultConfiguration();
  configuration.styleId = "classic-style";
  const scene = buildMaterialPreviewScene(configuration);
  expect(scene.baseSrc).toBe("/concepts/base-classic-2f-master.webp");
  expect(scene.layers).toEqual([]);
  expect(scene.available).toBe(false);
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `cd web && npm test -- src/features/configurator/presentation/material-preview-scene.test.ts`

Expected: FAIL เพราะ module ยังไม่มี

- [ ] **Step 3: Add a stable preview key to visible concepts**

เพิ่ม property `materialPreviewKey` ให้แต่ละ style: `classic`, `modern`, `nordic`, `loft`, `minimal`, `tropical`, `contemporary` โดยไม่ใช้ legacy IDs เช่น `luxury-style` เป็นชื่อ path

- [ ] **Step 4: Implement the descriptor**

```ts
export const MATERIAL_LAYER_ORDER = ["flooring", "wall", "roof", "window", "door"] as const;

export type MaterialPreviewScene = Readonly<{
  sceneId: string;
  baseSrc: string;
  available: boolean;
  layers: readonly Readonly<{ category: MaterialCategoryId; optionId: string; src: string }>[];
}>;

const AVAILABLE_SCENES = new Set(["nordic-2f"]);

export function buildMaterialPreviewScene(configuration: HouseConfiguration): MaterialPreviewScene {
  const concept = CONCEPT_CATALOG.find((item) => item.id === configuration.styleId);
  if (!concept) throw new Error("MATERIAL_PREVIEW_CONCEPT_NOT_FOUND");
  const floor = configuration.floors <= 1 ? 1 : configuration.floors >= 3 ? 3 : 2;
  const sceneId = `${concept.materialPreviewKey}-${floor}f`;
  const available = AVAILABLE_SCENES.has(sceneId);
  if (!available) return { sceneId, baseSrc: resolveConceptImage(concept, floor), available, layers: [] };
  const root = `/material-previews/${concept.materialPreviewKey}/${floor}f`;
  return {
    sceneId,
    baseSrc: `${root}/base.webp`,
    available,
    layers: MATERIAL_LAYER_ORDER.map((category) => ({
      category,
      optionId: configuration.materialSelections[category],
      src: `${root}/${category}/${configuration.materialSelections[category]}.webp`,
    })),
  };
}
```

- [ ] **Step 5: Run focused tests**

Run: `cd web && npm test -- src/features/configurator/presentation/material-preview-scene.test.ts src/features/preview/domain/concept-catalog.test.ts`

Expected: PASS

- [ ] **Step 6: Commit the typed descriptor**

```bash
git add web/src/features/configurator/presentation/material-preview-scene.ts web/src/features/configurator/presentation/material-preview-scene.test.ts web/src/features/preview/domain/concept-catalog.ts web/src/features/preview/domain/concept-catalog.test.ts
git commit -m "feat: resolve material preview scenes"
```

### Task 3: Build the reusable layered house renderer

**Files:**
- Create: `web/src/features/configurator/components/material-house-preview.tsx`
- Create: `web/src/features/configurator/components/material-house-preview.module.css`
- Create: `web/src/features/configurator/components/material-house-preview.test.tsx`

**Interfaces:**
- Consumes: `configuration: HouseConfiguration`, `priority?: boolean`, `sizes: string`
- Produces: `<MaterialHousePreview />` และ status ที่ screen reader อ่านได้

- [ ] **Step 1: Write failing component tests**

```tsx
render(<MaterialHousePreview configuration={configuration} sizes="860px" />);
expect(screen.getByRole("img", { name: /บ้านสไตล์นอร์ดิก 2 ชั้น/ })).toHaveAttribute(
  "src",
  expect.stringContaining("material-previews/nordic/2f/base.webp"),
);
expect(screen.getAllByTestId("material-preview-layer")).toHaveLength(5);
expect(screen.getByTestId("material-preview-scene")).toHaveAttribute("data-scene", "nordic-2f");
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `cd web && npm test -- src/features/configurator/components/material-house-preview.test.tsx`

Expected: FAIL เพราะ component ยังไม่มี

- [ ] **Step 3: Implement base + five selected overlays**

ใช้ `<Image fill unoptimized>` ทุก layer ภายใน container เดียวกัน; base มี alt text ส่วน overlays ใช้ `alt=""`, `aria-hidden="true"` และ `data-category` เพื่อไม่เพิ่มภาพซ้ำให้ screen reader

- [ ] **Step 4: Add a two-buffer crossfade per material category**

เก็บ layer ปัจจุบันจน layer ใหม่ `onLoad`; จากนั้น fade layer ใหม่เป็น opacity 1 ภายใน 180ms และถอด layer เก่าหลัง `transitionend` เพื่อไม่ให้เกิดแฟลชเป็นกล่องดำ

- [ ] **Step 5: Add fallback and reduced-motion behavior**

```css
.layer { position: absolute; inset: 0; object-fit: cover; transition: opacity 180ms ease; }
.incoming { opacity: 0; }
.incoming[data-ready="true"] { opacity: 1; }
@media (prefers-reduced-motion: reduce) { .layer { transition: none; } }
```

เมื่อ `scene.available === false` แสดง base อย่างเดียวและ badge “ภาพวัสดุของแบบนี้อยู่ระหว่างจัดเตรียม”

- [ ] **Step 6: Run focused tests**

Run: `cd web && npm test -- src/features/configurator/components/material-house-preview.test.tsx`

Expected: PASS

- [ ] **Step 7: Commit the renderer**

```bash
git add web/src/features/configurator/components/material-house-preview.tsx web/src/features/configurator/components/material-house-preview.module.css web/src/features/configurator/components/material-house-preview.test.tsx
git commit -m "feat: render layered material house preview"
```

### Task 4: Replace the blank Step 4 preview and test interactions

**Files:**
- Modify: `web/src/features/configurator/components/materials-preview.tsx`
- Modify: `web/src/features/configurator/components/materials-preview.module.css`
- Modify: `web/src/features/configurator/components/configurator-shell.test.tsx`
- Modify: `web/src/e2e/configurator-step-four.e2e.ts`

**Interfaces:**
- Consumes: `<MaterialHousePreview configuration={configuration} />`
- Produces: Step 4 preview ที่อ่าน configuration เดียวกับ form และ summary

- [ ] **Step 1: Change existing tests from blank-placeholder expectations to continuity expectations**

ทดสอบว่า Step 4 แสดง style/floor เดียวกับ Step 2, เลือก `metal-roof` แล้วเปลี่ยนเฉพาะ `data-category="roof"`, layer อื่นคง src เดิม และ summary เปลี่ยนชื่อวัสดุพร้อมกัน

- [ ] **Step 2: Run focused unit/E2E tests and confirm they fail**

Run: `cd web && npm test -- src/features/configurator/components/configurator-shell.test.tsx`

Run: `cd web && npm run test:e2e -- src/e2e/configurator-step-four.e2e.ts`

Expected: FAIL ที่ expectation ของ blank placeholder

- [ ] **Step 3: Replace `AssetPlaceholder` in `MaterialsPreview`**

```tsx
<div className={styles.previewSurface}>
  <MaterialHousePreview
    configuration={configuration}
    priority
    sizes="(max-width: 1199px) 100vw, 52vw"
  />
</div>
```

- [ ] **Step 4: Preserve layout and add polite update text**

ใช้ `aria-live="polite"` แสดงข้อความ เช่น “อัปเดตหลังคาเป็นหลังคาเมทัลชีทแล้ว” โดยข้อความต้องไม่ดัน layout

- [ ] **Step 5: Verify keyboard and responsive behavior**

ทดสอบ ArrowRight ใน radiogroup, 375/768/1440/1672/1920 px, ไม่มี horizontal overflow, desktop ไม่มี document scroll และ preview ไม่กระพริบระหว่างโหลด layer ใหม่

- [ ] **Step 6: Run focused tests**

Expected: unit และ Step 4 E2E ผ่านทั้งหมด

- [ ] **Step 7: Commit Step 4 integration**

```bash
git add web/src/features/configurator/components/materials-preview.tsx web/src/features/configurator/components/materials-preview.module.css web/src/features/configurator/components/configurator-shell.test.tsx web/src/e2e/configurator-step-four.e2e.ts
git commit -m "feat: preview selected materials on the house"
```

### Task 5: Carry the same project visual into Step 5 and Preliminary Summary

**Files:**
- Modify: `web/src/features/configurator/components/review-step.tsx`
- Modify: `web/src/features/configurator/components/review-step.module.css`
- Modify: `web/src/features/preview/components/free-preview.tsx`
- Modify: `web/src/features/preview/components/free-preview.module.css`
- Modify: `web/src/features/configurator/components/configurator-shell.test.tsx`
- Modify: `web/src/features/preview/components/free-preview.test.tsx`
- Modify: `web/src/e2e/configurator-step-five.e2e.ts`
- Modify: `web/src/e2e/preview-before-lead.e2e.ts`

**Interfaces:**
- Consumes: configuration ที่หน้า `/preview` โหลดจาก draft อยู่แล้ว
- Produces: ภาพบ้านแบบเดียวกับ Step 4 โดยไม่ duplicate material selections เข้า `FreePreviewPayload`

- [ ] **Step 1: Write failing continuity tests**

เลือก Nordic 2F + metal roof + natural stone แล้วตรวจ Step 5 และ `/preview` ว่ามี scene/layer IDs ชุดเดียวกับ Step 4

- [ ] **Step 2: Replace single concept `<Image>` with `MaterialHousePreview`**

ส่ง `configuration` ตัวเดิมให้ renderer; ห้ามเพิ่ม `materialSelections` ซ้ำใน `FreePreviewPayload` เพราะ PreviewPage มี `configuration` จาก draft อยู่แล้ว

- [ ] **Step 3: Run focused unit and E2E tests**

Run: `cd web && npm test -- src/features/configurator/components/configurator-shell.test.tsx src/features/preview/components/free-preview.test.tsx`

Run: `cd web && npm run test:e2e -- src/e2e/configurator-step-five.e2e.ts src/e2e/preview-before-lead.e2e.ts`

Expected: PASS และไม่มี stale base image

- [ ] **Step 4: Commit downstream client continuity**

```bash
git add web/src/features/configurator/components/review-step.tsx web/src/features/configurator/components/review-step.module.css web/src/features/preview/components/free-preview.tsx web/src/features/preview/components/free-preview.module.css web/src/features/configurator/components/configurator-shell.test.tsx web/src/features/preview/components/free-preview.test.tsx web/src/e2e/configurator-step-five.e2e.ts web/src/e2e/preview-before-lead.e2e.ts
git commit -m "feat: preserve material preview through project summary"
```

### Task 6: Add a flattened composite for reports, gallery thumbnails, and PDF

**Files:**
- Create: `web/src/features/configurator/server/render-material-preview.ts`
- Create: `web/src/features/configurator/server/render-material-preview.test.ts`
- Create: `web/src/app/api/previews/material/route.ts`
- Create: `web/src/app/api/previews/material/route.test.ts`
- Modify: `web/src/features/reports/application/build-full-report.ts`
- Modify: `web/src/features/reports/application/build-full-report.test.ts`
- Modify: `web/src/features/reports/pdf/project-report-document.tsx`
- Modify: `web/src/features/reports/pdf/project-report-document.test.tsx`

**Interfaces:**
- Consumes: `MaterialPreviewScene`
- Produces: `renderMaterialPreview(scene): Promise<Buffer>` และ deterministic `/api/previews/material?...` URL

- [ ] **Step 1: Write a failing mathematical/visual composition test**

ทดสอบว่า Sharp composite ใช้ base แล้วเรียง layers ตาม `MATERIAL_LAYER_ORDER`; output เป็น WebP 2000×1250 และ request ที่ IDs เดิมให้ cache key เดิม

- [ ] **Step 2: Implement the server compositor**

```ts
export async function renderMaterialPreview(scene: MaterialPreviewScene): Promise<Buffer> {
  const publicRoot = path.join(process.cwd(), "public");
  const file = (src: string) => path.join(publicRoot, src.replace(/^\//, ""));
  return sharp(file(scene.baseSrc))
    .composite(scene.layers.map((layer) => ({ input: file(layer.src) })))
    .webp({ quality: 88 })
    .toBuffer();
}
```

- [ ] **Step 3: Validate the API query with stable IDs only**

ใช้ Zod ตรวจ style, floor และ option IDs; reject path traversal และ unknown IDs; response ใส่ `Cache-Control: public, max-age=31536000, immutable` เพราะ URL เปลี่ยนเมื่อ selection เปลี่ยน

- [ ] **Step 4: Feed the flattened image into full report and PDF**

รายงานและ PDF ใช้ descriptor เดิม ไม่สร้าง price/project state ใหม่ และ fallback เป็น concept image เดิมถ้า scene ยังไม่พร้อม

- [ ] **Step 5: Run security, report, and PDF tests**

Run: `cd web && npm test -- src/app/api/previews/material/route.test.ts src/features/configurator/server/render-material-preview.test.ts src/features/reports/application/build-full-report.test.ts src/features/reports/pdf/project-report-document.test.tsx`

Expected: PASS; unknown IDs = 400; valid scene = image/webp

- [ ] **Step 6: Commit report continuity**

```bash
git add web/src/app/api/previews/material web/src/features/configurator/server web/src/features/reports
git commit -m "feat: use selected materials in full report visuals"
```

### Task 7: Roll out all styles/floors and complete visual QA

**Files:**
- Create: `web/public/material-previews/{classic,modern,nordic,loft,minimal,tropical,contemporary}/{1f,2f,3f}/...`
- Modify: `web/src/features/configurator/presentation/material-preview-scene.ts`
- Modify: `web/src/features/configurator/presentation/material-preview-assets.test.ts`
- Modify: `web/src/e2e/configurator-step-four.e2e.ts`

**Interfaces:**
- Consumes: asset contract จาก Task 1
- Produces: material preview ครบทุก style/floor ที่ผู้ใช้เลือกได้

- [ ] **Step 1: Resolve the current Minimal asset gap**

สร้าง `base-minimal-1f-master.webp` และ `base-minimal-3f-master.webp` พร้อม layer sets หรือจำกัด floor ของ Minimal อย่างชัดเจน หาก Step 2 ยังเลือก 1–3 ชั้นได้ ต้องใช้ทางเลือกแรกเพื่อไม่ให้รูป 2 ชั้นแสดงผิด

- [ ] **Step 2: Export the remaining pixel-locked scenes**

เมื่อรองรับ 7 styles × 3 floors จะมี 21 scenes × 20 overlays = 420 overlay assets (รวม base 21 ภาพ) แต่ browser โหลดเพียง base + 5 selected overlays ต่อครั้ง

- [ ] **Step 3: Add each completed scene to `AVAILABLE_SCENES` only after asset validation passes**

ห้ามประกาศ scene ก่อนครบ 20 overlays เพราะจะทำให้บางตัวเลือกเกิด 404

- [ ] **Step 4: Add E2E coverage for one scene per style and all four options per category**

ทดสอบอย่างน้อย 7 style/floor paths และใน reference scene ให้คลิกครบ 20 options พร้อมตรวจว่าเปลี่ยนเฉพาะ category layer ที่เกี่ยวข้อง

- [ ] **Step 5: Run visual correction pass**

จับภาพ 1672×941 และเทียบเรื่อง crop, ความสว่าง, edge bleed, layer alignment, transition, summary spacing และ gold intensity โดยไม่ redesign layout

- [ ] **Step 6: Run repository-native verification**

```bash
cd web
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
git diff --check
```

Expected: ทุก command exit 0; ไม่มี console error, broken image, overflow หรือ Thai text clipping

- [ ] **Step 7: Commit the rollout**

```bash
git add web/public/material-previews web/src/features/configurator/presentation web/src/e2e/configurator-step-four.e2e.ts
git commit -m "assets: complete material preview scenes"
```

## Acceptance Checklist

- [ ] Step 4 เริ่มจาก style และ floor ที่เลือกใน Step 1–2
- [ ] เปลี่ยนวัสดุหนึ่งหมวดแล้วบ้าน/กล้อง/ฉากหลังไม่เปลี่ยน
- [ ] หมวดอื่นไม่เปลี่ยนเมื่อผู้ใช้เลือก option ใหม่
- [ ] ทั้ง 5 หมวดมี 4 options และ summary ตรงกับภาพ
- [ ] การเลือกกลับไปกลับมาไม่มีภาพว่างหรือ flash
- [ ] Draft refresh/back/forward คงวัสดุและ preview เดิม
- [ ] Step 5, Preliminary Summary, Full Report และ PDF ใช้ project เดียวกัน
- [ ] Scene ที่ยังไม่พร้อมมี fallback ที่ไม่เกิด broken image
- [ ] Mobile โหลด base + 5 selected overlays ไม่ใช่ 20 overlays
- [ ] Unit, accessibility, E2E, typecheck, lint และ build ผ่าน
