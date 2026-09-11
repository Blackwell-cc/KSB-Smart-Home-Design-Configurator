# Preview Cinematic Gold Reveal Design

## Goal

สร้างจังหวะเปิดเผยผลลัพธ์หลัง Loader สิ้นสุด ให้หน้าภาพรวมบ้านรู้สึกหรู มีพลัง และน่าตื่นตาตื่นใจ โดยคงโครงสร้าง ตำแหน่ง และเนื้อหาปัจจุบันทั้งหมด

## Visual Direction

ใช้แนวทาง **Cinematic Gold Reveal** ในโทนดำ ทอง และงาช้างของ KSB Architect จุดเด่นคือแสงทองเส้นเดียวที่กวาดผ่านภาพบ้านในช่วงเปิดหน้า การเคลื่อนไหวอื่นทำหน้าที่พาสายตาจากภาพบ้านไปสู่ตัวเลขงบประมาณอย่างเป็นลำดับ

## Motion Sequence

1. พื้นหลังหน้าและ Header ปรากฏทันทีเพื่อป้องกันภาพกระพริบ
2. ภาพบ้านค่อย ๆ เปลี่ยนจากมืดและนุ่มเล็กน้อยเป็นคมชัด พร้อม Scale จาก `1.035` กลับสู่ขนาดจริง
3. แสงทองกวาดผ่านกรอบภาพบ้านหนึ่งครั้ง แล้วจางหายโดยไม่วนซ้ำ
4. Concept Direction และชุดภาพมุมมองเพิ่มเติมปรากฏหลังภาพบ้าน
5. หัวข้อหลักและคำอธิบายเลื่อนขึ้นเล็กน้อยพร้อม Fade
6. Metric ทั้งห้ารายการปรากฏต่อเนื่องจากซ้ายไปขวา
7. การ์ดรายละเอียดปรากฏ โดยการ์ดงบประมาณเป็นจุดเฉลยสุดท้ายและมี Golden Pulse หนึ่งครั้ง
8. Personality และ CTA ด้านล่างตามมาอย่างสุภาพ

เอฟเฟกต์ทั้งหมดใช้เวลาประมาณ 1.6–2 วินาที และเล่นหนึ่งครั้งเมื่อผลการประเมินพร้อม

## Layout and Interaction

- ไม่เพิ่ม ลบ หรือย้ายองค์ประกอบในหน้า
- ไม่เปลี่ยน Grid, ขนาดการ์ด, ลำดับ DOM หรือพฤติกรรมปุ่ม
- ระหว่างเอฟเฟกต์ ปุ่มและลิงก์ยังใช้งานได้ตามปกติ
- เอฟเฟกต์ใช้ `opacity`, `transform`, `filter` และ pseudo-element เพื่อหลีกเลี่ยง Layout Shift
- หลังจบเอฟเฟกต์ ทุกองค์ประกอบกลับสู่ Style ปัจจุบันโดยไม่มีแสงที่รบกวนการอ่าน

## Responsive and Accessibility

- Desktop ใช้ลำดับเต็มและแสงกวาดบนภาพบ้าน
- Tablet และ Mobile ลดระยะเลื่อนและ Scale แต่คงลำดับการเปิดเผย
- `prefers-reduced-motion: reduce` ปิด Animation และแสดงผลลัพธ์ทันที
- เนื้อหาไม่ถูกซ่อนจาก Accessibility Tree และไม่มีการประกาศข้อความซ้ำผ่าน Screen Reader

## Implementation

- เพิ่มสถานะหรือ Attribute สำหรับ Result Reveal ที่ Root ของ `FreePreview`
- เพิ่ม Class สำหรับลำดับภาพ หัวข้อ Metrics การ์ด และ CTA โดยใช้ CSS Modules เดิม
- เพิ่ม pseudo-element ให้กรอบภาพสำหรับแสงกวาดหนึ่งครั้ง
- ไม่เพิ่ม Animation Library หรือ Dependency ใหม่

## Verification

- Style test ตรวจว่ามีลำดับ Reveal, Golden Sweep, Budget Pulse และ Reduced Motion override
- Component test ตรวจว่า Ready state มี contract สำหรับเปิดเอฟเฟกต์ และ Loading/Error state ไม่มี
- Playwright ตรวจว่าหน้าแสดงผลครบหลัง Loader และ Animation สิ้นสุด รวมถึงไม่มี Horizontal Overflow
- ตรวจ Screenshot ที่ Desktop และ Mobile เพื่อยืนยันความหรู ความชัด และการไม่เปลี่ยน Layout
