# Preliminary Project Summary Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `/preview` into the premium, shareable preliminary project summary shown in IMAGE B while preserving the existing draft, estimate, full-report, and navigation flows.

**Architecture:** Keep `FreePreviewPayload` as the sole estimate projection and pass the existing `DesignBriefConfiguration` to the read-only view for personality/feature presentation. Add one pure presentation mapper for concept direction and personality copy, then compose the page from focused React sections styled by the existing CSS module.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, Vitest, Testing Library, Playwright.

## Global Constraints

- Do not create a second configurator store or duplicate pricing formula.
- Do not change the Full Report page or lead-capture behavior.
- Use existing concept assets and existing Thai font/design tokens.
- Preserve keyboard focus, semantic controls, responsive layouts, and current draft state.

---

### Task 1: Presentation mapping and state continuity

**Files:**
- Create: `web/src/features/preview/presentation/project-insight.ts`
- Create: `web/src/features/preview/presentation/project-insight.test.ts`
- Modify: `web/src/app/preview/page.tsx`
- Modify: `web/src/features/preview/components/free-preview.tsx`

**Interfaces:**
- Consumes: `DesignBriefConfiguration`, `FreePreviewPayload`, `CONCEPT_CATALOG`.
- Produces: `buildProjectInsight(configuration)` with concept direction, positive traits, and selected-feature adjustments.

- [ ] Write tests proving different styles and selected features produce readable, positive Thai presentation with no internal IDs.
- [ ] Run the focused test and confirm it fails because the mapper does not exist.
- [ ] Implement the pure mapper and pass the existing configuration into `FreePreview`.
- [ ] Run the focused test and confirm it passes.

### Task 2: Preliminary summary composition

**Files:**
- Modify: `web/src/features/preview/components/free-preview.tsx`
- Modify: `web/src/features/preview/components/free-preview.test.tsx`

**Interfaces:**
- Consumes: existing estimate ranges, configuration, existing `onBack`, `onFullReport`, and `onShare` handlers.
- Produces: semantic header/status, hero preview, metric strip, budget card, design-value card, personality card, share block, and Full Report CTA.

- [ ] Update component tests first for the new headings, preliminary budget rows, personality variation, share controls, and unchanged handoffs.
- [ ] Run the focused component test and confirm the old UI fails the new expectations.
- [ ] Implement the new read-only composition without changing estimate calculations or Full Report behavior.
- [ ] Run the focused component test and confirm it passes.

### Task 3: Responsive visual system

**Files:**
- Modify: `web/src/features/preview/components/free-preview.module.css`
- Modify: `web/src/features/preview/components/free-preview-styles.test.ts`
- Modify: `web/src/e2e/preview-before-lead.e2e.ts`

**Interfaces:**
- Consumes: semantic class structure from Task 2.
- Produces: IMAGE B desktop composition and stacked tablet/mobile layouts with no horizontal overflow.

- [ ] Add failing CSS/E2E assertions for the 50/50 desktop composition, preview dominance, responsive stacking, and accessible CTA/share controls.
- [ ] Run the tests and confirm failure against the current layout.
- [ ] Implement CSS using existing KSB tokens, restrained gold borders, and 375/768/1440/1672/wide breakpoints.
- [ ] Run component, style, and E2E tests until green.

### Task 4: Verification and visual correction

**Files:**
- Modify only files above if the screenshot comparison reveals mismatches.

**Interfaces:**
- Consumes: completed summary implementation.
- Produces: verified build and final screenshot set.

- [ ] Run lint, typecheck, focused tests, full unit tests, and production build.
- [ ] Capture the page at 375, 768, 1440, 1672×941, and wide desktop.
- [ ] Compare 1672×941 directly with IMAGE B and correct only spacing, scale, border intensity, and typography fidelity.
- [ ] Re-run focused E2E and verify no console errors or overflow.
