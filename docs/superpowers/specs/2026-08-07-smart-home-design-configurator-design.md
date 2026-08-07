# Smart Home Design Configurator — Product & System Design Specification

- วันที่: 2026-08-07
- สถานะ: อนุมัติโดยเจ้าของผลิตภัณฑ์เมื่อ 2026-08-07; พร้อมใช้เป็นฐาน Implementation Plan
- ผลิตภัณฑ์: KSB Architect Smart Home Design Configurator
- แนวทางที่เลือก: Guided Architect Experience
- ภาษาภายในเอกสาร: ไทย โดยใช้คำศัพท์ระบบภาษาอังกฤษเฉพาะจุดที่ช่วยลดความกำกวม

## 1. วัตถุประสงค์ของเอกสาร

เอกสารนี้เป็นข้อกำหนดหลักสำหรับ MVP และรวมการตัดสินใจที่ได้รับอนุมัติจากการวางแผนร่วมกันแล้ว หากข้อความในเอกสารนี้ขัดกับ Blueprint เดิม ให้ยึดเอกสารนี้สำหรับ MVP และปรับ Blueprint ในรอบงานเอกสารภายหลัง

เอกสารที่ใช้ประกอบ:

- `SMART_HOME_DESIGN_CONFIGURATOR_CODEX_BLUEPRINT.md`
- `docs/product/PRICING-RESEARCH-BASELINE-2026-Q2.md`
- `docs/product/GLOSSARY.md`
- `docs/architecture/decisions/ADR-001` ถึง `ADR-009`

## 2. Product Vision

สร้างเว็บที่ช่วยให้เจ้าของบ้านกำหนดความต้องการบ้านใหม่ได้อย่างง่ายดาย เห็น Concept Preview และกรอบงบประมาณเบื้องต้นที่มีที่มา ก่อนนำข้อมูลไปปรึกษาสถาปนิก

ผลิตภัณฑ์ต้องทำให้ KSB ดูเป็นบริษัทออกแบบที่เชี่ยวชาญ ซื่อสัตย์ และวางแผนโครงการอย่างเป็นระบบ ไม่ใช่เว็บไซต์แจกตัวเลขราคาต่อตารางเมตรหรือเครื่องมือเก็บ Lead แบบบังคับ

คุณค่าหลักที่ผู้ใช้ได้รับ:

1. เข้าใจว่าบ้านที่ต้องการควรมีพื้นที่ประมาณเท่าใด
2. เห็นงบก่อสร้าง ค่าออกแบบ งานพิเศษ และความเสี่ยงเป็นหมวดแยกกัน
3. เข้าใจสาเหตุที่ทำให้งบเพิ่มหรือลด
4. ได้สรุปโครงการที่ใช้สื่อสารกับสถาปนิกได้ตรงกัน
5. ได้ประสบการณ์ที่ง่าย สวย พรีเมียม และไม่รู้สึกว่าเป็น Lead Trap

## 3. เป้าหมายทางธุรกิจและตัวชี้วัด

### 3.1 เป้าหมายหลัก

- สร้าง Lead ที่มีบริบทโครงการครบกว่าฟอร์มติดต่อทั่วไป
- เพิ่มการรับรู้คุณค่าของงานออกแบบและบริการวิชาชีพอย่างเป็นธรรมชาติ
- ช่วยให้ทีม KSB เริ่มบทสนทนากับลูกค้าจากข้อมูลที่มีโครงสร้าง
- สร้าง Public Preview ที่แชร์ได้และพาผู้ใช้ใหม่กลับเข้าสู่ Configurator

### 3.2 Funnel หลัก

```text
เริ่ม Configurator
→ ทำครบ 5 ขั้น
→ เห็น Free Preview
→ กดรับ Full Project Report
→ เริ่มกรอก Lead Form
→ Submit สำเร็จ
→ ปลดล็อก Full Report
→ ดาวน์โหลด / บันทึก / แชร์ / ขอปรึกษาสถาปนิก
```

### 3.3 ตัวชี้วัด

- Completion rate ของ Configurator
- Preview → Full Report CTA rate
- Lead form start → submit rate
- Full Report unlock rate
- PDF download rate
- Public Preview share rate
- Consultation request rate
- Lead form abandonment rate
- สัดส่วนโครงการจริงที่ราคาอยู่ภายในช่วงประเมิน

เป้าหมายด้านราคาเมื่อผ่านการ Calibrate คือให้โครงการจริงที่มีเงื่อนไขใกล้เคียงอย่างน้อย 80% อยู่ภายในช่วงที่ระบบแสดง เป้าหมายนี้เป็นตัววัดคุณภาพโมเดล ไม่ใช่คำรับประกันราคาต่อผู้ใช้

## 4. ขอบเขต MVP

### 4.1 รวมใน MVP

- บ้านพักอาศัยสร้างใหม่ในประเทศไทย
- Configurator 5 ขั้นแบบเลือกเป็นหลัก
- Curated Concept Preview จากภาพที่ KSB อนุมัติ
- การแนะนำ Usable Area และแปลงเป็น Construction Floor Area (CFA)
- ราคาประเมินแบบช่วงตามจังหวัด ระดับวัสดุ และความซับซ้อน
- ระดับวัสดุ Select, Premium และ Signature
- ค่าเผื่อรายการพิเศษและความเสี่ยงหน้างานแบบแยกหมวด
- ค่าออกแบบและบริการวิชาชีพตามขอบเขตที่ยืนยัน
- Free Preview โดยไม่ขอข้อมูลส่วนตัว
- Soft Gate สำหรับ Full Project Report
- PDF, Save Project, Public Share และ Request Consultation
- Anonymous Draft ในอุปกรณ์และ Private Project Link หลัง Submit
- Analytics Funnel ที่ไม่เก็บ PII
- Pricing Admin แบบจำกัดขอบเขต
- ภาษาไทยเป็นภาษาหลัก

