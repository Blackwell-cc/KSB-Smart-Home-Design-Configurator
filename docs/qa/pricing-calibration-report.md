# KSB Pricing Calibration Report — Soft-launch Gate

**สถานะ ณ 10 สิงหาคม 2026: BLOCKED — ยังห้าม Publish Price Book และยังห้ามติด tag Soft Launch**

เหตุผลคือ repository ไม่มีเคสโครงการ KSB ที่ anonymized สำหรับเทียบราคา (ต้องมีอย่างน้อย 10 เคสที่เทียบกันได้), ยังไม่มีเกณฑ์ Coverage/MAPE/P80 ที่ KSB อนุมัติ และยังไม่มีลายเซ็น Pricing Approver/Architect/Privacy/Operations เอกสารนี้เตรียมวิธีรับข้อมูล สูตรคำนวณ และแบบบันทึกผลไว้ครบโดยไม่สร้างตัวเลขอนุมัติปลอม

## 1. Evidence inventory

| รายการ | หลักฐานที่มี | สถานะ |
|---|---|---|
| QA Price Book | `TH-2026Q2-QA-0.1`, Bangkok baseline, status `review` | QA เท่านั้น |
| Local seed | `supabase/seed.sql`; หนึ่งจังหวัด, ไม่มี approver, golden gate = false | Publish ไม่ได้โดยตั้งใจ |
| Golden unit cases | Pricing tests ใน `web/src/features/pricing` | ผ่านเชิง software ไม่ใช่การรับรองราคาจริง |
| เคสโครงการจริงแบบ anonymized | ไม่พบใน repository | ขาดข้อมูล |
| Coverage target | ยังไม่มีหลักฐานอนุมัติ | Pending |
| MAPE/P80 target | ยังไม่มีหลักฐานอนุมัติ | Pending |
| Price Book approver | Admin role รองรับแล้ว แต่ไม่มี approval record จริง | Pending |

## 2. Calibration input contract

ทำงานกับไฟล์ชั่วคราวในพื้นที่ที่ KSB อนุมัติและจำกัดสิทธิ์ ห้าม commit ไฟล์โครงการจริงเข้า Git แต่ละแถวต้องมีเฉพาะข้อมูลต่อไปนี้:

| Field | รูปแบบ/เงื่อนไข |
|---|---|
| `project_code` | รหัสสุ่มสำหรับ calibration ห้ามย้อนกลับไปหาลูกค้าได้ |
| `reference_date` | `YYYY-MM-DD` วันที่ของฐานราคา |
| `province_code` | รหัสจังหวัด 2 หลักตาม catalog 77 จังหวัด |
| `usable_area_m2` | ตัวเลขมากกว่า 0 |
| `cfa_m2` | ตัวเลขมากกว่า 0 และอธิบายวิธีวัดตรงกับ Area Catalog |
| `floors` | 1–3 |
| `material_level` | `select`, `premium` หรือ `signature` |
| `complexity_profile` | `normal`, `restricted` หรือ `very-restricted` ตามนิยามที่อนุมัติ |
| `contract_price` | มูลค่าสัญญาใน scope ที่ใช้เทียบ หน่วยบาท |
| `variation_total` | ผลรวม variation ใน scope เดียวกัน หน่วยบาท |
| `final_price` | ราคาจริงสุดท้ายที่ใช้เป็นฐานเทียบ หน่วยบาทและมากกว่า 0 |
| `included_scope` | รหัส scope ที่รวม คั่นด้วย `|`; ใช้ controlled vocabulary |
| `excluded_scope` | รหัส scope ที่ไม่รวม คั่นด้วย `|`; ใช้ controlled vocabulary |
| `design_fee` | ค่าวิชาชีพออกแบบ หน่วยบาท; แยกจากก่อสร้าง |
| `design_scope` | รหัสขอบเขตงานออกแบบ คั่นด้วย `|` |

### PII rejection rule

ปฏิเสธทั้งไฟล์ทันทีเมื่อพบ column เพิ่มเติมหรือข้อความที่เป็นชื่อบุคคล/บริษัทลูกค้า, ช่องทางติดต่อ, ที่อยู่ระดับบ้านหรือแปลง, เลขเอกสารสิทธิ์, เลขประจำตัว, เลขบัญชี หรือ token ใด ๆ ผู้เตรียมข้อมูลต้องเก็บ mapping จากรหัส calibration ไปข้อมูลต้นฉบับไว้นอกระบบนี้และจำกัดสิทธิ์

### Comparable-case rule

