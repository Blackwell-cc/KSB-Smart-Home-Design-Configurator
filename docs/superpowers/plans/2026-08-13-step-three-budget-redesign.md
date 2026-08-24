# Step 3 Budget Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เปลี่ยน Step 3 เป็นหน้ากำหนดงบประมาณแบบช่วงเดียวที่ใช้ง่าย พร้อม preview และ summary ที่ตรงภาพเป้าหมาย โดยไม่กระทบสูตรราคาและ Step 4

**Architecture:** เพิ่ม `budgetRangeId` เป็นข้อมูลหลักของ UI และใช้ catalog กลางแปลงเฉพาะช่วงปิดเป็น `targetBudget` เดิมเพื่อ compatibility หน้า Step 3 ใช้ `SiteBudgetStep` สำหรับ form และ `SiteBudgetPreview` สำหรับภาพ/summary ส่วน CSS ทุก rule ใหม่ scope ด้วย `data-step="site-budget"` เพื่อกันผลกระทบขั้นตอนอื่น

**Tech Stack:** Next.js 16, React 19, TypeScript, Zod, Zustand, CSS Modules, Vitest, Testing Library, Playwright

## Global Constraints

- ไม่แก้ pricing formula หรือ Step 4 layout
- ไม่เพิ่ม dependency
- จังหวัดยังบังคับ แต่งบประมาณไม่บังคับ
- `under_5m`, `over_80m`, `unspecified` ต้องมี `targetBudget: null`
- Draft เก่าต้องโหลดได้โดยไม่ทิ้ง `targetBudget` แบบกำหนดเอง
- Desktop Step 3 ต้องพอดี viewport; 375px ต้องไม่มี horizontal overflow
- ไฟล์ shared มี uncommitted work จาก Step 1–2 อยู่แล้ว ห้าม `git add` หรือ commit ทั้งไฟล์โดยไม่แยกตรวจ provenance ของ diff

---

### Task 1: Budget range catalog และ schema compatibility

**Files:**
- Create: `web/src/features/configurator/domain/budget-ranges.ts`
- Create: `web/src/features/configurator/domain/budget-ranges.test.ts`
- Modify: `web/src/features/configurator/domain/configuration.ts`
- Modify: `web/src/features/configurator/domain/configuration.test.ts`
- Modify: `web/src/features/configurator/state/draft-storage.test.ts`
- Modify: `web/src/features/pricing/application/estimate-request.ts`

**Interfaces:**
- Produces: `BUDGET_RANGE_IDS`, `BudgetRangeId`, `BUDGET_RANGE_OPTIONS`, `budgetRangeOptionFor(id)`, `budgetRangeIdForTarget(targetBudget)`
- Produces: `HouseConfiguration.budgetRangeId: BudgetRangeId`
- Preserves: `HouseConfiguration.targetBudget: { min: number; max: number } | null`

- [ ] **Step 1: เขียน failing tests ของ catalog และ schema**

สร้าง `budget-ranges.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { BUDGET_RANGE_OPTIONS, budgetRangeIdForTarget, budgetRangeOptionFor } from "./budget-ranges";

describe("budget ranges", () => {
  test("defines seven stable choices with an unspecified default", () => {
    expect(BUDGET_RANGE_OPTIONS.map((option) => option.id)).toEqual([
      "unspecified", "under_5m", "5m_10m", "10m_20m",
      "20m_40m", "40m_80m", "over_80m",
    ]);
    expect(budgetRangeOptionFor("unspecified")).toMatchObject({ label: "ยังไม่ระบุ", targetBudget: null });
  });

  test("maps bounded ranges to compatibility values without inventing open-ended limits", () => {
    expect(budgetRangeOptionFor("10m_20m").targetBudget).toEqual({ min: 10_000_000, max: 20_000_000 });
    expect(budgetRangeOptionFor("under_5m").targetBudget).toBeNull();
    expect(budgetRangeOptionFor("over_80m").targetBudget).toBeNull();
  });

  test("recognizes exact legacy ranges and leaves custom ranges unspecified", () => {
    expect(budgetRangeIdForTarget({ min: 20_000_000, max: 40_000_000 })).toBe("20m_40m");
    expect(budgetRangeIdForTarget({ min: 5_000_000, max: 7_000_000 })).toBe("unspecified");
    expect(budgetRangeIdForTarget(null)).toBe("unspecified");
  });
});
```

