import type { DesignBriefConfiguration } from "@/features/configurator/domain/configuration";
import type { ConceptId } from "@/features/preview/domain/concept-catalog";

type InsightTrait = { title: string; description: string };

type StylePresentation = {
  conceptDirection: { title: string; description: string };
  personality: { intro: string; traits: readonly InsightTrait[]; closing: string };
};

export type ProjectInsight = {
  conceptDirection: StylePresentation["conceptDirection"];
  personality: { intro: string; traits: InsightTrait[]; closing: string };
};

const establishedHouseStylePresentationMap = {
  "contemporary-warm-luxury": {
    conceptDirection: {
      title: "อบอุ่น เรียบหรู อยู่สบาย",
      description: "บ้านที่สร้างสมดุลระหว่างความงาม ฟังก์ชัน และการใช้ชีวิตร่วมกันในทุกช่วงเวลา",
    },
    personality: {
      intro: "จากตัวเลือกของคุณ บ้านสไตล์นี้น่าจะถูกใจคนที่...",
      traits: [
        { title: "ชอบความเรียบหรูที่ไม่ต้องพยายาม", description: "ใส่ใจรายละเอียด โดยไม่ต้องการความโอ้อวด" },
        { title: "ให้ความสำคัญกับความสบายของครอบครัว", description: "บ้านต้องสวยและใช้งานจริงได้ทุกวัน" },
        { title: "ชอบพื้นที่โปร่ง เป็นระเบียบ และมีคุณภาพ", description: "ให้คุณค่ากับแสงธรรมชาติ วัสดุ และบรรยากาศ" },
        { title: "มองบ้านเป็นพื้นที่พักใจระยะยาว", description: "อยากกลับบ้านแล้วรู้สึกสงบและเป็นตัวเอง" },
      ],
      closing: "บ้านที่ใช่ มักสะท้อนวิธีใช้ชีวิตของเจ้าของได้มากกว่าที่คิด",
    },
  },
  "modern-tropical-resort": {
    conceptDirection: {
      title: "โปร่ง สงบ เชื่อมต่อธรรมชาติ",
      description: "พื้นที่พักผ่อนที่เปิดรับลม แสง และสวน พร้อมเชื่อมชีวิตภายในกับภายนอกอย่างเป็นธรรมชาติ",
    },
    personality: {
      intro: "จากตัวเลือกของคุณ บ้านสไตล์นี้น่าจะถูกใจคนที่...",
      traits: [
        { title: "ให้คุณค่ากับการพักผ่อนและธรรมชาติ", description: "ชอบบรรยากาศโปร่ง สบาย และไม่เร่งรีบ" },
        { title: "รักการใช้เวลาร่วมกับคนสำคัญ", description: "มองบ้านเป็นพื้นที่เติมพลังให้ครอบครัวและเพื่อน" },
        { title: "ชอบพื้นที่ที่ไหลต่อถึงกัน", description: "ต้องการให้บ้านและสวนเป็นส่วนหนึ่งของชีวิตประจำวัน" },
        { title: "เลือกความหรูที่อยู่สบาย", description: "ให้ความสำคัญกับประสบการณ์ มากกว่าความโอ่อ่า" },
      ],
      closing: "บ้านที่ดี ไม่ได้แค่สวยในภาพ แต่ต้องทำให้ทุกวันรู้สึกเหมือนได้พักผ่อน",
    },
  },
  "timeless-contemporary-luxury": {
    conceptDirection: {
      title: "สง่างาม ร่วมสมัย เหนือกาลเวลา",
      description: "สัดส่วนที่สุขุม วัสดุที่มีคุณภาพ และรายละเอียดที่ยังคงคุณค่าได้ในระยะยาว",
    },
    personality: {
      intro: "จากตัวเลือกของคุณ บ้านสไตล์นี้น่าจะถูกใจคนที่...",
      traits: [
        { title: "ชอบความสง่างามแบบพอดี", description: "มองหาความสวยที่ไม่ขึ้นกับกระแสระยะสั้น" },
        { title: "ตัดสินใจจากคุณภาพระยะยาว", description: "ให้ความสำคัญกับวัสดุและรายละเอียดที่ไว้ใจได้" },
        { title: "รักความเป็นระเบียบและสัดส่วนที่ลงตัว", description: "ต้องการบ้านที่ชัดเจนทั้งภาพรวมและการใช้งาน" },
        { title: "มองบ้านเป็นคุณค่าที่ส่งต่อได้", description: "วางแผนเพื่อวันนี้ พร้อมรองรับอนาคตของครอบครัว" },
      ],
      closing: "ความเหนือกาลเวลา เริ่มจากการเลือกสิ่งที่มีความหมายกับชีวิตจริง",
    },
  },
  "classic-timeless": {
    conceptDirection: {
      title: "ภูมิฐาน ประณีต เหนือกาลเวลา",
      description: "บ้านที่ให้ความสำคัญกับสัดส่วน รายละเอียด และบรรยากาศสง่างามในทุกมุมมอง",
    },
    personality: {
      intro: "จากตัวเลือกของคุณ บ้านสไตล์นี้น่าจะถูกใจคนที่...",
      traits: [
        { title: "ชื่นชอบความงามที่มีรากฐาน", description: "ให้คุณค่ากับสัดส่วนและรายละเอียดที่ผ่านกาลเวลา" },
        { title: "พิถีพิถันกับภาพลักษณ์และบรรยากาศ", description: "ต้องการบ้านที่ดูภูมิฐานโดยไม่แข็งกระด้าง" },
        { title: "วางแผนบ้านเพื่อครอบครัวระยะยาว", description: "ให้ความสำคัญกับพื้นที่ที่ใช้งานได้หลายช่วงวัย" },
        { title: "เลือกความประณีตเหนือความหวือหวา", description: "เชื่อว่าคุณภาพที่ดีมองเห็นได้จากรายละเอียด" },
      ],
      closing: "บ้านที่สง่างามที่สุด คือบ้านที่สะท้อนคุณค่าและเรื่องราวของเจ้าของ",
    },
  },
  "minimal-nordic": {
    conceptDirection: {
      title: "เรียบง่าย อบอุ่น ใช้พื้นที่อย่างคุ้มค่า",
      description: "บ้านที่ลดสิ่งไม่จำเป็น เปิดรับแสงธรรมชาติ และจัดทุกพื้นที่ให้ดูแลง่ายในระยะยาว",
    },
    personality: {
      intro: "จากตัวเลือกของคุณ บ้านสไตล์นี้น่าจะถูกใจคนที่...",
      traits: [
        { title: "ชอบความเรียบง่ายที่คิดมาแล้ว", description: "ต้องการของน้อยชิ้น แต่ทุกชิ้นมีหน้าที่ชัดเจน" },
        { title: "ให้ความสำคัญกับความอบอุ่นในชีวิตประจำวัน", description: "มองหาบ้านที่สบายตาและสบายใจ" },
        { title: "ใช้พื้นที่อย่างมีเหตุผล", description: "ให้คุณค่ากับความคล่องตัวและการดูแลที่ไม่ยุ่งยาก" },
        { title: "เลือกคุณภาพมากกว่าปริมาณ", description: "ชอบรายละเอียดที่พอดีและใช้งานได้นาน" },
      ],
      closing: "ความเรียบง่ายที่ดี เกิดจากการเข้าใจว่าชีวิตต้องการอะไรจริง ๆ",
    },
  },
  "luxury-courtyard": {
    conceptDirection: {
      title: "เป็นส่วนตัว เชื่อมโยง รอบพื้นที่สีเขียว",
      description: "บ้านที่โอบล้อมคอร์ทกลางเพื่อรับแสง สร้างความสงบ และเชื่อมสมาชิกในบ้านเข้าหากัน",
    },
    personality: {
      intro: "จากตัวเลือกของคุณ บ้านสไตล์นี้น่าจะถูกใจคนที่...",
      traits: [
        { title: "ให้คุณค่ากับความเป็นส่วนตัว", description: "ต้องการพื้นที่สงบโดยไม่ตัดขาดจากธรรมชาติ" },
        { title: "ชอบบ้านที่มีจังหวะและเรื่องราว", description: "สนุกกับมุมมองที่เปลี่ยนไปเมื่อเดินผ่านแต่ละพื้นที่" },
        { title: "ให้ความสำคัญกับการอยู่ร่วมกัน", description: "มองคอร์ทกลางเป็นหัวใจที่เชื่อมทุกคนในบ้าน" },
        { title: "รักรายละเอียดที่ออกแบบเฉพาะตัว", description: "ต้องการบ้านที่ไม่เหมือนใคร แต่ยังอยู่สบาย" },
      ],
      closing: "พื้นที่ว่างที่ออกแบบดี มักกลายเป็นพื้นที่สำคัญที่สุดของบ้าน",
    },
  },
  "not-sure": {
    conceptDirection: {
      title: "เริ่มจากชีวิตจริง แล้วค่อยพัฒนาเป็นสไตล์",
      description: "รวบรวมความต้องการ พื้นที่ และงบประมาณ เพื่อค้นหาแนวทางบ้านที่เหมาะกับคุณที่สุด",
    },
    personality: {
      intro: "จากตัวเลือกของคุณ แนวทางนี้น่าจะเหมาะกับคนที่...",
      traits: [
        { title: "เปิดรับคำแนะนำอย่างมีเหตุผล", description: "อยากเห็นทางเลือกก่อนตัดสินใจเรื่องสไตล์" },
        { title: "เริ่มจากการใช้งานจริง", description: "ให้ความสำคัญกับชีวิตประจำวันมากกว่าภาพจำ" },
        { title: "ต้องการวางแผนอย่างเป็นระบบ", description: "อยากให้พื้นที่และงบประมาณเดินไปในทิศทางเดียวกัน" },
        { title: "พร้อมพัฒนาความต้องการไปพร้อมผู้เชี่ยวชาญ", description: "เชื่อว่าบ้านที่ดีเกิดจากบทสนทนาที่ชัดเจน" },
      ],
      closing: "ไม่ต้องรู้คำตอบทั้งหมดตั้งแต่แรก แค่เริ่มจากข้อมูลที่จริงกับชีวิตของคุณ",
    },
  },
} satisfies Record<Exclude<ConceptId,
  | "classic-style"
  | "modern-style"
  | "natural-style"
  | "loft-style"
  | "minimalist-style"
  | "luxury-style"
  | "vintage-style"
