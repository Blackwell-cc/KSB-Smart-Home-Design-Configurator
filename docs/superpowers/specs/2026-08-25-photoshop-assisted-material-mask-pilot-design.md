# Photoshop-Assisted Material Mask Pilot Design

**วันที่:** 25 สิงหาคม 2026  
**ขอบเขต Pilot:** บ้านสไตล์นอร์ดิก 2 ชั้น (`nordic-2f`)  
**เป้าหมาย:** เปลี่ยนวัสดุ 5 หมวดบนภาพบ้านเดิมโดยบ้าน มุมกล้อง สัดส่วน แสง สวน และฉากหลังไม่เปลี่ยน พร้อมลดงานคนให้เหลือการตรวจและแก้ Mask ใน Photoshop

## 1. ปัญหาและสาเหตุราก

ระบบปัจจุบันสร้างพื้นที่วัสดุจาก Polygon คร่าว ๆ และกรองพิกเซลด้วยค่าสีของภาพ จึงไม่เข้าใจความหมายทางสถาปัตยกรรมว่าอะไรคือหลังคา หน้าจั่ว เชิงชาย ผนัง กรอบหน้าต่าง ประตู หรือพื้นจริง ๆ ผลลัพธ์จึงมีทั้งพื้นที่ขาด พื้นที่เกิน และขอบวัสดุซ้อนส่วนประกอบอื่น

การเพิ่ม Polygon หรือปรับเกณฑ์สีต่อไปไม่สามารถรับประกันความแม่นยำ เพราะแสง เงา และสีของหลายส่วนในภาพใกล้เคียงกัน ปัญหาต้องแก้ที่แหล่งข้อมูลด้วย Semantic Mask ที่ผ่านการตรวจ ไม่ใช่แก้ความเข้มของเลเยอร์ปลายทาง

## 2. แนวทางที่เลือก

ใช้ Photoshop เป็นเครื่องมือเตรียม Asset ภายนอกแบบกึ่งอัตโนมัติ:

1. ใช้ Object Selection, Quick Selection หรือเครื่องมือเลือกวัตถุช่วยสร้าง Mask ตั้งต้น
2. ให้ผู้จัดเตรียม Asset ตรวจพื้นที่ด้วย Debug Overlay สีสด
3. แก้เฉพาะขอบหรือจุดที่เครื่องมือเลือกผิดด้วย Brush/Pen Tool
4. แบ่งพื้นผิวที่มี Perspective ต่างกันเป็นระนาบย่อย
5. ใช้ Mask ชุดเดียวซ้ำกับวัสดุทั้ง 4 ตัวเลือกในหมวดนั้น
6. ส่งออก Transparent WebP ที่ตรงกับภาพฐานทุกพิกเซล
7. เว็บไซต์ประกอบภาพฐานกับ Overlay ที่ผู้ใช้เลือก โดยไม่สร้างภาพใหม่ระหว่างใช้งาน

แนวทางนี้เปลี่ยนเฉพาะผิว สี และลวดลายของวัสดุ ไม่เปลี่ยน Geometry ของบ้าน หากตัวเลือกวัสดุต้องเปลี่ยนรูปทรงจริง เช่น เปลี่ยนรูปแบบวงกบหรือรายละเอียดขอบหลังคา จะต้องมี Render แยกและอยู่นอกขอบเขต Pilot นี้

## 3. โครงสร้างไฟล์ Photoshop

ใช้ภาพ `base-nordic-2f-master.webp` เป็น Smart Object ที่ล็อกตำแหน่งและขนาด ห้าม Crop, Resize หรือ Transform หลังเริ่มสร้าง Mask

```text
Nordic-2F-Material-Master.psd
├─ 00_REFERENCE
│  ├─ BASE_HOUSE_LOCKED
│  └─ DEBUG_GUIDES
├─ 10_ROOF
│  ├─ MASK_ROOF_ALL
│  ├─ roof-main-left
│  ├─ roof-main-right
│  ├─ roof-garage
│  ├─ roof-wing
│  └─ roof-minor-planes
├─ 20_WALL
│  ├─ MASK_WALL_ALL
│  └─ wall-plane-*
├─ 30_WINDOW
│  ├─ MASK_WINDOW_FRAME_ALL
│  └─ window-frame-*
├─ 40_DOOR
│  ├─ MASK_ENTRY_DOOR_ALL
│  └─ entry-door-*
├─ 50_FLOORING
│  ├─ MASK_FLOORING_ALL
│  └─ floor-plane-*
└─ 90_DEBUG
   ├─ ROOF_RED
   ├─ WALL_BLUE
   ├─ WINDOW_GREEN
   ├─ DOOR_YELLOW
   └─ FLOOR_MAGENTA
```

ไฟล์ PSD เป็นไฟล์ทำงานเท่านั้น เว็บไซต์ไม่โหลด PSD