เพิ่ม test ใน `configuration.test.ts` ว่า default มี `budgetRangeId: "unspecified"`, schema รับทุก ID และปฏิเสธ ID นอก catalog

เพิ่ม test ใน `draft-storage.test.ts`:

```ts
test("migrates a v1 draft that predates budget range choices without losing its custom budget", () => {
  const legacy = { ...createDefaultConfiguration(), targetBudget: { min: 5_000_000, max: 7_000_000 } } as Record<string, unknown>;
  delete legacy.budgetRangeId;
  const storage = createMemoryStorage({
    "ksb-configurator-draft-v1": JSON.stringify({
      draftVersion: 1,
      currentStep: 2,
      configuration: legacy,
    }),
  });
  const result = createDraftStorage(storage).load();
  expect(result).toMatchObject({
    status: "valid",
    draft: { configuration: { budgetRangeId: "unspecified", targetBudget: { min: 5_000_000, max: 7_000_000 } } },
  });
});
```

- [ ] **Step 2: รัน RED**

```powershell
npm test -- src/features/configurator/domain/budget-ranges.test.ts src/features/configurator/domain/configuration.test.ts src/features/configurator/state/draft-storage.test.ts
```

Expected: FAIL เพราะ catalog และ `budgetRangeId` ยังไม่มี

- [ ] **Step 3: สร้าง catalog กลาง**

สร้าง `budget-ranges.ts` ด้วย immutable options:

```ts
export const BUDGET_RANGE_IDS = [
  "unspecified", "under_5m", "5m_10m", "10m_20m",
  "20m_40m", "40m_80m", "over_80m",
] as const;

export type BudgetRangeId = (typeof BUDGET_RANGE_IDS)[number];
type TargetBudget = Readonly<{ min: number; max: number }> | null;

export const BUDGET_RANGE_OPTIONS = [
  { id: "unspecified", label: "ยังไม่ระบุ", shortLabel: "ยังไม่ระบุ", targetBudget: null },
  { id: "under_5m", label: "ต่ำกว่า 5 ล้านบาท", shortLabel: "ต่ำกว่า 5 ลบ.", targetBudget: null },
  { id: "5m_10m", label: "5–10 ล้านบาท", shortLabel: "5–10 ลบ.", targetBudget: { min: 5_000_000, max: 10_000_000 } },
  { id: "10m_20m", label: "10–20 ล้านบาท", shortLabel: "10–20 ลบ.", targetBudget: { min: 10_000_000, max: 20_000_000 } },
  { id: "20m_40m", label: "20–40 ล้านบาท", shortLabel: "20–40 ลบ.", targetBudget: { min: 20_000_000, max: 40_000_000 } },
  { id: "40m_80m", label: "40–80 ล้านบาท", shortLabel: "40–80 ลบ.", targetBudget: { min: 40_000_000, max: 80_000_000 } },
  { id: "over_80m", label: "มากกว่า 80 ล้านบาท", shortLabel: "80 ลบ. +", targetBudget: null },
] as const satisfies readonly { id: BudgetRangeId; label: string; shortLabel: string; targetBudget: TargetBudget }[];

export function budgetRangeOptionFor(id: BudgetRangeId) {
  return BUDGET_RANGE_OPTIONS.find((option) => option.id === id)!;
}

export function budgetRangeIdForTarget(target: { min: number; max: number } | null): BudgetRangeId {
  if (!target) return "unspecified";
  return BUDGET_RANGE_OPTIONS.find((option) =>
    option.targetBudget?.min === target.min && option.targetBudget.max === target.max,
  )?.id ?? "unspecified";
}
```

- [ ] **Step 4: เพิ่ม schema field และ compatibility defaults**

ใน `configuration.ts` import `BUDGET_RANGE_IDS`, เพิ่ม:

```ts
budgetRangeId: z.enum(BUDGET_RANGE_IDS).default("unspecified"),
```

และใน `createDefaultConfiguration()` เพิ่ม:

```ts
budgetRangeId: "unspecified",
```