>, StylePresentation>;

export const houseStylePresentationMap: Record<ConceptId, StylePresentation> = {
  ...establishedHouseStylePresentationMap,
  "classic-style": establishedHouseStylePresentationMap["classic-timeless"],
  "modern-style": establishedHouseStylePresentationMap["contemporary-warm-luxury"],
  "natural-style": establishedHouseStylePresentationMap["modern-tropical-resort"],
  "loft-style": establishedHouseStylePresentationMap["contemporary-warm-luxury"],
  "minimalist-style": establishedHouseStylePresentationMap["minimal-nordic"],
  "luxury-style": establishedHouseStylePresentationMap["timeless-contemporary-luxury"],
  "vintage-style": establishedHouseStylePresentationMap["classic-timeless"],
};

const featureTraits = {
  family: { title: "วางแผนเพื่อครอบครัวและทุกช่วงวัย", description: "คิดถึงความสะดวก ปลอดภัย และการใช้งานร่วมกันในระยะยาว" },
  technology: { title: "ชอบความสะดวกที่เทคโนโลยีช่วยได้", description: "เปิดรับระบบที่ทำให้บ้านใช้งานง่ายและตอบสนองชีวิตประจำวัน" },
  leisure: { title: "ให้พื้นที่กับการพักผ่อนและการพบปะ", description: "มองบ้านเป็นพื้นที่สร้างช่วงเวลาดี ๆ กับคนสำคัญ" },
  focus: { title: "ให้ความสำคัญกับสมาธิและประสิทธิภาพ", description: "ต้องการพื้นที่ที่ช่วยแยกจังหวะงานออกจากเวลาพักผ่อน" },
  quality: { title: "มองคุณภาพเป็นการลงทุนระยะยาว", description: "เลือกวัสดุและรายละเอียดที่คงคุณค่า ใช้งานดี และดูแลได้" },
} satisfies Record<string, InsightTrait>;

