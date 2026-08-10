# Premium Architect Landing Page — Design Specification

- วันที่: 2026-08-10
- สถานะ: ทิศทาง A ได้รับอนุมัติจากเจ้าของผลิตภัณฑ์แล้วเมื่อ 2026-08-10; รอการตรวจ Written Spec ก่อนจัดทำ Implementation Plan
- ผลิตภัณฑ์: KSB Architect Smart Home Design Configurator

## 1. ปัญหาที่ต้องแก้

หน้า `/` ปัจจุบันแสดงเพียง `<main>`, ข้อความ และลิงก์โดยไม่มี class หรือ layout เฉพาะหน้า จึงเห็นเนื้อหาดิบชิดมุมซ้าย แม้ `globals.css` และหน้า `/configurator` จะทำงานตามปกติ ปัญหานี้เป็นช่องว่างของ Landing Page ไม่ใช่ CSS build failure หรือปัญหาการทำงานของ Configurator

## 2. เป้าหมายและงานหลักของหน้า

สร้างหน้าเริ่มต้นที่ทำให้เจ้าของบ้านซึ่งมีงบสร้างบ้านจริงเข้าใจภายในช่วงแรกของหน้าว่าเครื่องมือนี้ช่วยวางกรอบพื้นที่และงบประมาณเบื้องต้นก่อนคุยกับสถาปนิกได้ โดยผู้ใช้ต้องเริ่ม Configurator ได้ทันทีและมั่นใจว่า Preview แรกไม่ขอข้อมูลส่วนตัว

หน้า Landing ต้องสื่อสารอย่างสงบ เป็นมืออาชีพ และไม่ทำให้ KSB ดูเป็นเว็บไซต์ขายบ้านราคาถูกหรือเครื่องคำนวณราคาที่ให้ความแม่นยำเกินจริง

## 3. ขอบเขต

### รวมในงานนี้

- Header ของ KSB พร้อมชื่อผลิตภัณฑ์และช่องทางติดต่อ
- Premium hero แบบสองคอลัมน์บน Desktop และคอลัมน์เดียวบน Mobile
- ภาพบ้าน `contemporary-warm-luxury.png` ที่อยู่ในคลัง Concept ปัจจุบัน
- Primary CTA ไปที่ `/configurator`
- Secondary CTA แบบ anchor ไปยังส่วนอธิบายขั้นตอนในหน้าเดียวกัน
- แถบยืนยันคุณค่าหลัก 3 ข้อ
- ขั้นตอนการใช้งานจริง 3 ขั้น
- ข้อความกำกับขอบเขตของผลลัพธ์และ Final CTA
- Responsive, keyboard focus, reduced-motion และ semantic landmarks
- Unit, end-to-end และ accessibility regression coverage สำหรับพฤติกรรมหลัก

### ไม่รวมในงานนี้

- ระบบบัญชีผู้ใช้หรือหน้าเข้าสู่ระบบ
- Portfolio, testimonial, CMS หรือข้อมูลผลงานโครงการจริง
- การเพิ่ม API, database schema หรือ pricing logic
- Animation library, WebGL หรือ dependency ใหม่
- การเปลี่ยน UI ภายใน Configurator, Preview, Report หรือ Admin

## 4. Information Architecture และข้อความหลัก

### 4.1 Header

- Brand lockup: `KSB ARCHITECT`
- Product label: `HOME PLANNING STUDIO`
- Contact link: `ปรึกษาสถาปนิก 091 991 4592` โดยใช้ `tel:0919914592`
- Header ต้องโปร่งและวางอยู่ในกรอบความกว้างเดียวกับเนื้อหาหลัก ไม่ใช้ navigation หลายรายการที่ยังไม่มีปลายทางจริง

### 4.2 Hero

