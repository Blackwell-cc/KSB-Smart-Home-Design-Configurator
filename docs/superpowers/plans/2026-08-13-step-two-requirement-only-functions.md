# Step 2 Requirement-only Functions Implementation Plan

> **For agentic workers:** Implement inline with test-driven development. Do not dispatch subagents.

**Goal:** ทำให้ตัวเลือกฟังก์ชันเพิ่มเติมทั้ง 12 รายการเป็นข้อมูลความต้องการเท่านั้น ไม่กระทบการคำนวณ และปรับ Preview/ไอคอนตามภาพอนุมัติ

**Architecture:** คงโครงข้อมูล Draft เดิมเพื่อความเข้ากันได้ แต่ตัด `configuration.functions` ออกจาก `calculateArea`. UI รวมค่าจาก `functions` และ `additionalRequirements` เพื่อแสดงใน Summary เดียว ส่วนแถบตัวเลือกใช้ horizontal overflow เท่านั้น

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Playwright

## Global Constraints

- แก้เฉพาะ Step 2 และสูตรพื้นที่ที่เกี่ยวข้อง
- ตัวเลือกทั้ง 12 รายการไม่เปลี่ยนพื้นที่หรือราคา
- ไม่มีข้อความอธิบายผลต่อพื้นที่
- ไม่มี scrollbar แนวตั้งในแถบตัวเลือก
- Preview ต้องเต็มกรอบด้วย `object-fit: cover`

### Task 1: Lock the no-calculation contract

**Files:**
- Modify: `web/src/features/area-planning/domain/calculate-area.test.ts`
- Modify: `web/src/features/area-planning/domain/calculate-area.ts`
- Modify: `web/src/features/area-planning/domain/area-catalog.ts`

- [ ] เปลี่ยนเทสต์ให้ทุกค่าของ `configuration.functions` และ `additionalRequirements` ไม่เปลี่ยนผล `calculateArea`
- [ ] รันเทสต์เพื่อยืนยัน RED
- [ ] ลบ contribution ของฟังก์ชันออกจากสูตรและ catalog
- [ ] รันเทสต์เพื่อยืนยัน GREEN

### Task 2: Unify selection summary and refine visuals

**Files:**
- Modify: `web/src/features/configurator/components/configurator-shell.test.tsx`
- Modify: `web/src/features/configurator/components/configurator-shell-styles.test.ts`
- Modify: `web/src/features/configurator/components/functions-step.tsx`
- Modify: `web/src/features/configurator/components/functions-preview.tsx`
- Modify: `web/src/features/configurator/components/review-step.tsx`
- Modify: `web/src/features/configurator/components/configurator-shell.module.css`

- [ ] เพิ่มเทสต์ให้ข้อความผลต่อพื้นที่หายไป, Summary มีหัวข้อเดียว, track ไม่มี vertical overflow และภาพใช้ cover
- [ ] รันเทสต์เพื่อยืนยัน RED
- [ ] รวมรายการที่เลือกทั้งหมดใน “ฟังก์ชันเพิ่มเติมที่เลือก”
- [ ] ปิด `overflow-y`, ทำภาพเต็มกรอบ และปรับไอคอนเส้นชุดเดียวกัน
- [ ] รัน unit, lint, typecheck, build และ Step 2 E2E
