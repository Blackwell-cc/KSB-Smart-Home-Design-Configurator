# Smart Home Design Configurator MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้าง KSB Smart Home Design Configurator รุ่น MVP ที่ให้ Free Preview ก่อนขอข้อมูล คำนวณงบแบบมีที่มา ปลดล็อก Full Report ผ่าน Soft Gate และรองรับ PDF, Summary Image, Save, Share และ Analytics อย่างปลอดภัย

**Architecture:** ใช้ Next.js App Router และ TypeScript แบบ Strict ใน `web/` แยก Feature ตามขอบเขตงาน โดย Pricing Engine เป็น Pure Domain Module ที่ทดสอบได้และทำงานฝั่ง Server ส่วน Supabase ให้ PostgreSQL, Admin Auth และ Object Storage ข้อมูล Configuration, Calculation Snapshot, Lead, Private Access และ Public Preview แยกจากกันตาม Privacy Boundary ใน Design Spec

**Tech Stack:** Node.js 20.9+, Next.js App Router, React, TypeScript, CSS Modules, Zod, Zustand, React Hook Form, Supabase PostgreSQL/Auth/Storage, Vitest, React Testing Library, Playwright, axe-core, React PDF และ html-to-image

## Global Constraints

- MVP รองรับบ้านพักอาศัยสร้างใหม่เท่านั้น ไม่รวมรีโนเวตหรือต่อเติม
- ภาษาไทยเป็นหลัก; โครงสร้างข้อความต้องพร้อมเพิ่มภาษาอังกฤษภายหลัง
- ใช้ DB Heavent ต่อเมื่อมีสิทธิ์ Webfont; ระหว่างพัฒนาใช้ Noto Sans Thai เป็น Approved Fallback
- Desktop Configurator เป็นตัวเลือกด้านซ้ายและ Preview ด้านขวา; Mobile เป็นคอลัมน์เดียวและมี Preview แบบย่อ
- ผู้ใช้ต้องเห็น Free Preview และกรอบงบประมาณช่วงกว้างก่อนกรอก PII
- Full Report และ Detailed Estimate ต้องตรวจสิทธิ์บน Server หลัง Lead Submit สำเร็จ
- Public Share ห้ามมี PII, Pricing, Full Requirement, Private Notes, ที่อยู่ละเอียด หรือ Private Token
- ค่าออกแบบไม่รวมค่าควบคุมงาน ออกแบบภายใน และภูมิสถาปัตยกรรม
- Local Draft ห้ามเก็บ PII
- Client Price ห้ามเป็น Source of Truth
- ทุก Calculation Snapshot ต้องเก็บ Pricing Version, Reference Date, Assumptions, Included และ Excluded Items
- Published Price Book แก้ย้อนหลังไม่ได้; เปลี่ยนค่าแล้วสร้าง Version ใหม่
- Analytics ห้ามส่งชื่อ เบอร์โทร Email LINE ที่อยู่ หรือ Private Token
- ทุก Task ใช้ TDD และจบด้วย Test, Lint/Typecheck ที่เกี่ยวข้อง และ Commit
- Production Launch ถูก Block หากไม่มี Approved Price Book, Privacy/Consent/Retention Config, Concept Asset Rights และ Lead Owner

---

## Scope Decomposition

Design Spec ครอบคลุมหลายระบบที่สัมพันธ์กัน แผนนี้จึงแบ่งเป็น Vertical Slices ตามลำดับ Dependency แต่ละ Task ต้องจบด้วย Software ที่รันและตรวจรับได้เอง:

1. Foundation และ Design System
2. Configurator และ Area Planning
3. Versioned Pricing และ Free Preview
4. Lead, Private Access และ Full Report
5. Public Share และ Pricing Admin
6. Analytics, Reliability, Accessibility, Security และ Launch

## File Structure

```text
web/
├── src/
│   ├── app/
│   │   ├── (public)/page.tsx
│   │   ├── configurator/page.tsx
│   │   ├── preview/page.tsx
│   │   ├── report/[token]/page.tsx
│   │   ├── share/[slug]/page.tsx
│   │   ├── admin/pricing/page.tsx
│   │   ├── api/estimate/route.ts
│   │   ├── api/leads/route.ts
│   │   ├── api/reports/[projectId]/pdf/route.ts
│   │   ├── api/projects/[projectId]/consultation/route.ts
│   │   ├── api/shares/route.ts
│   │   ├── privacy/page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── features/
│   │   ├── configurator/
│   │   │   ├── domain/configuration.ts
│   │   │   ├── state/configurator-store.ts
│   │   │   ├── state/draft-storage.ts
│   │   │   ├── components/configurator-shell.tsx
│   │   │   ├── components/step-navigation.tsx
│   │   │   ├── components/style-step.tsx
│   │   │   ├── components/functions-step.tsx
│   │   │   ├── components/site-budget-step.tsx
│   │   │   ├── components/material-features-step.tsx
│   │   │   └── components/review-step.tsx
│   │   ├── area-planning/
│   │   │   ├── domain/area-catalog.ts
│   │   │   ├── domain/calculate-area.ts
│   │   │   └── domain/calculate-area.test.ts
│   │   ├── pricing/
│   │   │   ├── domain/price-book.ts
│   │   │   ├── domain/calculate-estimate.ts
│   │   │   ├── domain/calculate-estimate.test.ts
│   │   │   ├── application/estimate-project.ts
│   │   │   ├── infrastructure/supabase-price-book-repository.ts
│   │   │   └── fixtures/qa-price-book.ts
│   │   ├── preview/
│   │   │   ├── domain/concept-catalog.ts
│   │   │   ├── application/build-free-preview.ts
│   │   │   └── components/free-preview.tsx
│   │   ├── leads/
│   │   │   ├── domain/lead.ts
│   │   │   ├── application/submit-lead.ts
│   │   │   └── components/soft-gate-form.tsx
│   │   ├── project-access/
│   │   │   ├── domain/project-token.ts
│   │   │   └── application/resolve-private-project.ts
│   │   ├── reports/
│   │   │   ├── application/build-full-report.ts
│   │   │   ├── components/full-report.tsx
│   │   │   ├── components/project-summary-card.tsx
│   │   │   └── pdf/project-report-document.tsx
│   │   ├── sharing/
│   │   │   ├── domain/public-preview.ts
│   │   │   └── application/create-public-share.ts
│   │   ├── price-book-admin/
│   │   │   ├── application/publish-price-book.ts
│   │   │   └── components/price-book-editor.tsx
│   │   └── analytics/
│   │       ├── event-schema.ts
│   │       ├── track-event.ts
│   │       └── abandonment-tracker.ts
│   ├── components/ui/
│   │   ├── button.tsx
│   │   ├── choice-card.tsx
│   │   ├── counter.tsx
│   │   ├── field-error.tsx
│   │   └── progress-stepper.tsx
│   ├── lib/
│   │   ├── env.ts
│   │   ├── money.ts
│   │   ├── supabase/browser.ts
│   │   ├── supabase/server.ts
│   │   └── validation/parse-json-request.ts
│   └── test/setup.ts
├── e2e/
│   ├── preview-before-lead.spec.ts
│   ├── lead-unlock.spec.ts
│   ├── public-share-privacy.spec.ts
│   └── recovery-accessibility.spec.ts
├── public/concepts/
├── playwright.config.ts
├── vitest.config.ts
└── package.json
supabase/
├── migrations/
│   ├── 0001_core.sql
│   ├── 0002_price_books.sql
│   ├── 0003_leads_projects.sql
│   └── 0004_admin_rls.sql
└── seed.sql
docs/
├── product/PRICING-RESEARCH-BASELINE-2026-Q2.md
├── runbooks/price-book-publish.md
├── runbooks/lead-recovery.md
└── qa/launch-checklist.md
```

---

### Task 1: Initialize the Production Repository and Test Harness

**Files:**
- Create: `.gitignore`
- Create: `web/` through create-next-app
- Create: `web/vitest.config.ts`
- Create: `web/src/test/setup.ts`
- Modify: `web/package.json`
- Test: `web/src/app/home-page.test.tsx`

**Interfaces:**
- Consumes: Approved Design Spec
- Produces: Next.js application, `npm test`, `npm run typecheck`, `npm run test:e2e`

- [ ] **Step 1: Initialize Git and scaffold Next.js**

Run from project root:

