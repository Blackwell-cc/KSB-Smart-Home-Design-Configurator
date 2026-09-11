# Review Special Feature Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show selected special-feature images in Step 5 and remove only the lower draft-save action.

**Architecture:** Extend the existing review-summary projection with catalog-backed feature metadata, then render compact image rows within the existing special-feature card. Keep Header draft saving unchanged and simplify only the Step 5 footer API and grid.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Testing Library, Playwright

## Global Constraints

- Preserve the Step 5 mosaic, preview, responsive breakpoints, content hierarchy, and continuation flow.
- Reuse `SPECIAL_FEATURE_CATALOG` images from Step 4.
- Display at most five image rows and retain the overflow count.
- Remove only the lower draft-save button; preserve the Header draft-save action and draft persistence.
- Maintain keyboard access, accessible image labels, and no horizontal overflow.

---

### Task 1: Project Selected Feature Metadata

**Files:**
- Modify: `web/src/features/configurator/presentation/review-summary.ts`
- Test: `web/src/features/configurator/presentation/review-summary.test.ts`

**Interfaces:**
- Produces: `summary.specialFeatures: Array<{ id: SpecialFeatureId; label: string; imageSrc: string }>`
- Preserves: `summary.specialFeatureLabels: string[]`

- [x] Add a failing assertion for IDs, labels, and image sources of selected features.
- [x] Run `npm test -- --run src/features/configurator/presentation/review-summary.test.ts` and verify failure.
- [x] Map selected codes to catalog entries and derive labels from the resulting metadata.
- [x] Run the focused test and verify it passes.

### Task 2: Render Image Rows and Simplify Footer Actions

**Files:**
- Modify: `web/src/features/configurator/components/review-step.tsx`
- Modify: `web/src/features/configurator/components/review-step.module.css`
- Modify: `web/src/features/configurator/components/configurator-shell.tsx`
- Test: `web/src/features/configurator/components/configurator-shell.test.tsx`

**Interfaces:**
- Consumes: `summary.specialFeatures`
- Removes: `ReviewStepProps.onSave`

- [x] Add failing integration assertions that selected feature images are rendered and the Step 5 footer has two buttons while the Header retains draft save.
- [x] Run `npm test -- --run src/features/configurator/components/configurator-shell.test.tsx` and verify failure.
- [x] Render the first five features as compact image rows with selected check overlays.
- [x] Remove the lower save button, its unused icon and prop, and change `.actions` to two columns.
- [x] Run the focused component test and verify it passes.

### Task 3: Verify Step 5 Responsiveness and Navigation

**Files:**
- Modify: `web/src/e2e/configurator-step-five.e2e.ts`

**Interfaces:**
- Verifies: image loading, two-button footer, Header save presence, responsive layout, and continuation flow

- [x] Update the Step 5 E2E expectation from three footer buttons to two and assert selected feature thumbnails load.
- [x] Run `npm run test:e2e -- src/e2e/configurator-step-five.e2e.ts`.
- [x] Inspect the reference desktop screenshot and confirm the existing mosaic dimensions are unchanged.
- [x] Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check`.
