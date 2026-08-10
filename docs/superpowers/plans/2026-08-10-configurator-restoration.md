# KSB Configurator Restoration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the configurator to the approved left-choice/right-live-preview luxury architect experience and make the complete development journey demonstrable without weakening production pricing gates.

**Architecture:** Preserve the existing configuration domain, store, pricing engine and API contracts. Add presentation metadata around the existing concept catalog, derive a pure live-preview view model from `HouseConfiguration`, reshape the configurator components/CSS around that model, and inject a development-only demo price-book repository at the API composition boundary.

**Tech Stack:** Next.js App Router, React 19, TypeScript, CSS Modules, Zod, Vitest, React Testing Library, Playwright.

## Global Constraints

- Use the approved Obsidian/Smoked Walnut/Architect Ivory/Champagne Gold palette.
- Thai typography is `DB Heavent` local-first with `Noto Sans Thai` fallback; do not commit proprietary font binaries.
- Preserve the five-step configuration schema, anonymous draft persistence, keyboard semantics and PII boundaries.
- Never enable the demo price book in Production; Production remains fail-closed without exactly one valid Published Price Book.
- Estimates are planning ranges, not quotations. Design fees exclude construction supervision.
- Use TDD: each behavior test must fail for the intended reason before production code is changed.

---

### Task 1: Build the Architect Material Board presentation model

**Files:**
- Modify: `web/src/features/preview/domain/concept-catalog.ts`
- Create: `web/src/features/configurator/presentation/live-preview.ts`
- Test: `web/src/features/configurator/presentation/live-preview.test.ts`
- Modify: `web/src/features/configurator/components/configurator-shell.tsx`
- Modify: `web/src/features/configurator/components/configurator-shell.test.tsx`

**Interfaces:**
- Produces: `buildLivePreview(configuration, area): LivePreviewModel`
- Produces concept Thai label, English label, description, image, material palette and active metric rows without changing stored configuration.

- [ ] Write failing tests proving style metadata, room/area metrics, material palette and feature labels are derived from configuration.
- [ ] Run focused tests and confirm RED because the presentation model does not exist.
- [ ] Add strict presentation metadata for all four style choices and implement the pure view-model builder.
- [ ] Wire the shell to render live metrics from the model while retaining `aria-live="polite"`.
- [ ] Run focused tests and confirm GREEN.
- [ ] Commit `feat: add responsive architect preview model`.

### Task 2: Reshape the five-step interface and typography

**Files:**
- Modify: `web/src/app/globals.css`
- Modify: `web/src/features/configurator/components/configurator-shell.module.css`
- Modify: `web/src/features/configurator/components/style-step.tsx`
- Modify: `web/src/features/configurator/components/functions-step.tsx`
- Modify: `web/src/features/configurator/components/material-features-step.tsx`
- Modify: `web/src/components/ui/progress-stepper.module.css`
- Test: `web/src/features/configurator/components/configurator-shell.test.tsx`

**Interfaces:**
- Consumes `CONCEPT_CATALOG` presentation metadata and `LivePreviewModel` from Task 1.
- Preserves existing callbacks and configuration updates.

- [ ] Add failing component tests for image-backed style cards, material swatches, live data attributes, selection text and mobile-safe landmarks.
- [ ] Run focused tests and confirm the expected RED assertions.
- [ ] Add `local("DB Heavent")` font stack with Noto fallback and tabular number utility.
- [ ] Implement 2×2 image style cards, material swatches, feature toggle cards, fixed-ratio preview frame and compact mobile preview.
- [ ] Add restrained image crossfade/selected sheen and disable it under reduced motion.
- [ ] Run component tests, typecheck and lint until GREEN.
- [ ] Commit `feat: restore luxury configurator experience`.

### Task 3: Provide a safe development estimate journey

**Files:**
- Create: `web/src/features/pricing/fixtures/development-demo-price-book.ts`
- Create: `web/src/features/pricing/infrastructure/development-price-book-repository.ts`
- Test: `web/src/features/pricing/infrastructure/development-price-book-repository.test.ts`
- Modify: `web/src/app/api/estimate/route.ts`
- Modify: `web/src/app/api/estimate/route.test.ts`
- Modify: `web/src/features/preview/components/free-preview.tsx`
- Modify: `web/src/features/preview/components/free-preview.module.css`
- Modify: `web/src/features/preview/components/free-preview.test.tsx`

**Interfaces:**
- Produces `createRuntimePriceBookRepository(environment)` that returns demo data only when `environment !== "production"` and Supabase publication is unavailable.
- Free Preview receives an explicit `estimateMode: "published" | "development-demo"` marker from the API.

- [ ] Write failing tests proving development fallback works, is labeled and Production never falls back.
- [ ] Confirm RED for missing composition and missing UI label.
- [ ] Build a complete 77-province demo fixture from the documented Bangkok benchmark plus explicit regional multipliers, marked non-published/non-production.
- [ ] Compose the repository so valid Supabase Published data wins; fallback is development-only.
- [ ] Add the visible “ข้อมูลทดสอบเพื่อพัฒนาระบบ” treatment and retain the broad-range disclaimer, design-fee split and supervision exclusion.
- [ ] Run focused pricing/API/preview tests and confirm GREEN.
- [ ] Commit `feat: enable safe development preview estimates`.

### Task 4: Verify the restored journey

**Files:**
- Modify: `web/src/e2e/preview-before-lead.e2e.ts`
- Modify: `web/src/e2e/privacy-accessibility.e2e.ts`
- Create: `docs/qa/configurator-restoration-review.md`

**Interfaces:**
- Consumes the UI and development estimate composition from Tasks 1–3.
- Produces desktop/mobile visual evidence and a recorded launch limitation for the uncalibrated price book.

- [ ] Add failing E2E assertions for image-backed choices, changing live preview metrics, Preview-before-Lead and demo estimate label.
- [ ] Confirm RED before final UI/API wiring.
- [ ] Run unit tests, typecheck, lint, build and focused E2E in bounded workers.
- [ ] Inspect desktop 1280×720 and mobile 390×844 in the local browser; record screenshots and accessibility findings.
- [ ] Fix any regression through new failing tests before implementation.
- [ ] Document the remaining Production calibration gate and commit `test: verify restored configurator journey`.

