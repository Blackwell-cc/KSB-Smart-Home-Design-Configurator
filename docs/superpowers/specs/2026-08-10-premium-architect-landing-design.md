# Consumer Configurator Hero — Design Specification

- วันที่: 2026-08-10
- สถานะ: อนุมัติทิศทาง Reference-faithful เมื่อ 2026-08-10
- ภาพอ้างอิง: `D:\KSB Smart Home Design Configurator\Ref-hero1.png`
- ขอบเขต: หน้า `/` เท่านั้น

## 1. เป้าหมาย

สร้างหน้าเปิดตัวสำหรับ Smart Home Design Configurator ที่ใกล้เคียงภาพอ้างอิงทั้งองค์ประกอบ สัดส่วน ลำดับสายตา และบรรยากาศ โดยให้ผู้ใช้ทั่วไปเข้าใจทันทีว่าเขาสามารถเลือกสไตล์บ้าน ฟังก์ชัน พื้นที่ และการตกแต่ง เพื่อดูภาพ Preview และกรอบงบประมาณเบื้องต้นได้ง่าย ๆ

หน้ามีหน้าที่หลักสองอย่าง:

1. สร้างความสนใจด้วยภาพบ้านและตัวอย่างหน้าจอ Configurator ที่ดูจับต้องได้
2. พาผู้ใช้ไปเริ่มทำแบบประเมินที่ `/configurator`

น้ำเสียงต้อง Premium แต่เป็นมิตร ไม่แข็งแบบบริษัทสถาปัตย์ ไม่เร่งขาย และไม่ทำให้ข้อมูลตัวอย่างดูเป็นราคาที่รับรองแล้ว

## 2. แนวทางที่เลือก

ใช้ `Reference-faithful Consumer Hero` ซึ่งใกล้ภาพอ้างอิงที่สุด:

- Header เต็มความกว้าง มีโลโก้ เมนูกลาง โทรศัพท์ และ CTA
- Hero desktop แบ่งข้อความประมาณ 40% และภาพบ้านประมาณ 60%
- ภาพบ้านเป็น visual focus และมีการ์ด Configurator ลอยรอบตัวบ้าน
- เนื้อหาด้านซ้ายประกอบด้วย Headline, Supporting Copy, CTA, Trust Row และ Simple Steps
- การ์ดเป็น HTML/CSS จริง มีข้อความและภาพที่เข้าถึงได้ แต่ไม่รับ input และไม่เปลี่ยนค่าบนหน้า
- การ์ดลอยช้า ๆ คนละจังหวะด้วย CSS เพื่อเพิ่มชีวิตให้หน้า โดยไม่ใช้ Three.js หรือ dependency เพิ่ม

แนวทางนี้ถูกเลือกแทนเวอร์ชัน Simplified เพราะผู้ใช้ต้องการความใกล้เคียงภาพอ้างอิง และเลือกแทน Full-bleed text overlay เพราะควบคุมความอ่านง่ายภาษาไทยและ Responsive ได้ดีกว่า

## 3. โครงสร้างและลำดับเนื้อหา

หน้า `/` ยังคงเป็น Server Component และมี `<section>` หลักเพียงหนึ่ง Hero section

```text
┌───────────────────────────────────────────────────────────────────────┐
│ LOGO          เริ่มต้น  แบบบ้าน  วิธีใช้งาน  FAQ    PHONE    CTA     │
├───────────────────────────────────────────────────────────────────────┤
│  บ้านในฝันของคุณ          ┌─────────────────────────────────────────┐ │
│  ราคาเท่าไหร่?            │ STYLE          CINEMATIC HOUSE   BUDGET │ │
│  concise supporting copy  │      AREA                         SHARE │ │
│  explanation              │ MATERIAL                            UI │ │
│  [เริ่มประเมินฟรี] [ดูตัวอย่างบ้าน]                              │ │
│  TRUST · TRUST · TRUST    └─────────────────────────────────────────┘ │
│  3 ขั้นตอนง่าย ๆ                                                     │
│  FAQ disclosure                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

Desktop ใช้ CSS Grid areas:

```text
content   house-preview
benefits  house-preview
steps     house-preview
faq       house-preview
```

Mobile เปลี่ยน DOM presentation เป็น:

```text
header → content → CTA → house preview → demo cards → benefits → steps → FAQ
```

## 4. Header และ Navigation

- Header สูงประมาณ `88–96px` บน desktop และ `72–80px` บน mobile
- ใช้โลโก้ `/brand/ksb-architect-logo.png` โดยคงสัดส่วนและ crop เฉพาะพื้นที่โปร่งของ source อย่างควบคุม
- Desktop navigation:
  - `เริ่มต้น` → `#start`
  - `แบบบ้าน` → `#house-preview`
  - `วิธีใช้งาน` → `#how-it-works`
  - `คำถามที่พบบ่อย` → `#faq`