- Eyebrow: `บริการวางแผนบ้านโดยสถาปนิก`
- H1: `รู้พื้นที่และงบประมาณบ้านก่อนเริ่มสร้าง`
- Supporting statement: `บ้านหรูไม่ได้เริ่มจากวัสดุแพง แต่เริ่มจากการวางแผนพื้นที่ ฟังก์ชัน และกรอบงบประมาณให้สอดคล้องกัน`
- Description: `เลือกความต้องการทีละขั้น เพื่อดู Concept Preview พื้นที่ใช้สอยที่แนะนำ และกรอบงบประมาณเบื้องต้นได้ก่อนให้ข้อมูลติดต่อ`
- Primary CTA: `เริ่มวางแผนบ้าน` → `/configurator`
- Secondary CTA: `ดูขั้นตอนการใช้งาน` → `#process`
- Helper copy ใต้ CTA: `ใช้เวลาประมาณ 3–5 นาที · Preview แรกไม่ต้องกรอกข้อมูลส่วนตัว`

ภาพ Hero ใช้ `/concepts/contemporary-warm-luxury.png` พร้อม alt text ภาษาไทยที่อธิบายว่าเป็นภาพแนวคิดบ้าน Contemporary Warm Luxury ไม่อ้างว่าเป็นผลงานก่อสร้างจริงของ KSB

### 4.3 Value Rail

แสดง 3 คุณค่าที่ตรวจสอบได้จากระบบปัจจุบัน:

1. `01 / กำหนดความต้องการ` — เลือกสไตล์ จำนวนห้อง ทำเล และระดับวัสดุ
2. `02 / เห็นกรอบโครงการ` — ดูพื้นที่ใช้สอย พื้นที่ก่อสร้าง และช่วงงบประมาณเบื้องต้น
3. `03 / คุยกับสถาปนิกต่อได้` — ใช้ข้อมูลสรุปเป็นจุดเริ่มต้นของการปรึกษาอย่างเป็นระบบ

ลำดับเลขใช้เพราะเป็นลำดับกระบวนการจริง ไม่ใช้เป็นของตกแต่ง

### 4.4 Process Section

Section id คือ `process` และใช้หัวข้อ `จากความต้องการ สู่กรอบโครงการที่คุยกับสถาปนิกได้`

- ขั้นที่ 1 `เลือกตามภาพและการใช้งานจริง`
- ขั้นที่ 2 `ระบบสรุปพื้นที่และกรอบงบประมาณ`
- ขั้นที่ 3 `ดู Preview ก่อนตัดสินใจปรึกษาต่อ`

ข้อความต้องใช้ภาษาคนทั่วไป หลีกเลี่ยงศัพท์ระบบ และระบุชัดว่าผู้ใช้ยังแก้ความต้องการย้อนหลังได้จาก Flow ปัจจุบัน

### 4.5 Scope Note และ Final CTA

- Scope note: `ผลลัพธ์เป็นการประเมินเบื้องต้นเพื่อช่วยวางแผน ไม่ใช่แบบก่อสร้าง ใบเสนอราคา หรือราคาผูกพัน`
- Final heading: `บ้านที่อยู่ได้จริง เริ่มจาก Brief ที่ชัดเจน`
- Final CTA: `เริ่มวางแผนบ้าน` → `/configurator`
- Contact CTA: `ปรึกษาฟรี 091 991 4592` → `tel:0919914592`

## 5. Visual Direction

### 5.1 Aesthetic

ใช้แนวทาง `Adaptive Obsidian Luxury` ที่มีอยู่ แต่ตีความผ่านภาษาของสตูดิโอสถาปัตยกรรม: กริดที่แม่นยำ เส้นอ้างอิงบาง ป้ายกำกับแบบ title block และพื้นที่ว่างที่สงบ ภาพรวมต้องดูเหมือน KSB กำลังเริ่มทำ Project Brief ให้ลูกค้า ไม่ใช่ Landing Page สำเร็จรูปของ SaaS

### 5.2 Color Tokens

- Obsidian Canvas: `#090807`
- Architect Surface: `#15120F`
- Warm Ivory: `#F3EEE5`
- Champagne Gold: `#D9B26D`
- Drawing Line: `rgba(217, 178, 109, 0.26)`
- Warm Gray Copy: `#AA9F91`

