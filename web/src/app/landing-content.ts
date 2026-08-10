export type LandingLocale = "th" | "en";

type LandingItem = {
  number: string;
  title: string;
  description: string;
};

export type LandingContent = {
  brand: string;
  productLabel: string;
  contactLabel: string;
  contactNumber: string;
  eyebrow: string;
  heading: string;
  statement: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  helper: string;
  conceptAlt: string;
  conceptLabel: string;
  values: LandingItem[];
  processEyebrow: string;
  processHeading: string;
  processDescription: string;
  processSteps: LandingItem[];
  scopeLabel: string;
  scopeNote: string;
  finalEyebrow: string;
  finalHeading: string;
  finalDescription: string;
  finalCta: string;
  contactCta: string;
  footerNote: string;
};

const defaultLandingLocale: LandingLocale = "th";

const landingContent: Partial<Record<LandingLocale, LandingContent>> = {
  th: {
    brand: "KSB ARCHITECT",
    productLabel: "HOME PLANNING STUDIO",
    contactLabel: "ปรึกษาสถาปนิก",
    contactNumber: "091 991 4592",
    eyebrow: "บริการวางแผนบ้านโดยสถาปนิก",
    heading: "รู้พื้นที่และงบประมาณบ้านก่อนเริ่มสร้าง",
    statement: "บ้านหรูไม่ได้เริ่มจากวัสดุแพง แต่เริ่มจากการวางแผนพื้นที่ ฟังก์ชัน และกรอบงบประมาณให้สอดคล้องกัน",
    description: "เลือกความต้องการทีละขั้น เพื่อดู Concept Preview พื้นที่ใช้สอยที่แนะนำ และกรอบงบประมาณเบื้องต้นได้ก่อนให้ข้อมูลติดต่อ",
    primaryCta: "เริ่มวางแผนบ้าน",
    secondaryCta: "ดูขั้นตอนการใช้งาน",
    helper: "ใช้เวลาประมาณ 3–5 นาที · Preview แรกไม่ต้องกรอกข้อมูลส่วนตัว",
    conceptAlt: "ภาพแนวคิดบ้านสไตล์ Contemporary Warm Luxury สำหรับประกอบการวางแผน",
    conceptLabel: "Contemporary Warm Luxury",
    values: [
      {
        number: "01",
        title: "กำหนดความต้องการ",
        description: "เลือกสไตล์ จำนวนห้อง ทำเล และระดับวัสดุ",
      },
      {
        number: "02",
        title: "เห็นกรอบโครงการ",
        description: "ดูพื้นที่ใช้สอย พื้นที่ก่อสร้าง และช่วงงบประมาณเบื้องต้น",
      },
      {
        number: "03",
        title: "คุยกับสถาปนิกต่อได้",
        description: "ใช้ข้อมูลสรุปเป็นจุดเริ่มต้นของการปรึกษาอย่างเป็นระบบ",
      },
    ],
    processEyebrow: "GUIDED ARCHITECT EXPERIENCE",
    processHeading: "จากความต้องการ สู่กรอบโครงการที่คุยกับสถาปนิกได้",
    processDescription: "ไม่จำเป็นต้องรู้ศัพท์สถาปัตยกรรม ระบบจะพาเลือกเฉพาะข้อมูลที่มีผลต่อการวางแผนบ้าน และคุณย้อนกลับไปแก้ไขได้ทุกขั้น",
    processSteps: [
      {
        number: "01",
        title: "เลือกตามภาพและการใช้งานจริง",
        description: "บอกสไตล์ ฟังก์ชัน จำนวนห้อง ทำเล และระดับวัสดุที่สอดคล้องกับชีวิตของคุณ",
      },
      {
        number: "02",
        title: "ระบบสรุปพื้นที่และกรอบงบประมาณ",
        description: "เห็นพื้นที่ใช้สอย พื้นที่ก่อสร้าง และปัจจัยที่มีผลต่อช่วงงบประมาณอย่างเป็นหมวดหมู่",
      },
      {
        number: "03",
        title: "ดู Preview ก่อนตัดสินใจปรึกษาต่อ",
        description: "รับภาพรวมโครงการก่อนให้ข้อมูลติดต่อ แล้วค่อยเลือกว่าจะรับสรุปฉบับเต็มหรือปรึกษาสถาปนิก",
      },
    ],
    scopeLabel: "ขอบเขตของผลลัพธ์",
    scopeNote: "ผลลัพธ์เป็นการประเมินเบื้องต้นเพื่อช่วยวางแผน ไม่ใช่แบบก่อสร้าง ใบเสนอราคา หรือราคาผูกพัน",
    finalEyebrow: "START WITH A CLEAR BRIEF",
    finalHeading: "บ้านที่อยู่ได้จริง เริ่มจาก Brief ที่ชัดเจน",
    finalDescription: "จัดกรอบความต้องการให้เห็นภาพก่อนเริ่มออกแบบจริง เพื่อให้ทุกการตัดสินใจคุยกันบนข้อมูลชุดเดียวกัน",
    finalCta: "เริ่มวางแผนบ้าน",
    contactCta: "ปรึกษาฟรี 091 991 4592",
    footerNote: "บริการออกแบบบ้าน สถาปัตยกรรม และวางแผนโครงการอย่างมืออาชีพ",
  },
};

export function getLandingContent(locale: LandingLocale = defaultLandingLocale): LandingContent {
  return landingContent[locale] ?? landingContent[defaultLandingLocale]!;
}
