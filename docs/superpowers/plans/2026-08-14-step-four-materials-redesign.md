# Step 4 Materials Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild only Step 4 as a viewport-height, data-driven material configurator with an internally scrolling selector, fixed four-level quality control, empty asset placeholders, and a stable preview summary matching the approved reference.

**Architecture:** Extend `HouseConfiguration` with explicit material selections and a user-facing quality ID while retaining legacy pricing fields. Render Step 4 through focused selector, placeholder, and preview components with Step 4-scoped CSS; route only the materials step into the new preview. Every production change follows a failing focused test.

**Tech Stack:** Next.js 16.3, React 19, TypeScript 5, Zod 4, CSS Modules, Zustand, Vitest, Testing Library, Playwright.

## Global Constraints

- Modify Step 4 and required state/mapping only; do not redesign Steps 1, 2, 3, or 5.
- Preserve draft persistence, navigation, and current pricing behavior.
- All material, feature, preview, and optional summary image areas remain empty placeholders with no URLs, text, icons, or images.
- Desktop uses a 43–45% left column and 55–57% right column with one divider and a viewport-height main area.
- Only the left catalog scrolls on desktop; the quality selector remains visible.
- Every normal material category contains exactly four radio options; special features use checkboxes.
- `bespoke` persists exactly but maps to legacy `signature` pricing until a dedicated rule exists.
- New design-only special features persist but are excluded from the current pricing request.
- Add no dependencies and do not stage unrelated pre-existing changes.

## File Map

- Create `web/src/features/configurator/domain/material-catalog.ts` and test: typed catalogs and compatibility mappings.
- Modify `web/src/features/configurator/domain/configuration.ts` and test: state schema/defaults.
- Modify `web/src/features/configurator/state/draft-storage.ts` and test: legacy migration.
- Modify `web/src/features/pricing/application/estimate-request.ts` and test: pricing-boundary filtering.
- Create `web/src/features/configurator/components/asset-placeholder.tsx` and CSS: reusable empty aspect-ratio surfaces.
- Replace `web/src/features/configurator/components/material-features-step.tsx`; create scoped CSS: selector, scrolling, quality.
- Create `web/src/features/configurator/components/materials-preview.tsx` and CSS: empty preview and compact summary.
- Modify `web/src/features/configurator/components/configurator-shell.tsx`, CSS, and tests: Step 4 routing and viewport composition.
- Modify `web/src/features/configurator/presentation/live-preview.ts` and `review-step.tsx`: labels for saved new choices in Step 5.
- Create `web/src/e2e/configurator-step-four.e2e.ts`: viewport, scrolling, accessibility, and visual verification.

---

### Task 1: Typed Material Catalog and Pricing Mappings

**Files:**
- Create: `web/src/features/configurator/domain/material-catalog.ts`
- Test: `web/src/features/configurator/domain/material-catalog.test.ts`

**Interfaces:**
- Produces `MATERIAL_CATALOG`, `DEFAULT_MATERIAL_SELECTIONS`, `MATERIAL_QUALITY_CATALOG`, `SPECIAL_FEATURE_CATALOG`, `MaterialSelections`, `MaterialQualityId`, `materialLevelForQuality()`, and `isPricingSpecialFeature()`.

- [ ] **Step 1: Write the failing catalog test**

```ts
test("defines eight categories with exactly four unique options", () => {
  expect(MATERIAL_CATALOG).toHaveLength(8);
  for (const category of MATERIAL_CATALOG) {
    expect(category.options).toHaveLength(4);
    expect(new Set(category.options.map((option) => option.id)).size).toBe(4);
    expect(category.label).not.toMatch(/^\d/);
  }
});

test("maps display quality without inventing bespoke pricing", () => {
  expect(MATERIAL_QUALITY_CATALOG.map(({ id }) => id)).toEqual([
    "standard", "premium", "signature", "bespoke",
  ]);
  expect(materialLevelForQuality("standard")).toBe("select");
  expect(materialLevelForQuality("bespoke")).toBe("signature");
  expect(isPricingSpecialFeature("pool")).toBe(true);
  expect(isPricingSpecialFeature("internal-garden")).toBe(false);
});
```

- [ ] **Step 2: Run RED**