### 4.2 ไม่รวมใน MVP

- ต่อเติมหรือรีโนเวต
- Live 3D Configurator
- AI สร้างภาพบ้านแบบ Real-time
- แบบสถาปัตยกรรมหรือแบบก่อสร้างจริงจากระบบ
- ใบเสนอราคาหรือราคาผูกพัน
- บัญชีสมาชิกและรหัสผ่าน
- อัปโหลดโฉนด แบบบ้าน หรือเอกสารส่วนตัว
- ออกแบบภายในและภูมิสถาปัตยกรรม
- ค่าควบคุมงานก่อสร้าง
- CRM เต็มรูปแบบภายในระบบ
- ภาษาอังกฤษในหน้าผู้ใช้; โครงสร้างข้อมูลและข้อความต้องพร้อมเพิ่มภายหลัง

## 5. Product Principles

1. **Progressive Value Exchange** — ให้คุณค่าจริงก่อนขอข้อมูลส่วนตัว
2. **Guided Architect Experience** — ผู้ใช้รู้สึกว่ามีผู้เชี่ยวชาญคอยแนะนำ ไม่ต้องรู้ศัพท์สถาปัตยกรรม
3. **Transparent Estimate** — แยกหมวดราคา สมมติฐาน และสิ่งที่ไม่รวม
4. **No False Precision** — ช่วงราคาต้องสะท้อนข้อมูลที่มีและระดับความไม่แน่นอน
5. **Privacy by Design** — Configuration, Lead และ Public Share แยกกัน
6. **Curated Quality** — ใช้ภาพและตัวเลือกที่ KSB ควบคุมคุณภาพ
7. **Recoverable Journey** — Refresh, Back หรือข้อผิดพลาดไม่ทำให้ข้อมูลหายโดยไม่จำเป็น
8. **Adaptive Luxury** — ความหรูเข้มข้นตามบริบท โดยไม่ลดความอ่านง่าย

## 6. User Experience Flow

### 6.1 Landing

หน้าเริ่มต้นต้องอธิบายภายในช่วงแรกของหน้า:

- ผู้ใช้จะได้ Concept Preview และกรอบงบประมาณเบื้องต้น
- ใช้เวลาไม่นานและเลือกตามภาพได้
- Preview ดูได้โดยไม่กรอกข้อมูลส่วนตัว
- ผลลัพธ์เป็นการประเมินเบื้องต้น ไม่ใช่แบบก่อสร้างหรือใบเสนอราคา

CTA หลัก: `เริ่มออกแบบบ้าน`

CTA รองเมื่อพบ Draft: `ทำโครงการเดิมต่อ`

### 6.2 Configurator 5 ขั้น

#### ขั้นที่ 1 — สไตล์บ้าน

- เลือกจาก Curated Concept Asset ที่ KSB อนุมัติ
- ใช้ภาพเสมือนจริงคุณภาพสูง ชื่อสไตล์ และคำอธิบายสั้น
- ไม่ใช้ชื่อสไตล์แทนข้อกำหนดทางเทคนิค
- ผู้ใช้เลือก `ยังไม่แน่ใจ` ได้
- MVP แสดงเฉพาะสไตล์ที่มีภาพและ Mapping ผ่าน Content QA แล้ว

#### ขั้นที่ 2 — พื้นที่และฟังก์ชัน

- จำนวนชั้น ห้องนอน ห้องน้ำ และที่จอดรถ
- จำนวนผู้อยู่อาศัย
- ห้องทำงาน ห้องผู้สูงอายุ ครัวไทย ห้องอเนกประสงค์ พื้นที่เก็บของ และความต้องการพิเศษที่ KSB รองรับ
- ใช้ Counter, Segmented Control และ Toggle เท่าที่เหมาะสม
- ระบบแนะนำ Usable Area จาก Room Program
- ผู้ใช้แก้ไขพื้นที่ได้ และระบบอธิบายผลต่อราคา

#### ขั้นที่ 3 — ทำเล หน้างาน และงบเป้าหมาย

- จังหวัดเป็นข้อมูลบังคับสำหรับการประเมินราคา
- อำเภอ/เขตเป็นข้อมูลเลือกตอบเมื่อช่วยเพิ่มความแม่นยำ
- ขนาดที่ดินและทิศทางเป็นข้อมูลเลือกตอบ
- ใช้ตัวเลือกอธิบายง่ายสำหรับทางเข้าหน้างานและข้อจำกัดการขนส่ง
- งบเป้าหมายเป็นข้อมูลเลือกตอบ ไม่ใช้เป็นตัวบังคับสูตรให้ได้ราคาตามงบ
- ไม่ขอที่อยู่เต็ม พิกัด หรือเลขโฉนดก่อน Preview

#### ขั้นที่ 4 — วัสดุและส่วนประกอบพิเศษ

- เลือกระดับวัสดุรวมหนึ่งระดับ: Select, Premium หรือ Signature
- แสดงคำอธิบายด้านคุณภาพ การดูแล และผลต่องบ โดยไม่ผูกกับแบรนด์ที่ยังไม่มี Catalog จริง
- รายการพิเศษขั้นต่ำ: สระว่ายน้ำ ลิฟต์ Smart Home Solar EV Charger Double Volume และกระจกขนาดใหญ่
- รายการพิเศษแสดงเป็น Allowance Range แยกจากค่าก่อสร้างหลัก

#### ขั้นที่ 5 — ตรวจทาน

- แสดงตัวเลือกทั้งหมดพร้อม Edit Link กลับไปแต่ละส่วน
- แสดง Usable Area และ CFA แยกกัน
- แสดงสมมติฐานสำคัญก่อนคำนวณ
- ไม่ขอข้อมูลติดต่อในขั้นนี้

### 6.3 Free Preview Result

