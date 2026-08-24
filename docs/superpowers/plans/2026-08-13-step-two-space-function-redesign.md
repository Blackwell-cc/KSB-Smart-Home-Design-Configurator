# Step 2 Space and Function Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ปรับหน้า Step 2 “พื้นที่และฟังก์ชัน” ให้ตรงกับภาพอ้างอิง โดยคง business logic, validation, state และ navigation เดิมทั้งหมด

**Architecture:** แยก UI เฉพาะ Step 2 ออกจาก Preview ร่วมของ Step 3–5 เพื่อป้องกัน style regression ใช้ `FunctionsStep` ดูแล input และสร้าง `FunctionsPreview` ดูแลภาพกับ summary โดยรับข้อมูลจาก configuration/area เดิม CSS ทุกกฎเฉพาะหน้าจะ scope ด้วย `data-step="functions"`

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Zustand, Vitest/Testing Library, Playwright

## Global Constraints

- แก้เฉพาะ Step 2 และ reusable control ที่ Step 2 ใช้ โดยไม่เปลี่ยน Step 1 หรือ Step 3–5
- ไม่เพิ่ม dependency และไม่เปลี่ยน schema/validation ช่วงพื้นที่ 60–1,500 ตร.ม.
- Preview ต้องไม่มีข้อความหรือ control ซ้อน และ summary ต้องอยู่ใต้ภาพ
- Desktop ใช้สัดส่วนประมาณ 43/57 และเส้นแบ่งคอลัมน์เพียงเส้นเดียว
- รองรับ 375px, 768px, 1440px และ wide desktop โดยไม่มี horizontal overflow

---

### Task 1: Step 2 component contract and behavior

**Files:**
- Modify: `web/src/features/configurator/components/functions-step.tsx`
- Create: `web/src/features/configurator/components/functions-preview.tsx`
- Modify: `web/src/features/configurator/components/configurator-shell.tsx`
- Test: `web/src/features/configurator/components/configurator-shell.test.tsx`

**Interfaces:**
- `FunctionsStep` consumes the existing `HouseConfiguration`, area draft/error and update callbacks.
- `FunctionsPreview` consumes `HouseConfiguration`, `AreaCalculation`, `LivePreviewModel`, and renders the clean preview plus live summary.

- [ ] Add failing tests asserting Step 2 has the six live summary metrics, slider semantics, selectable functions, clean preview, and working counters.
- [ ] Run focused Vitest and confirm failure is caused by missing redesigned Step 2 UI.
- [ ] Implement icon-backed segmented counters, the area range control, data-driven function cards, and `FunctionsPreview` without changing state handlers.
- [ ] Route only `currentStep === 1` through the new preview while leaving the shared Step 3–5 preview unchanged.
- [ ] Run focused Vitest and confirm all Step 2 behavior passes.

### Task 2: Reference-matched layout and responsive styling

**Files:**
- Modify: `web/src/features/configurator/components/configurator-shell.module.css`
- Test: `web/src/features/configurator/components/configurator-shell-styles.test.ts`
- Test: `web/src/e2e/configurator-step-two.e2e.ts`

**Interfaces:**
- CSS selectors use `.shell[data-step="functions"]` so other configurator steps retain existing layout.
- Desktop preview uses the current production concept image at 16:10 with `object-fit: contain`.

- [ ] Add failing style/E2E assertions for 43/57 columns, one divider, center glow, contained image, summary below image, and responsive stacking.
- [ ] Run focused tests and confirm RED.
- [ ] Implement the open left canvas, control grid, function cards, restrained divider, clean preview stage, summary, and compact actions.
- [ ] Add responsive rules for tablet/mobile and reduced motion/focus-visible behavior.
- [ ] Run focused unit/E2E tests and confirm GREEN.

### Task 3: Visual correction and release verification

**Files:**
- Modify if required after comparison: `web/src/features/configurator/components/configurator-shell.module.css`
- Update screenshots through: `web/src/e2e/configurator-step-two.e2e.ts`

**Interfaces:**
- Screenshot artifacts cover 375×812, 768×1024, 1440×900 and 1920×1080.

- [ ] Start the app and capture all four viewports with no console errors or horizontal overflow.
- [ ] Compare desktop screenshot to IMAGE B for column ratio, title scale, divider, control density, preview scale, summary gap, CTA prominence and lighting.
- [ ] Make one visual-correction pass without redesigning the approved structure.
- [ ] Run focused Step 2 tests again.
- [ ] Run `npm run typecheck`, `npm run lint`, `npm test -- --run`, `npm run build`, and `git diff --check`.
- [ ] Confirm Step 3–5 retain their original shared preview and document flow.