- Active item `เริ่มต้น` มีเส้นทองด้านล่าง
- ด้านขวาแสดง phone icon, `091 991 4592` และ CTA `ลองประเมินฟรี` ไป `/configurator`
- Mobile ใช้ native `<details>`/`<summary>` สำหรับเมนูเพื่อลด client JavaScript และคง keyboard semantics
- Header ใช้ `position: sticky` เพื่อให้ CTA และ navigation เข้าถึงได้ระหว่างหน้า Mobile ที่ยาวขึ้น โดยพื้นหลังต้องทึบพอไม่รบกวนการอ่าน

## 5. Hero Content

### 5.1 Headline

- บรรทัดที่ 1: `บ้านในฝันของคุณ`
- บรรทัดที่ 2: `ราคาเท่าไหร่?`
- บรรทัดแรกใช้ Warm Ivory น้ำหนัก 600
- บรรทัดที่สองใช้ Champagne Gold น้ำหนัก 500–600
- ใช้ Prompt ทั้งภาษาไทยและ Latin
- Desktop display size ประมาณ `clamp(4rem, 5vw, 6.3rem)` และลดลงอย่างมีจังหวะบน tablet/mobile
- line-height ประมาณ `1.04–1.1` เพื่อคงความแน่นแต่ไม่ชนวรรณยุกต์ไทย

### 5.2 Supporting Copy

ข้อความหลัก:

> ลองเลือกสไตล์ ฟังก์ชัน และการตกแต่ง
>
> เพื่อดูงบประมาณและภาพบ้านเบื้องต้นของคุณ

คำอธิบาย:

> เครื่องมือช่วยวางแผนบ้านที่เข้าใจง่าย ให้คุณเห็นภาพบ้านในฝัน พร้อมงบประมาณเบื้องต้น ก่อนตัดสินใจคุยรายละเอียดกับสถาปนิก

ข้อความต้องสั้น เป็นมิตร และไม่ใช้ภาษารับรองราคา

### 5.3 Actions

- Primary CTA `เริ่มประเมินฟรี` ไป `/configurator`
- Secondary CTA `ดูตัวอย่างบ้าน` ไป `#house-preview`
- Primary ใช้พื้น Champagne Gold; Secondary ใช้พื้นโปร่ง/ดำพร้อมเส้นทอง
- ทั้งสองมี touch target สูงอย่างน้อย `48px`
- มี hover, active และ `:focus-visible` ที่แยกจากกันชัดเจน

## 6. Trust Row และ Simple Steps

### Trust Row

แสดง benefit 3 รายการพร้อม inline SVG icon และ divider บาง:

- `ใช้เวลา 3–5 นาที`
- `ไม่ต้องกรอกข้อมูลก่อน`
- `แชร์ผลลัพธ์ให้ครอบครัวได้`

### Simple Steps

การ์ดรองหัวข้อ `3 ขั้นตอนง่าย ๆ เพื่อบ้านในฝัน`:

1. `เลือกสไตล์`
2. `ปรับฟังก์ชัน`
3. `ดูราคาและภาพตัวอย่าง`

Simple Steps ต้องดูเบากว่า CTA และไม่แย่งความเด่นจากภาพบ้าน

### FAQ

เพิ่ม native `<details id="faq">` แบบกระชับใต้ Simple Steps เพื่อให้ navigation มีปลายทางจริง โดยมีคำตอบสั้นเกี่ยวกับ:

- ผลลัพธ์เป็นการประเมินเบื้องต้น
- ไม่ต้องให้ข้อมูลส่วนตัวก่อนเห็น Preview
- สามารถกลับไปแก้ตัวเลือกและแชร์ผลลัพธ์ได้

สถานะเริ่มต้นปิดอยู่ จึงไม่รบกวนองค์ประกอบหลักแบบภาพอ้างอิง

## 7. House Showcase และ Floating Cards

### 7.1 ภาพหลัก

ใช้ asset ที่มีอยู่แล้ว:

`/concepts/contemporary-warm-luxury.png`

เหตุผล: เป็นภาพบ้านร่วมสมัยแสงอุ่นช่วงเย็น เหมาะกับ reference มากที่สุดและมีพื้นที่รอบบ้านพอสำหรับวางการ์ด

- ใช้ `next/image` พร้อม responsive `sizes`
- crop ให้บ้านกินพื้นที่ฝั่งขวาส่วนใหญ่และรักษาส่วนหลังคา/หน้าบ้าน
- เพิ่ม gradient มืดบริเวณขอบซ้ายและล่าง เพื่อเชื่อมกับพื้นหลังและรักษาความอ่านง่ายของการ์ด
- ไม่ใช้ภาพอ้างอิงเป็น background สำเร็จรูป

