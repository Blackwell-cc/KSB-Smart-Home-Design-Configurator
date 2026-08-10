import { PriceBookEditor } from "@/features/price-book-admin/components/price-book-editor";
import { resolvePricingAdmin } from "@/features/price-book-admin/application/authorize-pricing-admin";
import { createSupabasePriceBookAdminRepositoryFromEnvironment } from "@/features/price-book-admin/infrastructure/supabase-price-book-admin-repository";
import { createAuthenticatedSupabaseServerClient } from "@/lib/supabase/server-client";
import styles from "./pricing-admin.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PricingAdminPage() {
  let dashboard = null;
  try {
    const auth = await createAuthenticatedSupabaseServerClient(); const repository = createSupabasePriceBookAdminRepositoryFromEnvironment();
    await resolvePricingAdmin(auth.auth, repository); dashboard = await repository.loadReviewDashboard();
  } catch { return <main className={styles.status}><h1>ไม่สามารถเปิด Pricing Admin ได้</h1><p>กรุณาเข้าสู่ระบบด้วยบัญชีที่ได้รับสิทธิ์จาก KSB</p></main>; }
  return <main className={styles.page}><header><p>KSB ARCHITECT / PRICING GOVERNANCE</p><h1>ตรวจ Price Book ก่อนเผยแพร่</h1><span>Published data แก้ย้อนหลังไม่ได้ การแก้ไขต้องสร้างเวอร์ชันใหม่และผ่าน Review อีกครั้ง</span></header>{dashboard ? <PriceBookEditor draft={dashboard.draft} goldenCases={dashboard.goldenCases} /> : <section className={styles.empty}><h2>ยังไม่มี Candidate ที่รอตรวจ</h2><p>เปลี่ยน Draft เป็น Review พร้อมบันทึก Golden Cases, Sources และ Architect Approval ก่อนกลับมาหน้านี้</p></section>}</main>;
}
