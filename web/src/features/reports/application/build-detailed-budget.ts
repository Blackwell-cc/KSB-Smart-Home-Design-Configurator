import type { CalculationLineCode, MoneyRange } from "@/features/pricing/domain/price-book";

type SourceLine = Readonly<{ code: CalculationLineCode; label: string; amount: MoneyRange }>;

export type DetailedBudgetCategory = Readonly<{
  code: string;
  label: string;
  description: string;
  amount: Readonly<MoneyRange>;
}>;

export type DetailedBudget = Readonly<{
  categories: readonly DetailedBudgetCategory[];
  subtotal: Readonly<MoneyRange>;
  contingency: DetailedBudgetCategory;
  total: Readonly<MoneyRange>;
}>;

const CORE_CATEGORIES = [
  { code: "structure", label: "งานโครงสร้าง", description: "ฐานราก เสา คาน พื้น และโครงสร้างหลัก", weight: 0.22 },
  { code: "architecture", label: "งานสถาปัตยกรรม", description: "ก่อผนัง ฉาบ และงานตกแต่งพื้นฐาน", weight: 0.12 },
  { code: "roof", label: "งานหลังคา", description: "โครงหลังคา วัสดุมุง ฉนวน และรางน้ำ", weight: 0.06 },
  { code: "wall-finishes", label: "งานผนังและพื้นผิว", description: "ผิวภายใน–ภายนอก หิน ไม้ และวัสดุตกแต่ง", weight: 0.10 },
  { code: "doors-windows", label: "งานประตูและหน้าต่าง", description: "ประตู หน้าต่าง กระจก และอุปกรณ์ประกอบ", weight: 0.08 },
  { code: "electrical", label: "ระบบไฟฟ้า", description: "เดินสาย ตู้ไฟ อุปกรณ์ และแสงสว่าง", weight: 0.08 },
  { code: "plumbing", label: "ระบบประปาและสุขาภิบาล", description: "น้ำดี น้ำทิ้ง สุขภัณฑ์ และระบบระบายน้ำ", weight: 0.06 },
  { code: "air-conditioning", label: "ระบบปรับอากาศ / ระบายอากาศ", description: "ระบบปรับอากาศและการระบายอากาศ", weight: 0.06 },
  { code: "interior-allowance", label: "งานตกแต่งภายในเบื้องต้น", description: "งานฝ้า ผิว Built-in และรายละเอียดแสง", weight: 0.08 },
  { code: "kitchen", label: "งานครัว", description: "ครัว Built-in และค่าเผื่ออุปกรณ์พื้นฐาน", weight: 0.04 },
  { code: "landscape", label: "งานภูมิทัศน์", description: "สวน Hardscape ระบบรดน้ำ และไฟภายนอก", weight: 0.04 },
  { code: "site-preparation", label: "งานเตรียมพื้นที่และงานชั่วคราว", description: "เตรียมหน้างาน ป้องกันพื้นที่ และงานชั่วคราว", weight: 0.03 },
  { code: "other-allowance", label: "ค่าใช้จ่ายอื่น ๆ / Allowance", description: "ค่าเผื่องานประกอบที่ต้องยืนยันในแบบรายละเอียด", weight: 0.03 },
] as const;

const FEATURE_PRESENTATION: Record<string, { label: string; description: string }> = {
  pool: { label: "สระว่ายน้ำ / ส่วนพิเศษ", description: "สระว่ายน้ำ ระบบกรอง อุปกรณ์ และงานตกแต่งเกี่ยวเนื่อง" },
  lift: { label: "ลิฟต์โดยสาร", description: "ค่าเผื่อลิฟต์ ช่องลิฟต์ และงานระบบที่เกี่ยวข้อง" },
  "smart-home": { label: "ระบบ Smart Home", description: "ระบบควบคุมอัจฉริยะและอุปกรณ์พื้นฐาน" },
  solar: { label: "Solar Roof / ระบบพลังงาน", description: "ระบบผลิตพลังงานและอุปกรณ์เชื่อมต่อเบื้องต้น" },
  "ev-charger": { label: "EV Charger", description: "อุปกรณ์ชาร์จ ระบบไฟ และงานติดตั้ง" },
  "large-glazing": { label: "ผนังกระจกขนาดใหญ่", description: "กระจก โครงอะลูมิเนียม และอุปกรณ์เฉพาะ" },
};

const KEYS = ["low", "expected", "high"] as const;