### 7.2 Style Card

- Label: `สไตล์บ้าน`
- Selected: `Modern Warm`
- ใช้ภาพแนวคิดที่มีอยู่ 3 ภาพเป็น thumbnail
- thumbnail แรกมี selected outline และ check indicator แบบ static

### 7.3 Area Card

- Label: `พื้นที่ใช้สอย`
- Value: `320 ตร.ม.`
- มี slider visualization แบบ `aria-hidden="true"` ไม่ใช้ `<input>` เพื่อไม่ทำให้เข้าใจว่าปรับค่าได้

### 7.4 Material Card

- Label: `ระดับวัสดุและการตกแต่ง`
- Selected: `Premium`
- แสดง swatch 4 ชิ้นจากโทนไม้ หิน กระจก และผิวสีอ่อน
- swatch selected เป็น static state

### 7.5 Budget Card

- Label: `งบประมาณเริ่มต้น`
- Value: `5.8 – 6.9 ล้านบาท`
- Supporting text: `ช่วงราคาประมาณการเบื้องต้น`
- Affordance text: `ดูรายละเอียด`
- ต้องมีข้อความ `ตัวอย่างหน้าจอ · ไม่ใช่ราคาประเมิน` อยู่ภายในการ์ดและอ่านได้
- `ดูรายละเอียด` เป็น styled text ไม่ใช่ button/link เพราะการ์ดไม่รับ interaction
- ไม่มีการเรียก pricing API และไม่เชื่อมกับ Price Book

### 7.6 Share Preview Card

- Text: `Preview พร้อมแชร์`
- ใช้ภาพบ้าน thumbnail ขนาดเล็ก
- แสดง share icon เป็น decoration ไม่ใช่ปุ่ม

### 7.7 Card Styling และ Motion

- Dark translucent surface `rgba(20, 18, 15, 0.82–0.9)`
- Warm border opacity ต่ำ, backdrop blur ไม่เกิน `10px`
- Radius `16px` เป็นค่าเริ่มต้น ปรับได้ระหว่าง `14–20px`
- Shadow ดำโปร่งและ gold glow ที่ restrained
- แต่ละ card มี animation duration ต่างกันระหว่าง `7–11s`
- ระยะลอยไม่เกิน `6px` และไม่หมุนจนข้อความสั่น
- hover บน desktop เพิ่ม lift เล็กน้อยที่ inner surface โดยไม่เปลี่ยนความหมาย
- `prefers-reduced-motion: reduce` ปิด animation และ transform ที่ไม่จำเป็นทั้งหมด

## 8. Responsive Behavior

### Desktop `>= 1200px`

- Grid 40/60 โดย house visual เป็น visual focus
- การ์ดทั้ง 5 ใบ overlay รอบบ้านแต่ไม่บังประตู หลังคา และศูนย์กลางตัวบ้าน
- Hero สูงอย่างน้อย `calc(100svh - header)` และรองรับความสูงเนื้อหาโดยไม่ตัด

### Tablet `768–1199px`

- Header ลดช่องว่างและย่อ navigation ตามพื้นที่
- ที่ `1024–1199px` ใช้ split layout และย่อการ์ด/ระยะลอยให้พอดีกับพื้นที่
- ที่ `768–1023px` เปลี่ยนเป็น one-column: content ก่อน house visual และ demo cards ย้ายออกจาก overlay เป็น grid ปกติใต้ภาพ; เป็นการ reposition บน tablet ตามขอบเขตคำขอเดิม โดยไม่กำหนด 900px split

### Mobile `<600px`

- Headline และ CTA มาก่อนภาพ
- CTA เรียงแนวตั้งเต็มความกว้าง
- House image ใช้อัตราส่วนประมาณ `4:3` หรือ `5:4` และรักษา meaningful crop
- Demo cards เรียงหนึ่งคอลัมน์ตามลำดับ Style → Area → Material → Budget → Share
- Benefits และ Simple Steps อยู่หลัง cards
- ไม่มี horizontal overflow ที่ `375px`
- navigation ใช้ mobile menu และ touch target อย่างน้อย `44px`

## 9. Component และ File Boundaries

- `web/src/app/page.tsx`
  - ประกอบหน้าเท่านั้นและยังเป็น Server Component
- `web/src/app/landing-content.ts`
  - เก็บ copy, navigation, benefits, steps และ static card content เพื่อลดข้อความซ้ำ
- `web/src/app/landing-header.tsx`
  - โลโก้, desktop nav, phone CTA และ native mobile menu
- `web/src/app/hero-section.tsx`
  - Headline, supporting copy, actions, benefits, steps และ FAQ
