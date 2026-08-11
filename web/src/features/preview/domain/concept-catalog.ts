type ConceptCatalogEntry = {
  id: string;
  label: string;
  thaiLabel: string;
  englishLabel: string;
  description: string;
  image: string;
  category: "modern" | "contemporary" | "tropical" | "classic";
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

export const CONCEPT_CATALOG = [
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
    visible: true,
    specs: { land: "180–250 ตร.ม.", floors: "2 ชั้น", bedrooms: "3–4 ห้อง", bathrooms: "3 ห้อง", parking: "2 คัน", suitableFor: "ครอบครัวขนาดกลาง" },
  },
  {
    id: "modern-tropical-resort",
    label: "Modern Tropical Resort",
    thaiLabel: "ทรอปิคอล รีสอร์ต",
    englishLabel: "Tropical Resort",
    description: "พื้นที่เปิดรับลมและแสง พร้อมบรรยากาศพักผ่อนที่เชื่อมต่อภายในกับภายนอก",
    image: "/concepts/modern-tropical-resort.png",
    category: "tropical",
    pricingStyleId: "modern-tropical-resort",
    publicAssetId: "modern-tropical-resort",
    publicLabel: "Modern Tropical Resort",
    visible: true,
    specs: { land: "200–300 ตร.ม.", floors: "2 ชั้น", bedrooms: "3–4 ห้อง", bathrooms: "3 ห้อง", parking: "2 คัน", suitableFor: "ครอบครัวที่ชอบธรรมชาติ" },
  },
  {
    id: "timeless-contemporary-luxury",
    label: "Timeless Contemporary Luxury",
    thaiLabel: "คอนเทมโพรารี โมเดิร์น",
    englishLabel: "Contemporary Modern",
    description: "สัดส่วนสงบ เรียบหรู และเลือกวัสดุที่คงคุณค่าได้ในระยะยาว",
    image: "/concepts/timeless-contemporary-luxury.png",
    category: "contemporary",
    pricingStyleId: "timeless-contemporary-luxury",
    publicAssetId: "timeless-contemporary-luxury",
    publicLabel: "Timeless Contemporary Luxury",
    visible: true,
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
    visible: true,
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
    visible: true,
    specs: { land: "150–220 ตร.ม.", floors: "2 ชั้น", bedrooms: "3 ห้อง", bathrooms: "3 ห้อง", parking: "2 คัน", suitableFor: "ครอบครัวเริ่มต้น" },
  },
  {
    id: "luxury-courtyard",
    label: "Luxury Courtyard",
    thaiLabel: "ลักชัวรี คอร์ทยาร์ด",
    englishLabel: "Luxury Courtyard",
    description: "จัดพื้นที่รอบคอร์ทกลางบ้าน เพื่อรับแสงและสร้างความเป็นส่วนตัวอย่างลงตัว",
    image: "/concepts/modern-tropical-resort.png",
    category: "contemporary",
    pricingStyleId: "modern-tropical-resort",
    publicAssetId: "modern-tropical-resort",
    publicLabel: "Modern Tropical Resort",
    visible: true,
    specs: { land: "240–360 ตร.ม.", floors: "2 ชั้น", bedrooms: "4 ห้อง", bathrooms: "4 ห้อง", parking: "3 คัน", suitableFor: "ครอบครัวที่ต้องการพื้นที่ส่วนตัว" },
  },
  {
    id: "not-sure",
    label: "ยังไม่แน่ใจ ให้สถาปนิกช่วยแนะนำ",
    thaiLabel: "แนวทางที่สถาปนิกช่วยแนะนำ",
    englishLabel: "Architect Guided Direction",
    description: "เริ่มจากความต้องการใช้งานและงบประมาณ เพื่อให้สถาปนิกช่วยหาแนวทางที่เหมาะสม",
    image: "/concepts/contemporary-warm-luxury.png",
    category: "contemporary",
    pricingStyleId: "not-sure",
    publicAssetId: "not-sure",
    publicLabel: "ยังไม่แน่ใจ ให้สถาปนิกช่วยแนะนำ",
    visible: false,
    specs: { land: "ประเมินร่วมกัน", floors: "1–3 ชั้น", bedrooms: "ตามการใช้งาน", bathrooms: "ตามการใช้งาน", parking: "ตามความต้องการ", suitableFor: "ผู้ที่ต้องการคำแนะนำ" },
  },
] as const satisfies readonly ConceptCatalogEntry[];

export const VISIBLE_CONCEPT_CATALOG = CONCEPT_CATALOG.filter((concept) => concept.visible);

export type ConceptId = (typeof CONCEPT_CATALOG)[number]["id"];
