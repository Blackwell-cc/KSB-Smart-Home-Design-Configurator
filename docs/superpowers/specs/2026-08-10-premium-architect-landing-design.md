# Premium Architect Single-Hero Landing — Design Specification

- วันที่: 2026-08-10
- สถานะ: อนุมัติให้แก้ไขและดำเนินการต่อเมื่อ 2026-08-10
- เจ้าของผลิตภัณฑ์: KSB Architect

## 1. เป้าหมาย

ปรับหน้า `/` ให้เปิดมาแล้วน่าสนใจในทันที มีเพียง Hero section เดียว อ่านง่าย ดูเรียบหรู และพาผู้ใช้ไปเริ่มวางแผนบ้านได้โดยไม่ต้องเลื่อนผ่านเนื้อหาซ้ำหลายส่วน

หน้าแรกมีหน้าที่เดียว: อธิบายคุณค่าของ Smart Home Design Configurator และพาผู้ใช้กด `เริ่มวางแผนบ้าน`

## 2. ทิศทางที่เลือก

ใช้แนวทาง `Editorial Split Hero`:

- Navbar กว้างเต็ม viewport ไม่ถูกครอบด้วย max-width
- โลโก้จริงอยู่ซ้ายสุดภายใน safe padding ของจอ
- Hero แบ่งข้อความด้านซ้ายและภาพบ้านด้านขวา
- เส้นแนวนอนสีทองบางเชื่อมสองฝั่ง เป็น `Architectural Horizon` และเป็น signature element เพียงจุดเดียว
- ตัด value rail, process section, final CTA และ footer ออกจากหน้าแรก
- คงความรู้สึกสงบ มั่นใจ และเป็นมืออาชีพ ไม่ใช้เอฟเฟกต์หรือกราฟิกตกแต่งเกินจำเป็น

แนวทางนี้ถูกเลือกแทนภาพเต็มจอพร้อมข้อความทับ เพราะคุมความอ่านง่ายของภาษาไทยได้ดีกว่า และถูกเลือกแทน layout กึ่งกลางทั่วไปเพราะสื่อบุคลิกสตูดิโอสถาปัตย์ได้ชัดกว่า

## 3. โครงสร้างหน้า

```text
┌──────────────────────────────────────────────────────────────────────┐
│ [KSB LOGO]                                  ปรึกษาสถาปนิก  เบอร์โทร │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  บริการวางแผนบ้านโดยสถาปนิก        ┌─────────────────────────────┐ │
│  รู้พื้นที่และงบประมาณบ้าน           │                             │ │
│  ก่อนเริ่มสร้าง                      │       CONCEPT IMAGE         │ │
│  supporting copy                    │                             │ │
│  [เริ่มวางแผนบ้าน ↗] [ปรึกษาฟรี]   │   concise project caption   │ │
│  helper / trust note                └─────────────────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

Semantic structure มี `<header>` หนึ่งส่วน และ `<main>` ที่มี `<section>` เพียงหนึ่ง section เท่านั้น ไม่มี footer บนหน้าแรก

## 4. เนื้อหา

- Eyebrow: `บริการวางแผนบ้านโดยสถาปนิก`
- H1: `รู้พื้นที่และงบประมาณบ้าน ก่อนเริ่มสร้าง`
- Supporting statement: `บ้านหรูไม่ได้เริ่มจากวัสดุแพง แต่เริ่มจากการวางแผนพื้นที่ ฟังก์ชัน และกรอบงบประมาณให้สอดคล้องกัน`
- Primary CTA: `เริ่มวางแผนบ้าน` ไป `/configurator`
- Secondary CTA: `ปรึกษาฟรี` ไป `tel:0919914592`
- Helper: `ใช้เวลาประมาณ 3–5 นาที · Preview แรกไม่ต้องกรอกข้อมูลส่วนตัว`
- Contact ใน Navbar: `ปรึกษาสถาปนิก` และ `091 991 4592`

ตัดข้อความกระบวนการและ CTA ที่ซ้ำกันออก ไม่เพิ่มคำรับประกันราคา ระยะเวลาออกแบบ หรือข้อความขายเกินจริง

## 5. ระบบภาพ

### 5.1 สี

- Obsidian: `#080807` — พื้นหลังหลัก
- Charcoal: `#151310` — ผิวรองและ caption overlay
- Architectural Gold: `#CBAA6A` — CTA และเส้น horizon
- Soft Gold: `#E8D2A4` — eyebrow และข้อมูลสำคัญ
- Warm Ivory: `#F4F0E8` — หัวเรื่อง
- Stone: `#AAA198` — ข้อความรอง

### 5.2 Typography

ใช้ Google Font `Prompt` เป็นฟอนต์หลักใหม่ทั้งภาษาไทยและข้อความ Latin เพื่อให้หน้า Landing และ Configurator ต่อเนื่องกัน