แสดงทันทีหลังทำ Configurator ครบ โดยไม่ขอ PII:

- Concept Preview
- สไตล์บ้าน
- จำนวนชั้น ห้องนอน ห้องน้ำ และที่จอดรถ
- Usable Area โดยประมาณ
- CFA ที่ใช้เป็นฐานประเมิน
- Material Level
- กรอบงบประมาณช่วงกว้าง
- Summary เบื้องต้น
- Disclaimer ที่เห็นได้ชัดแต่ไม่รบกวนการอ่าน

CTA หลัก: `รับสรุปโครงการฉบับเต็ม`

CTA รอง: `แชร์ภาพ Preview`

### 6.4 Full Report Offer และ Soft Gate

ก่อนแสดง Lead Form ต้องอธิบายว่าผู้ใช้จะได้รับ:

- Detailed Project Summary
- Detailed Budget Estimate
- Material & Requirement Breakdown
- Downloadable PDF
- ภาพสรุปโครงการแบบหน้าเดียวสำหรับส่งต่อให้สถาปนิก
- Save Configuration
- ข้อมูลพร้อมนำไปปรึกษาสถาปนิก

ข้อความ CTA ที่ใช้ได้:

- `รับสรุปโครงการฉบับเต็ม`
- `ส่ง Project Report ฉบับเต็มให้ฉัน`

ห้ามใช้ข้อความ `กรอกข้อมูลเพื่อดูผลลัพธ์`

Lead Form ขอเฉพาะ:

- ชื่อ
- ช่องทางติดต่อที่ต้องการ: โทรศัพท์, Email หรือ LINE
- เบอร์โทร / Email / LINE ตามช่องทางที่เลือก
- Consent สำหรับจัดทำรายงานและติดต่อเกี่ยวกับโครงการนี้

ข้อความ Privacy ขั้นต่ำ:

> ข้อมูลของคุณจะใช้สำหรับจัดทำสรุปโครงการและติดต่อกลับเกี่ยวกับโครงการนี้เท่านั้น โดยจะจัดการข้อมูลตามนโยบายความเป็นส่วนตัวของบริษัท

ความยินยอมด้านการตลาด หากเพิ่มภายหลัง ต้องเป็นตัวเลือกแยกและไม่ถูกเลือกไว้ล่วงหน้า

### 6.5 Full Project Report

ปลดล็อกเมื่อ Server ยืนยันว่า Lead Submit สำเร็จเท่านั้น ประกอบด้วย:

- Project Summary ฉบับเต็ม
- Estimated Cost แบบ Low / Expected / High
- Construction Estimate
- Design & Professional Fee
- Special Feature Allowances
- Site & Foundation Risk Allowance
- ภาษีและค่าธรรมเนียมที่เกี่ยวข้องเมื่อมี โดยแสดงแยก
- รายการที่รวมและไม่รวม
- Assumptions
- Confidence Level และเหตุผล
- Pricing Version และ Reference Date
- คำแนะนำขั้นต่อไปก่อนปรึกษาสถาปนิก
- Download PDF
- Download Project Summary Image แบบหน้าเดียว
- Save / Reopen Project
- Request Architect Consultation

### 6.6 Save และกลับมาแก้ไข

- ก่อน Submit: เก็บ Anonymous Draft ใน Browser Storage โดยไม่เก็บ PII
- หลัง Submit: สร้าง Private Project Link ที่มี Token แบบคาดเดาไม่ได้และมีวันหมดอายุ
- แสดง Private Link หลัง Submit ทุกช่องทาง
- ส่งลิงก์ผ่าน Email หรือ LINE เมื่อช่องทางนั้นรองรับ
- กรณีเลือกโทรศัพท์และไม่มีบริการ SMS ผู้ใช้สามารถคัดลอกลิงก์หลัง Submit; การขอลิงก์ใหม่ต้องผ่านการยืนยันตามขั้นตอนที่ KSB อนุมัติ
- การบันทึกหลายโครงการด้วยข้อมูลติดต่อเดียวกันทำได้ และต้องไม่ถูก Merge เพียงเพราะ PII เหมือนกัน

### 6.7 Public Share

Public Preview แสดงได้เฉพาะ:

- Concept Image
- House Style
- จำนวนชั้น
- จำนวนห้องแบบสรุป
- Usable Area โดยประมาณ
- CTA `ลองออกแบบบ้านของคุณ`

Public Preview ไม่แสดง:

- ชื่อ เบอร์โทร Email LINE หรือ Identifier ที่ย้อนหา PII ได้
- ราคาประเมินทั้งแบบกว้างและแบบละเอียด
- Requirement ฉบับเต็ม
- Private Notes
- ที่อยู่ พิกัด ขนาดที่ดิน หรือข้อมูลหน้างานละเอียด
- Private Project Token

## 7. Visual and Interaction Design

### 7.1 Direction

แนวทางภาพรวม: **Obsidian Luxury ภายใต้ Adaptive Luxury**

- Landing: ดำ–ทองแบบ Cinematic ใช้แสง เงา และภาพบ้านสร้างความประทับใจ
- Configurator: ลดความเข้มของเอฟเฟกต์ เน้นอ่านและเลือกง่าย
- Preview / Full Report: เพิ่มความลึก แสงทอง และความรู้สึกมีคุณค่า
- Soft Gate: สุขุม โปร่ง และน่าเชื่อถือ ไม่กดดัน

Initial token direction:

- Obsidian background: `#090807`
- Deep surface: `#1A1714`
- Champagne gold: `#D9B26D`
- Highlight gold: `#F2D8A1`
- Warm ivory text: `#F3EEE5`
- Muted warm gray: `#AA9F91`
- Supporting sage: `#9CB091`

ค่าจริงต้องผ่าน Contrast QA ก่อนล็อก Design Token

### 7.2 Layout

