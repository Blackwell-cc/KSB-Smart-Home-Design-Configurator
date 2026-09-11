import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import PDFDocument from "pdfkit";
import * as fontkit from "fontkit";
import sharp from "sharp";
import { buildMaterialPreviewScene } from "@/features/configurator/presentation/material-preview-scene";
import type { FullReportViewModel } from "../application/build-full-report";

export function resolvePdfFontPath() {
  return path.join(process.cwd(), "src/features/reports/pdf/fonts/Sarabun-Regular.ttf");
}

const money = (value: number) => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(value);

export function buildPdfBudgetRows(report: FullReportViewModel) {
  return [...report.detailedBudget.categories, report.detailedBudget.contingency];
}

export function resolvePdfConceptImagePath(imageSrc: string | undefined): string | null {
  const assetPath = imageSrc?.split(/[?#]/u)[0];
  if (!assetPath || !/^\/concepts\/[a-z0-9-]+\.(?:png|webp)$/u.test(assetPath)) return null;
  const resolved = path.resolve(process.cwd(), "public", `.${assetPath}`);
  const conceptsRoot = path.resolve(process.cwd(), "public", "concepts") + path.sep;
  return resolved.startsWith(conceptsRoot) && existsSync(resolved) ? resolved : null;
}

export function resolvePdfConceptImage(imageSrc: string | undefined): { data: Buffer; format: "png" | "webp" } | null {
  const assetPath = imageSrc?.split(/[?#]/u)[0];
  const imagePath = resolvePdfConceptImagePath(imageSrc);
  if (!imagePath || !assetPath) return null;
  return { data: readFileSync(/* turbopackIgnore: true */ imagePath), format: assetPath.endsWith(".webp") ? "webp" : "png" };
}

function resolveMaterialAssetPath(imageSrc: string): string | null {
  const assetPath = imageSrc.split(/[?#]/u)[0];
  if (!/^\/material-previews\/[a-z0-9/_-]+\.(?:png|webp)$/u.test(assetPath)) return null;
  const resolved = path.resolve(process.cwd(), "public", `.${assetPath}`);
  const previewsRoot = path.resolve(process.cwd(), "public", "material-previews") + path.sep;
  return resolved.startsWith(previewsRoot) && existsSync(resolved) ? resolved : null;
}

export async function renderPdfHouseImage(report: FullReportViewModel): Promise<{ data: Buffer; format: "jpg" } | null> {
  const selections = report.configuration.materialSelections;
  if (report.concept.styleId && selections) {
    const scene = buildMaterialPreviewScene({
      styleId: report.concept.styleId,
      floors: report.configuration.floors,
      materialSelections: selections,
      specialFeatures: [...report.configuration.specialFeatures],
    });
    const basePath = resolveMaterialAssetPath(scene.baseSrc);
    if (basePath) {
      const overlayPaths = [...scene.layers, ...scene.featureLayers]
        .map((layer) => resolveMaterialAssetPath(layer.src))
        .filter((assetPath): assetPath is string => Boolean(assetPath));
      let data: Buffer;
      try {
        data = await sharp(basePath)
          .composite(overlayPaths.map((input) => ({ input })))
          .jpeg({ quality: 94, chromaSubsampling: "4:4:4" })
          .toBuffer();
      } catch (error) {
        throw new Error(`House image composition failed for ${scene.sceneId}: ${error instanceof Error ? error.message : String(error)}`);
      }
      return { data, format: "jpg" };
    }
  }
  const fallback = resolvePdfConceptImage(report.concept.imageSrc);
  if (!fallback) return null;
  return { data: await sharp(fallback.data).jpeg({ quality: 94, chromaSubsampling: "4:4:4" }).toBuffer(), format: "jpg" };
}

const PAGE_WIDTH = 1654;
const PAGE_HEIGHT = 2339;
const GOLD = "#9a722c";
const DEEP_GOLD = "#6d5126";
const INK = "#171411";
const MUTED = "#665f56";
const PAPER = "#fbfaf6";
const RULE = "#d8c9a9";

type PdfFont = ReturnType<typeof fontkit.create>;
type TextOptions = Readonly<{ size?: number; color?: string; align?: "left" | "center" | "right"; maxWidth?: number }>;

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function glyphRun(font: PdfFont, value: string, x: number, baseline: number, options: TextOptions = {}) {
  const size = options.size ?? 24;
  const run = font.layout(value);
  const scale = size / font.unitsPerEm;
  const width = run.positions.reduce((sum, position) => sum + position.xAdvance * scale, 0);
  const origin = options.align === "right" ? x - width : options.align === "center" ? x - width / 2 : x;
  let cursor = origin;
  const paths = run.glyphs.map((glyph, index) => {
    const position = run.positions[index];
    const transform = `translate(${(cursor + position.xOffset * scale).toFixed(3)} ${(baseline - position.yOffset * scale).toFixed(3)}) scale(${scale.toFixed(6)} ${(-scale).toFixed(6)})`;
    cursor += position.xAdvance * scale;
    return `<g transform="${transform}"><path d="${glyph.path.toSVG()}"/></g>`;
  }).join("");
  return `<g fill="${options.color ?? INK}" aria-label="${escapeXml(value)}">${paths}</g>`;
}

function fitText(font: PdfFont, value: string, x: number, baseline: number, options: TextOptions = {}) {
  let size = options.size ?? 24;
  const maxWidth = options.maxWidth;
  if (maxWidth) {
    while (size > 13) {
      const scale = size / font.unitsPerEm;
      const width = font.layout(value).positions.reduce((sum, position) => sum + position.xAdvance * scale, 0);
      if (width <= maxWidth) break;
      size -= 1;
    }
  }
  return glyphRun(font, value, x, baseline, { ...options, size });
}

function wrapText(font: PdfFont, value: string, maxWidth: number, size: number) {
  const segments = Array.from(new Intl.Segmenter("th", { granularity: "word" }).segment(value), (part) => part.segment);
  const lines: string[] = [];
  let current = "";
  for (const segment of segments) {
    const candidate = current + segment;
    const width = font.layout(candidate).positions.reduce((sum, position) => sum + position.xAdvance * size / font.unitsPerEm, 0);
    if (current && width > maxWidth) {
      lines.push(current.trim());
      current = segment.trimStart();
    } else current = candidate;
  }
  if (current.trim()) lines.push(current.trim());
  return lines.length ? lines : [value];
}

function svgDocument(content: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}" viewBox="0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}"><rect width="100%" height="100%" fill="${PAPER}"/>${content}</svg>`;
}

function reportHeader(font: PdfFont, page: number) {
  return [
    glyphRun(font, "KSB ARCHITECT · SMART HOME", 80, 76, { size: 22, color: GOLD }),
    glyphRun(font, `รายงานฉบับเต็ม · หน้า ${page} / 2`, PAGE_WIDTH - 80, 76, { size: 18, color: MUTED, align: "right" }),
    `<line x1="80" y1="102" x2="${PAGE_WIDTH - 80}" y2="102" stroke="${RULE}"/>`,
  ].join("");
}

function buildBudgetPage(report: FullReportViewModel, font: PdfFont, image: Awaited<ReturnType<typeof renderPdfHouseImage>>) {
  const rows = buildPdfBudgetRows(report);
  const parts = [reportHeader(font, 1)];
  parts.push(glyphRun(font, "รายงานงบประมาณและค่าใช้จ่าย", 80, 165, { size: 43, color: INK }));
  parts.push(fitText(font, report.concept.thaiLabel, 80, 204, { size: 25, color: GOLD, maxWidth: 720 }));
  parts.push(`<rect x="80" y="244" width="510" height="286" rx="12" fill="#eee8dc"/>`);
  if (image) {
    // The raster is composited after SVG rendering. Embedding a large data URI here
    // is rejected by librsvg in the bundled Next.js runtime on Windows.
  } else {
    parts.push(glyphRun(font, "ไม่พบภาพแนวคิดบ้าน", 335, 395, { size: 22, color: MUTED, align: "center" }));
  }
  parts.push(`<rect x="620" y="244" width="954" height="286" rx="12" fill="#f2ede3"/>`);
  parts.push(glyphRun(font, "สรุปข้อมูลโครงการ", 650, 292, { size: 25, color: GOLD }));
  const facts = [
    [`ประเภทบ้าน`, report.concept.label],
    [`จำนวนชั้น`, `${report.configuration.floors} ชั้น`],
    [`ห้องนอน / ห้องน้ำ`, `${report.configuration.bedrooms} / ${report.configuration.bathrooms} ห้อง`],
    [`ที่จอดรถ`, `${report.configuration.parkingSpaces} คัน`],
    [`พื้นที่ใช้สอย`, `${report.area.usableAreaM2} ตร.ม.`],
    [`พื้นที่ก่อสร้างรวม`, `${report.area.constructionFloorAreaM2} ตร.ม.`],
    [`ที่ตั้งโครงการ`, report.location.province],
    [`ระดับวัสดุ`, report.configuration.materialQuality],
  ];
  facts.forEach(([label, value], index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 650 + column * 445;
    const y = 340 + row * 45;
    parts.push(glyphRun(font, label, x, y, { size: 16, color: MUTED }));
    parts.push(fitText(font, value, x + 165, y, { size: 19, color: INK, maxWidth: 260 }));
  });

  parts.push(glyphRun(font, "งบประมาณและค่าใช้จ่ายโดยละเอียด", 80, 605, { size: 28, color: GOLD }));
  const tableTop = 636;
  const rowHeight = 51;
  parts.push(`<rect x="80" y="${tableTop}" width="1494" height="50" rx="5" fill="${GOLD}"/>`);
  parts.push(glyphRun(font, "ลำดับ", 110, tableTop + 33, { size: 17, color: "#fffaf0", align: "center" }));
  parts.push(glyphRun(font, "รายการ", 150, tableTop + 33, { size: 17, color: "#fffaf0" }));
  parts.push(glyphRun(font, "รายละเอียด", 470, tableTop + 33, { size: 17, color: "#fffaf0" }));
  parts.push(glyphRun(font, "ต่ำสุด", 1200, tableTop + 33, { size: 17, color: "#fffaf0", align: "right" }));
  parts.push(glyphRun(font, "คาดการณ์", 1380, tableTop + 33, { size: 17, color: "#fffaf0", align: "right" }));
  parts.push(glyphRun(font, "สูงสุด", 1550, tableTop + 33, { size: 17, color: "#fffaf0", align: "right" }));
  rows.forEach((row, index) => {
    const top = tableTop + 50 + index * rowHeight;
    if (index % 2) parts.push(`<rect x="80" y="${top}" width="1494" height="${rowHeight}" fill="#f7f3eb"/>`);
    parts.push(`<line x1="80" y1="${top + rowHeight}" x2="1574" y2="${top + rowHeight}" stroke="${RULE}"/>`);
    const baseline = top + 33;
    parts.push(glyphRun(font, String(index + 1), 110, baseline, { size: 17, color: MUTED, align: "center" }));
    parts.push(fitText(font, row.label, 150, baseline, { size: 18, maxWidth: 290 }));
    parts.push(fitText(font, row.description, 470, baseline, { size: 17, color: MUTED, maxWidth: 500 }));
    parts.push(glyphRun(font, money(row.amount.low), 1200, baseline, { size: 17, align: "right" }));
    parts.push(glyphRun(font, money(row.amount.expected), 1380, baseline, { size: 17, align: "right" }));
    parts.push(glyphRun(font, money(row.amount.high), 1550, baseline, { size: 17, align: "right" }));
  });
  const summaryTop = tableTop + 50 + rows.length * rowHeight;
  parts.push(`<rect x="80" y="${summaryTop}" width="1494" height="58" fill="#eee3ce"/>`);
  parts.push(glyphRun(font, "รวมย่อย (Subtotal)", 110, summaryTop + 38, { size: 20 }));
  parts.push(glyphRun(font, `${money(report.detailedBudget.subtotal.low)} / ${money(report.detailedBudget.subtotal.expected)} / ${money(report.detailedBudget.subtotal.high)} บาท`, 1550, summaryTop + 38, { size: 20, align: "right" }));
  parts.push(`<rect x="80" y="${summaryTop + 58}" width="1494" height="70" fill="${DEEP_GOLD}"/>`);
  parts.push(glyphRun(font, "รวมงบประมาณโดยประมาณ", 110, summaryTop + 103, { size: 23, color: "#fffaf0" }));
  parts.push(glyphRun(font, `${money(report.total.low)} / ${money(report.total.expected)} / ${money(report.total.high)} บาท`, 1550, summaryTop + 103, { size: 24, color: "#fffaf0", align: "right" }));
  parts.push(glyphRun(font, `Confidence ${report.confidence} · Price Book ${report.pricingVersion} · อ้างอิง ${report.referenceDate}`, 80, 2268, { size: 16, color: MUTED }));
  return svgDocument(parts.join(""));
}

function buildScopePage(report: FullReportViewModel, font: PdfFont) {
  const parts = [reportHeader(font, 2)];
  parts.push(glyphRun(font, "ขอบเขตโครงการและข้อควรทราบ", 80, 175, { size: 42 }));
  let y = 252;
  const addSection = (title: string, items: readonly string[], prefix: string) => {
    if (!items.length) return;
    parts.push(glyphRun(font, title, 80, y, { size: 27, color: GOLD }));
    y += 44;
    items.forEach((item) => {
      const lines = wrapText(font, `${prefix}${item}`, 1430, 21);
      lines.forEach((line) => {
        parts.push(glyphRun(font, line, 104, y, { size: 21, color: INK }));
        y += 34;
      });
      y += 8;
    });
    y += 28;
  };
  addSection("สมมติฐานที่ใช้ในการประเมิน", report.assumptions, "• ");
  addSection("รายการที่รวมอยู่ในประมาณการ", report.includedItems, "• ");
  addSection("รายการที่ยังไม่รวม", report.excludedItems, "• ");
  parts.push(`<rect x="80" y="${Math.min(y, 1770)}" width="1494" height="300" rx="14" fill="#f2ede3"/>`);
  const noteTop = Math.min(y, 1770);
  parts.push(glyphRun(font, "หมายเหตุสำคัญ", 112, noteTop + 52, { size: 27, color: GOLD }));
  let noteY = noteTop + 98;
  for (const line of wrapText(font, report.disclaimer, 1410, 20)) {
    parts.push(glyphRun(font, line, 112, noteY, { size: 20, color: MUTED }));
    noteY += 33;
  }
  noteY += 24;
  parts.push(glyphRun(font, "ขั้นตอนถัดไป", 112, noteY, { size: 23, color: GOLD }));
  noteY += 40;
  for (const line of wrapText(font, report.nextStepAdvice, 1410, 20)) {
    parts.push(glyphRun(font, line, 112, noteY, { size: 20 }));
    noteY += 33;
  }
  parts.push(glyphRun(font, `จัดทำเมื่อ ${new Intl.DateTimeFormat("th-TH", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Bangkok" }).format(new Date(report.generatedAt))}`, 80, 2268, { size: 16, color: MUTED }));
  return svgDocument(parts.join(""));
}

export async function renderProjectReportPdf(report: FullReportViewModel): Promise<Uint8Array> {
  const font = fontkit.create(readFileSync(resolvePdfFontPath()));
  const houseImage = await renderPdfHouseImage(report);
  const svgs = [buildBudgetPage(report, font, houseImage), buildScopePage(report, font)];
  const pages = await Promise.all(svgs.map(async (svg, index) => {
    try {
      let page = sharp(Buffer.from(svg)).flatten({ background: PAPER });
      if (index === 0 && houseImage) {
        const concept = await sharp(houseImage.data).resize(510, 286, { fit: "cover" }).png().toBuffer();
        page = page.composite([{ input: concept, left: 80, top: 244 }]);
      }
      return await page.jpeg({ quality: 92, chromaSubsampling: "4:4:4" }).toBuffer();
    } catch (error) {
      throw new Error(`PDF page ${index + 1} rendering failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }));

  const document = new PDFDocument({ autoFirstPage: false, info: { Title: "KSB Project Report", Author: "KSB Architect" } });
  const chunks: Buffer[] = [];
  const completed = new Promise<Buffer>((resolve, reject) => {
    document.on("data", (chunk: Buffer) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
  });
  pages.forEach((page) => {
    document.addPage({ size: "A4", margin: 0 });
    document.image(page, 0, 0, { width: 595.28, height: 841.89 });
  });
  document.end();
  return completed;
}