```powershell
git init
npx create-next-app@latest web --ts --eslint --app --src-dir --use-npm --import-alias "@/*" --no-tailwind
npm --prefix web install zod zustand react-hook-form @hookform/resolvers @supabase/supabase-js @supabase/ssr @react-pdf/renderer html-to-image
npm --prefix web install --save-dev vitest jsdom @vitejs/plugin-react @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event @playwright/test axe-core @axe-core/playwright
npm --prefix web exec -- playwright install chromium
```

Expected: `web/package.json` exists and dependency installation exits with code 0.

- [ ] **Step 2: Configure Vitest and scripts**

Create `web/vitest.config.ts`:

```ts
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

Create `web/src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Add scripts to `web/package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 3: Write the failing landing-page test**

Create `web/src/app/home-page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

test("explains the free preview before asking for contact data", () => {
  render(<HomePage />);
  expect(screen.getByRole("heading", { name: /รู้พื้นที่และงบประมาณบ้านก่อนเริ่มสร้าง/ })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "เริ่มออกแบบบ้าน" })).toHaveAttribute("href", "/configurator");
  expect(screen.getByText(/ดู Preview ได้โดยไม่ต้องกรอกข้อมูลส่วนตัว/)).toBeInTheDocument();
});
```

- [ ] **Step 4: Run the test and confirm failure**

Run: `npm --prefix web test -- src/app/home-page.test.tsx`

Expected: FAIL because the generated page does not contain the approved Thai copy.

- [ ] **Step 5: Implement the minimal landing page**

Replace `web/src/app/page.tsx`:

```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <p>บริการวางแผนบ้านโดยสถาปนิก</p>
      <h1>รู้พื้นที่และงบประมาณบ้านก่อนเริ่มสร้าง</h1>
      <p>เลือกความต้องการทีละขั้น และดู Preview ได้โดยไม่ต้องกรอกข้อมูลส่วนตัว</p>
      <Link href="/configurator">เริ่มออกแบบบ้าน</Link>
    </main>
  );
}
```

- [ ] **Step 6: Verify the foundation**

Run:

```powershell
npm --prefix web test
npm --prefix web run typecheck
npm --prefix web run lint
npm --prefix web run build
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit**

```powershell
git add .gitignore web
git commit -m "chore: initialize configurator application"
```

---

### Task 2: Add Adaptive Obsidian Luxury Design System

**Files:**
- Modify: `web/src/app/globals.css`
- Modify: `web/src/app/layout.tsx`
- Create: `web/src/components/ui/button.tsx`
- Create: `web/src/components/ui/choice-card.tsx`
- Create: `web/src/components/ui/button.test.tsx`
- Create: `web/src/app/fonts.ts`
- Create: `web/public/concepts/contemporary-warm-luxury.png`
- Create: `web/public/concepts/modern-tropical-resort.png`
- Create: `web/public/concepts/timeless-contemporary-luxury.png`

**Interfaces:**
- Consumes: Next.js shell from Task 1; source images in `assets/concept-exploration/`
- Produces: CSS token contract and accessible UI primitives

- [ ] **Step 1: Write the failing accessible-button test**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

test("activates with keyboard and exposes disabled state", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(<Button onClick={onClick}>ถัดไป</Button>);
  await user.tab();
  await user.keyboard("{Enter}");
  expect(onClick).toHaveBeenCalledOnce();
});
```

- [ ] **Step 2: Run the test and confirm failure**

Run: `npm --prefix web test -- src/components/ui/button.test.tsx`

Expected: FAIL with cannot resolve `./button`.

- [ ] **Step 3: Implement tokens and Button**

Create `web/src/components/ui/button.tsx`:

```tsx
import type { ButtonHTMLAttributes } from "react";
import styles from "./button.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "gold" | "ghost" };

export function Button({ variant = "gold", className = "", ...props }: Props) {
  return <button className={`${styles.button} ${styles[variant]} ${className}`} {...props} />;
}
```

Create `web/src/components/ui/button.module.css`:

```css
.button { min-height: 48px; border-radius: 999px; padding: 0 24px; font: inherit; cursor: pointer; }
.button:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
.button:disabled { cursor: not-allowed; opacity: .52; }
.gold { color: #17120c; border: 1px solid transparent; background: linear-gradient(135deg, var(--gold-light), var(--gold)); }
.ghost { color: var(--ivory); border: 1px solid var(--line); background: transparent; }
```

Define in `web/src/app/globals.css`:

```css
:root {
  --obsidian: #090807;
  --surface: #1a1714;
  --gold: #d9b26d;
  --gold-light: #f2d8a1;
  --ivory: #f3eee5;
  --muted: #aa9f91;
  --sage: #9cb091;
  --line: rgba(216, 177, 105, .26);
  --focus: #f7e1b6;
  --font-thai: var(--font-noto-thai), sans-serif;
}
* { box-sizing: border-box; }
html { color-scheme: dark; }
body { margin: 0; color: var(--ivory); background: var(--obsidian); font-family: var(--font-thai); }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; } }
```

- [ ] **Step 4: Configure the licensed-font fallback and copy curated assets**

Create `web/src/app/fonts.ts`:

```ts
import { Noto_Sans_Thai } from "next/font/google";

export const thaiFont = Noto_Sans_Thai({ subsets: ["thai", "latin"], variable: "--font-noto-thai", display: "swap" });
```

Apply `thaiFont.variable` to `<body>` in `layout.tsx`. Copy the three approved exploration images with `Copy-Item`; do not copy the local DB Heavent font file without confirmed Webfont rights.

- [ ] **Step 5: Verify and commit**

Run:

```powershell
npm --prefix web test
npm --prefix web run typecheck
npm --prefix web run lint
```

Expected: PASS and zero type/lint errors.

```powershell
git add web/src web/public/concepts
git commit -m "feat: add adaptive luxury design system"
```

---

### Task 3: Define Configuration Schema and PII-free Draft Store

**Files:**
- Create: `web/src/features/configurator/domain/configuration.ts`
- Create: `web/src/features/configurator/domain/provinces.ts`
- Create: `web/src/features/configurator/domain/configuration.test.ts`
- Create: `web/src/features/configurator/state/draft-storage.ts`
- Create: `web/src/features/configurator/state/configurator-store.ts`
- Test: `web/src/features/configurator/state/draft-storage.test.ts`

**Interfaces:**
- Produces: `HouseConfigurationSchema`, `HouseConfiguration`, `createDefaultConfiguration()`, `DraftStorage`

- [ ] **Step 1: Write failing schema tests**

```ts
import { HouseConfigurationSchema, createDefaultConfiguration } from "./configuration";

test("accepts a new-house configuration and rejects renovation", () => {
  expect(HouseConfigurationSchema.safeParse(createDefaultConfiguration()).success).toBe(true);
  expect(HouseConfigurationSchema.safeParse({ ...createDefaultConfiguration(), projectType: "renovation" }).success).toBe(false);
});