Run from `web`: `npm test -- src/features/configurator/domain/material-catalog.test.ts`

Expected: FAIL because the catalog module does not exist.

- [ ] **Step 3: Implement catalog types and mappings**

```ts
export const MATERIAL_CATEGORY_IDS = [
  "roof", "wall", "window", "door", "flooring", "ceiling", "facade", "lighting",
] as const;

export const MATERIAL_QUALITY_IDS = ["standard", "premium", "signature", "bespoke"] as const;
export type MaterialQualityId = (typeof MATERIAL_QUALITY_IDS)[number];

export function materialLevelForQuality(quality: MaterialQualityId) {
  return quality === "standard" ? "select" : quality === "bespoke" ? "signature" : quality;
}

export function isPricingSpecialFeature(value: string): value is PricingSpecialFeature {
  return (PRICING_SPECIAL_FEATURE_CODES as readonly string[]).includes(value);
}
```

Complete the eight approved Thai categories, four options per category, four quality entries, and 6–12+ special-feature entries as `as const` data. Derive `DEFAULT_MATERIAL_SELECTIONS` from the first option in each category.

- [ ] **Step 4: Run GREEN**

Run: `npm test -- src/features/configurator/domain/material-catalog.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web/src/features/configurator/domain/material-catalog.ts web/src/features/configurator/domain/material-catalog.test.ts
git commit -m "feat: define step four material catalog"
```

### Task 2: Persist Choices and Migrate Existing Drafts

**Files:**
- Modify: `web/src/features/configurator/domain/configuration.ts`
- Test: `web/src/features/configurator/domain/configuration.test.ts`
- Modify: `web/src/features/configurator/state/draft-storage.ts`
- Test: `web/src/features/configurator/state/draft-storage.test.ts`

**Interfaces:**
- Consumes Task 1 catalog IDs/defaults.
- Produces `materialSelections`, `materialQualityId`, expanded `specialFeatures`, and compatible draft loading.

- [ ] **Step 1: Write failing schema/default/migration tests**

```ts
test("creates complete Step 4 defaults", () => {
  const value = createDefaultConfiguration();
  expect(value.materialSelections).toEqual(DEFAULT_MATERIAL_SELECTIONS);
  expect(value.materialQualityId).toBe("premium");
  expect(value.materialLevel).toBe("premium");
});

test("migrates legacy signature drafts without losing features", () => {
  const legacyConfiguration = { ...createDefaultConfiguration() } as Record<string, unknown>;
  delete legacyConfiguration.materialSelections;
  delete legacyConfiguration.materialQualityId;
  legacyConfiguration.materialLevel = "signature";
  legacyConfiguration.specialFeatures = ["pool"];
  const storage = createMemoryStorage({
    "ksb-configurator-draft-v1": JSON.stringify({
      draftVersion: 1, currentStep: 3, configuration: legacyConfiguration,
    }),
  });
  const result = createDraftStorage(storage).load();
  expect(result).toMatchObject({
    status: "valid",
    draft: { configuration: { materialQualityId: "signature", specialFeatures: ["pool"] } },
  });
});
```

- [ ] **Step 2: Run RED**

Run: `npm test -- src/features/configurator/domain/configuration.test.ts src/features/configurator/state/draft-storage.test.ts`

Expected: FAIL because the Step 4 fields and migration do not exist.

- [ ] **Step 3: Extend schema and defaults**

```ts
materialSelections: MaterialSelectionsSchema.default(DEFAULT_MATERIAL_SELECTIONS),
materialQualityId: z.enum(MATERIAL_QUALITY_IDS).default("premium"),
materialLevel: z.enum(["select", "premium", "signature"]),
specialFeatures: z.array(z.enum(SPECIAL_FEATURE_CODES)).refine(uniqueValues),
```

Add the corresponding default values in `createDefaultConfiguration()`.

- [ ] **Step 4: Migrate legacy Step 4 state before Zod parsing**

```ts
configuration: {
  ...configuration,
  materialSelections: configuration.materialSelections ?? DEFAULT_MATERIAL_SELECTIONS,
  materialQualityId: configuration.materialQualityId
    ?? (configuration.materialLevel === "select"
      ? "standard"
      : configuration.materialLevel === "signature" ? "signature" : "premium"),
}
```

