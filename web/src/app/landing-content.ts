export type LandingLocale = "th" | "en";

export type LandingContent = {
  eyebrow: string;
  heading: string;
  description: string;
  cta: string;
};

const defaultLandingLocale: LandingLocale = "th";

const landingContent: Partial<Record<LandingLocale, LandingContent>> = {
  th: {
    eyebrow: "บริการวางแผนบ้านโดยสถาปนิก",
    heading: "รู้พื้นที่และงบประมาณบ้านก่อนเริ่มสร้าง",
    description: "เลือกความต้องการทีละขั้น และดู Preview ได้โดยไม่ต้องกรอกข้อมูลส่วนตัว",
    cta: "เริ่มออกแบบบ้าน",
  },
};

export function getLandingContent(locale: LandingLocale = defaultLandingLocale): LandingContent {
  return landingContent[locale] ?? landingContent[defaultLandingLocale]!;
}
