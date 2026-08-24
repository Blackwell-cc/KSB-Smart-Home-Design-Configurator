# Step 2 Heading Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** จัดระยะกลุ่มหัวข้อบนหน้า Step 2 ไม่ให้ข้อความภาษาไทยซ้อนกัน และรวมชื่อส่วนฟังก์ชันเพิ่มเติมกับปุ่มเลื่อนให้อยู่ในแถวเดียวกัน

**Architecture:** คง `FunctionsStep` และ state handlers เดิมทั้งหมด เปลี่ยนเฉพาะ semantic heading wrapper ภายใน `fieldset` และ CSS ที่ scope ด้วย `data-step="functions"` เพื่อไม่ให้กระทบขั้นตอนอื่น ใช้ style contract test เป็น regression guard ก่อนแก้ production code

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Testing Library

## Global Constraints

- ห้ามเปลี่ยนสูตรพื้นที่ งบประมาณ หรือ business logic
- ห้ามเปลี่ยนรายการและพฤติกรรมการเลือกฟังก์ชันเพิ่มเติม
- ห้ามแก้หน้าแรกหรือขั้นตอนอื่น
- ต้องคงชื่อกลุ่ม `fieldset` ให้โปรแกรมอ่านหน้าจอเข้าถึงได้
- ต้องไม่มี horizontal overflow บนหน้าจอแคบ

---

### Task 1: จัดลำดับชั้นและแนวหัวข้อ Step 2

**Files:**
- Modify: `web/src/features/configurator/components/configurator-shell-styles.test.ts`
- Modify: `web/src/features/configurator/components/functions-step.tsx`
- Modify: `web/src/features/configurator/components/configurator-shell.module.css`

**Interfaces:**
- Consumes: `FunctionsStepProps`, `styles.visuallyHidden`, `moveCarousel(direction)` และ state handlers เดิม
- Produces: `.choiceHeading` ที่มี `.choiceTitle` ทางซ้ายและ `.carouselActions` ทางขวา พร้อมระยะ `.eyebrow`, `h1`, `.intro` ที่ไม่ซ้อนกัน

- [ ] **Step 1: เขียน style contract test ที่ยังไม่ผ่าน**

เพิ่ม assertion ต่อไปนี้ใน test ของ Step 2:

```ts
expect(stylesheet).toMatch(/\.shell\[data-step="functions"\] \.eyebrow\s*\{[^}]*line-height:\s*1\.25;/);
expect(stylesheet).toMatch(/\.shell\[data-step="functions"\] \.formPanel h1\s*\{[^}]*margin-top:\s*10px;/);
expect(stylesheet).toMatch(/\.shell\[data-step="functions"\] \.intro\s*\{[^}]*margin-top:\s*3px;/);
expect(stylesheet).toMatch(/\.choiceHeading\s*\{[^}]*justify-content:\s*space-between;/);
expect(stylesheet).toMatch(/\.choiceTitle\s*\{[^}]*display:\s*flex;[^}]*align-items:\s*baseline;/);
```

- [ ] **Step 2: รัน test เพื่อยืนยัน RED**

Run:

```powershell
npm test -- src/features/configurator/components/configurator-shell-styles.test.ts
```

Expected: FAIL เพราะยังไม่มี Step 2 eyebrow rule, margin ใหม่ และ `.choiceTitle`

- [ ] **Step 3: ปรับ semantic markup ของหัวข้อฟังก์ชัน**

ใน `functions-step.tsx` คงชื่อกลุ่มสำหรับ accessibility ด้วย hidden legend และสร้าง visual row จริง:

```tsx
<fieldset className={styles.choiceFieldset}>
  <legend className={styles.visuallyHidden}>
    ฟังก์ชันเพิ่มเติม (เลือกได้หลายข้อ)
  </legend>
  <div className={styles.choiceHeading}>
    <div aria-hidden="true" className={styles.choiceTitle}>
      <strong>ฟังก์ชันเพิ่มเติม</strong>
      <span>(เลือกได้หลายข้อ)</span>
    </div>
    <div className={styles.carouselActions}>
      <button aria-label="เลื่อนตัวเลือกไปทางซ้าย" onClick={() => moveCarousel(-1)} type="button">←</button>
      <button aria-label="เลื่อนตัวเลือกไปทางขวา" onClick={() => moveCarousel(1)} type="button">→</button>
    </div>
  </div>
  {/* คง functionCarouselTrack และรายการเดิมทั้งหมด */}
</fieldset>
```

- [ ] **Step 4: ปรับ CSS ระยะและแนวจัดวางแบบ scoped**

แก้ `configurator-shell.module.css` ด้วยค่าต่อไปนี้:

```css
.shell[data-step="functions"] .eyebrow { line-height: 1.25; }
.shell[data-step="functions"] .formPanel h1 { margin-top: 10px; }
.shell[data-step="functions"] .intro { margin-top: 3px; }
.shell[data-step="functions"] .choiceFieldset { min-height: 0; gap: 7px; }
.choiceHeading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.choiceTitle { min-width: 0; display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px; color: var(--config-ivory); }
.choiceTitle strong { font-size: 1rem; font-weight: 600; }
.choiceTitle span { color: var(--config-muted); font-size: 0.72rem; font-weight: 400; }
```

ลบ rule ที่อ้างถึง visible legend ของ Step 2 ซึ่งไม่ถูกใช้อีก แต่คง `.visuallyHidden` เดิมไว้

- [ ] **Step 5: รัน focused tests เพื่อยืนยัน GREEN**

Run:

```powershell
npm test -- src/features/configurator/components/configurator-shell-styles.test.ts src/features/configurator/components/configurator-shell.test.tsx
```

Expected: PASS ทุก test โดยกลุ่ม checkbox และปุ่มเลื่อนยังเข้าถึงได้เหมือนเดิม

- [ ] **Step 6: รันการตรวจคุณภาพทั้งหมดที่เกี่ยวข้อง**

Run:

```powershell
npm run typecheck
npm run lint
npm test -- src/features/configurator/components/configurator-shell-styles.test.ts src/features/configurator/components/configurator-shell.test.tsx
```

Expected: ทุกคำสั่ง exit code 0

- [ ] **Step 7: ตรวจหน้า Step 2 จริง**

เปิด `http://localhost:3000/configurator` และตรวจว่า:

- `ขั้นตอน 2 / 5` ไม่ซ้อนกับหัวข้อหลัก
- หัวข้อหลักกับคำอธิบายเป็นกลุ่มเดียวกันและยังอ่านง่าย
- ชื่อ `ฟังก์ชันเพิ่มเติม (เลือกได้หลายข้อ)` อยู่ซ้าย และปุ่มลูกศรอยู่ขวาในแถวเดียวกัน
- ไม่มี horizontal overflow และไม่มี console error

- [ ] **Step 8: ตรวจ diff และ commit เฉพาะไฟล์งานนี้**

```powershell
git diff --check -- web/src/features/configurator/components/configurator-shell-styles.test.ts web/src/features/configurator/components/functions-step.tsx web/src/features/configurator/components/configurator-shell.module.css
git add -- web/src/features/configurator/components/configurator-shell-styles.test.ts web/src/features/configurator/components/functions-step.tsx web/src/features/configurator/components/configurator-shell.module.css docs/superpowers/plans/2026-08-13-step-two-heading-alignment.md
git commit -m "fix: align step two headings"
```

Expected: diff ไม่มี whitespace error และ commit มีเฉพาะไฟล์ตามรายการ
