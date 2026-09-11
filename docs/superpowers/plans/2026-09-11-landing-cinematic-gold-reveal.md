# Landing Cinematic Gold Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add a premium 1.8–2 second first-load reveal to the KSB landing hero without changing its layout, content, responsive structure, or navigation.

**Architecture:** Keep the landing page as server-rendered React and orchestrate the reveal entirely with CSS animations attached to existing semantic elements. Use pseudo-elements on the page and house area for non-interactive light treatments, stagger existing elements with scoped animation classes, and provide a complete `prefers-reduced-motion` override.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Testing Library, Playwright

## Global Constraints

- Preserve the current grid areas, spacing, dimensions, page copy, image assets, content hierarchy, links, and interaction flow.
- Run the sequence once whenever the landing page is newly loaded or mounted.
- Keep the entrance duration between 1.8 and 2 seconds.
- Add no runtime animation dependency and no JavaScript timer.
- Animate `opacity`, `transform`, and decorative pseudo-element gradients.
- Disable all entrance motion and lighting under `prefers-reduced-motion: reduce`.
- Keep every element usable and clickable throughout the sequence.

---

### Task 1: Define the Landing Motion Contract

**Files:**
- Modify: `web/src/app/landing-page-styles.test.ts`
- Modify: `web/src/app/home-page.test.tsx`

**Interfaces:**
- Consumes: existing CSS module selectors used by `LandingHeader`, `HeroSection`, `HouseShowcase`, `FloatingPreviewCards`, and `SimpleSteps`
- Produces: regression coverage for `heroBackdrop`, semantic reveal classes, orchestration keyframes, and reduced-motion behavior

- [x] **Step 1: Write failing structural and style tests**

Add assertions that the rendered page contains a decorative backdrop and that the CSS defines `landingReveal`, `houseReveal`, `lightSweep`, and staged content/card animations. Assert that the reduced-motion media block sets these selectors to `animation: none` and makes them immediately visible.

```tsx
expect(container.querySelector('[aria-hidden="true"][class*="heroBackdrop"]')).toBeInTheDocument();
```

```ts
expect(css).toContain("@keyframes landingReveal");
expect(css).toContain("@keyframes houseReveal");
expect(css).toContain("@keyframes lightSweep");
expect(mediaBlock("(prefers-reduced-motion: reduce)")).toContain(".heroBackdrop");
```

- [x] **Step 2: Run focused tests and verify failure**

Run:

```powershell
npm test -- --run src/app/home-page.test.tsx src/app/landing-page-styles.test.ts
```

Expected: FAIL because `heroBackdrop` and the new entrance keyframes do not exist.

### Task 2: Add Semantic Reveal Hooks Without Changing Layout

**Files:**
- Modify: `web/src/app/page.tsx`
- Modify: `web/src/app/landing-header.tsx`
- Modify: `web/src/app/hero-section.tsx`
- Modify: `web/src/app/house-showcase.tsx`
- Modify: `web/src/app/floating-preview-cards.tsx`

**Interfaces:**
- Consumes: CSS module class names from `landing-page.module.css`
- Produces: stable hooks `heroBackdrop`, `headerReveal`, `copyReveal`, `actionReveal`, `houseReveal`, `cardReveal`, `benefitReveal`, and `stepsReveal`

- [x] **Step 1: Add the decorative page backdrop**

Render a non-interactive child before the header while preserving existing header and main order:

```tsx
return (
  <div className={styles.page}>
    <div aria-hidden="true" className={styles.heroBackdrop} />
    <LandingHeader content={content} />
    <main><HeroSection content={content} /></main>
  </div>
);
```

- [x] **Step 2: Attach reveal classes to existing elements**

Combine the existing classes with scoped reveal classes. Do not add wrappers that participate in layout.

```tsx
<header className={`${styles.header} ${styles.headerReveal}`}>…</header>
<div className={`${styles.heroContent} ${styles.copyReveal}`}>…</div>
<div className={`${styles.heroActions} ${styles.actionReveal}`}>…</div>
<div className={`${styles.houseArea} ${styles.houseReveal}`} id="house-preview">…</div>
<div className={`${styles.cardFloat} ${styles.cardReveal} ${styles.stylePosition}`}>…</div>
<div className={`${styles.benefitRow} ${styles.benefitReveal}`}>…</div>
```

