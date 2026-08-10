# Premium Architect Single-Hero Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เปลี่ยนหน้า `/` ให้เป็น Landing แบบ Hero section เดียว ใช้ฟอนต์ Prompt, Navbar เต็มจอ และโลโก้จริงของ KSB Architect

**Architecture:** คงหน้าเป็น Next.js Server Component และเก็บ copy แยกใน `landing-content.ts` ตามโครงสร้างเดิม ลด DOM ให้เหลือ Header กับ Hero เดียว แล้วใช้ CSS Module คุม layout responsive โดยไม่เพิ่ม client state หรือ dependency ใหม่

**Tech Stack:** Next.js App Router, React, TypeScript, CSS Modules, `next/font/google`, Vitest, Testing Library, Playwright

## Global Constraints

- หน้าแรกต้องมี `<section>` เพียงหนึ่ง section
- ใช้ Prompt เป็นฟอนต์หลักทั้งภาษาไทยและ Latin
- Navbar ต้องกว้างเต็ม viewport และโลโก้อยู่ซ้ายภายใน safe padding `clamp(20px, 3vw, 56px)`
- โลโก้มาจาก `D:\KSB Smart Home Design Configurator\LOGO.png` และแสดงโดยไม่บิดสัดส่วน
- Primary CTA ไป `/configurator`; contact CTA ไป `tel:0919914592`
- ที่ `1366×768` ต้องเห็น CTA หลักโดยไม่เลื่อน และที่ `360×800` ต้องไม่มี horizontal overflow
- Touch target สำคัญต้องสูงอย่างน้อย `44px`

---

### Task 1: Lock the single-hero behavior with tests

**Files:**
- Modify: `web/src/app/home-page.test.tsx`
- Modify: `web/src/e2e/home-page.e2e.ts`

**Interfaces:**
- Consumes: `HomePage()` จาก `web/src/app/page.tsx`
- Produces: acceptance tests สำหรับ semantic structure, logo, CTA และ responsive behavior

- [ ] **Step 1: Replace unit expectations with the new contract**

เพิ่ม assertions ต่อไปนี้ใน `home-page.test.tsx`:

```tsx
const { container } = render(<HomePage />);
expect(container.querySelectorAll("main section")).toHaveLength(1);
expect(screen.getByRole("img", { name: "โลโก้ KSB Architect" })).toHaveAttribute(
  "src",
  expect.stringContaining("ksb-architect-logo.png"),
);
expect(screen.getAllByRole("link", { name: "เริ่มวางแผนบ้าน" })).toHaveLength(1);
expect(screen.getByRole("link", { name: "ปรึกษาฟรี" })).toHaveAttribute("href", "tel:0919914592");
expect(screen.queryByRole("link", { name: "ดูขั้นตอนการใช้งาน" })).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the unit test and verify RED**

Run: `npm test -- src/app/home-page.test.tsx`

Expected: FAIL เพราะหน้าเดิมยังมีหลาย section, ไม่มีรูปโลโก้ และมี CTA ซ้ำ

- [ ] **Step 3: Update E2E acceptance for the new page**

ให้ desktop test ตั้ง viewport `1366×768` แล้วตรวจ `primaryCta` ด้วย `toBeInViewport()`; ให้ mobile testคง overflow/touch target assertions และเปลี่ยน secondary action เป็น `ปรึกษาฟรี` ที่ `tel:0919914592`

---

### Task 2: Build the Prompt-based Navbar and single Hero

**Files:**
- Modify: `web/src/app/fonts.ts`
- Modify: `web/src/app/globals.css`
- Modify: `web/src/app/landing-content.ts`
- Modify: `web/src/app/page.tsx`
- Modify: `web/src/app/landing-page.module.css`
- Create: `web/public/brand/ksb-architect-logo.png`
- Test: `web/src/app/home-page.test.tsx`

**Interfaces:**
- Consumes: `getLandingContent(locale?: LandingLocale): LandingContent`
- Produces: `HomePage()` ที่ render Header และ Hero section เดียว

- [ ] **Step 1: Replace the global font with Prompt**

ใช้ implementation นี้ใน `fonts.ts`:

```ts
import { Prompt } from "next/font/google";