- Desktop Configurator: ตัวเลือกด้านซ้าย ภาพ Preview ด้านขวา
- Preview ด้านขวาควรอยู่ในตำแหน่งที่เห็นต่อเนื่องเมื่อพื้นที่จอเอื้อ
- Mobile: Preview แบบย่อด้านบน เปิดภาพเต็มได้ แล้วตามด้วยตัวเลือกแบบคอลัมน์เดียว
- Navigation ต้องมี Previous, Next และสถานะขั้นตอนที่ชัดเจน
- การเลือกแต่ละครั้งต้องมีทั้งสี ขอบ ไอคอน และข้อความ ไม่พึ่งสีอย่างเดียว

### 7.3 Typography

- ฟอนต์ไทยหลัก: DB Heavent
- ก่อน Production ต้องยืนยันสิทธิ์ Webfont
- หากไม่มีสิทธิ์ Webfont ให้ใช้ Thai fallback ที่อ่านง่ายและถูกลิขสิทธิ์ โดยไม่ฝังไฟล์ฟอนต์ท้องถิ่นลงเว็บ
- ต้องทดสอบวรรณยุกต์ ตัวเลขไทย/อารบิก การตัดบรรทัด และข้อความในปุ่มบน Mobile

### 7.4 Motion

- เตรียมเลเยอร์สำหรับ Light Sweep, Glow, Parallax เบาๆ และ Transition ภาพ
- Motion เป็น Progressive Enhancement ไม่เป็นเงื่อนไขต่อการใช้งาน
- รองรับ Reduced Motion
- หลีกเลี่ยงเอฟเฟกต์ที่ทำให้ข้อความอ่านยาก โหลดช้า หรือรบกวนการกรอกฟอร์ม

## 8. Pricing and Estimation Design

### 8.1 หลักการ

- ใช้ CFA เป็นฐานคำนวณค่าก่อสร้าง ไม่ใช้ Usable Area แทนกัน
- ผลลัพธ์เป็น Estimated Range ไม่ใช่ราคาสุดท้ายหรือใบเสนอราคา
- Preview และ Full Report ใช้ Calculation Result ชุดเดียวกัน แต่ต่างกันที่ระดับรายละเอียดและช่วงความไม่แน่นอน
- สูตรสำคัญคำนวณและตรวจซ้ำบน Server
- ทุกผลลัพธ์เก็บ Pricing Version, Reference Date, Inputs, Assumptions, Included Items และ Excluded Items

### 8.2 ลำดับการคำนวณ

```text
room program
→ recommended usable area
→ user-adjusted usable area
→ construction floor area (CFA)
→ provincial base construction range
→ material level adjustment
→ building complexity adjustment
→ location and site access adjustment
→ core construction estimate
→ special feature allowances
→ site/foundation risk allowance
→ design & professional fee
→ tax/fee lines when applicable
→ project budget envelope
```

### 8.3 Formula Concept

```text
core_construction_range =
  CFA
  × province_rate_range
  × material_factor
  × complexity_factor
  × site_access_factor

project_budget_envelope =
  core_construction_range
  + special_feature_allowances
  + site_and_foundation_risk_allowance
  + design_and_professional_fee
  + applicable_tax_and_fees
```

ตัวคูณทั้งหมดต้องมาจาก Price Book ที่มี Version และผ่านการอนุมัติ ห้ามกระจายค่าคงที่ไว้หลายจุดใน UI หรือ Code

### 8.4 พื้นที่

- ระบบสร้าง Recommended Usable Area จากจำนวนและประเภทห้อง
- ผู้ใช้ Override ได้ภายในช่วงที่ระบบรองรับ
- CFA รวมพื้นที่ที่ก่อให้เกิดต้นทุนตามกติกา KSB เช่น บันได ระเบียง เฉลียง โรงจอดรถมีหลังคา และพื้นที่ระบบ โดยใช้น้ำหนักตามประเภทพื้นที่
- Report ต้องแสดง Usable Area และ CFA แยกกันพร้อมคำอธิบาย

### 8.5 Material Level

- Select — คุณภาพดี คุมงบอย่างมีมาตรฐาน
- Premium — สมดุลความสวย รายละเอียด และคุณภาพ
- Signature — วัสดุและรายละเอียดเฉพาะบุคคล

ช่วงทดลอง Q2/2026 ใน Research Baseline ใช้เพื่อ Calibrate เท่านั้น:

- Select: 18,000–23,700 บาท/ตร.ม. CFA
- Premium: 23,700–33,500 บาท/ตร.ม. CFA
- Signature: 33,500–50,000+ บาท/ตร.ม. CFA

ห้ามเผยแพร่ช่วงดังกล่าวเป็น Production Price Book จนกว่าสถาปนิก KSB ตรวจขอบเขตและ Backtest กับโครงการจริง

### 8.6 จังหวัดและข้อมูลราคา

- รองรับจังหวัดทั่วประเทศไทยในโครงสร้างข้อมูล
- ใช้ข้อมูลราคาวัสดุรายจังหวัด ดัชนี REIC Benchmark ตลาด และข้อมูลจริง KSB ประกอบกัน
- จังหวัดเป็น Input บังคับ; อำเภอ/เขตเป็น Optional Modifier เมื่อมีข้อมูลรองรับ
- การไม่มีข้อมูลระดับอำเภอต้องไม่ทำให้ระบบสร้างตัวคูณสมมติ

### 8.7 Complexity Adjustments

ขั้นต่ำต้องรองรับ:

- จำนวนชั้น
- ความซับซ้อนของรูปทรงและ Facade
- รูปแบบและความซับซ้อนของหลังคา
- ช่วงเสากว้าง
- Double Volume
- ช่องเปิดและกระจกขนาดใหญ่
- ความหนาแน่นของงานระบบพิเศษ

แต่ละ Modifier ต้องมีชื่อ เหตุผล ช่วงค่า สถานะใช้งาน และหลักฐานหรือผู้อนุมัติ

