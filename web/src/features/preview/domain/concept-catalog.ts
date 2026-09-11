export type ConceptCatalogEntry = {
  id: string;
  label: string;
  thaiLabel: string;
  englishLabel: string;
  description: string;
  image: string;
  floorImages?: Partial<Record<1 | 2 | 3, string>>;
  materialPreviewKey?: "classic" | "modern" | "nordic" | "loft" | "minimal" | "tropical" | "contemporary";
  category: "classic" | "modern" | "natural" | "loft" | "minimalist" | "luxury" | "vintage";
  pricingStyleId: "contemporary-warm-luxury" | "modern-tropical-resort" | "timeless-contemporary-luxury" | "not-sure";
  publicAssetId: "contemporary-warm-luxury" | "modern-tropical-resort" | "timeless-contemporary-luxury" | "not-sure";
  publicLabel: string;
  visible: boolean;
  specs: {
    land: string;
    floors: string;
    bedrooms: string;
    bathrooms: string;
    parking: string;
    suitableFor: string;
  };
};

export const STYLE_SELECTION_FLOORS = 2 as const;

const LIVE_PREVIEW_IMAGE_OVERRIDES: Readonly<Record<string, string>> = {
  "classic-style-1": "/material-previews/classic/1f/base.webp?v=20260828-classic-1f-ai-v2",
  "classic-style-2": "/material-previews/classic/2f/base.webp?v=20260911-classic-2f-ai-v1",
  "classic-style-3": "/material-previews/classic/3f/base.webp?v=20260909-classic-3f-ai-v1",
  "vintage-style-1": "/material-previews/contemporary/1f/base.webp?v=20260910-contemporary-base-v3",
  "vintage-style-2": "/material-previews/contemporary/2f/base.webp?v=20260910-contemporary-base-v3",
  "vintage-style-3": "/material-previews/contemporary/3f/base.webp?v=20260910-contemporary-base-v3",
  "luxury-style-1": "/material-previews/tropical/1f/base.webp?v=20260910-tropical-1f-ai-v1",
  "luxury-style-2": "/material-previews/tropical/2f/base.webp?v=20260910-tropical-2f-ai-v1",
  "luxury-style-3": "/material-previews/tropical/3f/base.webp?v=20260911-tropical-3f-ai-v1",
  "loft-style-1": "/material-previews/loft/1f/base.webp?v=20260827-loft-1f-base-v2",
  "loft-style-2": "/material-previews/loft/2f/base.webp?v=20260827-loft-2f-ai-v1",
  "loft-style-3": "/material-previews/loft/3f/base.webp?v=20260827-loft-3f-ai-v1",
  "minimalist-style-1": "/material-previews/minimal/1f/base.webp?v=20260827-minimal-1f-ai-v1",
  "minimalist-style-2": "/material-previews/minimal/2f/base.webp?v=20260828-minimal-2f-ai-v1",
  "minimalist-style-3": "/material-previews/minimal/3f/base.webp?v=20260828-minimal-3f-ai-v1",
};

