import { DesignBriefConfigurationSchema, type DesignBriefConfiguration } from "@/features/configurator/domain/configuration";
import { SPECIAL_FEATURE_CATALOG } from "@/features/configurator/domain/material-catalog";
import { buildReviewSummary } from "@/features/configurator/presentation/review-summary";
import { CONCEPT_CATALOG } from "@/features/preview/domain/concept-catalog";
import { buildProjectInsight } from "@/features/preview/presentation/project-insight";
import type { CalculationLineCode, MoneyRange } from "@/features/pricing/domain/price-book";
import { buildDetailedBudget, type DetailedBudget } from "./build-detailed-budget";

export type ReportLine = Readonly<{ code: CalculationLineCode; label: string; amount: Readonly<MoneyRange> }>;

export type FullReportViewModel = Readonly<{
  projectId: string; snapshotId: string; generatedAt: string;
  concept: Readonly<{ styleId: string | null; label: string; thaiLabel: string; imageSrc?: string; direction: Readonly<{ title: string; description: string }> }>;
  configuration: Readonly<{ residents: number; floors: number; bedrooms: number; bathrooms: number; parkingSpaces: number; materialLevel: string; materialQuality: string; functions: readonly string[]; specialFeatures: readonly string[] }>;
  location: Readonly<{ province: string; district: string; siteAccess: string }>;
  area: Readonly<{ usableAreaM2: number; constructionFloorAreaM2: number }>;
  materials: readonly Readonly<{ categoryId: string; categoryLabel: string; optionLabel: string }>[];
  specialFeatures: readonly Readonly<{ id: string; label: string; description: string }>[];
  additionalRequirements: readonly string[];
  gallery: readonly Readonly<{ id: string; label: string; imageSrc: string; objectPosition: string; placeholder: boolean }>[];
  lines: readonly ReportLine[]; detailedBudget: DetailedBudget; total: Readonly<MoneyRange>;
  assumptions: readonly string[]; includedItems: readonly string[]; excludedItems: readonly string[]; confidence: "B" | "C";
  pricingVersion: string; referenceDate: string; disclaimer: string; nextStepAdvice: string;
  budgetComparison: Readonly<{ status: "no-target" | "within-target" | "below-target" | "above-target"; target?: Readonly<{ min: number; max: number }> }>;
}>;

const REQUIRED_CODES: readonly CalculationLineCode[] = ["core-construction", "special-features", "site-risk", "design-professional-fee", "tax-fees"];
const INVALID = "INVALID_SAVED_SNAPSHOT";
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const validNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  pool: "พื้นที่พักผ่อนพร้อมระบบสระและงานประกอบที่เกี่ยวข้อง", lift: "รองรับการใช้งานหลายช่วงวัยและการเดินทางระหว่างชั้น",
  "smart-home": "ควบคุมระบบสำคัญภายในบ้านได้สะดวกและเป็นระบบ", solar: "เตรียมแนวทางใช้พลังงานอย่างมีประสิทธิภาพในระยะยาว",
  "ev-charger": "รองรับรถยนต์ไฟฟ้าด้วยระบบไฟและจุดชาร์จเฉพาะ", "large-glazing": "เปิดรับแสงและมุมมองด้วยระบบกระจกขนาดใหญ่",
  "internal-garden": "เพิ่มพื้นที่สีเขียวและแสงธรรมชาติภายในบ้าน", "outdoor-pavilion": "พื้นที่พักผ่อนภายนอกที่เชื่อมต่อกับสวน",
  "security-system": "ระบบรักษาความปลอดภัยสำหรับการอยู่อาศัย", "fitness-room": "พื้นที่ออกกำลังกายที่ออกแบบตามการใช้งานจริง",
};