ใช้สีทองกับเส้นอ้างอิง สถานะ และ CTA เท่าที่จำเป็น หลีกเลี่ยง glow, gradient สีฉูดฉาด และเงาหนัก

### 5.3 Typography

- Display role: `Noto Sans Thai` น้ำหนัก 300–400 ขนาดใหญ่และ line-height แน่น เพื่อให้ภาษาไทยดูร่วมสมัยและสงบ
- Body role: `Noto Sans Thai` น้ำหนัก 400–500 เพื่อความอ่านง่ายและไม่เพิ่ม webfont ใหม่
- Utility role: Latin uppercase จากฟอนต์เดียวกัน น้ำหนัก 600–700 พร้อม letter spacing สำหรับ `KSB ARCHITECT`, project labels และตัวเลขลำดับ

การเลือก family เดียวหลายบทบาทเป็นข้อจำกัดโดยตั้งใจ เพื่อไม่เพิ่ม network/font dependency และรักษาความสอดคล้องกับ Configurator ปัจจุบัน ความแตกต่างสร้างด้วยน้ำหนัก ขนาด ระยะห่าง และโครงสร้าง ไม่ใช้ฟอนต์ตกแต่ง

### 5.4 Layout

Desktop ใช้กริด 12 คอลัมน์ภายในความกว้างสูงสุด 1440px: copy 5 คอลัมน์, ช่องว่าง 1 คอลัมน์ และภาพ 6 คอลัมน์ Hero ต้องเห็น H1, CTA, helper copy และส่วนสำคัญของภาพโดยไม่ต้องเลื่อนบน viewport 1366×768

```text
┌────────────────────────────────────────────────────────────┐
│ KSB ARCHITECT / HOME PLANNING STUDIO        CONTACT        │
├───────────────────────────────┬────────────────────────────┤
│ EYEBROW                       │ PROJECT BRIEF / 01         │
│ H1                            │                            │
│ Supporting copy               │      CONCEPT IMAGE         │
│ [PRIMARY]  [SECONDARY]        │                            │
│ helper copy                   │  style / planning labels   │
├───────────────────────────────┴────────────────────────────┤
│ 01 requirement   02 project frame   03 architect handoff  │
├────────────────────────────────────────────────────────────┤
│ PROCESS: three ordered steps                               │
├────────────────────────────────────────────────────────────┤
│ SCOPE NOTE + FINAL CTA                                     │
└────────────────────────────────────────────────────────────┘
```

Mobile เรียง Header → Hero copy → CTA → image → value rail → process → final CTA ปุ่มหลักกว้างเต็มพื้นที่ที่เหมาะสม ไม่มี horizontal scroll และ touch target สูงอย่างน้อย 44px

### 5.5 Signature Element

จุดจดจำของหน้าคือ `Architect's Briefing Plate`: กรอบภาพ Hero จะมีเส้น crosshair บางและ title block ที่มุมล่าง ระบุ `PROJECT BRIEF / 01`, `CONCEPT STUDY` และ `PRELIMINARY` องค์ประกอบนี้เชื่อมหน้ากับเอกสารสถาปัตยกรรมโดยตรง ใช้เพียงบริเวณ Hero และไม่ทำซ้ำเป็น decoration ทั่วหน้า

## 6. Component และ File Boundaries

- `web/src/app/page.tsx` เป็น semantic page structure และเชื่อม `Link`/`Image`; ไม่มี client state จึงคงเป็น Server Component
- `web/src/app/landing-content.ts` เก็บข้อความภาษาไทยทั้งหมดที่อาจต้องปรับหรือรองรับ locale ในอนาคต
- `web/src/app/landing-page.module.css` เก็บ style เฉพาะ Landing เพื่อไม่ให้ selector รั่วไปยัง Configurator
- `web/src/app/home-page.test.tsx` ตรวจ heading, CTA destinations, trust copy, contact link และ semantic sections
- `web/src/e2e/home-page.e2e.ts` ตรวจเส้นทางเริ่มต้น, critical content และพฤติกรรมบน viewport หลัก

