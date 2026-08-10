# Price Book Publish Runbook

## วัตถุประสงค์

ใช้ขั้นตอนนี้เมื่อ KSB จะเปลี่ยน Price Book ที่ระบบใช้คำนวณจริง การแก้ข้อมูลราคาเดิมย้อนหลังไม่อนุญาต ทุกการแก้ต้องเป็นเวอร์ชันใหม่และมีหลักฐานครบ

## สถานะข้อมูล

1. `draft` — ทีม Pricing เตรียมจังหวัด ตัวคูณ ค่าเผื่อ และแหล่งข้อมูล
2. `review` — ล็อก Candidate สำหรับทดสอบ Golden Cases และให้สถาปนิกอนุมัติ
3. `published` — ระบบคำนวณ Production ใช้เวอร์ชันนี้ได้เพียงหนึ่งเวอร์ชัน
4. `retired` — เวอร์ชันที่เคย Published เก็บไว้อ้างอิง Snapshot เดิม ห้ามแก้หรือลบ

## Checklist ก่อน Publish

- Province Rate ครบ 77 จังหวัดและไม่มีรหัสซ้ำ
- Material Level ครบ Select, Premium, Signature
- Special Feature ครบ 7 รายการและทุกช่วงเป็น `Low ≤ Expected ≤ High`
- Reference Date และ Version ถูกต้องและ Version ไม่ซ้ำ
- Golden Cases ผ่าน พร้อมผล Current เทียบ Candidate ทุก Case
- มี Source Records ที่ตรวจย้อนกลับได้
- มี Architect Approver และ Approved At
- ผู้กด Publish มีสิทธิ์ `pricing-approver`

## วิธี Publish

1. เปิด `/admin/pricing` ด้วยบัญชี Supabase ที่อยู่ใน `admin_users`
2. อ่าน % Diff ของ Golden Cases และตรวจ Outlier ทีละรายการ
3. ติ๊กยืนยันเมื่อหลักฐานครบ แล้วกด `เผยแพร่ Price Book เวอร์ชันนี้`
4. ระบบเรียก service-only RPC ซึ่ง lock transaction, retire เวอร์ชันเดิม และ publish Candidate ในครั้งเดียว
5. ตรวจหน้า Configurator ด้วย Golden Case อย่างน้อยหนึ่งรายการหลัง Publish

## Rollback

ห้ามเปลี่ยนสถานะเวอร์ชัน Retired กลับหรือแก้ Published row โดยตรง ให้ clone ข้อมูลที่ถูกต้องเป็น Version ใหม่ เช่น `TH-2026Q3-1.1`, ทดสอบ Golden Cases ใหม่ และ Publish ผ่านขั้นตอนเดิม Snapshot ของโครงการเก่ายังคงอ้างอิง Version เดิม

## เมื่อ Publish ไม่สำเร็จ

- ตรวจว่า Candidate ยังเป็น `review`
- ตรวจ 77 จังหวัด, 3 Material Levels และ 7 Feature Allowances
- ตรวจ `price_book_reviews` ว่า Golden Cases, Sources, Approver และเวลาอนุมัติครบ
- ตรวจว่าบัญชีผู้กดมี role `pricing-approver`
- ห้ามแก้ constraint หรือเรียก update สถานะโดยตรงเพื่อข้าม gate
