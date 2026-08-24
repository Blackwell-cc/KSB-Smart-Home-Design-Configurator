# Step 2 Viewport and Additional Requirements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** ทำให้ Step 2 พอดี viewport บน desktop เพิ่มแถบฟังก์ชันเลื่อนแนวนอน และบันทึกรายการความต้องการใหม่โดยไม่กระทบสูตรพื้นที่

**Architecture:** เพิ่ม `additionalRequirements` เป็น array แบบ enum ใน configuration แยกจาก `functions` เดิม และทำ migration สำหรับ draft เก่าที่ไม่มี field นี้ UI แสดงทั้งสองกลุ่มใน carousel เดียว แต่ `calculateArea` อ่านเฉพาะ `functions` เหมือนเดิม CSS ถูก scope เฉพาะ Step 2

**Tech Stack:** Next.js 16, React 19, TypeScript, Zod, Zustand, CSS Modules, Vitest, Playwright

## Global Constraints

- Desktop ตั้งแต่ 1200px ต้องไม่เลื่อนทั้ง document; tablet/mobile ยังคงเลื่อนแนวตั้ง
- รายการใหม่เป็น requirement เท่านั้นและต้องไม่เปลี่ยนผล `calculateArea`
- แถบการ์ดเลื่อนแนวนอนด้วย touch, wheel/trackpad และปุ่มลูกศร
- Preview ใช้โทนน้ำเงินดำ มี vignette/ambient gold และไม่มีข้อความซ้อนภาพ
- ไม่เปลี่ยน Step 1 หรือ Step 3–5

---

### Task 1: Data model and non-pricing behavior

**Files:** `configuration.ts`, `configuration.test.ts`, `draft-storage.ts`, `calculate-area.test.ts`

- [ ] เขียนเทสต์ให้ schema รับ enum requirements, draft เก่า migrate เป็น array ว่าง และพื้นที่ไม่เปลี่ยนเมื่อเลือก requirement
- [ ] รัน focused tests ให้ RED
- [ ] เพิ่ม enum/schema/default/migration โดยไม่เพิ่มรายการใหม่ในสูตรพื้นที่
- [ ] รัน focused tests ให้ GREEN

### Task 2: Step 2 carousel and viewport layout

**Files:** `functions-step.tsx`, `functions-preview.tsx`, `configurator-shell.tsx`, `configurator-shell.module.css`, component tests

- [ ] เขียนเทสต์ให้ requirement cards อัปเดต state และ summary
- [ ] เพิ่ม data-driven horizontal carousel พร้อมปุ่มซ้าย/ขวา
- [ ] ลด spacing/title line-height และล็อก desktop Step 2 ที่ `100svh`
- [ ] ปรับ preview stage เป็นโทนน้ำเงินดำตามภาพอ้างอิงที่ 3

### Task 3: Visual and release verification

**Files:** `configurator-step-two.e2e.ts`

- [ ] ตรวจ 1440×900 และ 1920×1080 ว่า document ไม่ scroll
- [ ] ตรวจ carousel scroll, no overflow, tablet/mobile และ visual screenshot
- [ ] รัน typecheck, lint, unit, E2E, build และ diff check
