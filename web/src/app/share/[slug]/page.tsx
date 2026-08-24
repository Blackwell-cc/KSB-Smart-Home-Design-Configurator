import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CONCEPT_CATALOG, resolveConceptImage } from "@/features/preview/domain/concept-catalog";
import type { PublicPreviewPayload } from "@/features/sharing/domain/public-preview";
import { createSupabasePublicShareRepositoryFromEnvironment } from "@/features/sharing/infrastructure/supabase-public-share-repository";
import styles from "./public-share.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Public Preview | KSB Architect", robots: { index: false, follow: false } };

export function PublicShareView({ preview }: { preview: PublicPreviewPayload }) {
  const concept = CONCEPT_CATALOG.find((item) => item.id === preview.conceptAssetId);
  if (!concept) return null;
  return <main className={styles.page}>
    <header className={styles.masthead}><span>KSB ARCHITECT</span><span>PUBLIC CONCEPT PREVIEW</span></header>
    <article className={styles.sheet}>
      <section className={styles.imagePanel} aria-label="ภาพคอนเซปต์บ้าน">
        <Image src={resolveConceptImage(concept, preview.floors)} alt={`บ้านสไตล์ ${preview.styleLabel}`} fill sizes="(max-width: 840px) 100vw, 60vw" priority />
        <div className={styles.imageNote}>แนวคิดเบื้องต้นเพื่อใช้เริ่มต้นวางแผนร่วมกับสถาปนิก</div>
      </section>
      <section className={styles.details}>
        <p className={styles.eyebrow}>CURATED HOUSE DIRECTION</p>
        <h1>{preview.styleLabel}</h1>
        <div className={styles.areaBlock}><strong>{preview.usableAreaM2}</strong><span>ตร.ม.<br />พื้นที่ใช้สอยโดยประมาณ</span></div>
        <dl className={styles.facts}>
          <div><dt>โครงสร้างบ้าน</dt><dd>{preview.floors} ชั้น</dd></div>
          <div><dt>พื้นที่พักผ่อน</dt><dd>{preview.bedrooms} ห้องนอน · {preview.bathrooms} ห้องน้ำ</dd></div>
          <div><dt>ที่จอดรถ</dt><dd>{preview.parkingSpaces} คัน</dd></div>
        </dl>
        <p className={styles.context}>บ้านที่ดีเริ่มจากการวางแผนพื้นที่ให้สอดคล้องกับชีวิตจริง ลองสร้างแนวทางของคุณ แล้วใช้ข้อมูลนี้คุยกับสถาปนิกอย่างเป็นระบบ</p>
        <Link className={styles.cta} href="/configurator?source=shared-preview">ลองออกแบบบ้านของคุณ</Link>
      </section>
    </article>
    <footer className={styles.footer}><span>KSB Architect</span><span>บ้านหรู เริ่มจากการวางแผนที่ดี</span></footer>
  </main>;
}

export default async function PublicSharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let preview: PublicPreviewPayload | null = null;
  try {
    preview = await createSupabasePublicShareRepositoryFromEnvironment().findBySlug(slug);
  } catch { notFound(); }
  if (!preview) notFound();
  return <PublicShareView preview={preview} />;
}