const GALLERY_VIEWS = [
  ["front", "มุมมองด้านหน้า", "50% 50%"], ["perspective", "มุมมองเฉียงด้านหน้า", "38% 50%"],
  ["side", "มุมมองด้านข้าง", "67% 50%"], ["rear", "มุมมองด้านหลัง", "78% 45%"],
  ["living", "ห้องนั่งเล่น", "42% 60%"], ["dining", "พื้นที่รับประทานอาหาร", "58% 60%"],
  ["bedroom", "ห้องนอน", "65% 42%"], ["kitchen", "พื้นที่ครัว", "32% 62%"],
  ["pool", "สระและพื้นที่พักผ่อน", "50% 72%"], ["garden", "สวนและภูมิทัศน์", "28% 68%"],
  ["arrival", "มุมมองทางเข้าบ้าน", "22% 52%"], ["night", "บรรยากาศยามค่ำคืน", "50% 45%"],
] as const;

function range(value: unknown): MoneyRange {
  if (!isRecord(value) || !validNumber(value.low) || !validNumber(value.expected) || !validNumber(value.high) || value.low > value.expected || value.expected > value.high) throw new Error(INVALID);
  return { low: value.low, expected: value.expected, high: value.high };
}
function strings(value: unknown): string[] { if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) throw new Error(INVALID); return [...value]; }

function snapshotShape(value: unknown) {
  if (!isRecord(value) || typeof value.id !== "string" || !isRecord(value.concept) || !isRecord(value.area) || !isRecord(value.estimate)) throw new Error(INVALID);
  const { concept, area, estimate } = value;
  const configuration = DesignBriefConfigurationSchema.safeParse(value.configuration);
  if (!configuration.success) throw new Error(INVALID);
  if (typeof concept.id !== "string" || typeof concept.label !== "string" || !/^\/concepts\/[a-z0-9-]+\.(?:png|webp)$/.test(String(concept.imageSrc))) throw new Error(INVALID);
  if (!validNumber(area.usableAreaM2) || !validNumber(area.constructionFloorAreaM2) || typeof estimate.pricingVersion !== "string" || typeof estimate.referenceDate !== "string" || (estimate.confidence !== "B" && estimate.confidence !== "C") || !Array.isArray(estimate.lines)) throw new Error(INVALID);
  const lines = estimate.lines.map((line) => {
    if (!isRecord(line) || typeof line.code !== "string" || typeof line.label !== "string") throw new Error(INVALID);
    return { code: line.code as CalculationLineCode, label: line.label, amount: range(line.amount) };
  });
  if (lines.length !== REQUIRED_CODES.length || lines.some((line, index) => line.code !== REQUIRED_CODES[index])) throw new Error(INVALID);
  return {
    id: value.id, concept: { id: concept.id, label: concept.label, imageSrc: concept.imageSrc as string }, configuration: configuration.data,
    area: { usableAreaM2: area.usableAreaM2 as number, constructionFloorAreaM2: area.constructionFloorAreaM2 as number },
    estimate: { pricingVersion: estimate.pricingVersion as string, referenceDate: estimate.referenceDate as string, confidence: estimate.confidence as "B" | "C", lines: lines as ReportLine[], total: range(estimate.total), assumptions: strings(estimate.assumptions), includedItems: strings(estimate.includedItems), excludedItems: strings(estimate.excludedItems) },
  };
}

function publicConfiguration(configuration: DesignBriefConfiguration) { return { ...configuration, privateNotes: "" }; }