export const CONCEPT_CATALOG = [
  {
    id: "classic-style",
    label: "Classic Style",
    thaiLabel: "บ้านสไตล์คลาสสิก",
    englishLabel: "Classic Style",
    description: "สัดส่วนสง่างามและรายละเอียดประณีต ให้บ้านดูภูมิฐานเหนือกาลเวลา",
    image: "/concepts/base-classic-2f-master.webp",
    floorImages: { 1: "/concepts/base-classic-1f-master.webp", 2: "/concepts/base-classic-2f-master.webp", 3: "/concepts/base-classic-3f-master.webp" },
    materialPreviewKey: "classic",
    category: "classic",
    pricingStyleId: "timeless-contemporary-luxury",
    publicAssetId: "timeless-contemporary-luxury",
    publicLabel: "Classic Style",
    visible: true,
    specs: { land: "220–320 ตร.ม.", floors: "2 ชั้น", bedrooms: "4 ห้อง", bathrooms: "4 ห้อง", parking: "2–3 คัน", suitableFor: "ครอบครัวที่ชอบความภูมิฐาน" },
  },
  {
    id: "modern-style",
    label: "Modern Style",
    thaiLabel: "บ้านสไตล์โมเดิร์น",
    englishLabel: "Modern Style",
    description: "รูปทรงเรขาคณิต เส้นสายคม และช่องเปิดขนาดใหญ่ รองรับการใช้ชีวิตร่วมสมัย",
    image: "/concepts/base-modern-2f-master-2.webp",
    floorImages: { 1: "/concepts/base-modern-1f-master-2.webp", 2: "/concepts/base-modern-2f-master-2.webp", 3: "/concepts/base-modern-3f-master-2.webp" },
    materialPreviewKey: "modern",
    category: "modern",
    pricingStyleId: "contemporary-warm-luxury",
    publicAssetId: "contemporary-warm-luxury",
    publicLabel: "Modern Style",
    visible: true,
    specs: { land: "180–250 ตร.ม.", floors: "2 ชั้น", bedrooms: "3–4 ห้อง", bathrooms: "3 ห้อง", parking: "2 คัน", suitableFor: "ครอบครัวขนาดกลาง" },
  },
  {
    id: "natural-style",
    label: "Nordic Style",
    thaiLabel: "บ้านสไตล์นอร์ดิก",
    englishLabel: "Nordic Style",
    description: "ผสานวัสดุธรรมชาติ แสง ลม และพื้นที่สีเขียว เพื่อบรรยากาศที่ผ่อนคลาย",
    image: "/concepts/base-nordic-2f-master.webp",
    floorImages: { 1: "/concepts/base-nordic-1f-master.webp", 2: "/concepts/base-nordic-2f-master.webp", 3: "/concepts/base-nordic-3f-master.webp" },
    materialPreviewKey: "nordic",
    category: "natural",
    pricingStyleId: "modern-tropical-resort",
    publicAssetId: "modern-tropical-resort",
    publicLabel: "Nordic Style",
    visible: true,
    specs: { land: "200–300 ตร.ม.", floors: "1–2 ชั้น", bedrooms: "3–4 ห้อง", bathrooms: "3 ห้อง", parking: "2 คัน", suitableFor: "ครอบครัวที่ชอบธรรมชาติ" },
  },
  {
    id: "loft-style",
    label: "Loft Style",
    thaiLabel: "บ้านสไตล์ลอฟท์",
    englishLabel: "Loft Style",
    description: "เผยผิววัสดุและโครงสร้างอย่างตรงไปตรงมา ให้พื้นที่โปร่ง เท่ และยืดหยุ่น",
    image: "/concepts/base-loft-2f-master.webp",
    floorImages: { 1: "/concepts/base-loft-1f-master.webp", 2: "/concepts/base-loft-2f-master.webp", 3: "/concepts/base-loft-3f-master.webp" },
    materialPreviewKey: "loft",
    category: "loft",
    pricingStyleId: "contemporary-warm-luxury",
    publicAssetId: "contemporary-warm-luxury",
    publicLabel: "Loft Style",
    visible: true,
    specs: { land: "160–240 ตร.ม.", floors: "2 ชั้น", bedrooms: "3 ห้อง", bathrooms: "3 ห้อง", parking: "2 คัน", suitableFor: "ผู้ที่ชอบพื้นที่โปร่งและวัสดุจริง" },
  },
  {
    id: "minimalist-style",
    label: "Minimalist Style",
    thaiLabel: "บ้านสไตล์มินิมอล",
    englishLabel: "Minimalist Style",
    description: "ลดทอนรายละเอียด เหลือเฉพาะสิ่งจำเป็น จัดพื้นที่เป็นระเบียบและดูแลรักษาง่าย",
    image: "/concepts/base-minimal-2f-master.webp",
    floorImages: { 1: "/concepts/base-minimal-1f-master.webp", 2: "/concepts/base-minimal-2f-master.webp", 3: "/concepts/base-minimal-3f-master.webp" },
    materialPreviewKey: "minimal",
    category: "minimalist",
    pricingStyleId: "contemporary-warm-luxury",
    publicAssetId: "contemporary-warm-luxury",
    publicLabel: "Minimalist Style",
    visible: true,
    specs: { land: "150–220 ตร.ม.", floors: "1–2 ชั้น", bedrooms: "3 ห้อง", bathrooms: "2–3 ห้อง", parking: "2 คัน", suitableFor: "ครอบครัวที่ชอบความเรียบง่าย" },
  },
  {
    id: "luxury-style",
    label: "Tropical",
    thaiLabel: "สไตล์ทรอปิคอล",
    englishLabel: "Tropical",
    description: "สัดส่วนโอ่อ่า วัสดุพรีเมียม และรายละเอียดเฉพาะตัวที่สะท้อนรสนิยมเจ้าของบ้าน",
    image: "/concepts/base-tropical-2f-master.webp?v=20260910-tropical-v3",
    floorImages: {
      1: "/concepts/base-tropical-1f-master.webp?v=20260910-tropical-v3",
      2: "/concepts/base-tropical-2f-master.webp?v=20260910-tropical-v3",
      3: "/concepts/base-tropical-3f-master.webp?v=20260910-tropical-v3",
    },
    materialPreviewKey: "tropical",
    category: "luxury",
    pricingStyleId: "timeless-contemporary-luxury",
    publicAssetId: "timeless-contemporary-luxury",
    publicLabel: "Tropical",
    visible: true,
    specs: { land: "240–400 ตร.ม.", floors: "2–3 ชั้น", bedrooms: "4–5 ห้อง", bathrooms: "4–6 ห้อง", parking: "3 คัน", suitableFor: "ครอบครัวที่ต้องการบ้านระดับพรีเมียม" },
  },
  {
    id: "vintage-style",
    label: "Contemporary",
    thaiLabel: "สไตล์ร่วมสมัย",
    englishLabel: "Contemporary",
    description: "กลิ่นอายย้อนยุคจากสัดส่วน สี และรายละเอียดคลาสสิก ให้บรรยากาศอบอุ่นมีเรื่องราว",
    image: "/concepts/base-contemporary-2f-master.webp?v=20260910-contemporary-v3",
    floorImages: {
      1: "/concepts/base-contemporary-1f-master.webp?v=20260910-contemporary-v3",
      2: "/concepts/base-contemporary-2f-master.webp?v=20260910-contemporary-v3",
      3: "/concepts/base-contemporary-3f-master.webp?v=20260910-contemporary-v3",
    },
    materialPreviewKey: "contemporary",
    category: "vintage",
    pricingStyleId: "timeless-contemporary-luxury",
    publicAssetId: "timeless-contemporary-luxury",
    publicLabel: "Contemporary",
    visible: true,
    specs: { land: "180–280 ตร.ม.", floors: "2 ชั้น", bedrooms: "3–4 ห้อง", bathrooms: "3–4 ห้อง", parking: "2 คัน", suitableFor: "ผู้ที่ชอบบ้านอบอุ่นมีเอกลักษณ์" },
  },
  {
    id: "contemporary-warm-luxury",
    label: "Contemporary Warm Luxury",
    thaiLabel: "โมเดิร์น ลักชัวรี",
    englishLabel: "Modern Luxury",
    description: "เส้นสายคม เรียบหรู และเปิดรับแสงธรรมชาติ เหมาะกับการใช้ชีวิตร่วมสมัย",
    image: "/concepts/contemporary-warm-luxury.png",
    category: "modern",
    pricingStyleId: "contemporary-warm-luxury",
    publicAssetId: "contemporary-warm-luxury",
    publicLabel: "Contemporary Warm Luxury",
    visible: false,
    specs: { land: "180–250 ตร.ม.", floors: "2 ชั้น", bedrooms: "3–4 ห้อง", bathrooms: "3 ห้อง", parking: "2 คัน", suitableFor: "ครอบครัวขนาดกลาง" },
  },
  {
    id: "modern-tropical-resort",
    label: "Modern Tropical Resort",
    thaiLabel: "ทรอปิคอล รีสอร์ต",
    englishLabel: "Tropical Resort",
    description: "พื้นที่เปิดรับลมและแสง พร้อมบรรยากาศพักผ่อนที่เชื่อมต่อภายในกับภายนอก",
    image: "/concepts/modern-tropical-resort.png",
    category: "natural",
    pricingStyleId: "modern-tropical-resort",
    publicAssetId: "modern-tropical-resort",
    publicLabel: "Modern Tropical Resort",
    visible: false,
    specs: { land: "200–300 ตร.ม.", floors: "2 ชั้น", bedrooms: "3–4 ห้อง", bathrooms: "3 ห้อง", parking: "2 คัน", suitableFor: "ครอบครัวที่ชอบธรรมชาติ" },
  },
  {
    id: "timeless-contemporary-luxury",
    label: "Timeless Contemporary Luxury",
    thaiLabel: "คอนเทมโพรารี โมเดิร์น",
    englishLabel: "Contemporary Modern",
    description: "สัดส่วนสงบ เรียบหรู และเลือกวัสดุที่คงคุณค่าได้ในระยะยาว",
    image: "/concepts/timeless-contemporary-luxury.png",
    category: "luxury",
    pricingStyleId: "timeless-contemporary-luxury",
    publicAssetId: "timeless-contemporary-luxury",
    publicLabel: "Timeless Contemporary Luxury",
    visible: false,
    specs: { land: "180–260 ตร.ม.", floors: "2 ชั้น", bedrooms: "4 ห้อง", bathrooms: "4 ห้อง", parking: "2 คัน", suitableFor: "ครอบครัวหลายช่วงวัย" },
  },
  {
    id: "classic-timeless",
    label: "Classic Timeless",
    thaiLabel: "คลาสสิก ไทม์เลส",
    englishLabel: "Classic Timeless",
    description: "สัดส่วนภูมิฐาน รายละเอียดประณีต และความงามที่อยู่เหนือกาลเวลา",
    image: "/concepts/timeless-contemporary-luxury.png",
    category: "classic",
    pricingStyleId: "timeless-contemporary-luxury",
    publicAssetId: "timeless-contemporary-luxury",
    publicLabel: "Timeless Contemporary Luxury",
    visible: false,
    specs: { land: "220–320 ตร.ม.", floors: "2 ชั้น", bedrooms: "4 ห้อง", bathrooms: "5 ห้อง", parking: "2–3 คัน", suitableFor: "ครอบครัวที่ชอบความภูมิฐาน" },
  },
  {
    id: "minimal-nordic",
    label: "Minimal Nordic",
    thaiLabel: "มินิมอล นอร์ดิก",
    englishLabel: "Minimal Nordic",
    description: "เรียบง่าย อบอุ่น ใช้พื้นที่คุ้มค่า และดูแลรักษาได้ง่ายในระยะยาว",
    image: "/concepts/contemporary-warm-luxury.png",
    category: "modern",
    pricingStyleId: "contemporary-warm-luxury",
    publicAssetId: "contemporary-warm-luxury",
    publicLabel: "Contemporary Warm Luxury",
    visible: false,
    specs: { land: "150–220 ตร.ม.", floors: "2 ชั้น", bedrooms: "3 ห้อง", bathrooms: "3 ห้อง", parking: "2 คัน", suitableFor: "ครอบครัวเริ่มต้น" },
  },
  {
    id: "luxury-courtyard",
    label: "Luxury Courtyard",
    thaiLabel: "ลักชัวรี คอร์ทยาร์ด",
    englishLabel: "Luxury Courtyard",
    description: "จัดพื้นที่รอบคอร์ทกลางบ้าน เพื่อรับแสงและสร้างความเป็นส่วนตัวอย่างลงตัว",
    image: "/concepts/modern-tropical-resort.png",
    category: "luxury",
    pricingStyleId: "modern-tropical-resort",
    publicAssetId: "modern-tropical-resort",
    publicLabel: "Modern Tropical Resort",
    visible: false,
    specs: { land: "240–360 ตร.ม.", floors: "2 ชั้น", bedrooms: "4 ห้อง", bathrooms: "4 ห้อง", parking: "3 คัน", suitableFor: "ครอบครัวที่ต้องการพื้นที่ส่วนตัว" },
  },
  {
    id: "not-sure",
    label: "ยังไม่แน่ใจ ให้สถาปนิกช่วยแนะนำ",
    thaiLabel: "แนวทางที่สถาปนิกช่วยแนะนำ",
    englishLabel: "Architect Guided Direction",
    description: "เริ่มจากความต้องการใช้งานและงบประมาณ เพื่อให้สถาปนิกช่วยหาแนวทางที่เหมาะสม",
    image: "/concepts/contemporary-warm-luxury.png",
    category: "modern",
    pricingStyleId: "not-sure",
    publicAssetId: "not-sure",
    publicLabel: "ยังไม่แน่ใจ ให้สถาปนิกช่วยแนะนำ",
    visible: false,
    specs: { land: "ประเมินร่วมกัน", floors: "1–3 ชั้น", bedrooms: "ตามการใช้งาน", bathrooms: "ตามการใช้งาน", parking: "ตามความต้องการ", suitableFor: "ผู้ที่ต้องการคำแนะนำ" },
  },
] as const satisfies readonly ConceptCatalogEntry[];

export const VISIBLE_CONCEPT_CATALOG = CONCEPT_CATALOG.filter((concept) => concept.visible);

export function resolveConceptImage(concept: ConceptCatalogEntry, floors: number): string {
  const supportedFloor = floors <= 1 ? 1 : floors >= 3 ? 3 : 2;
  return concept.floorImages?.[supportedFloor] ?? concept.floorImages?.[2] ?? concept.image;
}

export function conceptForFloors(concept: ConceptCatalogEntry, floors: number): ConceptCatalogEntry {
  const supportedFloor = floors <= 1 ? 1 : floors >= 3 ? 3 : 2;
  const previewImage = LIVE_PREVIEW_IMAGE_OVERRIDES[`${concept.id}-${supportedFloor}`]
    ?? resolveConceptImage(concept, supportedFloor);
  return { ...concept, image: previewImage };
}

export type ConceptId = (typeof CONCEPT_CATALOG)[number]["id"];