Compose this with the existing budget migration. Preserve `additionalRequirements`, budget data, and unrelated fields.

- [ ] **Step 5: Run GREEN**

Run: `npm test -- src/features/configurator/domain/configuration.test.ts src/features/configurator/state/draft-storage.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add web/src/features/configurator/domain/configuration.ts web/src/features/configurator/domain/configuration.test.ts web/src/features/configurator/state/draft-storage.ts web/src/features/configurator/state/draft-storage.test.ts
git commit -m "feat: persist step four material choices"
```

### Task 3: Keep Pricing and Step 5 Compatible

**Files:**
- Modify: `web/src/features/pricing/application/estimate-request.ts`
- Test: `web/src/features/pricing/application/estimate-request.test.ts`
- Modify: `web/src/features/configurator/presentation/live-preview.ts`
- Test: `web/src/features/configurator/presentation/live-preview.test.ts`
- Modify: `web/src/features/configurator/components/review-step.tsx`

**Interfaces:**
- Consumes `materialLevelForQuality()` and `isPricingSpecialFeature()`.
- Produces supported pricing payloads and labels for all persisted choices.

- [ ] **Step 1: Write failing boundary tests**

```ts
test("maps bespoke and removes unpriced design-only features", () => {
  const request = projectEstimateRequest({
    ...completeConfiguration,
    materialQualityId: "bespoke",
    materialLevel: "signature",
    specialFeatures: ["pool", "internal-garden"],
  });
  expect(request.materialLevel).toBe("signature");
  expect(request.specialFeatures).toEqual(["pool"]);
});
```

Add a live-preview test asserting that `internal-garden` resolves to `สวนภายในบ้าน` rather than throwing.

- [ ] **Step 2: Run RED**

Run: `npm test -- src/features/pricing/application/estimate-request.test.ts src/features/configurator/presentation/live-preview.test.ts`

Expected: FAIL because design-only codes are rejected or unlabeled.

- [ ] **Step 3: Filter only at the pricing boundary**

```ts
const materialLevel = materialLevelForQuality(configuration.materialQualityId);
const specialFeatures = configuration.specialFeatures.filter(isPricingSpecialFeature);
```

Pass these two values to `EstimateRequestSchema`. Extend presentation/review labels from the central catalog; do not edit price books or assign allowances.

- [ ] **Step 4: Run GREEN and commit**

Run: `npm test -- src/features/pricing/application/estimate-request.test.ts src/features/configurator/presentation/live-preview.test.ts`

Expected: PASS.

```bash
git add web/src/features/pricing/application/estimate-request.ts web/src/features/pricing/application/estimate-request.test.ts web/src/features/configurator/presentation/live-preview.ts web/src/features/configurator/presentation/live-preview.test.ts web/src/features/configurator/components/review-step.tsx
git commit -m "fix: preserve pricing compatibility for step four"
```

### Task 4: Build Placeholder and Selection Components

**Files:**
- Create: `web/src/features/configurator/components/asset-placeholder.tsx`
- Create: `web/src/features/configurator/components/asset-placeholder.module.css`
- Replace: `web/src/features/configurator/components/material-features-step.tsx`
- Create: `web/src/features/configurator/components/material-features-step.module.css`
- Modify: `web/src/features/configurator/components/configurator-shell.test.tsx`

**Interfaces:**
- Consumes catalog data and `HouseConfiguration`.
- Produces blank `AssetPlaceholder` surfaces and a data-driven `MaterialFeaturesStep` emitting `Partial<HouseConfiguration>`.

- [ ] **Step 1: Write failing UI tests**

```tsx
test("renders eight four-option material groups using blank placeholders", () => {
  const { store } = renderConfigurator();
  act(() => store.getState().setCurrentStep(3));
  expect(screen.getAllByTestId("material-asset-placeholder")).toHaveLength(32);
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});

test("selects materials, multiple features, and bespoke quality", async () => {
  const { store, user } = renderConfigurator();
  act(() => store.getState().setCurrentStep(3));
  await user.click(screen.getByRole("radio", { name: "Metal Roof" }));
  await user.click(screen.getByRole("checkbox", { name: "สระว่ายน้ำ" }));
  await user.click(screen.getByRole("checkbox", { name: "สวนภายในบ้าน" }));
  await user.click(screen.getByRole("radio", { name: /BESPOKE/ }));
  expect(store.getState().configuration).toMatchObject({
    materialSelections: { roof: "metal-roof" },
    materialQualityId: "bespoke",
    materialLevel: "signature",
  });
});
```