ใช้เคสคำนวณ gate ได้เมื่อ CFA มีนิยามตรงกัน, scope หลักตรงกับ estimate, ระดับวัสดุและความซับซ้อนจัดหมวดได้, ราคาสุดท้ายผ่านการตรวจทาน และวันที่อ้างอิงอยู่ในช่วงที่ Pricing Approver ยอมรับ เคสที่ scope ไม่ตรงต้องแยกเป็น outlier/ไม่ comparable ห้ามปรับราคาให้ดูเข้าเกณฑ์

## 3. Backtest method

สำหรับแต่ละเคส ให้รัน configuration ผ่าน candidate Price Book เดียวกันและบันทึก `estimate_low`, `estimate_expected`, `estimate_high`

- `APE = abs(estimate_expected - final_price) / final_price`
- `Median APE` = ค่ากลางของ APE หลังเรียงจากน้อยไปมาก
- `P80 APE` = nearest-rank percentile ที่ตำแหน่ง `ceil(0.80 × N)`
- `Range Covered` = `estimate_low <= final_price <= estimate_high`
- `Range Coverage` = จำนวนเคส Range Covered / จำนวนเคส comparable

รายงานทั้งภาพรวม, แยก `material_level` และแยก region ตามตาราง province→region ที่ Architect/Pricing Approver อนุมัติ ห้ามรายงาน segment ที่มีน้อยกว่า 3 เคสเป็นข้อสรุป ให้แสดงว่า “ข้อมูลยังไม่พอ”

## 4. Result table

ยังไม่คำนวณเพราะ `N = 0`

| Segment | Comparable N | Median APE | P80 APE | Range Coverage | Gate |
|---|---:|---:|---:|---:|---|
| Overall | 0 | N/A | N/A | N/A | BLOCKED: ต้องมีอย่างน้อย 10 เคส |
| Select | 0 | N/A | N/A | N/A | Insufficient data |
| Premium | 0 | N/A | N/A | N/A | Insufficient data |
| Signature | 0 | N/A | N/A | N/A | Insufficient data |
| Region groups | 0 | N/A | N/A | N/A | รอ region mapping ที่อนุมัติ |

เกณฑ์ขั้นต่ำที่ล็อกแล้วจากแผนคือ comparable cases ต้องไม่น้อยกว่า 10 และ Coverage ต้องไม่ต่ำกว่า target ที่อนุมัติ ส่วนค่าต่อไปนี้ยังต้องให้ KSB กรอกก่อนเริ่มตัดสินผล:

| Decision threshold | ค่าอนุมัติ | ผู้อนุมัติ | วันที่ |
|---|---:|---|---|
| Minimum Range Coverage | Pending | Pricing Approver |  |
| Maximum Median APE | Pending | Pricing Approver |  |
| Maximum P80 APE | Pending | Pricing Approver |  |
| Accepted reference-date window | Pending | Pricing Approver |  |

## 5. Outlier register

บันทึกทุกเคสที่อยู่นอก range หรือ APE สูง ห้ามลบเคสโดยไม่มีเหตุผลและผู้ทบทวน

| Project code | Segment | APE | Covered | Root cause | Action | Reviewer |
|---|---|---:|---|---|---|---|
| Pending |  |  |  | Scope / site / material / date / data quality |  |  |

## 6. Publish decision

`publish_price_book` เรียกได้ต่อเมื่อครบทุกข้อ:

- Comparable cases อย่างน้อย 10 และผล segment ไม่มีสัญญาณ bias ที่ยังไม่อธิบาย
- Coverage, Median APE และ P80 APE ผ่าน threshold ที่ลงนาม
- Source records และ golden-case results ถูกบันทึกใน `price_book_reviews`
- Province rates ครบ 77 จังหวัดและ entry types ทุกชุดผ่าน database validator
- Room/CFA coefficients ได้รับอนุมัติจากสถาปนิก
- Pricing Approver คนละบทบาทกับผู้เตรียม candidate ตรวจและลงเวลาอนุมัติ
- Checklist ด้าน asset rights, consent/retention, Lead owner/channel และ Production environment ผ่านครบ

เมื่อผ่านแล้วให้แนบ export ผล metric, outlier register และ approval reference เข้ากับ release record โดยยังคงเก็บ dataset ต้นทางไว้นอก Git

## 7. Required next actions

1. KSB Pricing Owner เตรียมเคส anonymized 10–20 เคสตาม contract
2. Architect อนุมัตินิยาม CFA, complexity profile และ province→region mapping
3. Pricing Approver กำหนด Coverage/MAPE/P80 thresholds ก่อนเห็นผล backtest เพื่อลด bias
4. Engineering รัน backtest และกรอกตารางผล/outlier โดยไม่แก้ source rows
5. ผู้อนุมัติลงนามใน `docs/qa/launch-checklist.md`
6. จึงค่อย publish Price Book, ทดสอบ staging/pilot และพิจารณา tag `v0.1.0-soft-launch`