### 8.8 Special Feature Allowances

แยกจากค่าก่อสร้างหลัก:

- สระว่ายน้ำ
- ลิฟต์
- Smart Home
- Solar
- EV Charger
- Double Volume ในส่วนที่เป็น Premium เพิ่มเติม
- กระจกหรือ Curtain Wall ขนาดใหญ่

Allowance ต้องเป็นช่วงและระบุขอบเขตมาตรฐาน ห้ามทำให้ผู้ใช้เข้าใจว่าเป็นราคาผูกพัน

### 8.9 Site and Foundation Risk

- แสดงเป็นหมวด `ค่าเผื่อความเสี่ยงหน้างาน`
- อ้างอิงข้อมูลสภาพดินที่ทราบ การถมดิน ฐานราก ทางเข้าก่อสร้าง และ Logistics
- หากไม่มีผลสำรวจหรือทดสอบดิน ให้แสดงช่วงกว้างและระบุว่าต้องยืนยันภายหลัง
- ไม่ซ่อนค่าเผื่อนี้ใน Core Construction Estimate

### 8.10 Design & Professional Fee

ขอบเขตที่รวม:

- ออกแบบสถาปัตยกรรม
- ออกแบบโครงสร้าง
- ระบบไฟฟ้า
- ระบบสุขาภิบาล
- แบบขออนุญาต
- แบบก่อสร้างตามมาตรฐาน KSB

ขอบเขตที่ไม่รวม:

- ควบคุมงานก่อสร้าง
- ออกแบบตกแต่งภายใน
- ออกแบบภูมิสถาปัตยกรรม

ค่าควบคุมงาน หากเสนอในอนาคต ต้องเป็นบริการและราคาแยก ไม่รวมในยอดค่าออกแบบของ MVP

Price Book Candidate สำหรับค่าออกแบบใช้ช่วง 5–8.5% ของ Construction Scope พร้อม Minimum Fee เพื่อ Cross-check เท่านั้น วิธีคิดจริงต้องยึดกติกา KSB ที่ผ่านการอนุมัติ

### 8.11 Confidence Level

- C — Concept: ข้อมูลพื้นฐาน เหมาะกับ Free Preview และช่วงกว้าง
- B — Brief: มี CFA ความซับซ้อน รายการพิเศษ และข้อมูลหน้างานเบื้องต้น เหมาะกับ Full Report
- A — Pre-design Review: สถาปนิกตรวจ Requirement และข้อมูลที่ดินแล้ว อยู่นอกการคำนวณอัตโนมัติของ MVP

ระบบไม่ประกาศเปอร์เซ็นต์ความแม่นยำแคบจนกว่าจะมี Backtest รองรับ

### 8.12 Price Book Governance

- Price Book มีสถานะ Draft, Review, Published และ Retired
- Published Version แก้ย้อนหลังไม่ได้; การเปลี่ยนค่าต้องสร้าง Version ใหม่
- Project เดิมอ้างอิงผลและ Version เดิม
- ตรวจข้อมูลวัสดุรายเดือน ดัชนีรายไตรมาส Benchmark อย่างน้อยทุก 6 เดือน และข้อมูล KSB รายไตรมาส
- Production Publish ต้องมีผู้อนุมัติจาก KSB และผล Backtest แนบ

## 9. Logical System Architecture

### 9.1 Technology Direction

- Web application: Next.js รุ่น Stable ณ วันเริ่ม Implement
- Language: TypeScript แบบ Strict
- UI: React และระบบ Style ที่รองรับ Design Token
- Server: Server Routes/Actions ที่ตรวจ Schema ฝั่ง Server
- Primary database: PostgreSQL
- File storage: Object Storage สำหรับ PDF และ Asset ที่ผ่านอนุมัติ
- Analytics: Vendor-agnostic Event Layer
- Error monitoring: Structured Log ที่ไม่บันทึก PII โดยไม่จำเป็น

หากเริ่มจาก Repository ใหม่ให้ใช้โครงสร้างนี้ หากมี Codebase ก่อนเริ่ม Implement ต้องตรวจและรักษา Convention เดิมที่เหมาะสม

### 9.2 Modules

#### Configurator Module

รับผิดชอบ Step State, Validation, Draft Version และการนำทาง ไม่คำนวณราคาที่เชื่อถือได้เอง

#### Area Planning Module

รับ Room Program แล้วคืน Recommended Usable Area, CFA Breakdown และคำอธิบาย

#### Pricing Engine

รับ Validated Project Inputs และ Price Book Version แล้วคืน Calculation Result แบบ Deterministic และตรวจสอบย้อนหลังได้

#### Preview Module

Map Configuration ไปยัง Curated Concept Asset และสร้าง Free/Public Preview Payload ที่ไม่รวม PII

#### Lead Module

รับ Minimal Contact Data, Consent และ Idempotency Key แล้วสร้างหรือคืน Lead เดิมสำหรับคำขอซ้ำ

#### Project Access Module

ออก Private Token, ตรวจสิทธิ์ Full Report และจัดการ Token Expiry/Rotation

#### Report Module

สร้าง Full Report Payload และ PDF จาก Calculation Snapshot เดียวกัน

#### Sharing Module

สร้าง Public Share Record จาก Allowlist เท่านั้น ไม่ Copy Private Project Payload ทั้งก้อน

#### Pricing Admin Module

จัดการ Price Book, Source, Modifier, Approval และ Publish Audit โดยใช้ Role-based Access

#### Analytics Module

รับ Event ตาม Schema กลางและส่งต่อ Provider โดยตัด PII ก่อนส่ง

### 9.3 Data Boundaries

