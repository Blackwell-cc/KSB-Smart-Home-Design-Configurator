# Preview Cinematic Gold Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เปิดเผยหน้าภาพรวมบ้านหลัง Loader ด้วยลำดับภาพแบบ Cinematic Gold Reveal ที่หรู มีพลัง และไม่เปลี่ยน Layout เดิม

**Architecture:** เพิ่ม `data-result-reveal="cinematic"` เฉพาะ Ready state ของ `FreePreview` แล้วควบคุมลำดับทั้งหมดผ่าน CSS Modules ของหน้าเดิม ภาพบ้านใช้ pseudo-element เป็นแสงกวาดหนึ่งครั้ง ส่วนหัวข้อ Metrics การ์ด และ CTA ใช้ delay ที่ต่างกันโดยอาศัย `opacity`, `transform` และ `filter` เท่านั้น

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Testing Library, Playwright

## Global Constraints

- คง Grid, ขนาดการ์ด, ลำดับ DOM และพฤติกรรมปุ่มเดิม
- เอฟเฟกต์รวมประมาณ 1.6–2 วินาทีและเล่นหนึ่งครั้งหลังผลประเมินพร้อม
- ไม่เพิ่ม Animation Library หรือ Dependency ใหม่
- `prefers-reduced-motion: reduce` ต้องแสดงผลทันทีโดยไม่มี Animation
- Motion ต้องไม่สร้าง Layout Shift หรือ Horizontal Overflow

---

### Task 1: Ready-state reveal contract and motion sequence

**Files:**
- Modify: `web/src/features/preview/components/free-preview.tsx`
- Modify: `web/src/features/preview/components/free-preview.module.css`
- Modify: `web/src/features/preview/components/free-preview.test.tsx`
- Modify: `web/src/features/preview/components/free-preview-styles.test.ts`

**Interfaces:**
- Consumes: `FreePreviewProps.status`, Ready-state `preview`, `configuration`
- Produces: `data-result-reveal="cinematic"` on the ready `<main>` and CSS animations `resultPageReveal`, `houseReveal`, `goldSweep`, `resultRise`, `metricReveal`, `cardReveal`, and `budgetPulse`

- [ ] **Step 1: Write failing component and style-contract tests**

Add to the ready-state component test:

```tsx
expect(screen.getByRole("main", { name: "ภาพรวมบ้านที่คุณกำลังวางแผน" }))
  .toHaveAttribute("data-result-reveal", "cinematic");
```

Add to `free-preview-styles.test.ts`:

```ts
test("orchestrates a one-shot cinematic result reveal with a reduced-motion fallback", () => {
  expect(stylesheet).toMatch(/\[data-result-reveal="cinematic"\][\s\S]*?houseReveal/);
  expect(stylesheet).toMatch(/\.conceptPanel::after[\s\S]*?goldSweep/);
  expect(stylesheet).toMatch(/\.metrics > div:nth-child\(5\)[\s\S]*?animation-delay/);
  expect(stylesheet).toMatch(/\.budgetCard[\s\S]*?budgetPulse/);
  const reducedMotion = stylesheet.slice(stylesheet.indexOf("@media (prefers-reduced-motion: reduce)"));
  expect(reducedMotion).toMatch(/animation:\s*none/);
});
```

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```powershell
npm test -- --run src/features/preview/components/free-preview.test.tsx src/features/preview/components/free-preview-styles.test.ts
```

Expected: FAIL because the ready page has no `data-result-reveal` contract and the cinematic keyframes do not exist.

- [ ] **Step 3: Add the ready-state attribute**

Change the ready-state root in `free-preview.tsx`:

```tsx
<main className={styles.page} data-result-reveal="cinematic" aria-labelledby="preview-title">
```

Loading and error roots remain unchanged so they never run the reveal sequence.

- [ ] **Step 4: Implement the motion sequence in the existing CSS Module**

Add scoped rules following this timing contract:

```css
.page[data-result-reveal="cinematic"] { animation: resultPageReveal 420ms ease-out both; }
.page[data-result-reveal="cinematic"] .materialConceptImage { animation: houseReveal 1100ms cubic-bezier(.2,.75,.2,1) both; }
.page[data-result-reveal="cinematic"] .conceptPanel::after { animation: goldSweep 1050ms cubic-bezier(.3,.7,.2,1) 160ms both; }
.page[data-result-reveal="cinematic"] .conceptCaption,
.page[data-result-reveal="cinematic"] .additionalViews { animation: resultRise 650ms ease-out 520ms both; }
.page[data-result-reveal="cinematic"] .introBlock { animation: resultRise 720ms ease-out 300ms both; }
.page[data-result-reveal="cinematic"] .metrics > div { animation: metricReveal 520ms ease-out both; }
.page[data-result-reveal="cinematic"] .metrics > div:nth-child(1) { animation-delay: 620ms; }
.page[data-result-reveal="cinematic"] .metrics > div:nth-child(2) { animation-delay: 700ms; }
.page[data-result-reveal="cinematic"] .metrics > div:nth-child(3) { animation-delay: 780ms; }
.page[data-result-reveal="cinematic"] .metrics > div:nth-child(4) { animation-delay: 860ms; }
.page[data-result-reveal="cinematic"] .metrics > div:nth-child(5) { animation-delay: 940ms; }
.page[data-result-reveal="cinematic"] .lowerCards,
.page[data-result-reveal="cinematic"] .personalityCard,
.page[data-result-reveal="cinematic"] .resultActions { animation: cardReveal 700ms ease-out both; }
.page[data-result-reveal="cinematic"] .lowerCards { animation-delay: 980ms; }
.page[data-result-reveal="cinematic"] .budgetCard { animation: budgetPulse 900ms ease-out 1180ms both; }
.page[data-result-reveal="cinematic"] .personalityCard,
.page[data-result-reveal="cinematic"] .resultActions { animation-delay: 1120ms; }
```

Define keyframes with final values `opacity: 1`, `transform: none`, and `filter: none`. Use the existing gold palette for `goldSweep` and `budgetPulse`. Scope the sweep to `.conceptPanel::after`, set `pointer-events: none`, and ensure it disappears at 100%.

- [ ] **Step 5: Add responsive and reduced-motion overrides**

Inside the existing mobile media query, reduce the starting scale and travel distance. Inside the existing reduced-motion query add:

```css
.page[data-result-reveal="cinematic"],
.page[data-result-reveal="cinematic"] .materialConceptImage,
.page[data-result-reveal="cinematic"] .conceptPanel::after,
.page[data-result-reveal="cinematic"] .conceptCaption,
.page[data-result-reveal="cinematic"] .additionalViews,
.page[data-result-reveal="cinematic"] .introBlock,
.page[data-result-reveal="cinematic"] .metrics > div,
.page[data-result-reveal="cinematic"] .lowerCards,
.page[data-result-reveal="cinematic"] .budgetCard,
.page[data-result-reveal="cinematic"] .personalityCard,
.page[data-result-reveal="cinematic"] .resultActions { animation: none; }
```

- [ ] **Step 6: Run focused tests and verify GREEN**

Run:

```powershell
npm test -- --run src/features/preview/components/free-preview.test.tsx src/features/preview/components/free-preview-styles.test.ts
```

Expected: both files pass.

- [ ] **Step 7: Commit Task 1**

```powershell
git add web/src/features/preview/components/free-preview.tsx web/src/features/preview/components/free-preview.module.css web/src/features/preview/components/free-preview.test.tsx web/src/features/preview/components/free-preview-styles.test.ts
git commit -m "feat: orchestrate cinematic preview reveal"
```

### Task 2: Browser verification and responsive visual QA

**Files:**
- Create: `web/src/e2e/preview-cinematic-reveal.e2e.ts`

**Interfaces:**
- Consumes: `/configurator` flow, `/preview`, `data-result-reveal="cinematic"`
- Produces: browser regression coverage and screenshots for Desktop and Mobile

- [ ] **Step 1: Write the Playwright regression test**

Create a test that completes the configurator, clicks “ดูสรุปค่าใช้จ่าย”, confirms the Loader, waits for the result, and verifies:

```ts
await expect(page.locator('[data-result-reveal="cinematic"]')).toBeVisible();
await expect(page.locator('[data-result-reveal="cinematic"]')).toHaveCSS("opacity", "1");
await expect(page.getByRole("region", { name: "กรอบงบประมาณเบื้องต้น" })).toBeVisible();
const dimensions = await page.evaluate(() => ({
  clientWidth: document.documentElement.clientWidth,
  scrollWidth: document.documentElement.scrollWidth,
}));
expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
```

Run the same contract at `375x812` and `1440x900`, saving `preview-reveal-mobile.png` and `preview-reveal-desktop.png`.

- [ ] **Step 2: Run the E2E test**

Run:

```powershell
npm run test:e2e -- src/e2e/preview-cinematic-reveal.e2e.ts
```

Expected: PASS at both viewports.

- [ ] **Step 3: Inspect both screenshots**

Confirm that the final frame matches the existing layout, text remains readable, the image is sharp, and no gold overlay remains over the budget or house image after animation.

- [ ] **Step 4: Run full verification**

```powershell
npm run lint
npm run typecheck
npm test
npm run build
```

Expected: all commands exit with code 0.

- [ ] **Step 5: Commit Task 2**

```powershell
git add web/src/e2e/preview-cinematic-reveal.e2e.ts
git commit -m "test: cover cinematic preview reveal"
```