ใน `estimate-request.ts` เพิ่ม `budgetRangeId: "unspecified"` ใน object ที่สร้าง `HouseConfiguration` เพื่อรักษา type compatibility

- [ ] **Step 5: รัน GREEN**

```powershell
npm test -- src/features/configurator/domain/budget-ranges.test.ts src/features/configurator/domain/configuration.test.ts src/features/configurator/state/draft-storage.test.ts src/features/pricing/application/estimate-request.test.ts
```

Expected: PASS และ legacy custom budget ยังอยู่ครบ

---

### Task 2: เปลี่ยน Step 3 form เป็น semantic budget radio group

**Files:**
- Modify: `web/src/features/configurator/components/site-budget-step.tsx`
- Modify: `web/src/features/configurator/components/configurator-shell.tsx`
- Modify: `web/src/features/configurator/components/configurator-shell.test.tsx`

**Interfaces:**
- `SiteBudgetStep` consumes `configuration`, `error`, `errorId`, `onChange`
- Selecting an option emits one patch `{ budgetRangeId, targetBudget }`
- Province validation and action navigation remain owned by `ConfiguratorShell`

- [ ] **Step 1: แทน tests ช่อง min/max ด้วย radio behavior tests**

ใน `configurator-shell.test.tsx` ลบ tests ที่ค้นหา spinbutton งบต่ำสุด/สูงสุด เพิ่ม helper นี้ข้าง `chooseStyleAndContinue`:

```ts
async function openStepThree(user: ReturnType<typeof userEvent.setup>) {
  await chooseStyleAndContinue(user);
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
  expect(screen.getByRole("heading", { name: "กำหนดงบประมาณ" })).toHaveFocus();
}
```

แล้วเพิ่ม tests:

```ts
test("selects one budget range, updates compatibility values, and keeps open ranges non-authoritative", async () => {
  const { store, user } = renderConfigurator();
  await openStepThree(user);

  const group = screen.getByRole("radiogroup", { name: "งบประมาณที่วางไว้" });
  expect(within(group).getAllByRole("radio")).toHaveLength(7);
  expect(within(group).getByRole("radio", { name: "ยังไม่ระบุ" })).toBeChecked();

  await user.click(within(group).getByRole("radio", { name: "10–20 ล้านบาท" }));
  expect(store.getState().configuration).toMatchObject({
    budgetRangeId: "10m_20m",
    targetBudget: { min: 10_000_000, max: 20_000_000 },
  });

  await user.click(within(group).getByRole("radio", { name: "มากกว่า 80 ล้านบาท" }));
  expect(store.getState().configuration).toMatchObject({ budgetRangeId: "over_80m", targetBudget: null });
});

test("allows Step 3 to continue with an unspecified budget while still requiring province", async () => {
  const { user } = renderConfigurator();
  await openStepThree(user);
  const next = screen.getByRole("button", { name: "ถัดไป" });
  expect(next).toBeDisabled();
  await user.selectOptions(screen.getByLabelText("จังหวัด"), "10");
  expect(next).toBeEnabled();
});

test("preserves the selected budget after back navigation", async () => {
  const { user } = renderConfigurator();
  await openStepThree(user);
  await user.selectOptions(screen.getByLabelText("จังหวัด"), "10");
  await user.click(screen.getByRole("radio", { name: "20–40 ล้านบาท" }));
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
  await user.click(screen.getByRole("button", { name: "ย้อนกลับ" }));
  expect(screen.getByRole("radio", { name: "20–40 ล้านบาท" })).toBeChecked();
});
```

- [ ] **Step 2: รัน RED**

```powershell
npm test -- src/features/configurator/components/configurator-shell.test.tsx
```

Expected: FAIL เพราะยังมี number inputs และไม่มี radiogroup

- [ ] **Step 3: ตัด budget draft logic ออกจาก shell**

ลบ `BudgetDraft`, `budgetDraftFor`, `budgetErrorFor`, `budgetDraftOverride`, `budgetError`, `updateBudget` และเงื่อนไข validity ของ budget ออกจาก `configurator-shell.tsx`

เปลี่ยน heading index 2 เป็น:

```ts
"กำหนดงบประมาณ",
```

