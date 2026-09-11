export const MATERIAL_CATEGORY_IDS = [
  "roof",
  "wall",
  "window",
  "door",
  "flooring",
] as const;

export type MaterialCategoryId = (typeof MATERIAL_CATEGORY_IDS)[number];

export type MaterialSelections = Record<MaterialCategoryId, string>;

export const ORIGINAL_MATERIAL_OPTION_ID = "original";
export const ORIGINAL_MATERIAL_OPTION_LABEL = "Original / แบบตั้งต้น";

export const MATERIAL_CATALOG = [
  {
    id: "roof",
    label: "หลังคา",
    options: [
      { id: "concrete-tile", label: "กระเบื้องคอนกรีต", imageSrc: "/materials/roof/1.png" },
      { id: "ceramic-tile", label: "กระเบื้องเซรามิก", imageSrc: "/materials/roof/2.png" },
      { id: "metal-roof", label: "หลังคาเมทัลชีท", imageSrc: "/materials/roof/3.png" },
      { id: "natural-slate", label: "หินชนวนธรรมชาติ", imageSrc: "/materials/roof/4.png" },
    ],
  },
  {
    id: "wall",
    label: "ผนังภายนอก",
    options: [
      { id: "smooth-plaster", label: "ปูนฉาบเรียบ", imageSrc: "/materials/wall/1.png" },
      { id: "natural-stone", label: "หินธรรมชาติ", imageSrc: "/materials/wall/2.png" },
      { id: "exterior-timber", label: "ไม้ตกแต่งภายนอก", imageSrc: "/materials/wall/3.png" },
      { id: "exposed-concrete", label: "คอนกรีตเปลือย", imageSrc: "/materials/wall/4.png" },
    ],
  },
  {
    id: "window",
    label: "หน้าต่าง",
    options: [
      { id: "black-aluminium", label: "อลูมิเนียมสีดำ", imageSrc: "/materials/window/1.png" },
      { id: "natural-aluminium", label: "อลูมิเนียมสีธรรมชาติ", imageSrc: "/materials/window/2.png" },
      { id: "solid-wood", label: "ไม้จริง", imageSrc: "/materials/window/4.png" },
      { id: "upvc", label: "uPVC", imageSrc: "/materials/window/3.png" },
    ],
  },
  {
    id: "door",
    label: "ประตูทางเข้า",
    options: [
      { id: "teak", label: "โมเดิร์น", imageSrc: "/materials/door/4.png" },
      { id: "engineered-wood", label: "วอลนัทธรรมชาติ", imageSrc: "/materials/door/1.png" },
      { id: "aluminium-glass", label: "โอ๊คธรรมชาติ", imageSrc: "/materials/door/2.png" },
      { id: "metal-frame", label: "อะลูมิเนียมซิลเวอร์", imageSrc: "/materials/door/3.png" },
    ],
  },
  {
    id: "flooring",
    label: "พื้น",
    options: [
      { id: "natural-marble", label: "หินอ่อนธรรมชาติ", imageSrc: "/materials/flooring/1.png" },
      { id: "engineered-wood", label: "ไม้เอ็นจิเนียร์", imageSrc: "/materials/flooring/2.png" },
      { id: "porcelain-tile", label: "กระเบื้องพอร์ซเลน", imageSrc: "/materials/flooring/3.png" },
      { id: "terrazzo", label: "หินขัดเทอร์ราซโซ", imageSrc: "/materials/flooring/4.png" },
    ],
  },
] as const;

export const VISIBLE_MATERIAL_CATALOG = MATERIAL_CATALOG.filter(
  ({ id }) => id !== "flooring",
);

export type VisibleMaterialCategory = Readonly<{
  id: Exclude<MaterialCategoryId, "flooring">;
  label: string;
  options: readonly Readonly<{
    id: string;
    label: string;
    imageSrc: string;
  }>[];
}>;

const MINIMAL_ROOF_OPTIONS = [
  { id: "concrete-tile", label: "สีชาร์โคล", imageSrc: "/materials/roof/minimal/roof-charcoal.png" },
  { id: "ceramic-tile", label: "สีโอลีฟเกรย์", imageSrc: "/materials/roof/minimal/roof-olive-gray.png" },
  { id: "metal-roof", label: "สีซอฟต์เกรจ", imageSrc: "/materials/roof/minimal/roof-soft-greige.png" },
  { id: "natural-slate", label: "สีวอร์มเทาป์", imageSrc: "/materials/roof/minimal/roof-warm-taupe.png" },
] as const;

