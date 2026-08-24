import path from "node:path";
import { readFileSync } from "node:fs";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { FullReportViewModel } from "../application/build-full-report";

Font.register({ family: "KSB Noto Sans Thai", src: path.join(process.cwd(), "src/features/reports/pdf/fonts/NotoSansThai-Variable.ttf") });

const styles = StyleSheet.create({ page: { padding: 34, fontFamily: "KSB Noto Sans Thai", fontSize: 10, color: "#171411" }, eyebrow: { color: "#8a692e", fontSize: 8, letterSpacing: 1.2 }, title: { marginTop: 6, fontSize: 22 }, section: { marginTop: 18 }, heading: { color: "#8a692e", fontSize: 12, marginBottom: 6 }, row: { flexDirection: "row", paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: "#d8c9a9" }, label: { flexGrow: 1 }, amount: { width: 88, textAlign: "right" }, fine: { marginTop: 12, color: "#625c55", fontSize: 8, lineHeight: 1.4 } });
const money = (value: number) => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(value);

const PDF_CONCEPT_IMAGES = {
  "/concepts/contemporary-warm-luxury.png": { file: "contemporary-warm-luxury.png", format: "png" },
  "/concepts/modern-tropical-resort.png": { file: "modern-tropical-resort.png", format: "png" },
  "/concepts/timeless-contemporary-luxury.png": { file: "timeless-contemporary-luxury.png", format: "png" },
  "/concepts/base-classic-2f-master.webp": { file: "pdf/base-classic-2f-master.jpg", format: "jpg" },
  "/concepts/base-classic-1f-master.webp": { file: "pdf/base-classic-1f-master.jpg", format: "jpg" },
  "/concepts/base-classic-3f-master.webp": { file: "pdf/base-classic-3f-master.jpg", format: "jpg" },
  "/concepts/base-modern-2f-master-2.webp": { file: "pdf/base-modern-2f-master-2.jpg", format: "jpg" },
  "/concepts/base-modern-1f-master-2.webp": { file: "pdf/base-modern-1f-master-2.jpg", format: "jpg" },
  "/concepts/base-modern-3f-master-2.webp": { file: "pdf/base-modern-3f-master-2.jpg", format: "jpg" },
  "/concepts/base-nordic-2f-master.webp": { file: "pdf/base-nordic-2f-master.jpg", format: "jpg" },
  "/concepts/base-nordic-1f-master.webp": { file: "pdf/base-nordic-1f-master.jpg", format: "jpg" },
  "/concepts/base-nordic-3f-master.webp": { file: "pdf/base-nordic-3f-master.jpg", format: "jpg" },
  "/concepts/base-loft-2f-master.webp": { file: "pdf/base-loft-2f-master.jpg", format: "jpg" },
  "/concepts/base-loft-1f-master.webp": { file: "pdf/base-loft-1f-master.jpg", format: "jpg" },
  "/concepts/base-loft-3f-master.webp": { file: "pdf/base-loft-3f-master.jpg", format: "jpg" },
  "/concepts/base-minimal-2f-master.webp": { file: "pdf/base-minimal-2f-master.jpg", format: "jpg" },
  "/concepts/base-tropical-2f-master.webp": { file: "pdf/base-tropical-2f-master.jpg", format: "jpg" },
  "/concepts/base-tropical-1f-master.webp": { file: "pdf/base-tropical-1f-master.jpg", format: "jpg" },
  "/concepts/base-tropical-3f-master.webp": { file: "pdf/base-tropical-3f-master.jpg", format: "jpg" },
  "/concepts/base-contemporary-2f-master.webp": { file: "pdf/base-contemporary-2f-master.jpg", format: "jpg" },
  "/concepts/base-contemporary-1f-master.webp": { file: "pdf/base-contemporary-1f-master.jpg", format: "jpg" },
  "/concepts/base-contemporary-3f-master.webp": { file: "pdf/base-contemporary-3f-master.jpg", format: "jpg" },
} as const satisfies Record<string, { file: string; format: "png" | "jpg" }>;

export function resolvePdfConceptImagePath(imageSrc: string | undefined): string | null {
  if (!imageSrc || !(imageSrc in PDF_CONCEPT_IMAGES)) return null;
  return path.join(process.cwd(), "public", "concepts", PDF_CONCEPT_IMAGES[imageSrc as keyof typeof PDF_CONCEPT_IMAGES].file);
}

export function resolvePdfConceptImage(imageSrc: string | undefined): { data: Buffer; format: "png" | "jpg" } | null {
  if (!imageSrc || !(imageSrc in PDF_CONCEPT_IMAGES)) return null;
  const asset = PDF_CONCEPT_IMAGES[imageSrc as keyof typeof PDF_CONCEPT_IMAGES];
  const imagePath = resolvePdfConceptImagePath(imageSrc);
  return imagePath ? { data: readFileSync(imagePath), format: asset.format } : null;
}

export function ProjectReportDocument({ report }: { report: FullReportViewModel }) {
  const conceptImage = resolvePdfConceptImage(report.concept.imageSrc);
  // React PDF's Image is not an HTML img and its typed API does not support alt.
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Document title="KSB Project Report" author="KSB Architect"><Page size="A4" style={styles.page}><Text style={styles.eyebrow}>KSB ARCHITECT · PRIVATE PROJECT REPORT</Text><Text style={styles.title}>สรุปโครงการ: {report.concept.label}</Text>{conceptImage ? <Image src={conceptImage} style={{ width: 220, height: 124, marginTop: 12, objectFit: "cover" }} /> : <View style={{ width: 220, height: 46, marginTop: 12, padding: 8, backgroundColor: "#eee8dc" }}><Text>Concept image unavailable</Text></View>}<View style={styles.section}><Text style={styles.heading}>พื้นที่และกรอบงบประมาณ</Text><Text>พื้นที่ใช้สอย {report.area.usableAreaM2} ตร.ม. · พื้นที่ก่อสร้างรวม {report.area.constructionFloorAreaM2} ตร.ม.</Text><View style={styles.row}><Text style={styles.label}>ต่ำสุด / คาดการณ์ / สูงสุด</Text><Text style={styles.amount}>{money(report.total.low)} / {money(report.total.expected)} / {money(report.total.high)} บาท</Text></View></View><View style={styles.section}><Text style={styles.heading}>รายละเอียดงบประมาณ</Text>{report.lines.map((line) => <View key={line.code} style={styles.row}><Text style={styles.label}>{line.label}</Text><Text style={styles.amount}>{money(line.amount.low)} / {money(line.amount.expected)} / {money(line.amount.high)}</Text></View>)}</View><View style={styles.section}><Text style={styles.heading}>ขอบเขตและข้อควรทราบ</Text>{report.assumptions.map((item) => <Text key={item}>• {item}</Text>)}{report.includedItems.map((item) => <Text key={item}>รวม: {item}</Text>)}{report.excludedItems.map((item) => <Text key={item}>ไม่รวม: {item}</Text>)}</View><Text style={styles.fine}>Confidence {report.confidence} · Price Book {report.pricingVersion} · อ้างอิง {report.referenceDate}</Text><Text style={styles.fine}>ค่าควบคุมงานก่อสร้าง: ยังไม่รวม · {report.disclaimer}</Text><Text style={styles.fine}>{report.nextStepAdvice}</Text></Page></Document>;
}