- [ ] **Step 2: Run RED**

Run: `npm test -- src/features/configurator/components/configurator-shell.test.tsx`

Expected: FAIL because new controls and placeholders are absent.

- [ ] **Step 3: Implement the reusable blank surface**

```tsx
export function AssetPlaceholder({ type, testId }: AssetPlaceholderProps) {
  return <span aria-hidden="true" className={styles.placeholder} data-placeholder-type={type} data-testid={testId} />;
}
```

Document in the CSS file: material 800×450 (16:9), feature 800×450 (16:9), preview 2000×1250 minimum 1600×1000 (16:10), summary 400×400 (1:1). Do not place content inside the placeholder.

- [ ] **Step 4: Implement selector and fixed quality structure**

Use native radio inputs for normal categories and quality, native checkboxes for special features, and this quality update:

```ts
onChange({
  materialQualityId: quality,
  materialLevel: materialLevelForQuality(quality),
});
```

Place all material/feature sections inside `data-testid="material-scroll-area"`; place the quality radiogroup after that scroll area with `flex-shrink: 0`. Add 44px targets, visible checks, `focus-visible`, narrow scrollbar styling, and reduced-motion rules.

- [ ] **Step 5: Run GREEN and commit**

Run: `npm test -- src/features/configurator/components/configurator-shell.test.tsx`

Expected: PASS.

```bash
git add web/src/features/configurator/components/asset-placeholder.tsx web/src/features/configurator/components/asset-placeholder.module.css web/src/features/configurator/components/material-features-step.tsx web/src/features/configurator/components/material-features-step.module.css web/src/features/configurator/components/configurator-shell.test.tsx
git commit -m "feat: build step four material selector"
```

### Task 5: Add Step 4 Preview and Viewport Composition

**Files:**
- Create: `web/src/features/configurator/components/materials-preview.tsx`
- Create: `web/src/features/configurator/components/materials-preview.module.css`
- Modify: `web/src/features/configurator/components/configurator-shell.tsx`
- Modify: `web/src/features/configurator/components/configurator-shell.module.css`
- Modify: `web/src/features/configurator/components/configurator-shell-styles.test.ts`
- Modify: `web/src/features/configurator/components/configurator-shell.test.tsx`

**Interfaces:**
- Consumes `AssetPlaceholder`, catalogs, and configuration.
- Produces the Step 4-only stable preview/summary while retaining existing preview routes for all other steps.

- [ ] **Step 1: Write failing preview and CSS-contract tests**

```tsx
test("shows a blank Step 4 preview and compact selection summary", () => {
  const { store } = renderConfigurator();
  act(() => store.getState().setCurrentStep(3));
  const preview = screen.getByRole("complementary", { name: "ภาพตัวอย่างวัสดุ" });
  expect(within(preview).getByTestId("main-house-preview-placeholder")).toBeInTheDocument();
  expect(within(preview).getByRole("heading", { name: "สรุปวัสดุที่เลือก" })).toBeInTheDocument();
  expect(within(preview).queryByText("CONCEPT PREVIEW")).not.toBeInTheDocument();
  expect(within(preview).queryByRole("img")).not.toBeInTheDocument();
});
```

Add style-source assertions for `.page[data-step="materials"]`, a 44/56 split, one divider, internal `overflow-y: auto`, and a non-shrinking quality area.

- [ ] **Step 2: Run RED**

Run: `npm test -- src/features/configurator/components/configurator-shell.test.tsx src/features/configurator/components/configurator-shell-styles.test.ts`

Expected: FAIL because Step 4 still uses the generic image preview and long page.

- [ ] **Step 3: Implement Step 4-only preview**

