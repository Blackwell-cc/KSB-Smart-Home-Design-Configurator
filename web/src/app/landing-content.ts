export type LandingLocale = "th" | "en";

export type LandingContent = {
  brand: string;
  contactLabel: string;
  contactNumber: string;
  eyebrow: string;
  heading: string;
  statement: string;
  primaryCta: string;
  secondaryCta: string;
  helper: string;
  conceptAlt: string;
  conceptLabel: string;
};

const defaultLandingLocale: LandingLocale = "th";

const landingContent: Partial<Record<LandingLocale, LandingContent>> = {
  th: {
    brand: "KSB ARCHITECT",
    contactLabel: "ปรึกษาสถาปนิก",
    contactNumber: "091 991 4592",
    eyebrow: "บริการวางแผนบ้านโดยสถาปนิก",
    heading: "รู้พื้นที่และงบประมาณบ้าน ก่อนเริ่มสร้าง",
    statement: "บ้านหรูไม่ได้เริ่มจากวัสดุแพง แต่เริ่มจากการวางแผนพื้นที่ ฟังก์ชัน และกรอบงบประมาณให้สอดคล้องกัน",
    primaryCta: "เริ่มวางแผนบ้าน",
    secondaryCta: "ปรึกษาฟรี",
    helper: "ใช้เวลาประมาณ 3–5 นาที · Preview แรกไม่ต้องกรอกข้อมูลส่วนตัว",
    conceptAlt: "ภาพแนวคิดบ้านสไตล์ Contemporary Warm Luxury สำหรับประกอบการวางแผน",
    conceptLabel: "Contemporary Warm Luxury",
  },
};

export function getLandingContent(locale: LandingLocale = defaultLandingLocale): LandingContent {
  return landingContent[locale] ?? landingContent[defaultLandingLocale]!;
}