เพิ่ม intro ของ Step 3 แบบ explicit:

```ts
state.currentStep === 2
  ? "ให้ข้อมูลที่สำคัญ เพื่อช่วยประเมินและวางแผนโครงการเบื้องต้นให้เหมาะกับความต้องการของคุณ"
```

เรียก component ด้วย props:

```tsx
<SiteBudgetStep
  configuration={state.configuration}
  error={error}
  errorId={errorId}
  onChange={updateConfiguration}
/>
```

- [ ] **Step 4: สร้าง form markup ตาม design**

ใน `site-budget-step.tsx`:

- ใช้ section heading `ข้อมูลโครงการ` พร้อม inline SVG และเส้นผ่าน CSS
- คง province select options เดิม
- เพิ่ม `placeholder="ระบุอำเภอ / เขต"`
- เปลี่ยน access display labels ตาม Spec โดยค่า enum เดิมไม่เปลี่ยน
- เพิ่ม heading/helper ของงบ
- render `BUDGET_RANGE_OPTIONS` เป็น `<fieldset>` + `<legend>` + radio inputs
- เมื่อ radio เปลี่ยนให้เรียก:

```ts
const option = budgetRangeOptionFor(event.target.value as BudgetRangeId);
onChange({
  budgetRangeId: option.id,
  targetBudget: option.targetBudget ? { ...option.targetBudget } : null,
});
```

selected card ต้องมี check mark ที่ `aria-hidden="true"` และ radio input จริงต้องรับ focus/arrow navigation ตาม native behavior

- [ ] **Step 5: รัน GREEN**

```powershell
npm test -- src/features/configurator/components/configurator-shell.test.tsx
```

Expected: tests ใหม่ผ่าน และ tests navigation/จังหวัดเดิมยังผ่าน

---

### Task 3: Step 3 concept preview และ live summary

**Files:**
- Create: `web/src/features/configurator/components/site-budget-preview.tsx`
- Modify: `web/src/features/configurator/components/configurator-shell.tsx`
- Modify: `web/src/features/configurator/components/configurator-shell.test.tsx`
- Modify: `web/src/features/configurator/components/review-step.tsx`

**Interfaces:**
- `SiteBudgetPreviewProps = { area: AreaRecommendation; configuration: HouseConfiguration; livePreview: LivePreviewModel }`
- Summary budget label comes only from `budgetRangeOptionFor(configuration.budgetRangeId).label`
- Step 4 review reads the same catalog label

- [ ] **Step 1: เขียน failing preview tests**

เพิ่มใน `configurator-shell.test.tsx`:

```ts
test("renders a clean Step 3 preview and updates its summary immediately", async () => {
  const { user } = renderConfigurator();
  await openStepThree(user);
  await user.selectOptions(screen.getByLabelText("จังหวัด"), "10");

  const preview = screen.getByRole("complementary", { name: "ภาพตัวอย่างกำหนดงบประมาณ" });
  expect(within(preview).getByText("CONCEPT PREVIEW")).toBeVisible();
  expect(within(preview).getByRole("region", { name: "สรุปข้อมูลเบื้องต้น" })).toBeVisible();
  expect(within(preview).queryByRole("button")).not.toBeInTheDocument();
  expect(within(preview).getByText("ยังไม่ระบุ")).toBeVisible();

  await user.click(screen.getByRole("radio", { name: "10–20 ล้านบาท" }));
  expect(within(preview).getByText("10–20 ล้านบาท")).toBeVisible();
});
```

เพิ่ม assertion ว่า Step 4 ยังใช้ shared preview เดิมและไม่มี `SiteBudgetPreview` landmark

- [ ] **Step 2: รัน RED**

```powershell
npm test -- src/features/configurator/components/configurator-shell.test.tsx
```

Expected: FAIL เพราะ Step 3 ยังใช้ shared preview

- [ ] **Step 3: สร้าง `SiteBudgetPreview`**

Component ต้องมีโครง semantic ต่อไปนี้:

```tsx
const summaryItems = [
  { icon: "location" as const, label: "ทำเลที่ตั้ง", value: locationLabel },
  { icon: "access" as const, label: "สภาพการเข้าถึง", value: ACCESS_LABELS[configuration.siteAccess] },
  { icon: "budget" as const, label: "งบประมาณ", value: budgetRangeOptionFor(configuration.budgetRangeId).label },
  { icon: "area" as const, label: "พื้นที่ใช้สอย (โดยประมาณ)", value: `${area.usableAreaM2} – ${area.constructionFloorAreaM2} ตร.ม.` },
];

<aside aria-label="ภาพตัวอย่างกำหนดงบประมาณ" className={styles.siteBudgetPreview}>
  <header className={styles.siteBudgetConceptHeading}>
    <p>CONCEPT PREVIEW</p>
    <h2>{livePreview.concept.thaiLabel}</h2>
    <span>{livePreview.concept.englishLabel}</span>
  </header>
  <figure className={styles.siteBudgetPreviewImage}>
    <Image
      alt={`ภาพอ้างอิง ${livePreview.concept.thaiLabel} (${livePreview.concept.englishLabel})`}
      fill
      key={livePreview.concept.id}
      preload
      sizes="(max-width: 899px) 100vw, 57vw"
      src={livePreview.concept.image}
    />
  </figure>
  <section aria-label="สรุปข้อมูลเบื้องต้น" className={styles.siteBudgetSummary}>
    <h2>สรุปข้อมูลเบื้องต้น</h2>
    <dl>
      {summaryItems.map((item) => (
        <div key={item.label}>
          <SummaryIcon name={item.icon} />
          <span><dt>{item.label}</dt><dd>{item.value}</dd></span>
        </div>
      ))}
    </dl>
    <p>ข้อมูลนี้ช่วยให้ทีมออกแบบประเมินแนวทางเบื้องต้นได้อย่างเหมาะสมยิ่งขึ้น</p>
  </section>
</aside>
```

ก่อน JSX ให้คำนวณ `locationLabel` จาก `THAI_PROVINCES` และ `configuration.district` โดยต่ออำเภอ/เขตเมื่อมีค่า สร้าง `SummaryIcon` แบบเดียวกับ `FunctionsPreview` แต่กำหนด path สำหรับ `location`, `access`, `budget`, `area` ภายในไฟล์นี้เท่านั้น

- [ ] **Step 4: เชื่อม preview เฉพาะ Step 3**

ใน `configurator-shell.tsx` แยก branch:

```tsx
state.currentStep === 2 ? (
  <SiteBudgetPreview area={area} configuration={state.configuration} livePreview={livePreview} />
) : null
```

ตัวอย่างข้างต้นแสดงเฉพาะ branch ใหม่: ใน implementation ให้แทน `null` ด้วย else branch shared preview ที่มีอยู่ในไฟล์ปัจจุบันแบบเดิมทุกบรรทัด เพื่อให้ Step 4–5 ยัง render เนื้อหาเดิมโดยไม่มีการแก้ไข

- [ ] **Step 5: ปรับ ReviewStep ให้ใช้ label กลาง**

แทนข้อความจาก `targetBudget` ด้วย:

```tsx
budgetRangeOptionFor(configuration.budgetRangeId).label
```

เพื่อให้ `under_5m` และ `over_80m` แสดงความหมายได้แม้ `targetBudget` เป็น `null`

- [ ] **Step 6: รัน GREEN**

```powershell
npm test -- src/features/configurator/components/configurator-shell.test.tsx
```

Expected: preview/summary tests ผ่าน และ Step 4 isolation ผ่าน

---

### Task 4: Scoped Step 3 visual system และ viewport layout

**Files:**
- Modify: `web/src/features/configurator/components/configurator-shell.module.css`
- Modify: `web/src/features/configurator/components/configurator-shell-styles.test.ts`

**Interfaces:**
- Consumes: `data-step="site-budget"`, `.siteBudgetPreview`, `.siteBudgetPreviewImage`, `.siteBudgetSummary`, `.budgetRangeGrid`, `.budgetRangeOption`
- Produces: 43/57 desktop layout, one divider with center glow, viewport lock only for Step 3

- [ ] **Step 1: เพิ่ม failing style contract test**

เพิ่ม test:

```ts
test("scopes the Step 3 viewport, split layout, divider, radio grid, and clean preview", () => {
  expect(stylesheet).toMatch(/\.page\[data-step="site-budget"\]\s*\{[^}]*height:\s*100svh;[^}]*overflow:\s*hidden;/);
  expect(stylesheet).toMatch(/\.shell\[data-step="site-budget"\]\s*\{[^}]*grid-template-columns:\s*minmax\(0, 43fr\) minmax\(0, 57fr\);/);
  expect(stylesheet).toMatch(/\.siteBudgetPreview::before\s*\{[^}]*width:\s*1px;/);
  expect(stylesheet).toMatch(/\.siteBudgetPreview::after\s*\{[^}]*height:\s*140px;[^}]*radial-gradient/);
  expect(stylesheet).toMatch(/\.budgetRangeGrid\s*\{[^}]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\);/);
  expect(stylesheet).toMatch(/\.siteBudgetPreviewImage img\s*\{[^}]*object-fit:\s*contain;/);
  expect(stylesheet).not.toMatch(/\.shell\[data-step="materials"\][^}]*height:\s*calc\(100svh/);
});
```

- [ ] **Step 2: รัน RED**

```powershell
npm test -- src/features/configurator/components/configurator-shell-styles.test.ts
```

Expected: FAIL เพราะ class/rules ใหม่ยังไม่มี

- [ ] **Step 3: เพิ่ม CSS scoped สำหรับ Desktop**

เพิ่ม rules ตาม token เดิม:

```css
.page[data-step="site-budget"] { height: 100svh; overflow: hidden; }
.shell[data-step="site-budget"] {
  width: 100%; height: calc(100svh - 78px);
  grid-template-columns: minmax(0, 43fr) minmax(0, 57fr);
  gap: 0; align-items: stretch; overflow: hidden; padding: 0;
}
.shell[data-step="site-budget"] .formPanel {
  min-width: 0; min-height: 0; display: flex; overflow: hidden;
  flex-direction: column; padding: 28px clamp(32px, 3.2vw, 58px) 22px;
}
.siteBudgetPreview {
  position: relative; min-width: 0; min-height: 0; display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto; gap: 20px;
  padding: 32px clamp(28px, 3vw, 52px) 22px;
  background: #07111a;
}
.siteBudgetPreview::before { position: absolute; top: 20px; bottom: 20px; left: 0; width: 1px; content: ""; background: rgba(205, 160, 77, 0.14); }
.siteBudgetPreview::after { position: absolute; top: 50%; left: -1px; width: 3px; height: 140px; content: ""; background: radial-gradient(ellipse at center, rgba(242, 194, 102, 0.9), rgba(214, 167, 80, 0.2) 36%, transparent 72%); transform: translateY(-50%); }
.budgetRangeGrid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.siteBudgetPreviewImage img { object-fit: contain; }
```

เพิ่ม rules ให้ input/select สูง 52px, section heading/line, radio selected/focus/check, summary metrics 4 คอลัมน์, restrained actions และ Thai typography ตาม Spec โดย scope ใต้ `[data-step="site-budget"]` เมื่อเป็น shared class

- [ ] **Step 4: เพิ่ม responsive rules**

- ≤1199px: ปลด viewport lock และอนุญาตเอกสารสูงตาม content
- ≤899px: stack form ก่อน preview, divider ซ่อน, summary ไม่ overlap
- ≤560px: budget grid 2 คอลัมน์หรือ 1 คอลัมน์เมื่อ label ล้น, action touch target ≥44px
- ห้ามใช้ rule global ที่เปลี่ยน `.shell`, `.formPanel` หรือ `.preview` ของ Step 4

- [ ] **Step 5: รัน GREEN**

```powershell
npm test -- src/features/configurator/components/configurator-shell-styles.test.ts src/features/configurator/components/configurator-shell.test.tsx
```

Expected: style/component tests ผ่าน

---

### Task 5: E2E, visual correction และ full verification

**Files:**
- Create: `web/src/e2e/configurator-step-three.e2e.ts`
- Modify only if visual evidence requires: `web/src/features/configurator/components/configurator-shell.module.css`

**Interfaces:**
- E2E opens Step 3 through the real Step 1 → Step 2 flow
- Captures `step-three-{desktop|wide|tablet|mobile}.png`