- H1: Prompt 400, responsive `clamp(3rem, 5vw, 5.5rem)`, line-height ประมาณ `1.08`
- Supporting statement: Prompt 400–500, line-height `1.7`
- Body/helper: Prompt 300–400, line-heightอย่างน้อย `1.6`
- Labels: Prompt 500–600 ใช้ letter spacing อย่างระมัดระวัง ไม่บีบตัวอักษรไทย

### 5.3 โลโก้

- Source: `D:\KSB Smart Home Design Configurator\LOGO.png`
- ส่งสำเนาเข้า `web/public/brand/ksb-architect-logo.png`
- แสดงด้วย `next/image` โดยคงสัดส่วน ไม่บิดภาพ
- Navbar desktop ให้โลโก้มี visual width ประมาณ `132–160px`; mobile ประมาณ `104–124px`
- เนื่องจาก source มีพื้นที่โปร่งรอบตราสัญลักษณ์ ให้ใช้ wrapper ที่ clip อย่างควบคุมและ scale ภาพภายในเพื่อให้ตราสัญลักษณ์มีขนาดพอดี โดยไม่แก้รูปทรงหรือสีของโลโก้

### 5.4 ภาพ Hero

ใช้ `/concepts/contemporary-warm-luxury.png` เป็นภาพหลัก แสดงแบบ cover และรักษาบริเวณตัวบ้านเป็น focal point มี gradient มืดเฉพาะส่วนล่างเพื่อรองรับ caption สั้น ห้ามใช้ title block หรือ crosshair จำนวนมากแบบเวอร์ชันเดิม

## 6. Responsive

- Desktop `>= 900px`: Hero สูงอย่างน้อย `calc(100svh - navbar)` แบ่ง copy ประมาณ 43% และภาพ 57%
- Navbar เต็มจอ ใช้ safe padding `clamp(20px, 3vw, 56px)` ไม่ใช้ container กึ่งกลาง
- ที่ viewport `1366×768` ต้องเห็น H1, CTA, helper และส่วนสำคัญของภาพโดยไม่ต้องเลื่อน
- Mobile `< 900px`: เรียง copy ก่อนภาพภายใน section เดียว ปุ่มเต็มความกว้างเมื่อจอแคบ และไม่เกิด horizontal overflow
- Touch target ทุกปุ่ม/ลิงก์สำคัญสูงอย่างน้อย `44px`

## 7. Interaction และ Accessibility

- หน้าเป็น Server Component และไม่มี API call/client state
- Primary CTA ไป `/configurator`; secondary และ Navbar contact ใช้ `tel:0919914592`
- โลโก้ลิงก์กลับ `/` และมี accessible name `KSB Architect หน้าแรก`
- ภาพแนวคิดมี alt text ภาษาไทยที่สื่อบริบท
- `:focus-visible` เห็นชัดบนพื้นมืด
- เคารพ `prefers-reduced-motion`
- สีข้อความและปุ่มต้องผ่าน WCAG AA

## 8. File Boundaries

- `web/src/app/page.tsx`: semantic structure ของ Navbar และ Hero เดียว
- `web/src/app/landing-content.ts`: copy ที่ใช้จริงบนหน้าแรกเท่านั้น
- `web/src/app/landing-page.module.css`: layout และ visual tokens เฉพาะ Landing
- `web/src/app/fonts.ts`: โหลด Prompt ผ่าน `next/font/google`
- `web/src/app/globals.css`: ผูกตัวแปร global font ใหม่
- `web/public/brand/ksb-architect-logo.png`: สำเนาโลโก้สำหรับเว็บ
- `web/src/app/home-page.test.tsx`: unit acceptance ของ single section, logo และ CTA
- `web/src/e2e/home-page.e2e.ts`: navigation, responsive และ above-the-fold acceptance

## 9. Testing และ Definition of Done

- Unit test ยืนยันว่ามี section เดียว, โลโก้จริง, H1, CTA `/configurator`, contact `tel:` และ trust note
- Unit test ยืนยันว่าไม่มี process/final CTA ที่ซ้ำจากเวอร์ชันเดิม
- E2E desktop ยืนยัน CTA หลักอยู่ใน viewport ที่ `1366×768`
- E2E mobile ยืนยันไม่มี horizontal overflow และ CTA สูงอย่างน้อย `44px`
- Typecheck, lint, unit tests และ production build ผ่าน
- Visual QA ที่ `1366×768`, `1920×1080`, `390×844` และ `360×800`
- โลโก้ไม่ยืด ไม่เล็กจนอ่านไม่ออก และชิดซ้ายตาม safe padding
- หน้าแรกมี Hero section เดียว อ่านง่าย และยังเข้าถึง Configurator/โทรปรึกษาได้ด้วย mouse, keyboard และ touch

