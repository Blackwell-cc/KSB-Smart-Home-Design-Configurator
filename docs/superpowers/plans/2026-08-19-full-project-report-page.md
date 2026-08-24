# Full Project Report Page Implementation Plan

> **For Codex:** Execute this plan in the existing `mvp-configurator` worktree. Preserve all unrelated user changes. Do not use brainstorming for this task.

**Goal:** Convert the existing authenticated `/report/[projectId]` experience into the premium Full Report page shown in the reference, reached only after a successful Full Report Request submission.

**Architecture:** Keep the existing lead submission, private access exchange, project session, persisted configuration snapshot, PDF endpoint, public share endpoint, and consultation endpoint. Extend the existing `buildFullReport` presentation model from the saved snapshot. Derive a detailed, deterministic category schedule from the authoritative saved estimate lines, allocating each source line without changing its total so every low/expected/high column reconciles exactly.

**Tech stack:** Next.js App Router, React, TypeScript, CSS Modules, Vitest/Testing Library, Playwright.

---

### Task 1: Lock the report data contract with failing tests

**Files:**
- Modify: `web/src/features/reports/application/build-full-report.test.ts`
- Modify: `web/src/features/reports/components/full-report.test.tsx`
- Modify: `web/src/features/reports/components/private-report-client.test.tsx`

- [ ] Add snapshot coverage for province, district, site access, residents, functions, material selections, quality, additional requirements and special features.
- [ ] Require presentation labels instead of internal IDs.
- [ ] Require a detailed cost schedule whose low/expected/high sums equal the saved total exactly.
- [ ] Require dynamic concept, gallery, summary, materials and selected features.
- [ ] Require PDF/share/consult actions and gallery keyboard controls.
- [ ] Run focused tests and confirm RED for the missing Full Report behavior.

### Task 2: Extend the saved-snapshot presentation model

**Files:**
- Modify: `web/src/features/reports/application/build-full-report.ts`
- Create: `web/src/features/reports/application/build-detailed-budget.ts`
- Create: `web/src/features/reports/application/build-detailed-budget.test.ts`

- [ ] Parse and validate the full saved design-brief configuration without duplicating state.
- [ ] Map catalogue IDs to public Thai/English labels.
- [ ] Build project gallery descriptors from the selected concept asset; use clearly defined project placeholders when unique views are unavailable.
- [ ] Derive report generation date at render time while retaining the price-book reference date.
- [ ] Split authoritative estimate lines into report categories with deterministic weights and exact remainder allocation.
- [ ] Prove subtotal/contingency/final total reconciliation for all three ranges.
- [ ] Run focused application tests and confirm GREEN.

### Task 3: Build the premium Full Report interface

**Files:**
- Modify: `web/src/features/reports/components/full-report.tsx`
- Modify: `web/src/features/reports/components/full-report.module.css`
- Modify: `web/src/features/reports/components/private-report-client.tsx`
- Modify: `web/src/features/reports/components/private-report-client.test.tsx`

- [ ] Create the minimal report header, breadcrumb and live PDF/share/consult actions.
- [ ] Build the 60/40 desktop report grid matching the reference.
- [ ] Add accessible main gallery, thumbnail strip and previous/next controls.
- [ ] Add dynamic project summary and semantic detailed budget table.
- [ ] Add concept, highlights, materials, selected features, value and optional next-step sections.
- [ ] Implement privacy-safe share copy/open behavior and consultation status without another sales modal.
- [ ] Add tablet/mobile layouts; use expandable budget category cards on mobile.
- [ ] Run component tests and typecheck.

### Task 4: Verify submission-to-report routing and state continuity

**Files:**
- Modify: `web/src/e2e/preview-before-lead.e2e.ts`
- Create or modify focused report E2E coverage as repository conventions require.

- [ ] Submit valid modal contact data and verify navigation through `/report/access` to `/report/[projectId]`.
- [ ] Verify selected style, rooms, location, area, materials and features appear from the same saved project.
- [ ] Verify invalid modal data does not navigate.
- [ ] Verify PDF, share and consultation controls use existing endpoints.

### Task 5: Visual match and responsive correction pass

- [ ] Run the local application with realistic seeded project data.
- [ ] Capture the Full Report at 1672x941.
- [ ] Compare header height, 60/40 ratio, gallery, thumbnails, report title, summary density, budget rows, card sizes, gold intensity and borders against the reference.
- [ ] Perform one visual-only correction pass.
- [ ] Check 375, 768, 1440, 1672 and wide desktop without horizontal overflow or clipped Thai marks.

### Task 6: Final verification

- [ ] Run focused report/application tests.
- [ ] Run repository lint.
- [ ] Run TypeScript typecheck.
- [ ] Run production build.
- [ ] Run relevant Playwright tests.
- [ ] Record any pre-existing unrelated failures separately.