- [x] **Step 3: Run component tests**

Run:

```powershell
npm test -- --run src/app/home-page.test.tsx src/app/house-showcase.test.tsx src/app/floating-preview-cards.test.tsx
```

Expected: PASS with unchanged headings, links, cards, and image semantics.

### Task 3: Implement the Cinematic CSS Sequence

**Files:**
- Modify: `web/src/app/landing-page.module.css`
- Test: `web/src/app/landing-page-styles.test.ts`

**Interfaces:**
- Consumes: the reveal hooks from Task 2
- Produces: the complete CSS-only 1.8-second orchestration and post-intro ambient treatment

- [x] **Step 1: Add isolated decorative layers**

Make `.page` a positioned isolation context. Add `.heroBackdrop` as a fixed, pointer-transparent layer with a warm radial glow and use `.houseArea::after` for a single diagonal gold sweep. Keep both layers outside layout calculations.

```css
.page { position: relative; isolation: isolate; }
.heroBackdrop { position: fixed; z-index: 0; inset: 78px 0 0; pointer-events: none; }
.header, .page main { position: relative; z-index: 1; }
```

- [x] **Step 2: Add entrance keyframes and timing**

Define `landingReveal`, `houseReveal`, `cardReveal`, `lightSweep`, and `ambientGlow`. Keep the final state identical to the current layout and use `animation-fill-mode: both` so pre-animation states do not flash.

```css
@keyframes landingReveal {
  from { opacity: 0; transform: translate3d(0, 18px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes houseReveal {
  from { opacity: 0; transform: scale(1.03); filter: brightness(0.72) saturate(0.82); }
  to { opacity: 1; transform: scale(1); filter: brightness(1) saturate(1); }
}
```

Use delays that complete by 1.8 seconds: header `0 ms`, house `80 ms`, headline/copy `180–450 ms`, cards `500–900 ms`, calls to action `700 ms`, benefits `1,050 ms`, and steps `1,180 ms`.

- [x] **Step 3: Preserve the idle card float after entrance**

Compose `cardReveal` and `cardFloat` on the same `.cardFloat` selector with separate animation names, durations, delays, iteration counts, and fill modes. Preserve each card's current float duration and negative idle delay after its entrance completes.

- [x] **Step 4: Add responsive and reduced-motion rules**

Reduce translation and disable the light sweep on narrow screens if it obscures content. In the existing reduced-motion media query, set every new reveal selector and pseudo-element to `animation: none`, `opacity: 1`, `transform: none`, and `filter: none`.

- [x] **Step 5: Run the motion contract tests**

Run:

```powershell
npm test -- --run src/app/home-page.test.tsx src/app/landing-page-styles.test.ts
```

Expected: PASS.

### Task 4: Visual and Regression Verification

**Files:**
- Modify: `web/src/e2e/home-page.e2e.ts`

**Interfaces:**
- Consumes: completed CSS reveal
- Produces: browser evidence for final layout, motion completion, CTA behavior, and accessibility fallback

- [x] **Step 1: Add Playwright checks for the reveal**

Assert the page has no overflow, the final heading and cards are visible after the sequence, the primary CTA still links to `/configurator`, and reduced-motion emulation produces immediately visible content.

```ts
await page.emulateMedia({ reducedMotion: "reduce" });
await page.goto("/");
await expect(page.getByRole("heading", { name: "บ้านในฝันของคุณราคาเท่าไหร่?" })).toBeVisible();
```

- [x] **Step 2: Capture and inspect responsive screenshots**

Run the landing E2E suite at desktop, tablet, and mobile viewports. Capture screenshots after animations settle and inspect them for unchanged composition, clipped cards, lighting artifacts, and overflow.

- [x] **Step 3: Run complete verification**

Run:

```powershell
npm run lint
npm run typecheck
npm test -- --run
npm run test:e2e -- src/e2e/home-page.e2e.ts
npm run build
git diff --check
```

Expected: lint, typecheck, unit tests, landing E2E, production build, and whitespace validation all pass.
