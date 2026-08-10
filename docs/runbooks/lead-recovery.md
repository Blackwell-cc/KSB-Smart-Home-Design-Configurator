# Lead Notification and Recovery Runbook

## หลักการ

Lead ต้องถูกบันทึกในฐานข้อมูลให้สำเร็จก่อนเรียก `LEAD_WEBHOOK_URL` เสมอ Webhook ล้มเหลวต้องไม่ rollback Lead และต้องไม่ทำให้ผู้ใช้กรอกแบบฟอร์มซ้ำ

ทุก request ใช้ Idempotency Key รูปแบบ `lead:<lead_id>` ปลายทาง Make.com, n8n หรือระบบแจ้งเตือนต้อง deduplicate ด้วยค่านี้

## เมื่อ Webhook ล้มเหลว

1. ตรวจสถานะปลายทางและ Secret/URL โดยไม่พิมพ์ Payload ที่มี PII ลง log
2. ตรวจ Lead ล่าสุดจากฐานข้อมูลด้วย service-role tool ที่บริษัทอนุมัติ โดยดู `lead_id`, `project_id`, `created_at` และช่องทางติดต่อ
3. สร้าง Lead summary ใหม่จาก Server เท่านั้น ห้ามรับ summary หรือ Project ID จาก Browser เพื่อ resend
4. ส่งซ้ำด้วย Idempotency Key เดิม `lead:<lead_id>`
5. บันทึกเวลา ผู้ดำเนินการ และผล resend ในระบบงานภายใน

ตัวแอป retry อัตโนมัติสูงสุด 3 ครั้งต่อการ Submit หนึ่งครั้ง การ retry response เดิมอาจส่ง webhook ซ้ำได้ แต่ปลายทางต้องไม่สร้างงานซ้ำเพราะ Idempotency Key คงที่

## Consultation Recovery

คำขอปรึกษาถูกเก็บใน `consultation_outbox` ภายใน transaction เดียวกับ `consultation_requested_at`

- ค้นหาแถว `status = 'pending'` หรือ `status = 'failed'`
- โหลด Project/Lead context ฝั่ง Server จาก `project_id` และ `lead_id`
- ส่งแจ้งเตือนผ่านช่องทางภายใน
- เมื่อปลายทางยืนยัน ให้เปลี่ยนเป็น `delivered` และกำหนด `delivered_at`
- หากยังล้มเหลว ให้คงข้อมูลไว้และเปลี่ยนเป็น `failed`; ห้ามลบ Project หรือแก้ timestamp เพื่อบังคับ retry

## Privacy Rules

- ห้ามใส่ชื่อ เบอร์โทร Email LINE ID หรือ Private Token ใน application log, analytics หรือ URL
- Webhook URL ต้องเป็น HTTPS และเก็บใน Server environment เท่านั้น
- ไม่ส่ง Private Project Token ไป webhook
- การ export/delete Lead ใช้เฉพาะผู้มี role `privacy-operator`
- Retention production ต้องกำหนด `PII_RETENTION_DAYS` เป็นจำนวนเต็มบวก และเรียกผ่าน service-only retention job