- [ ] **Step 1: เขียน failing E2E acceptance tests**

ทดสอบ viewport 1440×900, 1920×1080, 768×1024, 375×812:

```ts
expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
await expect(page.getByRole("radiogroup", { name: "งบประมาณที่วางไว้" })).toBeVisible();
await expect(page.getByRole("complementary", { name: "ภาพตัวอย่างกำหนดงบประมาณ" })).toBeVisible();
await expect(page.getByRole("region", { name: "สรุปข้อมูลเบื้องต้น" })).toBeVisible();
await expect(page.getByRole("spinbutton", { name: /งบประมาณ/ })).toHaveCount(0);
```

Desktop/wide เพิ่ม assertion ว่า `scrollHeight <= clientHeight`, summary อยู่ใต้ preview และ gap 20px ขึ้นไป

Interaction test:

- เลือกจังหวัด
- เลือก `40–80 ล้านบาท`
- summary แสดงค่าทันที
- ไป Step 4 แล้วย้อนกลับ
- radio ยัง selected
- keyboard ArrowRight เปลี่ยน radio ภายใน group
- console error array เท่ากับ `[]`

- [ ] **Step 2: รัน E2E และเก็บ RED ถ้ายังมี visual/behavior gap**

```powershell
npm run test:e2e -- src/e2e/configurator-step-three.e2e.ts
```

Expected ก่อน correction: อาจ FAIL ที่ viewport fit หรือ spacing ซึ่งต้องใช้เป็นหลักฐานรอบแก้

- [ ] **Step 3: Visual correction pass ครั้งเดียวตามภาพเป้าหมาย**

เปรียบเทียบ screenshot โดยตรวจเฉพาะ:

- ratio 43/57 และตำแหน่ง divider
- H1/eyebrow/intro spacing
- input 50–54px
- chip 3–4 ตัวต่อแถวและ selected brightness
- preview scale/object containment
- preview-summary gap 20–28px
- summary height และ CTA prominence
- background/border/gold intensity

แก้เฉพาะ CSS values ที่ไม่ตรง ห้ามเพิ่ม feature หรือเปลี่ยน composition

- [ ] **Step 4: รัน E2E ซ้ำให้ GREEN**

```powershell
npm run test:e2e -- src/e2e/configurator-step-three.e2e.ts
```

Expected: ทุก viewport และ interaction test ผ่าน ไม่มี console error

- [ ] **Step 5: รัน verification เต็ม**

```powershell
npm run typecheck
npm run lint
npm test
npm run build
git diff --check
```

Expected: ทุกคำสั่ง exit code 0

- [ ] **Step 6: ตรวจ scope และส่งมอบโดยไม่ปะปน dirty work**

```powershell
git status --short
git diff -- web/src/features/configurator/domain/budget-ranges.ts web/src/features/configurator/domain/budget-ranges.test.ts web/src/features/configurator/domain/configuration.ts web/src/features/configurator/domain/configuration.test.ts web/src/features/configurator/state/draft-storage.test.ts web/src/features/pricing/application/estimate-request.ts web/src/features/configurator/components/site-budget-step.tsx web/src/features/configurator/components/site-budget-preview.tsx web/src/features/configurator/components/configurator-shell.tsx web/src/features/configurator/components/configurator-shell.test.tsx web/src/features/configurator/components/review-step.tsx web/src/features/configurator/components/configurator-shell.module.css web/src/features/configurator/components/configurator-shell-styles.test.ts web/src/e2e/configurator-step-three.e2e.ts
```

รายงาน:

- ไฟล์และ components ที่เปลี่ยน
- budget catalog และ compatibility mapping
- logic เดิมที่รักษาไว้
- ผล lint/typecheck/tests/build/E2E
- ความต่างที่เหลือจากภาพอ้างอิง โดยเฉพาะ asset isometric หากยังไม่มี
- แนะนำงานถัดไป แต่ห้ามเริ่ม Step 4

หากไฟล์ shared ยังมี diff เดิมจากงานก่อนหน้า ให้คง branch/worktree ไว้และไม่สร้าง mixed commit อัตโนมัติ
