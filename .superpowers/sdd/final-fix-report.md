# Step 4 Whole-Feature Final-Fix Report

Date: 2026-08-14
Base HEAD: `ff73f220642cb1cafb5aea4c2c9132806981d81c`
Branch: `feature/mvp-configurator`

## Findings resolved

1. **Lead persistence boundary**
   - Added a strict `DesignBriefConfiguration` projection derived from the validated house configuration.
   - The design brief keeps all eight `materialSelections`, exact `materialQualityId`, legacy `materialLevel`, and every selected special feature.
   - `privateNotes` is removed before the Lead request; contact PII remains in the separate Lead fields.
   - `/api/estimate` still receives only `EstimateRequest`.
   - Lead calculation projects a separate mapped and filtered `pricingConfiguration`, while the configuration row and immutable calculation snapshot retain the full PII-safe design brief.
   - Regression covers Metal Roof + Bespoke + Pool + Internal Garden from browser draft through Lead submission and saved snapshot.

2. **Responsive Step 4 order**
   - Step 4 renders one navigation action pair after `MaterialsPreview` in DOM order.
   - Compact order is selector, quality, preview, summary, Back/Next.
   - Desktop grid places the same action pair in a fixed left-column row while the preview spans both desktop rows.
   - Steps 1–3 and 5 keep their existing action placement.

3. **Truthful guidance**
   - Removed the blanket statement that every special feature affects an allowance/budget category.
   - Design-only selections are described as design requirements without a price rule.
   - Added the exact note: `ระดับคุณภาพวัสดุมีผลต่อคุณภาพโดยรวมและงบประมาณของโครงการ`.
   - No exact price or percentage is shown.

4. **Step 2–3 scope audit**
   - The reviewer inference was false in the current routed implementation.
   - `FunctionsPreview` consumes only the unchanged legacy material tone (`material.level`), and `SiteBudgetPreview` consumes no quality label/description.
   - Exact quality label/description is rendered by the generic Step 5 preview; Step 4 uses its dedicated preview.
   - No Step 2–3 production change or extra regression was needed for this item.

5. **Quality/legacy-level invariant**
   - Both configuration schemas reject a mismatch between `materialQualityId` and `materialLevel`.
   - Store updates synchronize either field before validation.
   - Draft loading always derives legacy `materialLevel` from an exact valid `materialQualityId`, including Bespoke → Signature, and still migrates legacy drafts missing the exact quality field.
   - Regression covers corrupt Bespoke/Standard/Premium mismatches.

## Fix files

- `web/src/features/configurator/domain/configuration.ts`
- `web/src/features/configurator/domain/material-catalog.ts`
- `web/src/features/configurator/state/configurator-store.ts`
- `web/src/features/configurator/state/draft-storage.ts`
- `web/src/features/pricing/application/estimate-request.ts` (pre-existing dirty compatibility additions preserved; no final-fix hunk)
- `web/src/app/preview/page.tsx`
- `web/src/features/leads/domain/lead.ts`
- `web/src/features/leads/components/soft-gate-form.tsx`
- `web/src/features/leads/application/submit-lead.ts`
- `web/src/features/configurator/components/material-features-step.tsx`
- `web/src/features/configurator/components/configurator-shell.tsx`
- `web/src/features/configurator/components/configurator-shell.module.css`
- Focused tests beside the boundaries above.

## TDD and verification evidence

- Baseline focused suite: 11 files / 106 tests passed.
- RED: 7 files ran; 16 expected failures and 88 passes reproduced all five findings.
- GREEN focused suite: 11 files / 115 tests passed.
- Full unit suite: 76 files / 345 tests passed.
- Isolated staged-snapshot suite: 74/75 files and 325/326 tests passed. The sole failure is the pre-existing `estimate-request.test.ts` expectation for Step 2/3 compatibility fields; it reproduces unchanged on base `ff73f22` and passes in the preserved working tree with the intentionally unstaged user-owned `estimate-request.ts` compatibility hunk.
- Typecheck: passed.
- Lint: exited 0; one pre-existing warning remains in `configuration.test.ts` for `_lighting` at the unchanged missing-category test.
- Production build: passed (Next.js 16.3.0, 12 static pages generated).
- Step 4 focused E2E: 7/7 passed across 375, 768, 1440, 1672×941, and 1920 viewports plus scroll/keyboard persistence cases.
- `git diff --check`: passed; only the repository's existing LF→CRLF notices were printed.

## Preservation notes

- The linked worktree was already isolated on `feature/mvp-configurator` at the intended base HEAD.
- The worktree contained substantial pre-existing dirty and untracked Step 1–3/user work before this pass.
- No reset, checkout, stash, clean, delete, or destructive command was used.
- Unrelated working-tree changes remain present.
- Shared dirty files are staged through fix-only index hunks; unrelated Step 1–3/configuration work is intentionally left unstaged.
- No server is intentionally left running after Playwright verification.

## Remaining risk

- The Supabase Lead RPC was not exercised against a real hosted Supabase/PostgreSQL instance in this pass; its JSONB contract is unchanged and is covered by repository/unit tests.
