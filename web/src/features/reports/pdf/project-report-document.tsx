import path from "node:path";
import { readFileSync } from "node:fs";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { FullReportViewModel } from "../application/build-full-report";

Font.register({ family: "KSB Noto Sans Thai", src: path.join(process.cwd(), "src/features/reports/pdf/fonts/NotoSansThai-Variable.ttf") });

const styles = StyleSheet.create({ page: { padding: 34, fontFamily: "KSB Noto Sans Thai", fontSize: 10, color: "#171411" }, eyebrow: { color: "#8a692e", fontSize: 8, letterSpacing: 1.2 }, title: { marginTop: 6, fontSize: 22 }, section: { marginTop: 18 }, heading: { color: "#8a692e", fontSize: 12, marginBottom: 6 }, row: { flexDirection: "row", paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: "#d8c9a9" }, label: { flexGrow: 1 }, amount: { width: 88, textAlign: "right" }, fine: { marginTop: 12, color: "#625c55", fontSize: 8, lineHeight: 1.4 } });
const money = (value: number) => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(value);

export function resolvePdfConceptImagePath(imageSrc: string | undefined): string | null {
  switch (imageSrc) {
    case "/concepts/contemporary-warm-luxury.png": return path.join(process.cwd(), "public", "concepts", "contemporary-warm-luxury.png");
    case "/concepts/modern-tropical-resort.png": return path.join(process.cwd(), "public", "concepts", "modern-tropical-resort.png");
    case "/concepts/timeless-contemporary-luxury.png": return path.join(process.cwd(), "public", "concepts", "timeless-contemporary-luxury.png");
    default: return null;
  }
}

export function resolvePdfConceptImage(imageSrc: string | undefined): { data: Buffer; format: "png" } | null {
  switch (imageSrc) {
    case "/concepts/contemporary-warm-luxury.png": return { data: readFileSync(path.join(process.cwd(), "public", "concepts", "contemporary-warm-luxury.png")), format: "png" };
    case "/concepts/modern-tropical-resort.png": return { data: readFileSync(path.join(process.cwd(), "public", "concepts", "modern-tropical-resort.png")), format: "png" };
    case "/concepts/timeless-contemporary-luxury.png": return { data: readFileSync(path.join(process.cwd(), "public", "concepts", "timeless-contemporary-luxury.png")), format: "png" };
    default: return null;
  }
}

export function ProjectReportDocument({ report }: { report: FullReportViewModel }) {
  const conceptImage = resolvePdfConceptImage(report.concept.imageSrc);
  // React PDF's Image is not an HTML img and its typed API does not support alt.
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Document title="KSB Project Report" author="KSB Architect"><Page size="A4" style={styles.page}><Text style={styles.eyebrow}>KSB ARCHITECT · PRIVATE PROJECT REPORT</Text><Text style={styles.title}>สรุปโครงการ: {report.concept.label}</Text>{conceptImage ? <Image src={conceptImage} style={{ width: 220, height: 124, marginTop: 12, objectFit: "cover" }} /> : <View style={{ width: 220, height: 46, marginTop: 12, padding: 8, backgroundColor: "#eee8dc" }}><Text>Concept image unavailable</Text></View>}<View style={styles.section}><Text style={styles.heading}>พื้นที่และกรอบงบประมาณ</Text><Text>พื้นที่ใช้สอย {report.area.usableAreaM2} ตร.ม. · พื้นที่ก่อสร้างรวม {report.area.constructionFloorAreaM2} ตร.ม.</Text><View style={styles.row}><Text style={styles.label}>ต่ำสุด / คาดการณ์ / สูงสุด</Text><Text style={styles.amount}>{money(report.total.low)} / {money(report.total.expected)} / {money(report.total.high)} บาท</Text></View></View><View style={styles.section}><Text style={styles.heading}>รายละเอียดงบประมาณ</Text>{report.lines.map((line) => <View key={line.code} style={styles.row}><Text style={styles.label}>{line.label}</Text><Text style={styles.amount}>{money(line.amount.low)} / {money(line.amount.expected)} / {money(line.amount.high)}</Text></View>)}</View><View style={styles.section}><Text style={styles.heading}>ขอบเขตและข้อควรทราบ</Text>{report.assumptions.map((item) => <Text key={item}>• {item}</Text>)}{report.includedItems.map((item) => <Text key={item}>รวม: {item}</Text>)}{report.excludedItems.map((item) => <Text key={item}>ไม่รวม: {item}</Text>)}</View><Text style={styles.fine}>Confidence {report.confidence} · Price Book {report.pricingVersion} · อ้างอิง {report.referenceDate}</Text><Text style={styles.fine}>ค่าควบคุมงานก่อสร้าง: ยังไม่รวม · {report.disclaimer}</Text><Text style={styles.fine}>{report.nextStepAdvice}</Text></Page></Document>;
}