```tsx
export function MaterialsPreview({ configuration }: { configuration: HouseConfiguration }) {
  return (
    <aside aria-label="ภาพตัวอย่างวัสดุ" className={styles.preview}>
      <AssetPlaceholder type="preview" testId="main-house-preview-placeholder" />
      <section className={styles.summary}>
        <h2>สรุปวัสดุที่เลือก</h2>
        <dl>{renderSummary(configuration)}</dl>
      </section>
    </aside>
  );
}
```

Resolve labels from the catalog. Summarize roof, wall, door/window, floor, quality, and special features without thumbnails.

- [ ] **Step 4: Route and style only Step 4**

Add the approved Step 4 intro, validate new Step 4 state, and insert `MaterialsPreview` after the Step 3 preview branch and before the generic Step 5 preview. Desktop CSS sets `height: 100svh`, clips document scrolling, uses `44fr 56fr`, and gives the preview one divider with a 100–160px central highlight. Responsive CSS restores normal document flow and two-column choice grids on mobile.

- [ ] **Step 5: Run GREEN and commit**

Run: `npm test -- src/features/configurator/components/configurator-shell.test.tsx src/features/configurator/components/configurator-shell-styles.test.ts`

Expected: PASS.

```bash
git add web/src/features/configurator/components/materials-preview.tsx web/src/features/configurator/components/materials-preview.module.css web/src/features/configurator/components/configurator-shell.tsx web/src/features/configurator/components/configurator-shell.module.css web/src/features/configurator/components/configurator-shell-styles.test.ts web/src/features/configurator/components/configurator-shell.test.tsx
git commit -m "feat: add step four viewport preview layout"
```

### Task 6: Visual Correction and Full Verification

**Files:**
- Create: `web/src/e2e/configurator-step-four.e2e.ts`
- Modify only Step 4 component/CSS files when the visual comparison proves a mismatch.

**Interfaces:**
- Consumes the completed Step 4.
- Produces automated viewport evidence and one correction pass.

- [ ] **Step 1: Add the Step 4 navigation helper**

```ts
async function openStepFour(page: Page) {
  await page.goto("/configurator");
  await page.getByRole("radio", { name: "Contemporary Warm Luxury" }).click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByLabel("จังหวัด").selectOption("10");
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await expect(page.getByRole("heading", { name: "วัสดุและส่วนพิเศษ" })).toBeVisible();
}
```

- [ ] **Step 2: Write failing E2E acceptance tests**

```ts
test("quality remains visible while only the catalog scrolls", async ({ page }) => {
  await page.setViewportSize({ width: 1672, height: 941 });
  await openStepFour(page);
  await page.getByTestId("material-scroll-area").evaluate((node) => { node.scrollTop = node.scrollHeight; });
  await expect(page.getByRole("radiogroup", { name: "ระดับคุณภาพวัสดุ" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(941);
});

test("has no horizontal overflow at 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await openStepFour(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
```

Also cover keyboard radio selection, feature persistence, absence of images in placeholders, and console errors.

- [ ] **Step 3: Run RED**

Run: `npm run test:e2e -- src/e2e/configurator-step-four.e2e.ts`

Expected: initial failure or a captured mismatch before the correction pass.

- [ ] **Step 4: Capture and compare screenshots**

Inspect 375px, 768px, 1440px, 1672×941, and wide desktop. Compare header height, 44/56 divider, heading scale, four-column alignment, scrollbar, fixed quality height, preview dimensions, summary height, darkness, and gold intensity against IMAGE B.

- [ ] **Step 5: Apply one scoped visual-correction pass**

Change only Step 4 CSS/markup proven mismatched. Preserve empty placeholders and all state behavior.

- [ ] **Step 6: Run focused and repository-wide verification**

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e -- src/e2e/configurator-step-four.e2e.ts
git diff --check
git status --short
```

Expected: all commands exit 0; no console errors, clipping, overflow, broken Thai, or new regressions.

- [ ] **Step 7: Commit verified changes**

```bash
git add web/src/e2e/configurator-step-four.e2e.ts web/src/features/configurator web/src/features/pricing/application/estimate-request.ts web/src/features/pricing/application/estimate-request.test.ts
git commit -m "test: verify step four materials experience"
```

Before committing, unstage any pre-existing file not changed for this plan.