- `Configuration` ไม่มีชื่อหรือข้อมูลติดต่อ
- `CalculationSnapshot` เก็บ Input ที่จำเป็น ผลลัพธ์ และ Pricing Version
- `Lead` เก็บ PII และ Consent แยกจาก Configuration
- `PrivateProjectAccess` เก็บ Token แบบ Hash และสิทธิ์
- `PublicPreview` เก็บเฉพาะ Allowlisted Public Fields
- `AnalyticsEvent` ใช้ Session ID / Project ID แบบไม่เปิดเผย PII

## 10. Data Flow and State

### 10.1 Anonymous Journey

1. Browser สร้าง Anonymous Draft ID
2. ทุกการเปลี่ยนแปลงบันทึกแบบ Debounce ลง Browser Storage
3. Client ส่งเฉพาะ Validated Configuration ไปคำนวณ
4. Server ตรวจ Input, เลือก Published Price Book และคำนวณ
5. Client แสดง Free Preview จาก Result ที่ Server ยืนยัน

### 10.2 Lead Submission

1. Client สร้าง Idempotency Key สำหรับการ Submit หนึ่งครั้ง
2. Server ตรวจ Contact Method, Field ที่เกี่ยวข้อง และ Consent
3. Database บังคับ Unique Idempotency Key
4. Request ซ้ำด้วย Key เดิมต้องคืน Lead/Project เดิม ไม่สร้างรายการใหม่
5. ห้ามใช้ Email หรือ Phone เพียงอย่างเดียวเป็น Deduplication Key เพราะผู้ใช้หนึ่งคนอาจมีหลายโครงการ
6. เมื่อ Transaction สำเร็จ Server จึงออกสิทธิ์ Full Report

### 10.3 Report and PDF

- Full Report อ่านจาก Calculation Snapshot ที่บันทึกแล้ว
- PDF สร้างจาก Snapshot เดียวกันและเก็บสถานะ `not_generated`, `ready` หรือ `failed`
- การ Retry ต้องไม่สร้าง Report คนละ Version โดยไม่ตั้งใจ
- หาก PDF ล้มเหลว ผู้ใช้ยังอ่าน Full Report ในเว็บได้

## 11. Privacy and Security

### 11.1 Privacy Requirements

- ขอข้อมูลเท่าที่จำเป็นต่อรายงานและการติดต่อโครงการ
- เก็บ Consent Version และ Consented At
- แสดง Privacy Notice ก่อน Submit
- ไม่เก็บ PII ใน Local Storage โดย Default
- ไม่ส่ง PII เข้า Analytics, URL, Public Share, Client Log หรือ Error Log
- รองรับการค้นหา Export และลบข้อมูลตามกระบวนการของบริษัท
- ระยะเวลาเก็บข้อมูลต้องเป็น Production Configuration ที่ Privacy Owner ของ KSB อนุมัติ; ระบบต้องไม่อนุญาต Production Launch หากค่านี้และ Privacy Notice Version ยังไม่ถูกกำหนด

### 11.2 Security Invariants

- Full Report และ Detailed Estimate ตรวจสิทธิ์บน Server ทุกครั้ง
- Public Share สร้างจาก Allowlist ไม่ใช่การซ่อน Field ใน UI
- Private Token มี Entropy สูง เก็บแบบ Hash มี Expiry และ Rotate ได้
- Admin แยก Authentication และ Role จากผู้ใช้ทั่วไป
- Server ไม่เชื่อ Price, Pricing Version หรือ Unlock Status ที่ส่งจาก Client
- Input ทุกจุดมี Schema, Allowlist, Length Limit และ Rate Limit ที่เหมาะสม
- Secret และ Database Credential ไม่ส่งเข้า Browser
- PDF และ Asset ส่วนตัวไม่เปิดเป็น Public URL ถาวร

## 12. Analytics Specification

Event ขั้นต่ำ:

- `preview_viewed`
- `full_report_cta_clicked`
- `lead_form_started`
- `lead_form_abandoned`
- `lead_submitted`
- `full_report_unlocked`
- `pdf_downloaded`
- `summary_image_downloaded`
- `preview_shared`
- `consultation_requested`

Properties ที่อนุญาต:

- Anonymous Session ID
- Project ID แบบไม่เป็น PII
- Configurator Version
- Pricing Version
- Device Class
- Referrer Category
- UTM Fields ที่ผ่านการทำความสะอาด
- Current Step
- Material Level
- Province Code เมื่อ Privacy Review อนุญาต; ห้ามส่งที่อยู่หรือพิกัดละเอียด
- Timestamp

`lead_form_abandoned` เป็นเหตุการณ์เชิงประมาณการเพราะ Browser อาจปิดโดยไม่ส่ง Event ระบบควรบันทึกเมื่อเปิดฟอร์มแล้วไม่มี Submit ภายใน Session Window หรือเมื่อผู้ใช้เดินออกจาก Flow โดยชัดเจน ไม่พึ่ง `beforeunload` เพียงอย่างเดียว

## 13. Error Handling and Recovery

### Network Offline

- รักษา Draft ในเครื่อง
- แสดงสถานะ Offline และไม่อ้างว่าบันทึกบน Server แล้ว
- Retry เมื่อเชื่อมต่อใหม่โดยไม่ Reset ค่า

### Calculation Failure

- ไม่สร้างราคาจำลองฝั่ง Client เพื่อทดแทน
- เก็บ Configuration และให้ Retry
- บันทึก Error Code ที่ไม่มี PII สำหรับทีม

### Duplicate or Ambiguous Lead Submission

- ใช้ Idempotency Key และ Transaction
- หาก Client ไม่ได้รับ Response ให้ Query สถานะเดิมก่อน Retry
- ข้อความผู้ใช้ต้องไม่ทำให้ Submit ซ้ำโดยไม่จำเป็น

### Price Book Unavailable

- ไม่ใช้ Draft หรือ Retired Version โดยอัตโนมัติ
- ระงับการคำนวณและแจ้งข้อความที่สุภาพ
- Alert ทีมเมื่อ Published Version ใช้งานไม่ได้

