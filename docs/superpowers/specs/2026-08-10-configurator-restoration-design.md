# KSB Configurator Restoration Design

- วันที่: 2026-08-10
- สถานะ: อนุมัติโดยอ้างอิงบทสนทนา ภาพตัวอย่าง และทิศทางเดิมของเจ้าของผลิตภัณฑ์
- ขอบเขต: Configurator, Live Concept Preview และ Free Preview Result

## 1. เป้าหมาย

ปรับเว็บไซต์ที่ทำงานได้แล้วให้กลับมาตรงกับแนวคิดเดิม: ผู้ใช้เลือกข้อมูลทางฝั่งซ้ายและเห็นผลทางภาพฝั่งขวาแบบทันที ภาพรวมต้องเป็นบริษัทออกแบบบ้านระดับพรีเมียม ไม่ใช่แบบฟอร์มสีดำทั่วไป และต้องให้คุณค่าก่อนขอข้อมูลติดต่อ

## 2. สิ่งที่ต้องรักษาไว้

- โครงสร้าง 5 ขั้นตอนและ Draft ที่กลับมาแก้ไขได้
- แนวทาง Preview → Soft Gate → Full Report
- การคำนวณแยก Usable Area, CFA, ค่าก่อสร้าง, ค่าออกแบบ, Allowance และ Site Risk
- Production ต้องไม่แสดงราคาหากไม่มี Published Price Book ที่ผ่านการอนุมัติ
- ไม่รวมค่าควบคุมงานในค่าออกแบบ
- ไม่เก็บ PII ใน Draft, URL, Public Share หรือ Analytics
- Keyboard, Screen Reader, Mobile และ Reduced Motion ต้องใช้งานได้

## 3. ช่องว่างของหน้าเว็บปัจจุบัน

1. หน้าสไตล์เป็นรายการข้อความ ทำให้ยังไม่รู้สึกว่า “เลือกจากแบบบ้าน”
2. ภาพด้านขวาเปลี่ยนเฉพาะสไตล์ แต่ไม่สื่อจำนวนชั้น ห้อง พื้นที่ ระดับวัสดุ หรือส่วนพิเศษ
3. Material Level ยังไม่มีภาพหรือ Material Mood ทำให้ความต่างระหว่าง Select, Premium และ Signature ไม่ชัด
4. ฟอนต์หลักเป็น Noto Sans Thai ขณะที่ทิศทางที่ยืนยันคือ DB Heavent
5. Mobile แสดง Preview ยาวก่อนฟอร์มและ Stepper แน่นเกินไป
6. Local Development ไปถึงหน้า Preview แล้วพบ Estimate Unavailable จึงทดสอบประสบการณ์ปลายทางไม่ได้

## 4. ทิศทางภาพ: Architect Material Board

### 4.1 Palette

- `Obsidian` — `#090807`: ฉากหลัก
- `Smoked Walnut` — `#17120E`: พื้นผิวการ์ด
- `Architect Ivory` — `#F3EEE5`: ตัวอักษรหลัก
- `Champagne Gold` — `#D9B26D`: Selected state และ CTA
- `Burnished Bronze` — `#8D6238`: รายละเอียดวัสดุและเส้นแสง
- `Muted Sand` — `#A99D8D`: ข้อความรอง

สีทองใช้เฉพาะจุดที่มีความหมาย เช่น สิ่งที่เลือก ขั้นตอนปัจจุบัน และปุ่มดำเนินการ ไม่ใช้เป็นลายตกแต่งทุกพื้นที่

### 4.2 Typography

- ภาษาไทย: `DB Heavent` จาก Local Font ของผู้ใช้ เป็นตัวเลือกแรก
- Fallback: `Noto Sans Thai`
- หัวข้อใช้ DB Heavent Bold/Condensed ในขนาดใหญ่ แต่ลดความหนาเพื่อคงความ Calm Luxury
- English utility labels ใช้อักษรตัวพิมพ์ใหญ่ ขนาดเล็ก และ letter spacing พอประมาณ
- Production จะ bundle DB Heavent ได้ต่อเมื่อ KSB ยืนยันสิทธิ์ Webfont; ระหว่างพัฒนาใช้ `local("DB Heavent")`

### 4.3 Desktop Layout

```text
┌─────────────────────────────────────────────────────────────┐
│ KSB ARCHITECT     1 STYLE  2 SPACE  3 SITE  4 MATERIAL  5  │
├──────────────────────────┬──────────────────────────────────┤
│ STEP / TITLE             │ LIVE CONCEPT PREVIEW             │
│ คำอธิบายสั้น             │                                  │
│ ┌────────┐ ┌────────┐    │        Photorealistic House      │
│ │ Choice │ │ Choice │    │                                  │
│ └────────┘ └────────┘    │  STYLE · FLOOR · MATERIAL        │
│ Controls / Details       │  AREA · CFA · ACTIVE FEATURES    │
│ Back              Next   │  Material palette / confidence   │
└──────────────────────────┴──────────────────────────────────┘
```