## 4. นิยามพื้นที่แต่ละหมวด

### หลังคา

- รวมเฉพาะผิววัสดุมุงหลังคาที่มองเห็น
- ไม่รวมหน้าจั่ว ผนังใต้หน้าจั่ว เชิงชาย รางน้ำ เสา กระจก และท้องหลังคา
- แยกแต่ละระนาบเพื่อให้ Texture เดินตาม Perspective และสเกลเดียวกัน

### ผนังภายนอก

- รวมผิวผนังทึบที่ต้องการเปลี่ยน Finish
- ไม่รวมช่องกระจก ประตู กรอบหน้าต่าง หลังคา เสาไฟ ต้นไม้ และของตกแต่งที่อยู่ด้านหน้า
- หากเสาเป็นวัสดุเดียวกับผนัง ให้กำหนดเป็นระนาบย่อยอย่างชัดเจน

### หน้าต่าง

- รวมเฉพาะกรอบ วงกบ และ Mullion ที่เป็นวัสดุเลือกได้
- ไม่รวมกระจก วิวภายใน เงาสะท้อน และผนังรอบช่องเปิด

### ประตูทางเข้า

- รวมเฉพาะบานประตูและส่วนกรอบที่อยู่ในขอบเขตวัสดุของประตู
- ไม่รวมผนัง บัว ช่องกระจกข้าง และขั้นบันได เว้นแต่แบบต้นฉบับกำหนดเป็นชุดเดียวกัน

### พื้น

- Pilot ครอบคลุมพื้นเฉลียงและพื้นทางเข้าที่กำหนดไว้ล่วงหน้า
- ไม่รวมสนาม ทางรถ ถนน บันได สระน้ำ หรือพื้น Landscape จนกว่าจะระบุเป็นส่วนหนึ่งของวัสดุเดียวกัน
- แบ่งระนาบตาม Perspective เพื่อไม่ให้ลาย Texture แบนหรือผิดทิศทาง

## 5. วิธีประกอบวัสดุใน Photoshop

สำหรับแต่ละตัวเลือก:

1. วาง Texture เป็น Smart Object
2. ใช้ Perspective/Warp แยกตามระนาบ
3. ใช้ Mask กลุ่มของหมวดนั้นเป็น Clipping/Layer Mask
4. ใส่ Undercoat ทึบภายใน Mask เพื่อปิดวัสดุเดิม ไม่ให้ลายเดิมลอด
5. นำข้อมูลแสงและเงาจากภาพฐานกลับมาซ้อนด้วย Luminance/Multiply ที่ปรับเฉพาะหมวด
6. ตรวจความต่อเนื่องของ Texture ระหว่างระนาบและขอบอาคาร
7. Export เฉพาะ Overlay แบบโปร่งใสนอก Mask

ห้ามใช้ Blend Mode เดียวกับทุกหมวดโดยไม่ตรวจ เพราะหลังคา ผนัง กรอบโลหะ ประตูไม้ และพื้นต้องรักษาแสงต่างกัน

## 6. Asset Contract

Pilot ใช้ขนาดภาพต้นฉบับ `1672 × 941 px` ทุกไฟล์ ไม่มีการ Crop หรือ Resize ระหว่างไฟล์

```text
public/material-previews/nordic/2f/
├─ base.webp
├─ roof/
│  ├─ concrete-tile.webp
│  ├─ ceramic-tile.webp
│  ├─ metal-roof.webp
│  └─ natural-slate.webp
├─ wall/
│  ├─ smooth-plaster.webp
│  ├─ natural-stone.webp
│  ├─ exterior-timber.webp
│  └─ exposed-concrete.webp
├─ window/
│  ├─ black-aluminium.webp
│  ├─ natural-aluminium.webp
│  ├─ solid-wood.webp
│  └─ upvc.webp
├─ door/
│  ├─ teak.webp
│  ├─ engineered-wood.webp
│  ├─ aluminium-glass.webp
│  └─ metal-frame.webp
└─ flooring/
   ├─ natural-marble.webp
   ├─ engineered-wood.webp
   ├─ porcelain-tile.webp
   └─ terrazzo.webp
```

ข้อกำหนด Overlay:

- Lossless WebP พร้อม Alpha
- Canvas `1672 × 941 px`
- โปร่งใส 100% นอกพื้นที่วัสดุ
- พื้นที่ภายใน Mask ต้องปิดวัสดุเดิมได้ ไม่เป็นเพียงเงาจาง
- ไม่มี Pixel ที่เกิดจากการเลื่อนตำแหน่งหรือ Resize
- ชื่อไฟล์ใช้ Stable ID จาก `MATERIAL_CATALOG`

## 7. การทำงานของเว็บไซต์

เว็บไซต์ใช้ `HouseConfiguration.materialSelections` ชุดเดิมเป็น Source of Truth และประกอบภาพตามลำดับ:

```text
BASE
→ FLOORING
→ WALL
→ ROOF
→ WINDOW
→ DOOR
```

เมื่อเลือกวัสดุใหม่ ให้เปลี่ยนเฉพาะ `src` ของหมวดนั้นและ Crossfade 180 ms หมวดอื่นต้องไม่เปลี่ยน การแสดงใน Step 5, Preliminary Summary และ Full Report ต้องใช้ Descriptor ชุดเดียวกัน

หาก Overlay ใดโหลดไม่สำเร็จ ให้คง Overlay ก่อนหน้าและแสดงสถานะที่เข้าถึงได้ ห้ามแสดง Broken Image หรือทำให้ Preview ว่าง

## 8. Quality Gate ก่อนนำ Asset เข้าเว็บ

แต่ละหมวดต้องผ่านการตรวจดังนี้:

1. เปิด Debug Overlay สีสดที่ Opacity 60–80%
2. Zoom 200–400% ตรวจขอบ หน้าจั่ว เชิงชาย ช่องเปิด และสิ่งกีดขวาง
3. เปิด Checkerboard ตรวจว่า Alpha นอก Mask โปร่งใสจริง
4. เปิด Overlay ทับ Base ที่ Opacity 50% เพื่อตรวจ Pixel Alignment
5. สลับวัสดุครบ 4 ตัวเลือก ตรวจ Perspective และสเกล Texture
6. เปิดวัสดุทั้ง 5 หมวดพร้อมกัน ตรวจ Mask ซ้อนและลำดับ Layer
7. ตรวจที่ขนาดหน้าจอ 375, 768, 1440, 1672 และ Wide Desktop

เกณฑ์ผ่าน:

- ไม่มีพื้นที่วัสดุขาดหรือเกินที่มองเห็นได้ในขนาดใช้งานจริง
- หน้าจั่ว เชิงชาย กระจก และ Landscape ไม่ถูกเปลี่ยนผิดหมวด
- Texture เดินตาม Perspective
- แสงและเงาของบ้านคงความเป็นภาพเดียวกัน
- เปลี่ยนหนึ่งหมวดแล้วหมวดอื่นไม่เปลี่ยน
- ไม่มี Flash, Broken Image, Console Error หรือ Horizontal Overflow

## 9. บทบาทของคนและระบบ

### คนเตรียม Asset

- สร้าง Selection ตั้งต้นด้วยเครื่องมือช่วยเลือก
- ตรวจและแก้ Mask เฉพาะจุด
- กำหนด Perspective ของระนาบ
- ตรวจ Debug Overlay และอนุมัติ Asset

### Script เตรียมไฟล์

- ตรวจขนาด Canvas, Alpha และชื่อไฟล์
- แปลง Export เป็น Lossless WebP
- ตรวจไฟล์ขาดและ Mask ว่าง
- สร้างภาพ Contact Sheet สำหรับ QA

### เว็บไซต์

- เลือก Asset ตาม State เดิม
- ประกอบ Base และ Overlay แบบเรียลไทม์
- ทำ Transition และ Fallback
- ส่งภาพเดียวกันต่อไปยัง Step 5 และรายงาน

## 10. ขอบเขต Pilot และสิ่งที่ยังไม่ทำ

Pilot ทำเฉพาะ `nordic-2f` ครบ 5 หมวด × 4 ตัวเลือกก่อน ไม่สร้าง Mask Editor ในเว็บ ไม่รองรับ Geometry Swap และยังไม่ขยายไป 7 สไตล์ × 3 ชั้นจนกว่า Pilot จะผ่าน Quality Gate

หลัง Pilot ผ่าน ให้บันทึกเวลาจริงต่อฉาก จำนวนจุดที่ต้องแก้ และปัญหา Texture Mapping แล้วจึงประเมินการผลิต Scene ที่เหลือเป็น Batch

## 11. Acceptance Criteria

- Nordic 2 ชั้นใช้ภาพฐานเดียวกับขั้นตอนก่อนหน้า
- มี Overlay ครบ 20 ไฟล์ตาม Stable ID
- หลังคา ผนัง หน้าต่าง ประตู และพื้นมี Semantic Mask ที่ผ่านการตรวจ
- หลังคาไม่เปลี่ยนหน้าจั่ว ผนัง เชิงชาย หรือกระจก
- หน้าต่างเปลี่ยนเฉพาะกรอบ ไม่เปลี่ยนกระจก
- วัสดุเดิมไม่ลอดผ่านจนดูเป็นเงาจาง
- Texture ของหลังคาและพื้นตรง Perspective
- เว็บไซต์เปลี่ยนเฉพาะหมวดที่ผู้ใช้เลือก
- Step 4, Step 5 และหน้ารายงานใช้การเลือกชุดเดียวกัน
- Asset Test, Unit Test, E2E, Lint, Typecheck และ Production Build ผ่าน

