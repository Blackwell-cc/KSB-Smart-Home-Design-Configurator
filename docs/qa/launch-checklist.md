# KSB Smart Home Design Configurator — Release QA Checklist

เอกสารนี้เป็น checklist บังคับก่อนนำ build ขึ้น Pilot หรือ Production ทุกครั้ง ช่องที่ยังไม่ผ่านต้องมีเจ้าของงานและวันนัดแก้ชัดเจน ห้ามข้ามหัวข้อ Privacy, Pricing, Private Access หรือ Lead Recovery

## 1. Automated release suite

รันจากโฟลเดอร์ `web/` ด้วย environment ที่แยกจาก Production:

```powershell
npm test -- --maxWorkers=1
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

- [ ] ทุกคำสั่งออกด้วย exit code `0`
- [ ] Unit/Integration tests ไม่มี test ที่ถูก skip โดยไม่ระบุเหตุผล
- [ ] Playwright ไม่มี failed test และไม่มี serious/critical axe violation
- [ ] Build log ไม่มี secret, PII หรือข้อมูล Lead
- [ ] ตรวจ `git status --short` แล้วไม่มีไฟล์ผลทดสอบ/trace ถูกเตรียม commit

## 2. Preview-before-Lead และ Draft recovery

- [ ] ผู้ใช้ทำ Configurator ครบและเห็น Concept, พื้นที่, CFA และกรอบงบก่อนกรอกข้อมูลติดต่อ
- [ ] ก่อนกด “รับสรุปโครงการฉบับเต็ม” ไม่มีช่องชื่อ เบอร์ อีเมล หรือ LINE
- [ ] Refresh ทุกขั้นแล้ว Draft กลับมาที่ขั้นและค่าล่าสุด
- [ ] ปุ่ม Back/ย้อนกลับไม่ล้างค่าที่เลือกไว้
- [ ] Offline หรือ Estimate API ล้มเหลวแล้วไม่แสดงกรอบงบปลอม และยังกลับไปแก้ Draft ได้
- [ ] Draft ที่ schema ไม่รองรับแสดงข้อความให้เริ่มตรวจข้อมูลใหม่อย่างปลอดภัย
- [ ] เมื่อสร้าง Private Project สำเร็จแล้ว Draft และ submission intent ถูกล้าง

## 3. Lead, idempotency และ recovery

- [ ] ส่ง Lead สำเร็จหนึ่งครั้ง ได้ `leadId`, `projectId` และ private handoff URL
- [ ] จำลอง response หายแล้วกดส่งซ้ำ: ใช้ `idempotencyKey` และ `configurationId` เดิม และฐานข้อมูลมี Lead/Project เพียงชุดเดียว
- [ ] กดส่งรัว/เกินโควตาได้ `429`, `{ "error": { "code": "RATE_LIMITED" } }` และ `Retry-After`
- [ ] Webhook ล้มเหลวไม่ rollback Lead ที่บันทึกสำเร็จ
- [ ] ทีมงานค้น Lead ที่ notification ไม่สำเร็จและส่งต่อใหม่ได้ตาม `docs/runbooks/lead-recovery.md`
- [ ] Consultation retry ไม่สร้าง outbox ซ้ำ และทีมงานกู้ pending outbox ได้
- [ ] Production มี edge/distributed rate limit เพิ่มจาก in-process limiter ของแอป เพื่อครอบคลุมหลาย instance

## 4. Private access และ exports

- [ ] เปิด `/report/access` โดยไม่มี fragment แล้วไม่เห็น Report
- [ ] Token หมดอายุ, revoked, ผิด หรือ Project ไม่ตรงกันตอบ generic `PROJECT_LINK_INVALID`
- [ ] Fragment token ถูกลบจาก address bar/history ก่อนเปลี่ยนหน้า Report
- [ ] Strict Mode/effect replay ไม่ทำให้ valid fragment กลายเป็น invalid
- [ ] Session cookie เป็น `HttpOnly; Secure; SameSite=Strict` และอายุไม่เกิน private token
- [ ] Report, PDF, Consultation และ Share API ตรวจ Project session เดียวกัน
- [ ] PDF สำเร็จมี Concept และ disclaimer; เมื่อสร้าง PDF ไม่ได้ตอบ generic error และไม่คืนไฟล์เสีย
- [ ] PNG export ล้าง object URL และ temporary element แม้ export ล้มเหลว

## 5. Public Share privacy

- [ ] Public URL เดาสุ่มจาก Project ID ไม่ได้ และหน้าใช้ `noindex`
- [ ] HTML, RSC payload และ network response ไม่มีชื่อ เบอร์ อีเมล LINE, token, Project ID, private notes, จังหวัด หรือข้อมูลราคา
- [ ] Payload มีเพียง `conceptAssetId`, `styleLabel`, `floors`, `bedrooms`, `bathrooms`, `parkingSpaces`, `usableAreaM2`
- [ ] Slug หมดอายุ/revoked/ไม่ถูกต้องตอบ 404 โดยไม่บอกว่ามี Project หรือไม่
- [ ] CTA เดียวพาไป `/configurator?source=shared-preview`

## 6. API security และ error contract

- [ ] JSON endpoint ปฏิเสธ Content-Type ผิด, malformed JSON, body เกินกำหนด และ unknown fields
- [ ] Error ที่ client เห็นอยู่ในรูป `{ "error": { "code": "..." } }` โดยไม่มี stack/SQL/validation detail
- [ ] Response ที่เกี่ยวกับ Estimate, Lead, Project, Share และ Admin ใช้ `Cache-Control: no-store`
- [ ] Origin guard ผ่านคำขอ same-origin หลัง reverse proxy และปฏิเสธ Origin ภายนอก
- [ ] Service role key, session secret, token secret, webhook URL และ rate-limit secret อยู่เฉพาะ server environment
- [ ] RLS และ function grants ของ migration ถูกตรวจใน Supabase staging ด้วย role `anon`, `authenticated`, `service_role`

## 7. Accessibility และ device QA

- [ ] ใช้คีย์บอร์ดทำ Landing → Configurator → Preview → Soft Gate → Report ได้ครบ
- [ ] Focus ย้ายไปหัวข้อขั้นใหม่ และ validation error เชื่อมด้วย `aria-describedby`
- [ ] Field error อ่านเป็น alert และ focus ได้เมื่อจำเป็น
- [ ] Radio/checkbox/counter มี accessible name และ state ถูกต้อง
- [ ] ทดสอบ 360×800, 768×1024, 1440×900 และ zoom 200% โดยไม่มีข้อความ/ปุ่มหลุดจอ
- [ ] สี ข้อความ และ focus indicator ผ่าน contrast; reduced motion ไม่เสียการใช้งาน
- [ ] ภาษาเอกสารเป็น `th` และข้อความไทยไม่เพี้ยน

## 8. Browser/manual smoke

- [ ] Chrome/Edge รุ่นปัจจุบันบน Windows
- [ ] Safari บน iPhone จริงหรือ BrowserStack
- [ ] Chrome บน Android จริงหรือ BrowserStack
- [ ] Slow 4G: Loading state ชัดเจน กดซ้ำไม่ได้ และ retry ได้
- [ ] Incognito/blocked storage: ระบบไม่ crash และอธิบายการกู้ข้อมูลอย่างเหมาะสม

## 9. Sign-off

| Gate | ผู้อนุมัติ | หลักฐาน/เวอร์ชัน | วันที่ | สถานะ |
|---|---|---|---|---|
| ราคาและ Golden Cases | KSB Pricing Approver |  |  | Pending |
| พื้นที่/CFA | KSB Architect |  |  | Pending |
| ภาพและสิทธิ์ใช้งาน | Brand/Content Owner |  |  | Pending |
| PDPA/ข้อความยินยอม | Privacy Owner |  |  | Pending |
| Lead owner + recovery | Sales/Operations |  |  | Pending |
| Technical release | Engineering |  |  | Pending |

Production release ทำได้เมื่อทุกแถวเป็น Approved เท่านั้น