- ซ้ายเป็น Decision Canvas ประมาณ 48%
- ขวาเป็น Live Preview ประมาณ 52% และ sticky
- Preview ต้องรักษาความสูงใกล้เคียงกันทุกขั้น เพื่อลด layout shift

### 4.4 Choice Design

- Style: การ์ด 2×2 มีภาพย่อ อันดับ ชื่อภาษาไทย/อังกฤษ และคำอธิบายสถาปัตยกรรมสั้น ๆ
- Counters: การ์ดตัวเลขที่อ่านง่าย มีค่าปัจจุบันเด่น และแสดงผลพื้นที่ทันที
- Material: การ์ด Material Board มี swatch 3 ชิ้น เช่น ผนัง ไม้ กระจก/โลหะ พร้อมคำอธิบายผลต่อราคา
- Special Features: Toggle card พร้อมสถานะและผลต่อกรอบงบประมาณ ไม่แสดงเป็น checkbox ธรรมดา

### 4.5 Live Preview Behavior

- เปลี่ยนภาพหลักตาม House Style ด้วย crossfade 220–280ms
- เปลี่ยนโทนแสงและ Material Palette ตาม Material Level โดยไม่หลอกว่าเป็นภาพก่อสร้างจริง
- แสดงข้อมูลสด: ชั้น ห้องนอน ห้องน้ำ ที่จอดรถ Usable Area CFA จังหวัด และรายการพิเศษ
- แสดงคำว่า “Concept Preview” และ disclaimer ว่าภาพใช้สื่อสารแนวทาง ไม่ใช่แบบก่อสร้าง
- ไม่มี AI generation แบบสดใน MVP

### 4.6 Mobile

- Preview ย่อเป็นภาพอัตราส่วน 16:10 พร้อมสรุป 3–4 ค่า แล้วจึงเข้าสู่ตัวเลือก
- Stepper เลื่อนแนวนอนได้ แต่ขั้นปัจจุบันต้องอยู่ในมุมมอง
- Choices เป็นหนึ่งคอลัมน์
- Back/Next เป็น action bar ด้านล่างที่ไม่บัง input

## 5. Free Preview Result

- ต้องเห็น Concept Image, Style, Floors, Rooms, Usable Area, CFA, Material Level และกรอบงบประมาณกว้างก่อน Lead Form
- แสดง “ข้อมูลทดสอบ” ชัดเจนเมื่อใช้ Development Demo Price Book
- Development Demo ใช้ได้เฉพาะเมื่อไม่ใช่ Production และไม่สามารถถูกเปิดใน Production ด้วย environment flag
- Production ยังคง Fail Closed หากไม่มี Published Price Book
- ค่าออกแบบต้องแยกจากค่าก่อสร้างและระบุชัดว่าไม่รวมค่าควบคุมงาน
- Soft Gate อยู่หลัง Preview และใช้ข้อความ “รับสรุปโครงการฉบับเต็ม”

## 6. Motion และ Accessibility

- Motion หลักมีเพียง crossfade ภาพ, selected-state sheen และ step transition
- `prefers-reduced-motion` ต้องปิด animation ที่ไม่จำเป็น
- Radio/checkbox semantics ต้องคงอยู่แม้การ์ดมีภาพ
- Focus ring ใช้ Champagne Gold/Architect Ivory ที่ contrast ผ่าน
- ข้อความไม่พึ่งสีเพียงอย่างเดียวเพื่อบอกสถานะ

## 7. Acceptance Criteria

- Style cards มีภาพย่อและชื่อที่เข้าใจง่าย
- Live Preview เปลี่ยนตาม style และสรุปค่าหลักจากทุกขั้น
- Material Level มี visual swatches และ selected state ชัดเจน
- Thai UI ใช้ DB Heavent local-first พร้อม Noto fallback
- Desktop คง split layout และ Mobile เป็น one-column ที่ไม่ล้นแนวนอนโดยไม่จำเป็น
- Development journey ไปถึง Free Preview พร้อมราคาทดสอบและป้ายกำกับได้
- Production estimate contract ยังคงต้องใช้ Published Price Book จริง
- Preview แสดงคุณค่าก่อน Soft Gate และไม่ขอ PII ก่อนเห็นผล
- Unit, integration, accessibility และ browser journey ที่เกี่ยวข้องผ่านทั้งหมด