export const thaiFont = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-prompt",
  display: "swap",
});
```

และตั้ง `--font-thai: var(--font-prompt), "Prompt", sans-serif;` ใน `globals.css`

- [ ] **Step 2: Copy the approved logo asset**

สร้าง directory `web/public/brand` แล้วคัดลอก `D:\KSB Smart Home Design Configurator\LOGO.png` เป็น `web/public/brand/ksb-architect-logo.png` โดยไม่ resize หรือแก้สี source

- [ ] **Step 3: Reduce landing content to fields used by one Hero**

ให้ `LandingContent` เหลือ brand/contact/eyebrow/heading/statement/primaryCta/secondaryCta/helper/conceptAlt/conceptLabel และลบ arrays/process/final/footer copy ที่ไม่ render แล้ว

- [ ] **Step 4: Replace the page structure**

ให้ `page.tsx` render โครงสร้างนี้เท่านั้น:

```tsx
<div className={styles.page}>
  <header className={styles.header}>...</header>
  <main className={styles.main}>
    <section aria-labelledby="landing-heading" className={styles.hero}>...</section>
  </main>
</div>
```

โลโก้ใช้ `Image` จาก `/brand/ksb-architect-logo.png`, CTA หลักใช้ `Link` ไป `/configurator`, และ CTA รองใช้ `<a href="tel:0919914592">`

- [ ] **Step 5: Rebuild the CSS as Editorial Split Hero**

กำหนด Navbar เต็ม viewport, Hero desktop สองคอลัมน์, `Architectural Horizon` เป็นเส้นทองหนึ่งเส้น, ภาพ cover พร้อม caption สั้น และ mobile breakpoint ที่ `899px`; ห้ามคง selectors ของ value rail/process/final CTA/footer

- [ ] **Step 6: Run focused tests and verify GREEN**

Run: `npm test -- src/app/home-page.test.tsx src/app/landing-content.test.ts`

Expected: PASS ทุก test ที่ระบุ

- [ ] **Step 7: Commit the implementation**

```bash
git add web/src/app web/src/e2e/home-page.e2e.ts web/public/brand/ksb-architect-logo.png
git commit -m "feat: simplify landing to premium single hero"
```

---

### Task 3: Verify behavior and visual quality

**Files:**
- Modify only if verification exposes a defect in the files from Task 2
- Create: `docs/qa/screenshots/landing-single-hero-desktop-1366x768.png`
- Create: `docs/qa/screenshots/landing-single-hero-mobile-390x844.png`

**Interfaces:**
- Consumes: built Next.js application
- Produces: automated and visual evidence for Definition of Done

- [ ] **Step 1: Run static and automated verification**

Run:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e -- src/e2e/home-page.e2e.ts
```

Expected: ทุก command exit code `0` และไม่มี failed test

- [ ] **Step 2: Capture desktop and mobile screenshots**

เปิดหน้า `/` ที่ `1366×768` และ `390×844`; บันทึก screenshots ตามชื่อไฟล์ด้านบน

- [ ] **Step 3: Visually inspect and correct defects**

ตรวจ logo crop/สัดส่วน, Thai wrapping, CTA above the fold, image focal point, contrast และ horizontal overflow หากแก้ defect ให้รัน focused test ที่เกี่ยวข้องซ้ำก่อนดำเนินการต่อ

- [ ] **Step 4: Run final fresh verification**

Run: `npm run typecheck; npm run lint; npm test; npm run build`

Expected: ทุก command exit code `0`

- [ ] **Step 5: Commit QA evidence**

```bash
git add docs/qa/screenshots web/src/app web/src/e2e/home-page.e2e.ts
git commit -m "test: verify premium single hero landing"
```