export function buildFullReport(project: { id: string; targetBudget: { min: number; max: number } | null }, savedSnapshot: unknown, generatedAt = new Date()): FullReportViewModel {
  const snapshot = snapshotShape(savedSnapshot);
  const review = buildReviewSummary(publicConfiguration(snapshot.configuration));
  const insight = buildProjectInsight(snapshot.configuration);
  const catalogueConcept = CONCEPT_CATALOG.find((item) => item.id === snapshot.configuration.styleId) ?? CONCEPT_CATALOG.find((item) => item.id === snapshot.concept.id);
  const target = project.targetBudget;
  const budgetComparison = !target ? { status: "no-target" as const }
    : snapshot.estimate.total.expected < target.min ? { status: "below-target" as const, target: Object.freeze({ ...target }) }
      : snapshot.estimate.total.expected > target.max ? { status: "above-target" as const, target: Object.freeze({ ...target }) }
        : { status: "within-target" as const, target: Object.freeze({ ...target }) };
  const detailedBudget = buildDetailedBudget({ lines: snapshot.estimate.lines, total: snapshot.estimate.total, selectedSpecialFeatures: snapshot.configuration.specialFeatures });
  const selectedSpecialFeatures = snapshot.configuration.specialFeatures.map((id) => ({ id, label: SPECIAL_FEATURE_CATALOG.find((feature) => feature.id === id)?.label ?? "รายการส่วนพิเศษ", description: FEATURE_DESCRIPTIONS[id] ?? "รายละเอียดส่วนพิเศษตามข้อมูลที่เลือกไว้" }));

  return Object.freeze({
    projectId: project.id, snapshotId: snapshot.id, generatedAt: generatedAt.toISOString(),
    concept: Object.freeze({ styleId: snapshot.configuration.styleId, label: catalogueConcept?.englishLabel ?? snapshot.concept.label, thaiLabel: catalogueConcept?.thaiLabel ?? snapshot.concept.label, imageSrc: snapshot.concept.imageSrc, direction: Object.freeze({ ...insight.conceptDirection }) }),
    configuration: Object.freeze({ residents: snapshot.configuration.residents, floors: snapshot.configuration.floors, bedrooms: snapshot.configuration.bedrooms, bathrooms: snapshot.configuration.bathrooms, parkingSpaces: snapshot.configuration.parkingSpaces, materialLevel: snapshot.configuration.materialLevel, materialQuality: review.quality.label, functions: Object.freeze([...review.functionLabels]), specialFeatures: Object.freeze([...snapshot.configuration.specialFeatures]) }),
    location: Object.freeze({ province: review.location.province, district: review.location.district, siteAccess: review.location.access }), area: Object.freeze(snapshot.area),
    materials: Object.freeze(review.materials.map((material) => Object.freeze({ ...material }))),
    specialFeatures: Object.freeze(selectedSpecialFeatures.map((feature) => Object.freeze(feature))),
    additionalRequirements: Object.freeze([...review.functionLabels]),
    gallery: Object.freeze(GALLERY_VIEWS.map(([id, label, objectPosition]) => Object.freeze({ id, label, imageSrc: snapshot.concept.imageSrc, objectPosition, placeholder: true }))),
    lines: Object.freeze(snapshot.estimate.lines.map((line) => Object.freeze({ ...line, amount: Object.freeze({ ...line.amount }) }))),
    detailedBudget, total: Object.freeze({ ...snapshot.estimate.total }), assumptions: Object.freeze(snapshot.estimate.assumptions), includedItems: Object.freeze(snapshot.estimate.includedItems), excludedItems: Object.freeze(snapshot.estimate.excludedItems), confidence: snapshot.estimate.confidence, pricingVersion: snapshot.estimate.pricingVersion, referenceDate: snapshot.estimate.referenceDate,
    disclaimer: "งบประมาณเป็นการประเมินเบื้องต้นจากข้อมูลและตัวเลือกปัจจุบัน ราคาจริงอาจเปลี่ยนแปลงตามแบบรายละเอียด วัสดุ สภาพพื้นที่ก่อสร้าง และราคาตลาด ไม่ใช่ใบเสนอราคาสุดท้าย",
    nextStepAdvice: "นัดพูดคุยกับสถาปนิกเพื่อยืนยันพื้นที่ รายละเอียดหน้างาน และขอบเขตงานก่อนเริ่มออกแบบ", budgetComparison: Object.freeze(budgetComparison),
  });
}