- `web/src/app/house-showcase.tsx`
  - ภาพบ้าน, overlay gradient และ composition ของ demo cards
- `web/src/app/floating-preview-cards.tsx`
  - render card ทั้ง 5 แบบจาก content โดยไม่มี state/event handlers
- `web/src/app/landing-icons.tsx`
  - inline SVG icons ที่ใช้เฉพาะ Landing; decorative icon ใช้ `aria-hidden="true"`
- `web/src/app/landing-page.module.css`
  - visual tokens, layout, responsive rules และ motion เฉพาะ Landing
- `web/src/app/home-page.test.tsx`
  - semantic/content/navigation acceptance
- `web/src/app/landing-content.test.ts`
  - copy และ static sample-data contract
- `web/src/e2e/home-page.e2e.ts`
  - CTA journey, anchors, mobile overflow, focus และ responsive checks

ไม่แก้ Configurator components, calculation domain, pricing API, Price Book หรือ Preview workflow

## 10. Data Flow และ Interaction

Landing ไม่มี API call และไม่มี client state:

1. `getLandingContent()` คืนข้อมูลภาษาไทย
2. Server Components render header, hero, image และ static demo cards
3. CSS จัดตำแหน่ง/motion ตาม viewport
4. CTA เปิด `/configurator`
5. Secondary/nav anchors เลื่อนไป element ภายใน Hero
6. Mobile menu และ FAQ ใช้ native HTML disclosure

หาก JavaScript โหลดไม่สำเร็จ CTA, navigation, phone link, mobile disclosure และเนื้อหาหลักยังใช้งานได้

## 11. Accessibility และ Error Handling

- ใช้ `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<ol>` และ heading hierarchy ที่ถูกต้อง
- การ์ด Demo ไม่ใช้ `<button>` และไม่มี `tabIndex` เพราะกดไม่ได้
- slider, check และ share decoration ใช้ `aria-hidden="true"`
- House image และ thumbnails มี alt text ที่ตรงบริบท; swatch decoration ไม่ประกาศชื่อซ้ำ
- actual links ทุกจุดมี accessible name ตรงกับผลของ action
- focus ring contrast ชัดเจนและไม่ถูก sticky header บัง
- สีข้อความผ่าน WCAG 2.2 AA
- หากภาพหลักโหลดไม่ได้ Headline, CTA และคำอธิบายตัวอย่างยังอยู่ใน DOM
- Budget sample มี disclaimer เสมอและไม่ถูกซ่อนเฉพาะ hover
- ไม่มีข้อมูลส่วนตัว, analytics payload หรือราคา authoritative บน Landing

## 12. Testing และ Definition of Done

### Unit/Component

- Hero มี H1 ตามข้อความอนุมัติและมี section หลักหนึ่ง section
- Navigation มีรายการครบและ anchors มีปลายทางจริง
- Primary CTA ไป `/configurator`; Secondary ไป `#house-preview`
- Trust items 3 รายการและ Steps 3 ขั้นครบ
- Demo cards 5 ใบแสดงค่าตาม spec และไม่มี button/input ภายในการ์ด
- Budget sample disclaimer แสดงเสมอ
- Content tests ยืนยันว่า sample budget ถูกระบุว่าไม่ใช่ราคาประเมิน

### E2E/Visual QA

- Desktop `1440×900`: composition 40/60, CTA และ Simple Steps มองเห็น, cards ไม่บังส่วนสำคัญของบ้าน
- Tablet `768×1024`: one-column/grid transition อ่านได้และไม่ล้น
- Mobile `375×812`: ไม่มี horizontal overflow, CTA สูงอย่างน้อย 48px และลำดับ content ถูกต้อง
- Keyboard focus เดินผ่าน Logo, navigation, phone, CTA, mobile disclosure และ FAQ ได้
- Browser console ไม่มี error/warning ที่เกิดจาก Landing
- Reduced-motion ปิด card float animations
- Typecheck, lint, unit tests, relevant E2E และ production build ผ่าน

### ความแตกต่างจากภาพอ้างอิงที่ยอมรับได้

- ใช้ภาพบ้านของโปรเจกต์แทนภาพบ้านใน reference
- ไม่มีรถ คน หรือ avatar จริงที่ไม่มี asset/สิทธิ์ใช้งาน; Share Card ใช้ icon และภาพ Preview แทน
- การ์ด Budget มี disclaimer ชัดเจนกว่าภาพอ้างอิง
- Tablet/Mobile เปลี่ยน floating cards เป็น normal-flow cards เพื่อ accessibility และความอ่านง่าย
- ฟอนต์ใช้ Prompt ตามระบบปัจจุบัน ไม่เลียนแบบ font ใน reference แบบไม่ทราบสิทธิ์
