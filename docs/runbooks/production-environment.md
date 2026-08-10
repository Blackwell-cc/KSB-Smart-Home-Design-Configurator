# Production Environment Contract

แอปตรวจ environment ผ่าน `web/src/instrumentation.ts` ตอน Next.js Node server เริ่มทำงาน หาก `NODE_ENV=production` และค่าบังคับไม่ครบ server จะหยุดด้วย `PRODUCTION_ENVIRONMENT_INVALID` โดยไม่พิมพ์ชื่อหรือค่าของ secret ลง log

ตั้งค่าต่อไปนี้ใน secret manager ของ hosting platform เท่านั้น ห้าม commit `.env`, screenshot หรือค่าจริงลง issue/chat:

| Variable | เงื่อนไข |
|---|---|
| `SUPABASE_URL` | HTTPS origin ของ Production Supabase ไม่มี path/query |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only, อย่างน้อย 32 bytes |
| `SUPABASE_ANON_KEY` | ใช้กับ SSR admin auth; อย่างน้อย 20 bytes |
| `PROJECT_ACCESS_TOKEN_SECRET` | สุ่มอย่างน้อย 32 bytes |
| `PROJECT_SESSION_SECRET` | สุ่มอย่างน้อย 32 bytes และต้องไม่ซ้ำ access secret |
| `RATE_LIMIT_SECRET` | สุ่มอย่างน้อย 32 bytes และต้องไม่ซ้ำ secret อื่น |
| `LEAD_WEBHOOK_URL` | HTTPS endpoint ของช่องทาง Lead ที่ Operations อนุมัติ |
| `PII_RETENTION_DAYS` | จำนวนเต็ม 1–3,650 ตามนโยบายที่อนุมัติ |

หลังตั้งค่า:

1. เริ่ม Production instance ใหม่และยืนยันว่า startup guard ผ่าน
2. ตรวจว่าไม่มี secret ชื่อใดขึ้นใน client bundle หรือ browser network payload
3. ใช้ staging service role รัน smoke test ของ Price Book, Lead, Private Access, PDF, Share และ retention
4. ทดสอบ webhook ด้วย Lead จำลองและยืนยัน idempotency key `lead:<leadId>`
5. ตั้ง edge/distributed rate limit บน hosting/WAF เพิ่มจาก limiter ภายใน process
6. บันทึก platform configuration revision และผู้ตรวจใน launch checklist โดยไม่คัดลอกค่าของ secret

การ rotate `PROJECT_ACCESS_TOKEN_SECRET` จะทำให้การสร้าง token สำหรับ retry เดิมเปลี่ยนไป ส่วนการ rotate `PROJECT_SESSION_SECRET` จะยกเลิก session cookie เดิมทั้งหมด จึงต้องวางแผนช่วงเปลี่ยนและทดสอบ private links ก่อนใช้งานจริง
