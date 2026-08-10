type ConceptCatalogEntry = {
  id: string;
  label: string;
  thaiLabel: string;
  englishLabel: string;
  description: string;
  image: string;
};

export const CONCEPT_CATALOG = [
  {
    id: "contemporary-warm-luxury",
    label: "Contemporary Warm Luxury",
    thaiLabel: "คอนเทมโพรารี วอร์ม ลักชัวรี",
    englishLabel: "Contemporary Warm Luxury",
    description: "เส้นสายร่วมสมัยที่อบอุ่น สมดุลระหว่างความเรียบง่ายและรายละเอียดวัสดุ",
    image: "/concepts/contemporary-warm-luxury.png",
  },
  {
    id: "modern-tropical-resort",
    label: "Modern Tropical Resort",
    thaiLabel: "โมเดิร์น ทรอปิคอล รีสอร์ต",
    englishLabel: "Modern Tropical Resort",
    description: "พื้นที่เปิดรับลมและแสง พร้อมบรรยากาศพักผ่อนที่เชื่อมต่อภายในกับภายนอก",
    image: "/concepts/modern-tropical-resort.png",
  },
  {
    id: "timeless-contemporary-luxury",
    label: "Timeless Contemporary Luxury",
    thaiLabel: "ไทม์เลส คอนเทมโพรารี ลักชัวรี",
    englishLabel: "Timeless Contemporary Luxury",
    description: "สัดส่วนสงบ เรียบหรู และเลือกวัสดุที่คงคุณค่าได้ในระยะยาว",
    image: "/concepts/timeless-contemporary-luxury.png",
  },
  {
    id: "not-sure",
    label: "ยังไม่แน่ใจ ให้สถาปนิกช่วยแนะนำ",
    thaiLabel: "แนวทางที่สถาปนิกช่วยแนะนำ",
    englishLabel: "Architect Guided Direction",
    description: "เริ่มจากความต้องการใช้งานและงบประมาณ เพื่อให้สถาปนิกช่วยหาแนวทางที่เหมาะสม",
    image: "/concepts/contemporary-warm-luxury.png",
  },
] as const satisfies readonly ConceptCatalogEntry[];

export type ConceptId = (typeof CONCEPT_CATALOG)[number]["id"];