test("contains no contact fields", () => {
  const keys = Object.keys(createDefaultConfiguration());
  expect(keys).not.toEqual(expect.arrayContaining(["name", "phone", "email", "lineId"]));
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm --prefix web test -- src/features/configurator/domain/configuration.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement exact Configuration contract**

```ts
import { z } from "zod";
import { THAI_PROVINCE_CODES } from "./provinces";

export const HouseConfigurationSchema = z.object({
  schemaVersion: z.literal(1),
  projectType: z.literal("new-house"),
  styleId: z.string().nullable(),
  residents: z.number().int().min(1).max(20),
  floors: z.number().int().min(1).max(3),
  bedrooms: z.number().int().min(1).max(12),
  bathrooms: z.number().int().min(1).max(15),
  parkingSpaces: z.number().int().min(0).max(10),
  functions: z.object({ office: z.boolean(), elderlyRoom: z.boolean(), thaiKitchen: z.boolean(), multipurposeRoom: z.boolean() }),
  usableAreaOverrideM2: z.number().min(60).max(1500).nullable(),
  provinceCode: z.enum(THAI_PROVINCE_CODES).nullable(),
  district: z.string().max(100).nullable(),
  siteAccess: z.enum(["normal", "restricted", "very-restricted"]),
  targetBudget: z.object({ min: z.number().positive(), max: z.number().positive() }).nullable(),
  materialLevel: z.enum(["select", "premium", "signature"]),
  specialFeatures: z.array(z.enum(["pool", "lift", "smart-home", "solar", "ev-charger", "double-volume", "large-glazing"])),
  privateNotes: z.string().max(1000),
});

export type HouseConfiguration = z.infer<typeof HouseConfigurationSchema>;

export function createDefaultConfiguration(): HouseConfiguration {
  return {
    schemaVersion: 1, projectType: "new-house", styleId: null, residents: 4, floors: 2,
    bedrooms: 3, bathrooms: 3, parkingSpaces: 2,
    functions: { office: false, elderlyRoom: false, thaiKitchen: false, multipurposeRoom: false },
    usableAreaOverrideM2: null, provinceCode: null, district: null, siteAccess: "normal",
    targetBudget: null, materialLevel: "premium", specialFeatures: [], privateNotes: "",
  };
}
```

Create `web/src/features/configurator/domain/provinces.ts` and use this allowlist in Configurator, API and Price Book publish validation:

```ts
export const THAI_PROVINCE_CODES = [
  "10","11","12","13","14","15","16","17","18","19",
  "20","21","22","23","24","25","26","27",
  "30","31","32","33","34","35","36","37","38","39",
  "40","41","42","43","44","45","46","47","48","49",
  "50","51","52","53","54","55","56","57","58",
  "60","61","62","63","64","65","66","67",
  "70","71","72","73","74","75","76","77",
  "80","81","82","83","84","85","86",
  "90","91","92","93","94","95","96",
] as const;

export type ThaiProvinceCode = (typeof THAI_PROVINCE_CODES)[number];
```

- [ ] **Step 4: Implement versioned Local Draft storage**

Create `web/src/features/configurator/state/draft-storage.ts`:

```ts
import { z } from "zod";
import { HouseConfigurationSchema, type HouseConfiguration } from "../domain/configuration";

const STORAGE_KEY = "ksb-configurator-draft-v1";
const DraftEnvelopeSchema = z.object({
  draftVersion: z.literal(1),
  currentStep: z.number().int().min(0).max(4),
  configuration: HouseConfigurationSchema,
});

export type DraftEnvelope = z.infer<typeof DraftEnvelopeSchema>;
export type DraftLoadResult =
  | { status: "none" }
  | { status: "valid"; draft: DraftEnvelope }
  | { status: "incompatible" };

type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function createDraftStorage(storage: KeyValueStorage) {
  return {
    load(): DraftLoadResult {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return { status: "none" };
      try {
        const parsed = DraftEnvelopeSchema.safeParse(JSON.parse(raw));
        return parsed.success ? { status: "valid", draft: parsed.data } : { status: "incompatible" };
      } catch {
        return { status: "incompatible" };
      }
    },
    save(currentStep: number, configuration: HouseConfiguration): void {
      const draft = DraftEnvelopeSchema.parse({ draftVersion: 1, currentStep, configuration });
      storage.setItem(STORAGE_KEY, JSON.stringify(draft));
    },
    clear(): void {
      storage.removeItem(STORAGE_KEY);
    },
  };
}
```

Parse every load and never pass Lead data into this API. The Store owns a debounced call to `save`; it clears only after the private Project has been created successfully.

- [ ] **Step 5: Verify and commit**

Run: `npm --prefix web test -- src/features/configurator`

Expected: schema, migration and PII-boundary tests PASS.

```powershell
git add web/src/features/configurator
git commit -m "feat: add versioned configuration draft"
```

---

### Task 4: Implement Area Planning as a Pure Domain Module

**Files:**
- Create: `web/src/features/area-planning/domain/area-catalog.ts`
- Create: `web/src/features/area-planning/domain/calculate-area.ts`
- Test: `web/src/features/area-planning/domain/calculate-area.test.ts`

**Interfaces:**
- Consumes: `HouseConfiguration`
- Produces: `calculateArea(configuration): AreaRecommendation`

- [ ] **Step 1: Write failing area tests**

```ts
import { createDefaultConfiguration } from "@/features/configurator/domain/configuration";
import { calculateArea } from "./calculate-area";

test("returns usable area and a larger weighted CFA", () => {
  const result = calculateArea(createDefaultConfiguration());
  expect(result.recommendedUsableAreaM2).toBe(164);
  expect(result.constructionFloorAreaM2).toBe(198);
  expect(result.breakdown.find((item) => item.code === "covered-parking")?.weightedM2).toBe(30);
});

test("uses an approved user override without changing the room program", () => {
  const result = calculateArea({ ...createDefaultConfiguration(), usableAreaOverrideM2: 220 });
  expect(result.usableAreaM2).toBe(220);
  expect(result.constructionFloorAreaM2).toBeGreaterThan(220);
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm --prefix web test -- src/features/area-planning/domain/calculate-area.test.ts`

Expected: FAIL because `calculateArea` is undefined.

- [ ] **Step 3: Implement the QA catalog and calculation**

Create `web/src/features/area-planning/domain/area-catalog.ts`:

```ts
export const QA_AREA_CATALOG = {
  status: "draft-for-architect-review" as const,
  bedroomM2: 14,
  bathroomM2: 5,
  livingDiningBaseM2: 28,
  livingDiningPerResidentM2: 2,
  entryStorageM2: 8,
  kitchenM2: 14,
  serviceM2: 9,
  circulationPerFloorM2: 20,
  officeM2: 12,
  elderlyRoomM2: 16,
  thaiKitchenM2: 12,
  multipurposeRoomM2: 15,
  coveredParkingPerSpaceM2: 15,
  coveredServiceM2: 4,
} as const;
```

Create `web/src/features/area-planning/domain/calculate-area.ts`:

```ts
import type { HouseConfiguration } from "@/features/configurator/domain/configuration";
import { QA_AREA_CATALOG as C } from "./area-catalog";

export type AreaRecommendation = {
  recommendedUsableAreaM2: number;
  usableAreaM2: number;
  constructionFloorAreaM2: number;
  breakdown: Array<{ code: string; rawM2: number; weight: number; weightedM2: number }>;
};

export function calculateArea(input: HouseConfiguration): AreaRecommendation {
  const recommendedUsableAreaM2 = Math.round(
    input.bedrooms * C.bedroomM2 +
    input.bathrooms * C.bathroomM2 +
    C.livingDiningBaseM2 + input.residents * C.livingDiningPerResidentM2 +
    C.entryStorageM2 + C.kitchenM2 + C.serviceM2 + input.floors * C.circulationPerFloorM2 +
    (input.functions.office ? C.officeM2 : 0) +
    (input.functions.elderlyRoom ? C.elderlyRoomM2 : 0) +
    (input.functions.thaiKitchen ? C.thaiKitchenM2 : 0) +
    (input.functions.multipurposeRoom ? C.multipurposeRoomM2 : 0),
  );
  const usableAreaM2 = input.usableAreaOverrideM2 ?? recommendedUsableAreaM2;
  const parkingM2 = input.parkingSpaces * C.coveredParkingPerSpaceM2;
  const breakdown = [
    { code: "usable-area", rawM2: usableAreaM2, weight: 1, weightedM2: usableAreaM2 },
    { code: "covered-parking", rawM2: parkingM2, weight: 1, weightedM2: parkingM2 },
    { code: "covered-service", rawM2: C.coveredServiceM2, weight: 1, weightedM2: C.coveredServiceM2 },
  ];
  return {
    recommendedUsableAreaM2,
    usableAreaM2,
    constructionFloorAreaM2: breakdown.reduce((sum, item) => sum + item.weightedM2, 0),
    breakdown,
  };
}
```

The catalog is a test fixture and cannot be published until architect approval.

- [ ] **Step 4: Add boundary tests**

Test 1 floor/1 bedroom, 3 floors/12 bedrooms, zero parking and every optional function. Assert no negative value, deterministic output and CFA breakdown sum equals total.

- [ ] **Step 5: Verify and commit**

Run: `npm --prefix web test -- src/features/area-planning`

Expected: all area tests PASS.

```powershell
git add web/src/features/area-planning
git commit -m "feat: add assisted area planning engine"
```

---

### Task 5: Build the Five-step Accessible Configurator

**Files:**
- Create: `web/src/app/configurator/page.tsx`
- Create: `web/src/features/configurator/components/configurator-shell.tsx`
- Create: five step components listed in File Structure
- Create: `web/src/components/ui/counter.tsx`
- Create: `web/src/components/ui/progress-stepper.tsx`
- Create: `web/src/features/preview/domain/concept-catalog.ts`
- Test: `web/src/features/configurator/components/configurator-shell.test.tsx`

**Interfaces:**
- Consumes: Configurator Store, `calculateArea`, Concept Catalog
- Produces: reviewed `HouseConfiguration` and navigation to `/preview`

- [ ] **Step 1: Write failing journey tests**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfiguratorShell } from "./configurator-shell";

async function chooseStyleAndContinue() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("radio", { name: "Contemporary Warm Luxury" }));
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
}