### PDF Failure

- Full Report ยังใช้งานได้
- แสดงปุ่ม Retry
- ใช้ Snapshot เดิมเมื่อสร้างใหม่

### Expired Private Link

- ไม่เปิดเผยว่าข้อมูลติดต่อใดอยู่ในระบบ
- ให้เข้าสู่กระบวนการขอลิงก์ใหม่ตามช่องทางที่ยืนยันได้

### Incompatible Local Draft

- Draft มี Schema Version
- Migration ที่รองรับต้องรักษาข้อมูล
- หากไม่รองรับ ให้แจ้งผู้ใช้และเสนอเริ่มใหม่โดยไม่เกิด Crash

## 14. Accessibility, Responsive and Performance

### Accessibility

- ใช้งาน Configurator และ Lead Form ได้ด้วย Keyboard
- Focus Indicator ชัดเจน
- Label, Error, Help Text และ Required State เชื่อมกันอย่างถูกต้อง
- Screen Reader รับรู้ Step, Selection, Price Update และ Form Error
- Contrast ผ่านการตรวจจริง
- Touch Target เหมาะกับ Mobile
- ไม่ใช้สีเพียงอย่างเดียวสื่อสถานะ

### Responsive

- Mobile เป็น Single-column Flow
- ไม่มี Horizontal Scroll สำหรับเนื้อหาหลัก
- Sticky Action ต้องไม่บัง Field หรือ Keyboard
- Preview Image ใช้ขนาดและ Crop ที่เหมาะกับอุปกรณ์
- Desktop Split Layout ต้องยุบตัวอย่างมีลำดับบน Tablet

### Performance

- รูป Concept ใช้ Responsive Image และโหลดเฉพาะที่จำเป็น
- ไม่โหลดภาพทุกสไตล์ความละเอียดสูงพร้อมกัน
- Font, Motion และ PDF Library ไม่ควรบล็อก First Interaction
- Analytics และ Integration ภายนอกต้องไม่ทำให้ Configurator ใช้งานไม่ได้

## 15. Testing Strategy

### Unit Tests

- Room Program → Recommended Usable Area
- Usable Area → CFA Breakdown
- Province/Material/Complexity Modifiers
- Allowance Aggregation
- Design Fee Scope
- Low/Expected/High Range
- Confidence Level
- Public Preview Field Allowlist
- Lead Validation และ Idempotency

### Golden Pricing Cases

สร้างกรณีมาตรฐานที่สถาปนิก KSB อนุมัติ ครอบคลุม:

- จังหวัดและภูมิภาคหลัก
- 1–3 ชั้นตามช่วงที่ Price Book รองรับ
- Select, Premium, Signature
- พื้นที่ต่ำ กลาง สูง
- บ้านรูปทรงเรียบและซับซ้อน
- Special Feature แต่ละประเภทและหลายประเภทร่วมกัน
- Site Access ปกติและมีข้อจำกัด

เมื่อ Price Book เปลี่ยน ต้องแสดง Diff ของ Golden Cases ก่อน Publish

### Integration Tests

- Client/Server Validation ให้ผลสอดคล้องกัน
- Calculation Snapshot ใช้ Pricing Version ถูกต้อง
- Lead Transaction สร้าง Project Access หลังสำเร็จเท่านั้น
- Report และ PDF ใช้ Snapshot เดียวกัน
- Public Share ไม่มี Private Fields
- Analytics Payload ไม่มี PII

### End-to-End Tests

- Landing → 5 Steps → Free Preview
- Preview โดยไม่มี PII
- Full Report ล็อกก่อน Submit
- Soft Gate ตาม Contact Method
- Submit สำเร็จและปลดล็อก
- Submit ซ้ำไม่สร้าง Lead ซ้ำ
- PDF Download
- Project Summary Image Download
- Save / Reopen ผ่าน Private Link
- Public Share CTA กลับเข้า Configurator
- Back, Refresh, Offline และ Recovery

### Manual QA

- Mobile, Tablet, Desktop
- Keyboard และ Screen Reader
- DB Heavent หรือ Approved Fallback
- Thai line wrapping และวรรณยุกต์
- Slow Network และ API Failure
- Reduced Motion
- Browser หลักที่ KSB กำหนดใน Launch Matrix

## 16. Calibration and Launch Plan

### 16.1 Pricing Calibration

ก่อน Production Pricing Publish ต้องใช้ข้อมูล KSB แบบปกปิดลูกค้าอย่างน้อย 10–20 โครงการ เก็บ:

- ช่วงเวลาและจังหวัด
- Usable Area และ CFA
- จำนวนชั้นและความซับซ้อน
- Material Level
- ราคาประเมิน ราคาตามสัญญา Variation และราคาจบจริงเมื่อมี
- Included/Excluded Scope
- ค่าออกแบบจริงและขอบเขต

วัด Median Error, P80 Error, Coverage ของช่วงราคา และเหตุผล Outlier แยกตาม Material Level และภูมิภาค หาก Coverage ต่ำกว่าเป้าหมาย ให้ปรับสูตรหรือขยายช่วงก่อน Publish

### 16.2 Soft Launch

1. Internal QA โดยทีม KSB และสถาปนิก
2. Pilot กับผู้ใช้กลุ่มเล็ก
3. ตรวจ Funnel และตัวอย่าง Lead จริง
4. ตรวจราคาเทียบกับการประเมินโดยสถาปนิก
5. ปรับ Copy, Range และ Soft Gate
6. เปิด Traffic เพิ่มเมื่อคุณภาพผ่าน Launch Gate

### 16.3 Launch Gates

