# Step 5 Review Redesign — Implementation Plan

**Goal:** ปรับ Step 5 ให้เป็นหน้าตรวจสอบข้อมูลจาก Step 1–4 แบบ read-only ตามภาพอ้างอิง โดยไม่แสดงราคาคำนวณและไม่สร้างแหล่งข้อมูลซ้ำ

1. เพิ่ม presentation model สำหรับแปลง configuration ปัจจุบันเป็นข้อความผู้ใช้ พร้อม fallback และ readiness state
2. เขียน focused tests สำหรับ state continuity, label mapping, edit navigation, preview และ CTA `/preview`
3. สร้าง Step 5 workspace แบบสองคอลัมน์ พร้อม review cards, preview, readiness, next benefits และ bottom actions
4. เชื่อม workspace เข้ากับ ConfiguratorShell เฉพาะ Step 5 โดยรักษา Step 1–4 และ draft persistence เดิม
5. รัน focused tests, typecheck, lint, build และตรวจ responsive screenshots ตาม viewport ที่กำหนด
