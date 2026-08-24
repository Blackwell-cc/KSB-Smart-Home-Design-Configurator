# Full Report Request Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Open a premium, accessible full-report request dialog over the existing Preliminary Project Summary while reusing the current configurator configuration and preview payload.

**Architecture:** Keep `/preview` mounted and render one stateful `FullReportRequestModal` beside it. The modal receives the existing `DesignBriefConfiguration` and `FreePreviewPayload`, derives presentation-only project metadata from the local catalog/province list, and submits only contact/request fields plus the existing configuration through `/api/leads`. Extend the lead contract and Supabase RPC with a stable request-purpose ID without duplicating project data.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Zod, Vitest/Testing Library, Playwright, Supabase SQL.

## Global Constraints

- Preserve the Preliminary Project Summary page and its scroll position.
- Do not navigate when opening; dim and blur the real page under a modal.
- Reuse the existing Thai font and KSB black/champagne-gold visual tokens.
- No stepper, footer, address field, random images, duplicate project object, or sales-heavy copy.
- Required fields: full name, phone, email, request purpose, consent. LINE ID remains optional.
- Desktop modal target: 1180–1240px wide, 760–810px high, with 66/34 form-to-information split.
- Mobile uses a full-screen dialog with a sticky action area and no horizontal overflow.
- Dialog must trap focus, close with Escape/X/back, restore focus, lock body scroll, and preserve unfinished form state while mounted.

---

### Task 1: Lead request contract

**Files:**
- Modify: `web/src/features/leads/domain/lead.ts`
- Modify: `web/src/features/leads/application/submit-lead.ts`
- Modify: `web/src/features/leads/infrastructure/supabase-lead-repository.ts`
- Create: `supabase/migrations/0010_full_report_request_purpose.sql`
- Test: `web/src/features/leads/domain/lead.test.ts`
- Test: `web/src/features/leads/application/submit-lead.test.ts`
- Test: `web/src/features/leads/infrastructure/supabase-lead-repository.test.ts`
- Test: `web/src/features/leads/infrastructure/migrations.test.ts`

**Interfaces:**
- Consumes: existing `DesignBriefConfigurationSchema` and `submit_lead_once` transaction.
- Produces: `REQUEST_PURPOSE_IDS`, `RequestPurposeId`, and a lead submission requiring phone/email/requestPurpose with optional lineId.

- [ ] Add failing tests for stable purpose IDs, full contact validation, repository RPC arguments, and migration storage.
- [ ] Run the focused tests and confirm failures are caused by the missing contract.
- [ ] Implement the Zod contract, application mapping, repository mapping, and additive SQL migration.
- [ ] Run focused lead tests and confirm they pass.

### Task 2: Accessible modal and dynamic project summary

**Files:**
- Create: `web/src/features/leads/components/full-report-request-modal.tsx`
- Create: `web/src/features/leads/components/full-report-request-modal.module.css`
- Modify: `web/src/features/leads/components/soft-gate-form.tsx`
- Test: `web/src/features/leads/components/soft-gate-form.test.tsx`

**Interfaces:**
- Consumes: `configuration: DesignBriefConfiguration`, `preview: FreePreviewPayload`, `open`, `onClose`, and `onSuccess`.
- Produces: `FullReportRequestModal`, preserving in-memory form state across close/reopen and posting the existing configuration unchanged.

- [ ] Replace the old form test with failing dialog tests covering dynamic style/province/area/image/gallery, inline validation, stable request-purpose value, submission payload, and close/reopen state.
- [ ] Run the component test and confirm expected failures.
- [ ] Implement modal semantics, focus trap/restore, Escape close, scroll lock, form validation, benefits, trust card, project summary, and local placeholder gallery.
- [ ] Implement desktop/tablet/mobile CSS matching the supplied reference and run component tests green.

### Task 3: Preview-page integration

**Files:**
- Modify: `web/src/app/preview/page.tsx`
- Modify: `web/src/app/preview/page.test.tsx`
- Modify: `web/src/e2e/preview-before-lead.e2e.ts`

**Interfaces:**
- Consumes: the existing `state.preview`, `state.configuration`, and existing CTA callback.
- Produces: non-navigating open/close behavior and success-only navigation to the private report URL.

- [ ] Add failing page tests for opening without navigation, closing with Escape, focus return, and reopening with preserved input.
- [ ] Wire the always-mounted modal to the CTA while keeping the real preview page unchanged.
- [ ] Add E2E coverage for dynamic project continuity, validation, keyboard navigation, no overflow, and viewport behavior.
- [ ] Run page and E2E tests green.

### Task 4: Visual correction and final verification

**Files:**
- Modify if required: `web/src/features/leads/components/full-report-request-modal.module.css`

**Interfaces:**
- Consumes: rendered `/preview` at 375, 768, 1440, 1672, and wide desktop widths.
- Produces: verified reference-aligned composition and final screenshots.

- [ ] Start the local production-equivalent app, complete/load a project, open the modal, and capture reference-aspect screenshots.
- [ ] Compare modal size, centering, split, fields, panels, thumbnails, actions, blur, borders, and gold intensity; apply one correction pass only.
- [ ] Run `npm run lint`, `npm run typecheck`, focused/unit/E2E tests, `npm run build`, and `git diff --check`.
- [ ] Report modified files, state reuse, fields/options, gallery approach, accessibility, verification, and any remaining asset-level differences.
