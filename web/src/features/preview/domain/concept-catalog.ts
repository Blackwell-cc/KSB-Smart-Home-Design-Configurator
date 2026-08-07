export const CONCEPT_CATALOG = [
  {
    id: "contemporary-warm-luxury",
    label: "Contemporary Warm Luxury",
    image: "/concepts/contemporary-warm-luxury.png",
  },
  {
    id: "modern-tropical-resort",
    label: "Modern Tropical Resort",
    image: "/concepts/modern-tropical-resort.png",
  },
  {
    id: "timeless-contemporary-luxury",
    label: "Timeless Contemporary Luxury",
    image: "/concepts/timeless-contemporary-luxury.png",
  },
  {
    id: "not-sure",
    label: "ยังไม่แน่ใจ ให้สถาปนิกช่วยแนะนำ",
    image: "/concepts/contemporary-warm-luxury.png",
  },
] as const;

export type ConceptId = (typeof CONCEPT_CATALOG)[number]["id"];
