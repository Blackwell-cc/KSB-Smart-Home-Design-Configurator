# Step 3 Budget Configurator Design

## เป้าหมาย

ปรับหน้า Step 3 จากฟอร์มทำเลและช่องกรอกงบต่ำสุด/สูงสุด ให้เป็นหน้ากำหนดงบประมาณที่เข้าใจง่ายสำหรับผู้บริโภค โดยใช้โครง 2 คอลัมน์และภาษาภาพเดียวกับ Step 2 ภาพบ้านยังเป็นจุดเด่นสูงสุด และการเลือกช่วงงบต้องไม่บังคับผู้ใช้

## ขอบเขต

- แก้เฉพาะ Step 3, adapter ข้อมูลช่วงงบ, draft migration และหน้าสรุปที่ต้องอ่านค่าใหม่
- คงการเลือกจังหวัด เขต/อำเภอ สภาพการเข้าถึง การนำทาง และ validation จังหวัดเดิม
- ไม่แก้สูตรประมาณราคาหรือ Step 4
- ไม่เพิ่ม dependency
- ใช้ HTML/CSS/components จริงทั้งหมด ยกเว้นภาพบ้าน

## โครงหน้า Desktop

หน้าใช้ความสูงหนึ่ง viewport ใต้ header และแบ่งพื้นที่ประมาณ 43/57:

```text
┌──────────────────────────────────────────────────────────────┐
│ Configurator Header — Step 3 active                         │
├──────────────────────────┬───────────────────────────────────┤
│ ขั้นตอน 3 / 5            │ CONCEPT PREVIEW                   │
│ กำหนดงบประมาณ           │ ชื่อสไตล์                         │
│ คำอธิบาย                 │                                   │
│                          │          HOUSE PREVIEW            │
│ ข้อมูลโครงการ ─────────  │                                   │
│ จังหวัด                  │                                   │
│ อำเภอ / เขต              ├───────────────────────────────────┤
│ การเข้าถึง               │ สรุปข้อมูลเบื้องต้น               │
│                          │ ทำเล | การเข้าถึง | งบ | พื้นที่  │
│ งบประมาณที่วางไว้ ─────  │ หมายเหตุ                           │
│ [ช่วงงบแบบ radio]        │                                   │
│ [ย้อนกลับ] [ถัดไป]      │                                   │
└──────────────────────────┴───────────────────────────────────┘
```

มีเส้นแบ่งแนวตั้งเพียงหนึ่งเส้น ใช้สีทองโปร่งต่ำและมีแสงสั้น ๆ บริเวณกึ่งกลางเหมือน Step 2

## ฝั่งซ้าย: ข้อมูลและช่วงงบ

### กลุ่มหัวข้อ

- Eyebrow: `ขั้นตอน 3 / 5`
- H1: `กำหนดงบประมาณ`
- คำอธิบาย: `ให้ข้อมูลที่สำคัญ เพื่อช่วยประเมินและวางแผนโครงการเบื้องต้นให้เหมาะกับความต้องการของคุณ`
- ใช้ฟอนต์และระยะปลอดภัยของ Step 2 เพื่อป้องกันสระ/วรรณยุกต์ซ้อนกัน

### ข้อมูลโครงการ

หัวข้อ `ข้อมูลโครงการ` มีไอคอนเส้นแบบ architectural/location และเส้นบางต่อไปทางขวา

- จังหวัด: ใช้รายการจังหวัด production เดิมและ validation เดิม
- อำเภอ / เขต: ไม่บังคับ พร้อม placeholder `ระบุอำเภอ / เขต`
- สภาพการเข้าถึงหน้างาน: คงค่า enum เดิมเพื่อไม่กระทบ pricing
  - `normal` → `เข้าถึงปกติ`
  - `restricted` → `ถนนค่อนข้างแคบ`
  - `very-restricted` → `รถขนาดใหญ่เข้าถึงยาก`
- Helper: `ช่วยให้ทีมพิจารณาการขนส่งและการวางแผนหน้างานเบื้องต้น`
- Input/select สูงประมาณ 50–54px พื้นเข้ม เส้นขอบทองบาง และ focus-visible ชัดเจน

### งบประมาณที่วางไว้

ลบช่องตัวเลขต่ำสุด/สูงสุดออกทั้งหมด แล้วใช้ radio group เลือกได้ครั้งละหนึ่งช่วง:

1. `unspecified` — ยังไม่ระบุ
2. `under_5m` — ต่ำกว่า 5 ล้านบาท
3. `5m_10m` — 5–10 ล้านบาท
4. `10m_20m` — 10–20 ล้านบาท
5. `20m_40m` — 20–40 ล้านบาท
6. `40m_80m` — 40–80 ล้านบาท
7. `over_80m` — มากกว่า 80 ล้านบาท

ค่าเริ่มต้นคือ `unspecified` และผู้ใช้กดถัดไปได้โดยไม่ระบุงบ ตัวเลือกเป็น radio จริง ใช้ keyboard ได้ มีข้อความและเครื่องหมายเลือก จึงไม่สื่อสถานะด้วยสีเพียงอย่างเดียว

Desktop จัด 3–4 ตัวต่อแถวตามพื้นที่ Mobile จัด 2 คอลัมน์หรือแถวเต็มโดยรักษา touch target อย่างน้อย 44px สถานะเลือกใช้พื้น champagne gold ตัวอักษรเข้ม และ glow เฉพาะจุดอย่างจำกัด

## แบบจำลองข้อมูลช่วงงบ

เพิ่ม field หลักใน `HouseConfiguration`:

```ts
type BudgetRangeId =
  | "unspecified"
  | "under_5m"
  | "5m_10m"
  | "10m_20m"
  | "20m_40m"
  | "40m_80m"
  | "over_80m";
```

สร้าง catalog กลางหนึ่งแห่งเพื่อเก็บ id, label และค่า compatibility:

| ID | Label | `targetBudget` compatibility |
|---|---|---|
| `unspecified` | ยังไม่ระบุ | `null` |
| `under_5m` | ต่ำกว่า 5 ล้านบาท | `null` |
| `5m_10m` | 5–10 ล้านบาท | `{ min: 5_000_000, max: 10_000_000 }` |
| `10m_20m` | 10–20 ล้านบาท | `{ min: 10_000_000, max: 20_000_000 }` |
| `20m_40m` | 20–40 ล้านบาท | `{ min: 20_000_000, max: 40_000_000 }` |
| `40m_80m` | 40–80 ล้านบาท | `{ min: 40_000_000, max: 80_000_000 }` |
| `over_80m` | มากกว่า 80 ล้านบาท | `null` |

`budgetRangeId` เป็นข้อมูลอ้างอิงหลักของ UI ส่วน `targetBudget` คงไว้เพื่อ compatibility กับระบบเดิมเท่านั้น ช่วงปลายเปิดไม่สร้างค่าต่ำสุด/สูงสุดสมมติและไม่ส่งผลต่อ logic เปรียบเทียบงบ

Draft เก่าที่ไม่มี `budgetRangeId` ต้อง migrate ดังนี้:

- `targetBudget: null` → `unspecified`
- min/max ที่ตรง catalog → range id ที่ตรงกัน
- min/max แบบกำหนดเองจาก draft เดิม → `unspecified` และคง `targetBudget` เดิมไว้เพื่อไม่ทำข้อมูลเดิมสูญหาย จนกว่าผู้ใช้จะเลือกช่วงใหม่

เมื่อเลือกช่วงใหม่ ระบบเขียนทั้ง `budgetRangeId` และ `targetBudget` จาก catalog กลางใน patch เดียว

## ฝั่งขวา: Concept Preview

สร้าง preview เฉพาะ Step 3 แยกจาก shared preview ของ Step 3–5 เพื่อไม่เปลี่ยน Step 4/5

- ด้านบนมี `CONCEPT PREVIEW`, ชื่อไทย และชื่ออังกฤษ
- ภาพบ้านอยู่บนพื้นเข้มแบบ architectural grid ใช้ภาพ concept ปัจจุบันที่ดีที่สุดในโครงการ
- ภาพใช้ `object-fit: contain` และไม่ครอบตัดสถาปัตยกรรมสำคัญ
- ไม่มี toggle, rotate, zoom, compass, hotspot, tooltip หรือข้อความลอยบนตัวบ้าน
- กรณียังไม่มี asset isometric ที่ตรงภาพอ้างอิง ให้ใช้ asset ปัจจุบันโดยคง component พร้อมเปลี่ยนเฉพาะ source ในอนาคต ความแตกต่างนี้ต้องรายงานใน final report

## แผงสรุป

วางใต้ภาพโดยเว้น 20–28px และไม่ overlap ภาพ แสดง 4 รายการ:

- ทำเลที่ตั้ง: จังหวัดและอำเภอ/เขตถ้ามี
- สภาพการเข้าถึง: label จาก enum เดิม
- งบประมาณ: label จาก `budgetRangeId`
- พื้นที่ใช้สอย (โดยประมาณ): `{usableAreaM2} – {constructionFloorAreaM2} ตร.ม.` พร้อม `(จาก concept)`