const CLASSIC_ROOF_OPTIONS = [
  { id: "concrete-tile", label: "สีชาร์โคล", imageSrc: "/materials/roof/classic/roof-charcoal.png" },
  { id: "ceramic-tile", label: "สีโอลีฟเกรย์", imageSrc: "/materials/roof/classic/roof-olive-gray.png" },
  { id: "metal-roof", label: "สีซอฟต์เกรจ", imageSrc: "/materials/roof/classic/roof-soft-greige.png" },
  { id: "natural-slate", label: "สีวอร์มเทาป์", imageSrc: "/materials/roof/classic/roof-warm-taupe.png" },
] as const;

export function visibleMaterialCatalogForStyle(
  styleId: string | null | undefined,
): readonly VisibleMaterialCategory[] {
  const catalog = VISIBLE_MATERIAL_CATALOG as readonly VisibleMaterialCategory[];
  const roofOptions = styleId === "minimalist-style" || styleId === "vintage-style"
    ? MINIMAL_ROOF_OPTIONS
    : styleId === "classic-style"
      ? CLASSIC_ROOF_OPTIONS
      : null;
  if (!roofOptions) return catalog;

  return catalog.map((category) => (
    category.id === "roof"
      ? { ...category, options: roofOptions }
      : category
  ));
}

export const DEFAULT_MATERIAL_SELECTIONS: MaterialSelections = Object.fromEntries(
  MATERIAL_CATALOG.map((category) => [category.id, category.options[0].id]),
) as MaterialSelections;

export const MATERIAL_QUALITY_IDS = ["standard", "premium", "signature", "bespoke"] as const;

export type MaterialQualityId = (typeof MATERIAL_QUALITY_IDS)[number];

export const MATERIAL_QUALITY_CATALOG = [
  { id: "standard", label: "STANDARD", description: "คุณภาพดี ควบคุมงบอย่างมีมาตรฐาน" },
  { id: "premium", label: "PREMIUM", description: "สมดุลความสวย รายละเอียด และคุณภาพ" },
  { id: "signature", label: "SIGNATURE", description: "วัสดุและรายละเอียดเฉพาะตัว" },
  { id: "bespoke", label: "BESPOKE", description: "คัดสรรวัสดุเพื่อสะท้อนตัวตนอย่างเฉพาะเจาะจง" },
] as const;

export type PricingSpecialFeature =
  | "pool"
  | "lift"
  | "smart-home"
  | "solar"
  | "ev-charger"
  | "large-glazing";

export const PRICING_SPECIAL_FEATURE_CODES = [
  "pool",
  "lift",
  "smart-home",
  "solar",
  "ev-charger",
  "large-glazing",
] as const satisfies readonly PricingSpecialFeature[];

export const SPECIAL_FEATURE_CATALOG = [
  { id: "pool", label: "สระว่ายน้ำ", imageSrc: "/materials/special-features/1.png" },
  { id: "lift", label: "ลิฟต์", imageSrc: "/materials/special-features/2.png" },
  { id: "smart-home", label: "ระบบ Smart Home", imageSrc: "/materials/special-features/3.png" },
  { id: "solar", label: "โซลาร์เซลล์", imageSrc: "/materials/special-features/4.png" },
  { id: "ev-charger", label: "ที่ชาร์จรถ EV", imageSrc: "/materials/special-features/5.png" },
  { id: "large-glazing", label: "ผนังกระจกขนาดใหญ่", imageSrc: "/materials/special-features/6.png" },
  { id: "internal-garden", label: "สวนภายในบ้าน", imageSrc: "/materials/special-features/7.png" },
  { id: "outdoor-pavilion", label: "ศาลานั่งเล่นภายนอก", imageSrc: "/materials/special-features/8.png" },
  { id: "security-system", label: "ระบบรักษาความปลอดภัย", imageSrc: "/materials/special-features/9.png" },
  { id: "fitness-room", label: "ห้องออกกำลังกาย", imageSrc: "/materials/special-features/10.png" },
] as const;

export const RETIRED_SPECIAL_FEATURE_IDS = [
  "double-volume",
  "skylight",
  "home-theater",
  "wine-room",
  "pet-area",
] as const;

export type SpecialFeatureId = (typeof SPECIAL_FEATURE_CATALOG)[number]["id"];

export function materialLevelForQuality(quality: MaterialQualityId): "select" | "premium" | "signature" {
  return quality === "standard" ? "select" : quality === "bespoke" ? "signature" : quality;
}

export function materialQualityForLevel(level: "select" | "premium" | "signature"): Exclude<MaterialQualityId, "bespoke"> {
  return level === "select" ? "standard" : level;
}

export function isPricingSpecialFeature(value: string): value is PricingSpecialFeature {
  return (PRICING_SPECIAL_FEATURE_CODES as readonly string[]).includes(value);
}