function add(ranges: readonly Readonly<MoneyRange>[]): MoneyRange {
  return ranges.reduce((sum, range) => ({
    low: sum.low + range.low,
    expected: sum.expected + range.expected,
    high: sum.high + range.high,
  }), { low: 0, expected: 0, high: 0 });
}

function sameRange(left: Readonly<MoneyRange>, right: Readonly<MoneyRange>) {
  return KEYS.every((key) => left[key] === right[key]);
}

function allocate(amount: Readonly<MoneyRange>, weights: readonly number[]): MoneyRange[] {
  const ranges = weights.map(() => ({ low: 0, expected: 0, high: 0 }));
  for (const key of KEYS) {
    let allocated = 0;
    weights.forEach((weight, index) => {
      const value = index === weights.length - 1 ? amount[key] - allocated : Math.floor(amount[key] * weight);
      ranges[index][key] = value;
      allocated += value;
    });
  }
  return ranges;
}

function lineByCode(lines: readonly SourceLine[], code: CalculationLineCode): SourceLine {
  const line = lines.find((candidate) => candidate.code === code);
  if (!line) throw new Error("INVALID_SAVED_SNAPSHOT");
  return line;
}

export function buildDetailedBudget(input: Readonly<{
  lines: readonly SourceLine[];
  total: Readonly<MoneyRange>;
  selectedSpecialFeatures: readonly string[];
}>): DetailedBudget {
  const sourceTotal = add(input.lines.map(({ amount }) => amount));
  if (!sameRange(sourceTotal, input.total)) throw new Error("REPORT_BUDGET_DOES_NOT_RECONCILE");

  const construction = lineByCode(input.lines, "core-construction");
  const coreAmounts = allocate(construction.amount, CORE_CATEGORIES.map(({ weight }) => weight));
  const categories: DetailedBudgetCategory[] = CORE_CATEGORIES.map(({ code, label, description }, index) => ({
    code,
    label,
    description,
    amount: Object.freeze(coreAmounts[index]),
  }));

  const special = lineByCode(input.lines, "special-features");
  const pricingFeatures = input.selectedSpecialFeatures.filter((feature) => FEATURE_PRESENTATION[feature]);
  if (pricingFeatures.length > 0) {
    const featureAmounts = allocate(special.amount, pricingFeatures.map(() => 1 / pricingFeatures.length));
    pricingFeatures.forEach((feature, index) => {
      const presentation = FEATURE_PRESENTATION[feature];
      categories.push({ code: feature, ...presentation, amount: Object.freeze(featureAmounts[index]) });
    });
  } else if (KEYS.some((key) => special.amount[key] > 0)) {
    categories.push({ code: "special-features", label: "งานระบบและส่วนพิเศษ", description: "รายการพิเศษตามขอบเขตที่บันทึกไว้", amount: Object.freeze({ ...special.amount }) });
  }

  const designFee = lineByCode(input.lines, "design-professional-fee");
  const taxFees = lineByCode(input.lines, "tax-fees");
  categories.push(
    { code: designFee.code, label: "ค่าออกแบบและบริการวิชาชีพ", description: "งานสถาปัตยกรรม วิศวกรรม และเอกสารประกอบการก่อสร้าง", amount: Object.freeze({ ...designFee.amount }) },
    { code: taxFees.code, label: "ภาษีและค่าธรรมเนียม", description: "ภาษีและค่าธรรมเนียมตามสมมติฐานของ Price Book", amount: Object.freeze({ ...taxFees.amount }) },
  );

  const contingencySource = lineByCode(input.lines, "site-risk");
  const subtotal = add(categories.map(({ amount }) => amount));
  const contingency: DetailedBudgetCategory = {
    code: "contingency",
    label: "สำรองประมาณการ / ความเสี่ยงหน้างาน",
    description: "ค่าเผื่อจากข้อจำกัดการเข้าถึงและเงื่อนไขหน้างานที่บันทึกไว้",
    amount: Object.freeze({ ...contingencySource.amount }),
  };
  const reconciled = add([subtotal, contingency.amount]);
  if (!sameRange(reconciled, input.total)) throw new Error("REPORT_BUDGET_DOES_NOT_RECONCILE");

  return Object.freeze({
    categories: Object.freeze(categories.map((category) => Object.freeze(category))),
    subtotal: Object.freeze(subtotal),
    contingency: Object.freeze(contingency),
    total: Object.freeze({ ...input.total }),
  });
}
