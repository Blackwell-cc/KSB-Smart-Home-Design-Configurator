import { CONCEPT_CATALOG } from "@/features/preview/domain/concept-catalog";

type MoneyRange = { low: number; expected: number; high: number };
type ReportLine = { code: "core-construction" | "special-features" | "site-risk" | "design-professional-fee" | "tax-fees"; label: string; amount: MoneyRange };

export type FullReportViewModel = Readonly<{
  projectId: string; snapshotId: string; concept: { styleId: string | null; label: string; imageSrc?: string };
  configuration: { floors: number; bedrooms: number; bathrooms: number; parkingSpaces: number; materialLevel: string; specialFeatures: readonly string[] };
  area: { usableAreaM2: number; constructionFloorAreaM2: number }; lines: readonly ReportLine[]; total: MoneyRange;
  assumptions: readonly string[]; includedItems: readonly string[]; excludedItems: readonly string[]; confidence: "B" | "C";
  pricingVersion: string; referenceDate: string; disclaimer: string; nextStepAdvice: string;
  budgetComparison: { status: "no-target" | "within-target" | "below-target" | "above-target"; target?: { min: number; max: number } };
}>;

const REQUIRED_CODES = ["core-construction", "special-features", "site-risk", "design-professional-fee", "tax-fees"] as const;
const INVALID = "INVALID_SAVED_SNAPSHOT";
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const validNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;

function range(value: unknown): MoneyRange {
  if (!isRecord(value) || !validNumber(value.low) || !validNumber(value.expected) || !validNumber(value.high) || value.low > value.expected || value.expected > value.high) throw new Error(INVALID);
  return { low: value.low, expected: value.expected, high: value.high };
}
function strings(value: unknown): string[] { if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) throw new Error(INVALID); return [...value]; }
function snapshotShape(value: unknown) {
  if (!isRecord(value) || typeof value.id !== "string" || !isRecord(value.configuration) || !isRecord(value.area) || !isRecord(value.estimate)) throw new Error(INVALID);
  const config = value.configuration; const area = value.area; const estimate = value.estimate;
  if (typeof config.styleId !== "string" && config.styleId !== null || ![config.floors, config.bedrooms, config.bathrooms, config.parkingSpaces].every((v) => typeof v === "number" && Number.isInteger(v) && v >= 0) || typeof config.materialLevel !== "string" || !Array.isArray(config.specialFeatures) || config.specialFeatures.some((v) => typeof v !== "string") || !validNumber(area.usableAreaM2) || !validNumber(area.constructionFloorAreaM2) || typeof estimate.pricingVersion !== "string" || typeof estimate.referenceDate !== "string" || (estimate.confidence !== "B" && estimate.confidence !== "C") || !Array.isArray(estimate.lines)) throw new Error(INVALID);
  const lines = estimate.lines.map((line) => {
    if (!isRecord(line) || typeof line.code !== "string" || typeof line.label !== "string") throw new Error(INVALID);
    return { code: line.code, label: line.label, amount: range(line.amount) };
  });
  if (lines.length !== REQUIRED_CODES.length || lines.some((line, index) => line.code !== REQUIRED_CODES[index])) throw new Error(INVALID);
  return { id: value.id, configuration: { styleId: config.styleId as string | null, floors: config.floors as number, bedrooms: config.bedrooms as number, bathrooms: config.bathrooms as number, parkingSpaces: config.parkingSpaces as number, materialLevel: config.materialLevel as string, specialFeatures: strings(config.specialFeatures) }, area: { usableAreaM2: area.usableAreaM2 as number, constructionFloorAreaM2: area.constructionFloorAreaM2 as number }, estimate: { pricingVersion: estimate.pricingVersion as string, referenceDate: estimate.referenceDate as string, confidence: estimate.confidence as "B" | "C", lines: lines as ReportLine[], total: range(estimate.total), assumptions: strings(estimate.assumptions), includedItems: strings(estimate.includedItems), excludedItems: strings(estimate.excludedItems) } };
}

export function buildFullReport(project: { id: string; targetBudget: { min: number; max: number } | null }, savedSnapshot: unknown): FullReportViewModel {
  const snapshot = snapshotShape(savedSnapshot);
  const concept = CONCEPT_CATALOG.find((item) => item.id === snapshot.configuration.styleId);
  const target = project.targetBudget;
  const budgetComparison = !target ? { status: "no-target" as const } : snapshot.estimate.total.expected < target.min ? { status: "below-target" as const, target: { ...target } } : snapshot.estimate.total.expected > target.max ? { status: "above-target" as const, target: { ...target } } : { status: "within-target" as const, target: { ...target } };
  return Object.freeze({ projectId: project.id, snapshotId: snapshot.id, concept: Object.freeze({ styleId: snapshot.configuration.styleId, label: concept?.label ?? "แนวคิดบ้านที่เลือก", ...(concept ? { imageSrc: concept.image } : {}) }), configuration: Object.freeze(snapshot.configuration), area: Object.freeze(snapshot.area), lines: Object.freeze(snapshot.estimate.lines.map((line) => Object.freeze({ ...line, amount: Object.freeze({ ...line.amount }) }))), total: Object.freeze({ ...snapshot.estimate.total }), assumptions: Object.freeze(snapshot.estimate.assumptions), includedItems: Object.freeze(snapshot.estimate.includedItems), excludedItems: Object.freeze(snapshot.estimate.excludedItems), confidence: snapshot.estimate.confidence, pricingVersion: snapshot.estimate.pricingVersion, referenceDate: snapshot.estimate.referenceDate, disclaimer: "ตัวเลขนี้เป็นกรอบงบประมาณเบื้องต้นจากข้อมูลที่บันทึกไว้ ไม่ใช่ราคาสุดท้ายหรือใบเสนอราคา", nextStepAdvice: "นำสรุปนี้ไปคุยกับสถาปนิกเพื่อยืนยันพื้นที่ รายละเอียดหน้างาน และขอบเขตงานก่อนเริ่มออกแบบ", budgetComparison: Object.freeze(budgetComparison) });
}
