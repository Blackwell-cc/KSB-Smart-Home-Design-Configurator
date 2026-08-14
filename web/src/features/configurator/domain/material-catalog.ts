export const MATERIAL_CATEGORY_IDS = [
  "roof",
  "wall",
  "window",
  "door",
  "flooring",
  "ceiling",
  "facade",
  "lighting",
] as const;

export type MaterialCategoryId = (typeof MATERIAL_CATEGORY_IDS)[number];

export type MaterialSelections = Record<MaterialCategoryId, string>;

export const MATERIAL_CATALOG = [
  {
    id: "roof",
    label: "หลังคา",
    options: [
      { id: "concrete-tile", label: "Concrete Tile" },
      { id: "ceramic-tile", label: "Ceramic Tile" },
      { id: "metal-roof", label: "Metal Roof" },
      { id: "natural-slate", label: "Natural Slate" },
    ],
  },
  {
    id: "wall",
    label: "ผนังภายนอก",
    options: [
      { id: "smooth-plaster", label: "Smooth Plaster" },
      { id: "natural-stone", label: "Natural Stone" },
      { id: "exterior-timber", label: "Exterior Timber" },
      { id: "exposed-concrete", label: "Exposed Concrete" },
    ],
  },
  {
    id: "window",
    label: "หน้าต่าง",
    options: [
      { id: "black-aluminium", label: "Black Aluminium" },
      { id: "natural-aluminium", label: "Natural Aluminium" },
      { id: "solid-wood", label: "Solid Wood" },
      { id: "upvc", label: "uPVC" },
    ],
  },
  {
    id: "door",
    label: "ประตูทางเข้า",
    options: [
      { id: "teak", label: "Teak" },
      { id: "engineered-wood", label: "Engineered Wood" },
      { id: "aluminium-glass", label: "Aluminium and Glass" },
      { id: "metal-frame", label: "Metal Frame" },
    ],
  },
  {
    id: "flooring",
    label: "พื้น",
    options: [
      { id: "natural-marble", label: "Natural Marble" },
      { id: "engineered-wood", label: "Engineered Wood" },
      { id: "porcelain-tile", label: "Porcelain Tile" },
      { id: "terrazzo", label: "Terrazzo" },
    ],
  },
  {
    id: "ceiling",
    label: "ฝ้าเพดาน",
    options: [
      { id: "flat-ceiling", label: "Flat Ceiling" },
      { id: "timber-slats", label: "Timber Slats" },
      { id: "recessed-ceiling", label: "Recessed Ceiling" },
      { id: "solid-timber", label: "Solid Timber" },
    ],
  },
  {
    id: "facade",
    label: "รายละเอียดฟาซาด",
    options: [
      { id: "timber-screen", label: "Timber Screen" },
      { id: "decorative-stone", label: "Decorative Stone" },
      { id: "metal-screen", label: "Metal Screen" },
      { id: "green-facade", label: "Green Facade" },
    ],
  },
  {
    id: "lighting",
    label: "แสงและบรรยากาศ",
    options: [
      { id: "warm-ambient", label: "Warm Ambient" },
      { id: "architectural-light", label: "Architectural Light" },
      { id: "landscape-light", label: "Landscape Light" },
      { id: "accent-lighting", label: "Accent Lighting" },
    ],
  },
] as const;

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
  | "double-volume"
  | "large-glazing";

export const PRICING_SPECIAL_FEATURE_CODES = [
  "pool",
  "lift",
  "smart-home",
  "solar",
  "ev-charger",
  "double-volume",
  "large-glazing",
] as const satisfies readonly PricingSpecialFeature[];

export const SPECIAL_FEATURE_CATALOG = [
  { id: "pool", label: "สระว่ายน้ำ" },
  { id: "lift", label: "ลิฟต์" },
  { id: "smart-home", label: "ระบบ Smart Home" },
  { id: "solar", label: "โซลาร์เซลล์" },
  { id: "ev-charger", label: "ที่ชาร์จรถ EV" },
  { id: "double-volume", label: "โถง Double Volume" },
  { id: "large-glazing", label: "ผนังกระจกขนาดใหญ่" },
  { id: "internal-garden", label: "สวนภายในบ้าน" },
  { id: "skylight", label: "สกายไลต์" },
  { id: "home-theater", label: "โฮมเธียเตอร์" },
  { id: "wine-room", label: "ห้องไวน์" },
  { id: "outdoor-pavilion", label: "ศาลานั่งเล่นภายนอก" },
  { id: "security-system", label: "ระบบรักษาความปลอดภัย" },
  { id: "fitness-room", label: "ห้องออกกำลังกาย" },
  { id: "pet-area", label: "พื้นที่สำหรับสัตว์เลี้ยง" },
] as const;

export type SpecialFeatureId = (typeof SPECIAL_FEATURE_CATALOG)[number]["id"];

export function materialLevelForQuality(quality: MaterialQualityId): "select" | "premium" | "signature" {
  return quality === "standard" ? "select" : quality === "bespoke" ? "signature" : quality;
}

export function isPricingSpecialFeature(value: string): value is PricingSpecialFeature {
  return (PRICING_SPECIAL_FEATURE_CODES as readonly string[]).includes(value);
}