export function buildProjectInsight(configuration: DesignBriefConfiguration): ProjectInsight {
  const styleId = (configuration.styleId ?? "not-sure") as ConceptId;
  const presentation = houseStylePresentationMap[styleId] ?? houseStylePresentationMap["not-sure"];
  const adjustments: InsightTrait[] = [];

  if (configuration.functions.elderlyRoom) adjustments.push(featureTraits.family);
  if (configuration.specialFeatures.includes("smart-home")) adjustments.push(featureTraits.technology);
  if (configuration.specialFeatures.includes("pool") || configuration.specialFeatures.includes("outdoor-pavilion")) adjustments.push(featureTraits.leisure);
  if (configuration.functions.office) adjustments.push(featureTraits.focus);
  if (["signature", "bespoke"].includes(configuration.materialQualityId)) adjustments.push(featureTraits.quality);

  const uniqueAdjustments = adjustments.filter((trait, index) => adjustments.findIndex(({ title }) => title === trait.title) === index).slice(0, 2);
  const baseCount = 4 - uniqueAdjustments.length;

  return {
    conceptDirection: presentation.conceptDirection,
    personality: {
      intro: presentation.personality.intro,
      traits: [...presentation.personality.traits.slice(0, baseCount), ...uniqueAdjustments],
      closing: presentation.personality.closing,
    },
  };
}