async function completeThroughReview() {
  const user = userEvent.setup();
  await chooseStyleAndContinue();
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
  await user.selectOptions(screen.getByLabelText("จังหวัด"), "10");
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
  await user.click(screen.getByRole("radio", { name: /Premium/ }));
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
}

test("moves through five steps without contact fields", async () => {
  render(<ConfiguratorShell />);
  expect(screen.getByRole("heading", { name: "เลือกสไตล์บ้าน" })).toBeInTheDocument();
  expect(screen.queryByLabelText(/เบอร์โทร|อีเมล|LINE/)).not.toBeInTheDocument();
  await completeThroughReview();
  expect(screen.getByRole("heading", { name: "ตรวจทานความต้องการ" })).toBeInTheDocument();
});

test("restores the current step and values after remount", async () => {
  const first = render(<ConfiguratorShell />);
  await chooseStyleAndContinue();
  first.unmount();
  render(<ConfiguratorShell />);
  expect(screen.getByRole("heading", { name: "พื้นที่และฟังก์ชัน" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm --prefix web test -- src/features/configurator/components/configurator-shell.test.tsx`

Expected: FAIL because the shell and test helpers do not exist.

- [ ] **Step 3: Implement the shell and exact steps**

Use the following stable step IDs:

```ts
export const CONFIGURATOR_STEPS = [
  { id: "style", label: "สไตล์บ้าน" },
  { id: "functions", label: "พื้นที่และฟังก์ชัน" },
  { id: "site-budget", label: "ทำเลและงบประมาณ" },
  { id: "materials", label: "วัสดุและส่วนพิเศษ" },
  { id: "review", label: "ตรวจทาน" },
] as const;
```

Create the MVP concept catalog with these stable IDs and copied assets:

```ts
export const CONCEPT_CATALOG = [
  { id: "contemporary-warm-luxury", label: "Contemporary Warm Luxury", image: "/concepts/contemporary-warm-luxury.png" },
  { id: "modern-tropical-resort", label: "Modern Tropical Resort", image: "/concepts/modern-tropical-resort.png" },
  { id: "timeless-contemporary-luxury", label: "Timeless Contemporary Luxury", image: "/concepts/timeless-contemporary-luxury.png" },
  { id: "not-sure", label: "ยังไม่แน่ใจ ให้สถาปนิกช่วยแนะนำ", image: "/concepts/contemporary-warm-luxury.png" },
] as const;
```

Keep Desktop selection left/preview right; collapse to preview header plus one-column form below 900px. Put focus on each new step heading after navigation. Disable Next until required fields for that step pass schema refinement. Previous never discards data.

- [ ] **Step 4: Test keyboard, mobile semantics and refresh recovery**

Assert each choice is a radio/checkbox/button with an accessible name, counter buttons include the field name, progress uses an ordered list, and validation errors are connected with `aria-describedby`.

- [ ] **Step 5: Verify and commit**

Run:

```powershell
npm --prefix web test -- src/features/configurator
npm --prefix web run typecheck
npm --prefix web run lint
```

Expected: PASS.

```powershell
git add web/src/app/configurator web/src/features/configurator web/src/components/ui
git commit -m "feat: build five-step house configurator"
```

---

### Task 6: Implement Versioned Pricing Engine and Golden Cases

**Files:**
- Create: `web/src/features/pricing/domain/price-book.ts`
- Create: `web/src/features/pricing/domain/calculate-estimate.ts`
- Create: `web/src/features/pricing/domain/calculate-estimate.test.ts`
- Create: `web/src/features/pricing/fixtures/qa-price-book.ts`

**Interfaces:**
- Consumes: `AreaRecommendation`, `HouseConfiguration`, `PriceBook`
- Produces: `calculateEstimate(input, priceBook): CalculationSnapshot`

- [ ] **Step 1: Write failing pricing tests**

```ts
import { createDefaultConfiguration } from "@/features/configurator/domain/configuration";
import { calculateEstimate } from "./calculate-estimate";
import { qaPriceBook } from "../fixtures/qa-price-book";

const goldenPremiumBangkokInput = {
  configuration: {
    ...createDefaultConfiguration(),
    styleId: "contemporary-warm-luxury",
    provinceCode: "10",
  },
  constructionFloorAreaM2: 198,
  production: false,
};

test("separates construction, design fee, allowances and site risk", () => {
  const snapshot = calculateEstimate(goldenPremiumBangkokInput, qaPriceBook);
  expect(snapshot.pricingVersion).toBe("TH-2026Q2-QA-0.1");
  expect(snapshot.lines.map((line) => line.code)).toEqual([
    "core-construction", "special-features", "site-risk", "design-professional-fee", "tax-fees",
  ]);
  expect(snapshot.excludedItems).toContain("ค่าควบคุมงานก่อสร้าง");
  expect(snapshot.total.low).toBeLessThan(snapshot.total.expected);
  expect(snapshot.total.expected).toBeLessThan(snapshot.total.high);
});

test("is deterministic for the same inputs and price-book version", () => {
  expect(calculateEstimate(goldenPremiumBangkokInput, qaPriceBook)).toEqual(
    calculateEstimate(goldenPremiumBangkokInput, qaPriceBook),
  );
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm --prefix web test -- src/features/pricing/domain/calculate-estimate.test.ts`

Expected: FAIL because Pricing types/functions do not exist.

- [ ] **Step 3: Implement the domain contracts**

```ts
export type MoneyRange = { low: number; expected: number; high: number };
export type PriceBookStatus = "draft" | "review" | "published" | "retired";
export type CalculationLineCode =
  | "core-construction" | "special-features" | "site-risk"
  | "design-professional-fee" | "tax-fees";

export type CalculationSnapshot = {
  pricingVersion: string;
  referenceDate: string;
  confidence: "C" | "B";
  lines: Array<{ code: CalculationLineCode; label: string; amount: MoneyRange }>;
  total: MoneyRange;
  assumptions: string[];
  includedItems: string[];
  excludedItems: string[];
};

export type PriceBook = {
  version: string;
  status: PriceBookStatus;
  referenceDate: string;
  provinceRates: Record<string, MoneyRange>;
  materialFactors: Record<"select" | "premium" | "signature", number>;
  floorFactors: Record<1 | 2 | 3, number>;
  siteAccessFactors: Record<"normal" | "restricted" | "very-restricted", number>;
  siteRisk: Record<"normal" | "restricted" | "very-restricted", MoneyRange>;
  featureAllowances: Record<string, MoneyRange>;
  designFeeRates: MoneyRange;
  taxRate: number;
};
```

Create `web/src/features/pricing/domain/calculate-estimate.ts`:

```ts
import type { HouseConfiguration } from "@/features/configurator/domain/configuration";
import type { CalculationSnapshot, MoneyRange, PriceBook } from "./price-book";

const round = (value: number) => Math.round(value);
const scale = (range: MoneyRange, factor: number): MoneyRange => ({
  low: round(range.low * factor), expected: round(range.expected * factor), high: round(range.high * factor),
});
const add = (...ranges: MoneyRange[]): MoneyRange => ranges.reduce(
  (sum, range) => ({ low: sum.low + range.low, expected: sum.expected + range.expected, high: sum.high + range.high }),
  { low: 0, expected: 0, high: 0 },
);
const percent = (range: MoneyRange, rates: MoneyRange): MoneyRange => ({
  low: round(range.low * rates.low),
  expected: round(range.expected * rates.expected),
  high: round(range.high * rates.high),
});

export function calculateEstimate(
  input: { configuration: HouseConfiguration; constructionFloorAreaM2: number; production: boolean },
  book: PriceBook,
): CalculationSnapshot {
  if (input.production && book.status !== "published") throw new Error("PUBLISHED_PRICE_BOOK_REQUIRED");
  const provinceCode = input.configuration.provinceCode;
  if (!provinceCode || !book.provinceRates[provinceCode]) throw new Error("PROVINCE_RATE_NOT_FOUND");
  const factor =
    input.constructionFloorAreaM2 *
    book.materialFactors[input.configuration.materialLevel] *
    book.floorFactors[input.configuration.floors as 1 | 2 | 3] *
    book.siteAccessFactors[input.configuration.siteAccess];
  const construction = scale(book.provinceRates[provinceCode], factor);
  const features = add(...input.configuration.specialFeatures.map((code) => {
    const allowance = book.featureAllowances[code];
    if (!allowance) throw new Error(`FEATURE_ALLOWANCE_NOT_FOUND:${code}`);
    return allowance;
  }));
  const siteRisk = book.siteRisk[input.configuration.siteAccess];
  const designFee = percent(construction, book.designFeeRates);
  const beforeTax = add(construction, features, siteRisk, designFee);
  const taxFees = scale(beforeTax, book.taxRate);
  const total = add(beforeTax, taxFees);
  return {
    pricingVersion: book.version,
    referenceDate: book.referenceDate,
    confidence: "B",
    lines: [
      { code: "core-construction", label: "ค่าก่อสร้างหลัก", amount: construction },
      { code: "special-features", label: "รายการพิเศษ", amount: features },
      { code: "site-risk", label: "ค่าเผื่อความเสี่ยงหน้างาน", amount: siteRisk },
      { code: "design-professional-fee", label: "ค่าออกแบบและบริการวิชาชีพ", amount: designFee },
      { code: "tax-fees", label: "ภาษีและค่าธรรมเนียม", amount: taxFees },
    ],
    total,
    assumptions: ["เป็นการประเมินเบื้องต้นจากข้อมูลที่ผู้ใช้ระบุ", "ฐานรากต้องยืนยันหลังสำรวจหรือทดสอบดิน"],
    includedItems: ["งานก่อสร้างหลัก", "งานออกแบบสถาปัตยกรรม โครงสร้าง ไฟฟ้า สุขาภิบาล แบบขออนุญาต และแบบก่อสร้าง"],
    excludedItems: ["ค่าควบคุมงานก่อสร้าง", "ออกแบบตกแต่งภายใน", "ออกแบบภูมิสถาปัตยกรรม"],
  };
}
```

Create `web/src/features/pricing/fixtures/qa-price-book.ts`:

```ts
import type { PriceBook } from "../domain/price-book";

export const qaPriceBook: PriceBook = {
  version: "TH-2026Q2-QA-0.1",
  status: "review",
  referenceDate: "2026-06-30",
  provinceRates: { "10": { low: 23_700, expected: 28_600, high: 33_500 } },
  materialFactors: { select: 0.78, premium: 1, signature: 1.3 },
  floorFactors: { 1: 1, 2: 1.04, 3: 1.1 },
  siteAccessFactors: { normal: 1, restricted: 1.04, "very-restricted": 1.1 },
  siteRisk: {
    normal: { low: 0, expected: 0, high: 150_000 },
    restricted: { low: 100_000, expected: 250_000, high: 500_000 },
    "very-restricted": { low: 300_000, expected: 700_000, high: 1_500_000 },
  },
  featureAllowances: {
    pool: { low: 800_000, expected: 1_200_000, high: 2_000_000 },
    lift: { low: 900_000, expected: 1_300_000, high: 1_800_000 },
    "smart-home": { low: 150_000, expected: 350_000, high: 800_000 },
    solar: { low: 180_000, expected: 300_000, high: 500_000 },
    "ev-charger": { low: 35_000, expected: 65_000, high: 120_000 },
    "double-volume": { low: 150_000, expected: 350_000, high: 700_000 },
    "large-glazing": { low: 250_000, expected: 600_000, high: 1_500_000 },
  },
  designFeeRates: { low: 0.05, expected: 0.0675, high: 0.085 },
  taxRate: 0,
};
```

These values are QA fixtures only. Keep `taxRate: 0` until an approved applicable-tax rule is selected; the line still renders as zero rather than being silently omitted.

- [ ] **Step 4: Add Golden Cases and invariant tests**

Cover three Material Levels, three Site Access values, every Special Feature, 1–3 floors and boundary CFA. Assert no NaN/negative values, `low <= expected <= high`, every special feature maps to an Allowance and excluded supervision is always present.

- [ ] **Step 5: Verify and commit**

Run: `npm --prefix web test -- src/features/pricing`

Expected: all pricing tests PASS.

```powershell
git add web/src/features/pricing
git commit -m "feat: add versioned pricing engine"
```

---

### Task 7: Add Server Estimate API and Free Preview

**Files:**
- Create: `web/src/features/pricing/application/estimate-project.ts`
- Create: `web/src/features/pricing/infrastructure/supabase-price-book-repository.ts`
- Create: `web/src/app/api/estimate/route.ts`
- Create: `web/src/features/preview/application/build-free-preview.ts`
- Create: `web/src/features/preview/components/free-preview.tsx`
- Create: `web/src/app/preview/page.tsx`
- Test: `web/src/app/api/estimate/route.test.ts`

**Interfaces:**
- Produces: `POST /api/estimate`, `FreePreviewPayload`

- [ ] **Step 1: Write failing API tests**

```ts
import { NextRequest } from "next/server";
import { createDefaultConfiguration } from "@/features/configurator/domain/configuration";
import { POST } from "./route";

const validConfiguration = {
  ...createDefaultConfiguration(),
  styleId: "contemporary-warm-luxury",
  provinceCode: "10",
};

const jsonRequest = (body: unknown) => new NextRequest("http://localhost/api/estimate", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

test("returns a server-validated preview without contact data", async () => {
  const response = await POST(jsonRequest(validConfiguration));
  const body = await response.json();
  expect(response.status).toBe(200);
  expect(body.preview.budgetRange).toBeDefined();
  expect(JSON.stringify(body)).not.toMatch(/phone|email|lineId|name/);
});

test("rejects a client-supplied price", async () => {
  const response = await POST(jsonRequest({ ...validConfiguration, estimate: { total: 1 } }));
  expect(response.status).toBe(400);
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm --prefix web test -- src/app/api/estimate/route.test.ts`

Expected: FAIL because the route does not exist.

- [ ] **Step 3: Implement the route**

Parse JSON with `HouseConfigurationSchema.strict()`, load one Published Price Book through the repository, run Area Planning and Pricing, then return:

```ts
type FreePreviewPayload = {
  conceptAssetId: string;
  styleLabel: string;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  usableAreaM2: number;
  constructionFloorAreaM2: number;
  materialLevel: "select" | "premium" | "signature";
  budgetRange: { low: number; high: number };
  confidence: "C";
  disclaimer: string;
};
```

Do not return detailed lines before unlock.

- [ ] **Step 4: Build Free Preview UI and CTA**

Render concept, house facts, wide budget, disclaimer, `รับสรุปโครงการฉบับเต็ม` and `แชร์ภาพ Preview`. Do not render Lead Form until the CTA is clicked.

- [ ] **Step 5: Verify and commit**

Run:

```powershell
npm --prefix web test
npm --prefix web run typecheck
```

Expected: PASS.

```powershell
git add web/src/app/api/estimate web/src/app/preview web/src/features/pricing web/src/features/preview
git commit -m "feat: show free preview from server estimate"
```

---

### Task 8: Create Database Schema and Idempotent Soft Gate

**Files:**
- Create: `supabase/migrations/0001_core.sql`
- Create: `supabase/migrations/0002_price_books.sql`
- Create: `supabase/migrations/0003_leads_projects.sql`
- Create: `web/src/features/leads/domain/lead.ts`
- Create: `web/src/features/leads/application/submit-lead.ts`
- Create: `web/src/features/leads/components/soft-gate-form.tsx`
- Create: `web/src/app/api/leads/route.ts`
- Test: `web/src/features/leads/application/submit-lead.test.ts`

**Interfaces:**
- Consumes: Calculation Snapshot and Minimal Lead Input
- Produces: `LeadSubmissionResult { leadId, projectId, privateToken, reportUrl }`
- Repository contract: `submitOnce(input, tokenHash, expiresAt)` returns the existing row when `idempotencyKey` conflicts

- [ ] **Step 1: Write failing idempotency tests**

```ts
import { submitLead } from "./submit-lead";

const validInput = {
  configurationId: "11111111-1111-4111-8111-111111111111",
  idempotencyKey: "22222222-2222-4222-8222-222222222222",
  preferredContactMethod: "email" as const,
  name: "ผู้ทดสอบ",
  email: "owner@example.test",
  consentVersion: "project-contact-v1",
};

function createTestDependencies() {
  const rows = new Map<string, { leadId: string; projectId: string }>();
  const repository = {
    insertCount: 0,
    async submitOnce(input: typeof validInput) {
      const existing = rows.get(input.idempotencyKey);
      if (existing) return existing;
      repository.insertCount += 1;
      const row = { leadId: crypto.randomUUID(), projectId: crypto.randomUUID() };
      rows.set(input.idempotencyKey, row);
      return row;
    },
  };
  return {
    repository,
    dependencies: {
      repository,
      createAccessToken: () => ({ plainText: "test-private-token", hash: "test-token-hash" }),
      now: () => new Date("2026-08-07T00:00:00Z"),
    },
  };
}

test("returns the same lead and project for the same idempotency key", async () => {
  const { dependencies, repository } = createTestDependencies();
  const first = await submitLead(validInput, dependencies);
  const second = await submitLead(validInput, dependencies);
  expect(second.leadId).toBe(first.leadId);
  expect(second.projectId).toBe(first.projectId);
  expect(repository.insertCount).toBe(1);
});

test("allows the same contact to submit a different project", async () => {
  const { dependencies } = createTestDependencies();
  const firstProject = await submitLead(validInput, dependencies);
  const second = await submitLead({
    ...validInput,
    idempotencyKey: crypto.randomUUID(),
    configurationId: "33333333-3333-4333-8333-333333333333",
  }, dependencies);
  expect(second.projectId).not.toBe(firstProject.projectId);
});
```

- [ ] **Step 2: Create migration with hard boundaries**

Run once before creating migrations:

```powershell
npx supabase init
npx supabase start
```

Then create the migrations with these enforced columns and constraints:

```sql
create extension if not exists pgcrypto;

create table configurations (
  id uuid primary key default gen_random_uuid(),
  schema_version integer not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table price_books (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  status text not null check (status in ('draft','review','published','retired')),
  reference_date date not null,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index one_published_price_book on price_books ((status)) where status = 'published';

create table price_book_entries (
  id uuid primary key default gen_random_uuid(),
  price_book_id uuid not null references price_books(id),
  entry_type text not null,
  entry_key text not null,
  payload jsonb not null,
  source_label text not null,
  unique (price_book_id, entry_type, entry_key)
);

create table calculation_snapshots (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id),
  price_book_id uuid not null references price_books(id),
  pricing_version text not null,
  reference_date date not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table consent_versions (
  version text primary key,
  privacy_notice_url text not null,
  published_at timestamptz not null,
  active boolean not null default false
);

create unique index one_active_consent on consent_versions ((active)) where active;

create table leads (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id),
  idempotency_key uuid not null unique,
  name text not null check (char_length(name) between 1 and 120),
  preferred_contact_method text not null check (preferred_contact_method in ('phone','email','line')),
  phone text,
  email text,
  line_id text,
  consent_version text not null references consent_versions(version),
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (
    (preferred_contact_method = 'phone' and phone is not null and email is null and line_id is null) or
    (preferred_contact_method = 'email' and email is not null and phone is null and line_id is null) or
    (preferred_contact_method = 'line' and line_id is not null and phone is null and email is null)
  )
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id),
  calculation_snapshot_id uuid not null references calculation_snapshots(id),
  lead_id uuid not null unique references leads(id),
  consultation_requested_at timestamptz,
  created_at timestamptz not null default now()
);

create table project_access_tokens (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id),
  token_hash bytea not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public_previews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id),
  slug text not null unique,
  public_payload jsonb not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

alter table configurations enable row level security;
alter table price_books enable row level security;
alter table price_book_entries enable row level security;
alter table calculation_snapshots enable row level security;
alter table consent_versions enable row level security;
alter table leads enable row level security;
alter table projects enable row level security;
alter table project_access_tokens enable row level security;
alter table public_previews enable row level security;
```

Do not add anonymous table policies. Public API routes use a server-only service credential and explicit application validation. Store token hashes, never plaintext.

- [ ] **Step 3: Implement the exact Lead schema**

```ts
export const LeadInputSchema = z.discriminatedUnion("preferredContactMethod", [
  z.object({ preferredContactMethod: z.literal("phone"), name: z.string().min(1).max(120), phone: z.string().min(9).max(20) }),
  z.object({ preferredContactMethod: z.literal("email"), name: z.string().min(1).max(120), email: z.string().email() }),
  z.object({ preferredContactMethod: z.literal("line"), name: z.string().min(1).max(120), lineId: z.string().min(1).max(100) }),
]).and(z.object({ configurationId: z.string().uuid(), idempotencyKey: z.string().uuid(), consentVersion: z.string().min(1) }));
```

Consent must be checked in UI and revalidated on Server. The Privacy copy appears before Submit.

- [ ] **Step 4: Implement one transaction for lead, project and access token**

Generate 32 random bytes for the private token, store SHA-256 hash and expiry, return plaintext once. On unique conflict, load the existing result by Idempotency Key. Do not unlock if any transaction step fails.

- [ ] **Step 5: Verify and commit**

Run:

```powershell
npm --prefix web test -- src/features/leads
npx supabase db reset
npm --prefix web run typecheck
```

Expected: tests PASS and migrations apply from an empty local database.

```powershell
git add supabase web/src/features/leads web/src/app/api/leads
git commit -m "feat: add privacy-aware soft gate"
```

---

### Task 9: Implement Private Project Access, Full Report, PDF and Summary Image

**Files:**
- Create: `web/src/features/project-access/domain/project-token.ts`
- Create: `web/src/features/project-access/application/resolve-private-project.ts`
- Create: `web/src/features/reports/application/build-full-report.ts`
- Create: `web/src/features/reports/components/full-report.tsx`
- Create: `web/src/features/reports/components/project-summary-card.tsx`
- Create: `web/src/features/reports/pdf/project-report-document.tsx`
- Create: `web/src/app/report/[token]/page.tsx`
- Create: `web/src/app/api/reports/[projectId]/pdf/route.ts`
- Create: `web/src/app/api/projects/[projectId]/consultation/route.ts`
- Test: `web/src/features/reports/application/build-full-report.test.ts`

**Interfaces:**
- Produces: Server-protected report route, PDF response and client-side PNG export

- [ ] **Step 1: Write failing access and snapshot tests**

```ts
const now = new Date("2026-08-07T00:00:00Z");
const repository = {
  async findByTokenHash() {
    return { projectId: "project-1", expiresAt: new Date("2026-08-06T00:00:00Z"), revokedAt: null };
  },
};

const snapshot = {
  id: "snapshot-1",
  pricingVersion: "TH-2026Q2-QA-0.1",
  referenceDate: "2026-06-30",
  confidence: "B" as const,
  lines: [
    { code: "core-construction", label: "ค่าก่อสร้างหลัก", amount: { low: 4_500_000, expected: 5_500_000, high: 6_500_000 } },
    { code: "design-professional-fee", label: "ค่าออกแบบและบริการวิชาชีพ", amount: { low: 225_000, expected: 371_250, high: 552_500 } },
  ],
  total: { low: 4_725_000, expected: 5_871_250, high: 7_052_500 },
  assumptions: [], includedItems: [], excludedItems: ["ค่าควบคุมงานก่อสร้าง"],
};
const project = { id: "project-1", targetBudget: null };
const projectWithTargetBudget = { id: "project-2", targetBudget: { min: 4_000_000, max: 5_000_000 } };

test("rejects an expired or unknown private token", async () => {
  await expect(resolvePrivateProject("expired-token", repository, now)).rejects.toMatchObject({ code: "PROJECT_LINK_EXPIRED" });
});

test("builds web, PDF and image data from one snapshot", () => {
  const report = buildFullReport(project, snapshot);
  expect(report.snapshotId).toBe(snapshot.id);
  expect(report.lines.find((line) => line.code === "design-professional-fee")).toBeDefined();
  expect(report.excludedItems).toContain("ค่าควบคุมงานก่อสร้าง");
});

test("compares an optional target budget without changing the estimate", () => {
  const report = buildFullReport(projectWithTargetBudget, snapshot);
  expect(report.budgetComparison.status).toBe("above-target");
  expect(report.total).toEqual(snapshot.total);
});
```

- [ ] **Step 2: Implement private token verification**

Hash the presented token with SHA-256, query by hash, require `expires_at > now` and `revoked_at IS NULL`, then load the Project and Calculation Snapshot. Return a generic not-found page for invalid links without revealing PII.

- [ ] **Step 3: Implement Full Report**

Render Project Summary, Low/Expected/High, five budget lines, assumptions, included/excluded items, Confidence, Pricing Version, Reference Date and next-step advice. When Target Budget exists, compare it with the unchanged estimate and return `within-target`, `below-target` or `above-target`; never force the estimate to match the user's budget and never downgrade selections automatically. Do not recalculate when reading an existing project.

- [ ] **Step 4: Implement PDF and Summary Image exports**

Use React PDF on the Server to render the same `FullReportViewModel`. Use `html-to-image` only on `ProjectSummaryCard` in the authenticated report page to export PNG; do not upload the generated PNG. Both exports include the Concept Image and KSB disclaimer.

- [ ] **Step 5: Implement idempotent consultation request**

The authenticated Report CTA calls `POST /api/projects/[projectId]/consultation`. The Server resolves the Private Project Access, sets `consultation_requested_at` only when null, sends the Lead notification with Project context and returns the existing timestamp on retries. Emit `consultation_requested` only after the Server confirms success.

- [ ] **Step 6: Verify and commit**

Run: `npm --prefix web test -- src/features/project-access src/features/reports`

Expected: access, snapshot and report tests PASS.

```powershell
git add web/src/features/project-access web/src/features/reports web/src/app/report web/src/app/api/reports web/src/app/api/projects
git commit -m "feat: unlock private full project reports"
```

---

### Task 10: Implement Safe Public Preview Sharing

**Files:**
- Create: `web/src/features/sharing/domain/public-preview.ts`
- Create: `web/src/features/sharing/application/create-public-share.ts`
- Create: `web/src/app/api/shares/route.ts`
- Create: `web/src/app/share/[slug]/page.tsx`
- Test: `web/src/features/sharing/application/create-public-share.test.ts`

**Interfaces:**
- Produces: `PublicPreviewPayload`, public slug and share page

- [ ] **Step 1: Write the failing privacy allowlist test**

```ts
const privateProject = {
  id: "project-1", conceptAssetId: "contemporary-warm-luxury", styleLabel: "Contemporary Warm Luxury",
  floors: 2, bedrooms: 3, bathrooms: 3, parkingSpaces: 2, usableAreaM2: 164,
  name: "ข้อมูลส่วนตัว", phone: "0910000000", budget: 6_000_000,
  notes: "Private note", province: "10", privateToken: "secret",
};
const repository = {
  async save(payload: Record<string, unknown>) {
    return { ...payload, slug: "public-example-7f3k" };
  },
};

test("copies only public fields", async () => {
  const payload = await createPublicShare(privateProject, repository);
  expect(Object.keys(payload).sort()).toEqual([
    "bathrooms", "bedrooms", "conceptAssetId", "floors", "parkingSpaces", "slug", "styleLabel", "usableAreaM2",
  ]);
  expect(JSON.stringify(payload)).not.toMatch(/name|phone|email|lineId|price|budget|notes|province|token/i);
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm --prefix web test -- src/features/sharing`

Expected: FAIL because the public payload module does not exist.

- [ ] **Step 3: Implement explicit allowlist mapping**

Do not spread a private object. Construct each property explicitly and persist only the allowlisted payload. Generate a random slug independent of Project ID and Private Token.

- [ ] **Step 4: Build the share page**

Render Concept Image, style, floors, room summary and usable area. The only primary CTA is `ลองออกแบบบ้านของคุณ` linking to `/configurator?source=shared-preview`. Add `noindex` if KSB does not approve indexable user-generated pages.

- [ ] **Step 5: Verify and commit**

Run: `npm --prefix web test -- src/features/sharing`

Expected: PASS.

```powershell
git add web/src/features/sharing web/src/app/api/shares web/src/app/share
git commit -m "feat: add privacy-safe public previews"
```

---

### Task 11: Add Price Book Admin Review and Immutable Publish

**Files:**
- Create: `supabase/migrations/0004_admin_rls.sql`
- Create: `web/src/features/price-book-admin/application/publish-price-book.ts`
- Create: `web/src/features/price-book-admin/components/price-book-editor.tsx`
- Create: `web/src/app/admin/pricing/page.tsx`
- Create: `web/src/features/price-book-admin/application/publish-price-book.test.ts`
- Create: `docs/runbooks/price-book-publish.md`

**Interfaces:**
- Consumes: Supabase Auth Admin Session, Draft Price Book
- Produces: immutable Published Price Book and Golden Case diff

- [ ] **Step 1: Write failing publish-gate tests**

```ts
import { THAI_PROVINCE_CODES } from "@/features/configurator/domain/provinces";

const adminContext = { userId: "admin-1", roles: ["pricing-admin", "pricing-approver"] };
const incompleteDraft = {
  version: "TH-2026Q3-DRAFT-0.1", provinceEntries: [], materialLevels: [],
  specialFeatures: [], goldenCasesPassed: false, approvedBy: null, approvedAt: null, sources: [],
};
const approvedDraft = {
  version: "TH-2026Q3-1.0", provinceEntries: THAI_PROVINCE_CODES.map((code) => ({ code })),
  materialLevels: ["select", "premium", "signature"],
  specialFeatures: ["pool", "lift", "smart-home", "solar", "ev-charger", "double-volume", "large-glazing"],
  goldenCasesPassed: true, approvedBy: "architect-1", approvedAt: "2026-08-07T00:00:00Z",
  sources: ["MOC", "REIC", "KSB_CALIBRATION"],
};

test("blocks publish without all provinces, approval and passing golden cases", async () => {
  await expect(publishPriceBook(incompleteDraft, adminContext)).rejects.toMatchObject({ code: "PRICE_BOOK_NOT_READY" });
});

test("retires the previous book and publishes a new version atomically", async () => {
  const result = await publishPriceBook(approvedDraft, adminContext);
  expect(result.previousStatus).toBe("retired");
  expect(result.publishedStatus).toBe("published");
});
```

- [ ] **Step 2: Add Admin authentication and RLS**

Use Supabase Auth cookie sessions through `@supabase/ssr`. Require the authenticated Email to exist in `admin_users` with role `pricing-admin` or `pricing-approver`. Authenticated admin pages must be dynamic and non-cacheable. Service-role credentials stay Server-only.

- [ ] **Step 3: Implement publish rules**

Block publish unless:

- Version is unique
- Reference Date is valid
- Province table contains exactly 77 unique Province Codes
- Select, Premium and Signature entries exist
- Every active Special Feature has Low/Expected/High allowance
- Golden Cases pass
- Architect Approver ID and Approved At exist
- Source records exist

Publish and retire the prior version in one transaction; never update a Published row.

- [ ] **Step 4: Build Preview Diff UI and runbook**

Show current vs candidate totals for every Golden Case, highlight percentage changes and require explicit confirmation. Document Draft → Review → Published → Retired workflow and rollback by publishing a new corrected version.

- [ ] **Step 5: Verify and commit**

Run:

```powershell
npm --prefix web test -- src/features/price-book-admin
npm --prefix web run typecheck
```

Expected: PASS.

```powershell
git add supabase/migrations/0004_admin_rls.sql web/src/features/price-book-admin web/src/app/admin docs/runbooks/price-book-publish.md
git commit -m "feat: add governed price-book publishing"
```

---

### Task 12: Implement Privacy-safe Analytics, Retention and Lead Notifications

**Files:**
- Create: `web/src/features/analytics/event-schema.ts`
- Create: `web/src/features/analytics/track-event.ts`
- Create: `web/src/features/analytics/abandonment-tracker.ts`
- Create: `web/src/features/analytics/event-schema.test.ts`
- Create: `web/src/features/leads/infrastructure/webhook-lead-notifier.ts`
- Create: `web/src/features/privacy/application/export-project-data.ts`
- Create: `web/src/features/privacy/application/delete-project-data.ts`
- Create: `web/src/features/privacy/application/run-retention.ts`
- Create: `web/src/features/privacy/application/privacy-operations.test.ts`
- Create: `docs/runbooks/lead-recovery.md`

**Interfaces:**
- Produces: `trackEvent(event)`, required Funnel Events and server-side notification adapter

- [ ] **Step 1: Write failing event privacy tests**

```ts
const baseProperties = {
  sessionId: "session-1",
  projectId: "project-1",
  configuratorVersion: "0.1.0",
  pricingVersion: "TH-2026Q2-QA-0.1",
  deviceClass: "desktop",
  timestamp: "2026-08-07T00:00:00Z",
};

test.each(["name", "phone", "email", "lineId", "address", "privateToken"])("rejects PII property %s", (key) => {
  expect(() => AnalyticsEventSchema.parse({ name: "preview_viewed", properties: { [key]: "secret" } })).toThrow();
});

test("accepts every required funnel event", () => {
  const names = [
    "preview_viewed", "full_report_cta_clicked", "lead_form_started", "lead_form_abandoned",
    "lead_submitted", "full_report_unlocked", "pdf_downloaded", "summary_image_downloaded",
    "preview_shared", "consultation_requested",
  ];
  names.forEach((name) => expect(AnalyticsEventSchema.parse({ name, properties: baseProperties })).toBeDefined());
});
```

- [ ] **Step 2: Implement vendor-agnostic Event Layer**

Allow only `sessionId`, `projectId`, `configuratorVersion`, `pricingVersion`, `deviceClass`, cleaned UTM fields, `currentStep`, `materialLevel`, approved Province Code and Timestamp. Provider failure must be swallowed after a structured non-PII log; it must never block Configurator actions.

- [ ] **Step 3: Implement abandonment semantics**

Start a session record on `lead_form_started`; mark abandoned when the user explicitly leaves the flow or when the session expires without `lead_submitted`. Do not depend only on `beforeunload`.

- [ ] **Step 4: Implement Lead notification webhook**

POST a server-generated Lead summary to `LEAD_WEBHOOK_URL` after the database transaction. Retry notification independently; never roll back a successfully stored Lead because the webhook failed. The runbook must explain how staff recover unnotified Leads from the database.

- [ ] **Step 5: Implement retention, export and deletion operations**

Parse `PII_RETENTION_DAYS` as a required positive integer in Production. `runRetention(now)` selects Leads older than the cutoff and deletes Private Tokens, Public Preview, Project, Lead, orphaned Calculation Snapshot and orphaned Configuration in one transaction. `exportProjectData(leadId)` returns Contact, Consent, Configuration and Snapshot for an authorized privacy operator. `deleteProjectData(leadId)` performs the same cascade immediately for an approved deletion request. Tests must prove the PII cannot be queried after commit and a failed transaction removes nothing.

- [ ] **Step 6: Verify and commit**

Run: `npm --prefix web test -- src/features/analytics src/features/leads src/features/privacy`

Expected: PASS.

```powershell
git add web/src/features/analytics web/src/features/leads/infrastructure web/src/features/privacy docs/runbooks/lead-recovery.md
git commit -m "feat: add privacy-safe funnel analytics"
```

---

### Task 13: Add Recovery, Accessibility, Security and End-to-End Tests

**Files:**
- Create: `web/playwright.config.ts`
- Create: four E2E files listed in File Structure
- Create: `web/e2e/helpers/complete-configurator.ts`
- Create: `web/src/components/ui/field-error.tsx`
- Create: `docs/qa/launch-checklist.md`
- Modify: API routes to add consistent error envelopes and rate limits

**Interfaces:**
- Produces: release-blocking E2E suite and manual QA checklist

- [ ] **Step 1: Write failing E2E for Preview-before-Lead**

Create `web/e2e/helpers/complete-configurator.ts`:

```ts
import type { Page } from "@playwright/test";

export async function completeConfigurator(page: Page) {
  await page.getByRole("radio", { name: "Contemporary Warm Luxury" }).check();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByLabel("จังหวัด").selectOption("10");
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("radio", { name: /Premium/ }).check();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await page.getByRole("button", { name: "ประเมินโครงการ" }).click();
}
```

```ts
import { expect, test } from "@playwright/test";
import { completeConfigurator } from "./helpers/complete-configurator";

test("shows free preview before any contact field", async ({ page }) => {
  await page.goto("/configurator");
  await completeConfigurator(page);
  await expect(page.getByRole("heading", { name: "ตัวอย่างโครงการของคุณ" })).toBeVisible();
  await expect(page.getByText(/กรอบงบประมาณเบื้องต้น/)).toBeVisible();
  await expect(page.getByLabel(/เบอร์โทร|อีเมล|LINE/)).toHaveCount(0);
});
```

- [ ] **Step 2: Add Lead unlock and duplicate-submit E2E**

Intercept the first Lead response to simulate a lost response, retry with the same Idempotency Key, and assert only one database record exists. Assert report route is inaccessible before Submit and visible after Submit.

- [ ] **Step 3: Add Public Share privacy and accessibility E2E**

Scan the rendered HTML and network JSON for forbidden PII/Pricing keys. Run `@axe-core/playwright` on Landing, every Configurator step, Preview, Soft Gate, Full Report and Public Share; fail on serious/critical violations.

- [ ] **Step 4: Add recovery and API security tests**

Cover Offline Draft, Refresh, Back, invalid enum, oversized Notes, expired token, revoked token, missing Published Price Book, failed PDF and rate-limited Lead Submit. Assert errors preserve configuration and never emit a fake estimate.

- [ ] **Step 5: Run the release suite**

```powershell
npm --prefix web test
npm --prefix web run typecheck
npm --prefix web run lint
npm --prefix web run build
npm --prefix web run test:e2e
```

Expected: every command exits 0 and Playwright reports zero failed tests.

- [ ] **Step 6: Commit**

```powershell
git add web/e2e web/playwright.config.ts web/src docs/qa/launch-checklist.md
git commit -m "test: add release-blocking configurator coverage"
```

---

### Task 14: Calibrate, Soft-launch and Close Production Gates

**Files:**
- Create: `docs/qa/pricing-calibration-report.md`
- Modify: `docs/qa/launch-checklist.md`
- Create: `supabase/seed.sql`
- Modify: Production environment configuration outside Git

**Interfaces:**
- Consumes: 10–20 anonymized KSB projects and approved business inputs
- Produces: first Published Price Book and signed Launch Checklist

- [ ] **Step 1: Import anonymized calibration cases**

Use a CSV schema with `project_code`, `reference_date`, `province_code`, `usable_area_m2`, `cfa_m2`, `floors`, `material_level`, `complexity_profile`, `contract_price`, `variation_total`, `final_price`, `included_scope`, `excluded_scope`, `design_fee`, `design_scope`. Reject rows containing customer names, contacts, exact addresses or title-deed identifiers.

- [ ] **Step 2: Backtest the candidate Price Book**

Calculate Median Absolute Percentage Error, P80 Absolute Percentage Error and Range Coverage by Material Level and region. Record every outlier cause. Do not publish if fewer than 10 comparable cases or Coverage is below the approved target.

- [ ] **Step 3: Close business launch gates**

Record approvals for Price Book, Room/CFA coefficients, Concept Assets and rights, Consent/Privacy/Retention, Webfont or fallback, Lead Owner, Notification channel and Contact copy. The application must fail Production startup when mandatory environment configuration is absent.

- [ ] **Step 4: Run internal and pilot Soft Launch**

Complete at least one internal E2E per device class and a small invited-user pilot. Compare automated estimates with architect review, inspect Preview → Lead → Full Report Funnel and verify Public Share manually.

- [ ] **Step 5: Commit calibration documentation**

```powershell
git add docs/qa/pricing-calibration-report.md docs/qa/launch-checklist.md supabase/seed.sql
git commit -m "docs: approve configurator soft launch"
```

- [ ] **Step 6: Run final verification**

```powershell
npm --prefix web test
npm --prefix web run typecheck
npm --prefix web run lint
npm --prefix web run build
npm --prefix web run test:e2e
git status --short
```

Expected: all checks pass and `git status --short` is empty.

- [ ] **Step 7: Tag the verified soft launch**

```powershell
git tag -a v0.1.0-soft-launch -m "KSB configurator soft launch"
git show v0.1.0-soft-launch --no-patch
```

Expected: the annotated tag points to the clean, verified commit.

---

## Plan-wide Verification Matrix

| Requirement | Implemented by | Verified by |
|---|---|---|
| Free Preview ก่อน Lead | Tasks 5, 7 | Unit + E2E Preview-before-Lead |
| Soft Gate minimal fields | Task 8 | Lead schema + E2E |
| Full Report server lock | Tasks 8–9 | Access tests + E2E |
| No duplicate Lead | Task 8 | Idempotency unit/integration/E2E |
| Draft survives Back/Refresh | Tasks 3, 5 | Store tests + E2E |
| Versioned pricing | Tasks 6, 11 | Golden tests + publish tests |
| Construction/Design/Allowance/Site Risk split | Tasks 6, 9 | Pricing and report tests |
| No supervision fee | Tasks 6, 9 | Golden/report assertions |
| PDF + Summary Image | Task 9 | Snapshot and export tests |
| Public Share without PII/Pricing | Task 10 | Allowlist unit + E2E network scan |
| Analytics events without PII | Task 12 | Event schema tests |
| Mobile/Keyboard/Screen Reader | Tasks 5, 13 | RTL + Playwright + axe + manual QA |
| Pricing calibration | Task 14 | Calibration report + launch gate |

## Official Technical References Checked on 2026-08-07

- Next.js App Router installation and Node.js requirement: https://nextjs.org/docs/app/getting-started/installation
- Next.js App Router: https://nextjs.org/docs/app
- Supabase package selection for SSR: https://supabase.com/docs/guides/auth/choosing-a-server-package
- Supabase SSR client setup: https://supabase.com/docs/guides/auth/server-side/creating-a-client
- Vitest setup: https://vitest.dev/guide/index.html
- React Testing Library setup: https://testing-library.com/docs/react-testing-library/setup/
- Playwright test runner guidance: https://playwright.dev/docs/next/library