- Acceptance Criteria ผ่านทั้งหมด
- มี Published Price Book ที่ KSB อนุมัติ
- Golden Pricing Cases ผ่าน
- Public Share ไม่รั่ว PII หรือ Pricing
- Full Report ตรวจสิทธิ์ฝั่ง Server
- Report และ PDF แสดงตัวเลขตรงกัน
- Draft Recovery และ Duplicate Submit ผ่าน
- Analytics Funnel ครบและไม่มี PII
- Privacy Notice, Consent Version และ Retention Configuration ได้รับอนุมัติ
- Webfont License หรือ Approved Fallback ชัดเจน
- Curated Concept Assets ผ่าน Content QA และมีสิทธิ์ใช้งาน
- มีผู้รับผิดชอบ Lead และช่องทางแจ้งเตือนที่ทดสอบแล้ว

## 17. Acceptance Criteria

- ผู้ใช้เห็น Free Preview ได้โดยไม่กรอกข้อมูลส่วนตัว
- Free Preview แสดง Concept, ข้อมูลบ้าน และกรอบงบประมาณช่วงกว้าง
- Full Report และ Detailed Estimate ล็อกจนกว่า Lead Submit สำเร็จ
- Lead Form ขอข้อมูลเท่าที่จำเป็นตามช่องทางติดต่อ
- Privacy Notice และ Consent ชัดเจน
- Refresh หรือ Back แล้ว Configuration ไม่หายโดยไม่จำเป็น
- Request ซ้ำด้วย Idempotency Key เดิมไม่สร้าง Lead ซ้ำ
- ผู้ใช้แชร์ Public Preview ได้โดยไม่เปิดเผย PII, Pricing, Full Requirement หรือ Private Notes
- Public Preview มี CTA กลับเข้า Configurator
- Full Report แยก Construction, Design Fee, Allowance, Site Risk, Tax/Fee และ Exclusion
- ค่าออกแบบไม่รวมค่าควบคุมงาน
- Report แสดง Pricing Version, Reference Date, Assumptions และ Confidence Level
- Full Report, PDF และ Project Summary Image ใช้ Calculation Snapshot เดียวกัน
- รองรับ Mobile, Keyboard, Screen Reader และ Accessible Form
- Analytics แยกวัด Preview → Lead → Full Report ได้และไม่ส่ง PII
- ระบบไม่แสดงราคาปลอมเมื่อ Pricing Service ล้มเหลว
- Pricing Admin Publish Version ใหม่โดยไม่แก้ผลโครงการย้อนหลัง

## 18. Production Inputs and Ownership

รายการเหล่านี้ไม่เปลี่ยนสถาปัตยกรรม แต่ต้องมีผู้อนุมัติก่อนผ่าน Launch Gate:

| รายการ | เจ้าของการอนุมัติ | พฤติกรรมระบบก่อนอนุมัติ |
|---|---|---|
| Room size และ CFA coefficients | สถาปนิก KSB | ใช้ได้เฉพาะ Draft/QA; ห้าม Publish Price Book |
| ราคา จังหวัด Material และ Modifier | Pricing Owner + สถาปนิก KSB | คำนวณใน Test Environment เท่านั้น |
| Special Feature Allowance | สถาปนิก/ผู้เชี่ยวชาญ KSB | ซ่อน Feature ที่ยังไม่มีช่วงรับรอง |
| Curated Concept Asset และ Mapping | Creative + สถาปนิก KSB | ซ่อน Style ที่ไม่ผ่าน QA |
| Consent, Privacy Notice, Retention | Privacy Owner ของ KSB | Production Deployment ถูก Block |
| DB Heavent Webfont License | Brand/Legal Owner | ใช้ Approved Fallback |
| Lead Owner และ Notification Channel | ผู้บริหาร KSB | Soft Launch ไม่เปิดรับ Public Lead |
| Contact SLA | Lead Owner | ไม่สัญญาระยะเวลาติดต่อใน Copy |
| Hosting, Database, Analytics Provider | Technical Owner | ใช้ Adapter/Interface ใน Development |

## 19. Delivery Decomposition

เพื่อควบคุมความเสี่ยง แบ่งการพัฒนาเป็นลำดับ:

1. Foundation: Repository, Design Tokens, Schema และ Test Harness
2. Configurator UI + Local Draft
3. Area Planning + Curated Preview
4. Versioned Pricing Engine + Calibration Tools
5. Free Preview + Public Share
6. Lead, Consent, Private Project Access
7. Full Report + PDF
8. Pricing Admin
9. Analytics + Error Monitoring
10. Accessibility, Security, Performance และ Soft Launch QA

แต่ละลำดับต้องมี Test และ Acceptance Criteria ของตนเอง ไม่รอทดสอบทั้งหมดในช่วงท้าย

## 20. Final Decision Summary

- ใช้ Guided Architect Experience
- ใช้ Adaptive Obsidian Luxury
- MVP สำหรับบ้านสร้างใหม่เท่านั้น
- ใช้ Configurator 5 ขั้นและ Preview ด้านขวาบน Desktop
- ใช้ Curated Photorealistic Concept ไม่ใช้ Real-time AI/3D
- ให้ Free Preview ก่อนขอข้อมูล
- ใช้ Soft Gate สำหรับ Full Report
- งบเป้าหมายเป็น Optional Input
- แยกค่าเสี่ยงหน้างานและ Special Allowance
- ค่าออกแบบรวมสถาปัตยกรรม โครงสร้าง ไฟฟ้า สุขาภิบาล แบบขออนุญาต และแบบก่อสร้าง
- ไม่รวมค่าควบคุมงาน ภายใน และภูมิสถาปัตยกรรม
- ใช้ Anonymous Local Draft และ Private Link แบบไม่ใช้บัญชี
- Public Share ไม่แสดง PII หรือ Pricing
- ใช้ Versioned Evidence-based Price Book และ Backtest ก่อน Production
- ภาษาไทยและ DB Heavent เป็นทิศทางหลัก โดยต้องผ่าน Webfont License Gate