ไม่สร้าง component abstraction เพิ่มหากถูกใช้เพียงหน้าเดียว เพื่อหลีกเลี่ยงโครงสร้างเกินจำเป็น

## 7. Interaction และ Data Flow

Landing ไม่มี API call และไม่มี client-side state:

1. Server render ข้อความจาก `getLandingContent()`
2. `next/image` ส่งภาพตามขนาด viewport
3. Primary CTA เปิด `/configurator`
4. Secondary CTA เลื่อนไป `#process` ด้วย native anchor behavior
5. Contact CTA เปิด dialer ผ่าน `tel:`

เมื่อ JavaScript โหลดไม่สำเร็จ ลิงก์และเนื้อหาหลักยังต้องใช้งานได้

## 8. Responsive, Accessibility และ Performance

- ใช้ `<header>`, `<main>`, `<section>`, heading order และ `<footer>` อย่างมีความหมาย
- ทุกลิงก์มี accessible name ที่ตรงกับผลของการกด
- `:focus-visible` ต้องเห็นชัดบนพื้นดำ
- สีข้อความและ CTA ต้องผ่าน WCAG AA; ไม่ใช้สีเพียงอย่างเดียวสื่อข้อมูล
- เคารพ `prefers-reduced-motion`; ไม่เพิ่ม animation ที่จำเป็นต่อความเข้าใจ
- ภาพ Hero ใช้ `next/image`, `sizes`, responsive crop และ preload เฉพาะภาพ above-the-fold
- ที่ 360px ต้องไม่มี horizontal overflow และเนื้อหา/ปุ่มไม่ถูกตัด
- ที่ 1366×768 ต้องเห็น CTA หลักโดยไม่ต้องเลื่อน

## 9. Error Handling และ Fallback

- หากภาพโหลดไม่ได้ เนื้อหาและ CTA ยังอยู่ใน DOM และ alt text บอกบริบทได้
- หากโทรศัพท์ไม่รองรับ `tel:` ลิงก์ยังแสดงหมายเลขให้คัดลอกได้
- ไม่ซ่อน CTA ด้วย JavaScript, animation หรือ viewport detection
- ไม่เพิ่มข้อความรับประกันราคา ระยะเวลาติดต่อ หรือข้อมูลผลงานที่ยังไม่ได้รับการยืนยัน

## 10. Testing และ Acceptance Criteria

### Automated Tests

- Unit test ยืนยัน H1, primary CTA `/configurator`, secondary anchor `#process`, contact `tel:0919914592`, Preview-without-PII copy และ scope note
- E2E test ยืนยันหน้าไทยแสดง critical content และ primary CTA นำไป `/configurator`
- E2E responsive assertion ยืนยัน `document.documentElement.scrollWidth <= document.documentElement.clientWidth` ที่ viewport 360×800
- Accessibility scan ของ Landing ต้องไม่มี serious หรือ critical violations
- Typecheck, lint และ production build ต้องผ่าน

### Visual QA

- Desktop: 1366×768 และ 1920×1080
- Mobile: 360×800 และ 390×844
- ตรวจ Thai wrapping, crop ของภาพ, contrast, keyboard focus และ CTA above the fold

### Definition of Done

- หน้า `/` ไม่ปรากฏเป็นข้อความดิบชิดมุมอีกต่อไป
- ผู้ใช้เข้าใจสิ่งที่จะได้รับ ขอบเขตผลลัพธ์ และเงื่อนไขไม่ขอข้อมูลก่อน Preview ภายใน Hero
- Primary CTA ไปถึง Configurator และใช้งานได้ด้วย mouse, keyboard และ touch
- ดีไซน์ต่อเนื่องกับหน้า Configurator แต่มี Hero ที่โดดเด่นแบบ Architect's Briefing Plate
- Automated verification และ Visual QA ตามรายการข้างต้นผ่านโดยไม่มี regression ที่เกี่ยวข้อง