แผงใช้ไอคอนเส้น label/value และเส้นแบ่งแนวตั้ง พื้นเข้ม เส้นขอบ warm gold โปร่งต่ำ ไม่มี glow ทั้งแผง และมีหมายเหตุ:

`ข้อมูลนี้ช่วยให้ทีมออกแบบประเมินแนวทางเบื้องต้นได้อย่างเหมาะสมยิ่งขึ้น`

ข้อมูลสรุปอัปเดตทันทีเมื่อฟอร์มเปลี่ยน แต่ไม่มี control แก้ไขในแผง

## ปุ่มและสถานะ

- `ย้อนกลับ`: พื้นเข้ม เส้นบาง
- `ถัดไป`: champagne gold แบบ restrained สูงประมาณ 54–58px
- จังหวัดยังเป็นข้อมูลบังคับตาม validation เดิม
- งบประมาณไม่บังคับ และ `unspecified` ไม่ทำให้ปุ่มถัดไป disabled
- ทุก input, select, radio และ button มี hover, focus-visible และ disabled state ที่ชัดเจน

## Responsive

- Desktop ≥1200px: 43/57 เต็ม viewport ใต้ header
- Tablet: ลด padding และสามารถ stack preview ใต้ฟอร์มเมื่อพื้นที่ไม่พอ
- Mobile: Header → หัวข้อ → ข้อมูลโครงการ → ช่วงงบ → Preview → Summary → Actions
- ที่ 375px ต้องไม่มี horizontal overflow, Thai text clipping หรือ touch target ต่ำกว่า 44px

## Components และไฟล์ที่คาดว่าจะเปลี่ยน

- `configuration.ts`: เพิ่ม `budgetRangeId` และ default
- `budget-ranges.ts`: catalog/mapping/label กลาง
- `site-budget-step.tsx`: ฟอร์มข้อมูลโครงการและ radio selector
- `site-budget-preview.tsx`: concept preview และ summary ของ Step 3
- `configurator-shell.tsx`: เชื่อม state ใหม่และเลือก preview เฉพาะ Step 3
- `configurator-shell.module.css`: layout/tokens แบบ scoped ด้วย `data-step="site-budget"`
- `review-step.tsx`: อ่าน label จาก catalog กลาง
- draft/schema/request tests ที่จำเป็นต่อ compatibility
- Step 3 component/style/E2E tests

## การทดสอบและการตรวจภาพ

ใช้ TDD โดยเริ่มจาก tests ต่อไปนี้:

- catalog แปลง id เป็น label และ `targetBudget` ถูกต้อง
- default เป็น `unspecified`
- radio group เลือกได้ครั้งละหนึ่งค่าและอัปเดต state/summary ทันที
- ช่วงปลายเปิดมี `targetBudget: null`
- ช่วงมีขอบเขตเขียน min/max ตาม catalog
- จังหวัดยังบังคับ แต่งบไม่บังคับ
- draft เก่ายังโหลดได้
- Step 4 ไม่ได้รับ layout เฉพาะ Step 3

หลัง implementation ต้องรัน lint, typecheck, relevant tests, full tests และ production build จากนั้นตรวจ 375px, 768px, 1440px และ wide desktop พร้อม visual correction pass อีกหนึ่งรอบ ตรวจ overflow, keyboard, persistence, back navigation และ console errors

## เกณฑ์ยอมรับ

- Desktop ใกล้เคียงภาพเป้าหมายและสอดคล้อง Step 2
- ไม่มีช่องกรอก min/max
- งบเป็น single-select radio และค่าเริ่มต้น `ยังไม่ระบุ`
- เลือกงบแล้ว summary เปลี่ยนทันทีและ persistence ทำงาน
- ช่วงปลายเปิดไม่สร้างเพดานสมมติหรือกระทบการคำนวณ
- Preview สะอาด ไม่มี control/label ทับบ้าน และ summary ไม่ทับภาพ
- มีเส้นแบ่งเพียงหนึ่งเส้นพร้อม center glow แบบ restrained
- ไม่กระทบ Step 4/5 และไม่มี console/overflow/accessibility regression

## นอกขอบเขต

- ไม่สร้างหรือปรับสูตรราคา
- ไม่ redesign Step 4
- ไม่เพิ่ม 3D/WebGL
- ไม่สร้าง asset บ้าน isometric ใหม่ในรอบนี้
