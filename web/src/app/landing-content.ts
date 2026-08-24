export type LandingLocale = "th" | "en";
export type LandingIconName =
  | "phone"
  | "calculator"
  | "eye"
  | "clock"
  | "shield"
  | "share"
  | "home"
  | "space"
  | "chart"
  | "menu"
  | "arrow";

type NavigationItem = { label: string; href: `#${string}` };
type BenefitItem = { label: string; icon: LandingIconName };
type StepItem = {
  number: string;
  title: string;
  description: string;
  icon: LandingIconName;
};

export type LandingContent = {
  brand: { logoAlt: string; homeLabel: string };
  header: { phoneLabel: string; phoneNumber: string; ctaLabel: string };
  navigation: NavigationItem[];
  hero: {
    headingLead: string;
    headingAccent: string;
    supportingCopy: string;
    explanation: string;
    primaryCta: string;
    secondaryCta: string;
  };
  benefits: BenefitItem[];
  steps: StepItem[];
  showcase: {
    imageAlt: string;
    style: {
      label: string;
      selected: string;
      choices: Array<{ label: string; image: string }>;
    };
    area: { label: string; value: string; unit: string };
    material: {
      label: string;
      selected: string;
      swatches: Array<{ label: string; color: string }>;
    };
    budget: {
      label: string;
      value: string;
      supporting: string;
      detailLabel: string;
      disclaimer: string;
    };
    share: { title: string; supporting: string; imageAlt: string };
  };
};

const thaiContent: LandingContent = {
  brand: {
    logoAlt: "โลโก้ KSB Architect",
    homeLabel: "KSB Architect หน้าแรก",
  },
  header: {
    phoneLabel: "โทรปรึกษา",
    phoneNumber: "091 991 4592",
    ctaLabel: "ลองประเมินฟรี",
  },
  navigation: [
    { label: "เริ่มต้น", href: "#start" },
    { label: "แบบบ้าน", href: "#house-preview" },
    { label: "วิธีใช้งาน", href: "#how-it-works" },
  ],
  hero: {
    headingLead: "บ้านในฝันของคุณ",
    headingAccent: "ราคาเท่าไหร่?",
    supportingCopy:
      "ลองเลือกสไตล์ ฟังก์ชัน และการตกแต่ง เพื่อดูงบประมาณและภาพบ้านเบื้องต้นของคุณ",
    explanation:
      "เครื่องมือช่วยวางแผนบ้านที่เข้าใจง่าย ให้คุณเห็นภาพบ้านในฝัน พร้อมงบประมาณเบื้องต้น ก่อนตัดสินใจคุยรายละเอียดกับสถาปนิก",
    primaryCta: "เริ่มประเมินฟรี",
    secondaryCta: "ดูตัวอย่างบ้าน",
  },
  benefits: [
    { label: "ใช้เวลา 3–5 นาที", icon: "clock" },
    { label: "ไม่ต้องกรอกข้อมูลก่อน", icon: "shield" },
    { label: "แชร์ผลลัพธ์ให้ครอบครัวได้", icon: "share" },
  ],
  steps: [
    {
      number: "1",
      title: "เลือกสไตล์",
      description: "สไตล์ที่ใช่สำหรับคุณ",
      icon: "home",
    },
    {
      number: "2",
      title: "ปรับฟังก์ชัน",
      description: "ขนาดพื้นที่และฟังก์ชัน",
      icon: "space",
    },
    {
      number: "3",
      title: "ดูราคาและภาพตัวอย่าง",
      description: "เห็นงบประมาณและภาพบ้าน",
      icon: "chart",
    },
  ],
  showcase: {
    imageAlt: "บ้านร่วมสมัยแสงอบอุ่นช่วงเย็นสำหรับตัวอย่างการวางแผนบ้าน",
    style: {
      label: "สไตล์บ้าน",
      selected: "Modern Warm",
      choices: [
        {
          label: "Modern Warm",
          image: "/concepts/contemporary-warm-luxury.png",
        },
        { label: "Tropical", image: "/concepts/modern-tropical-resort.png" },
        {
          label: "Timeless",
          image: "/concepts/timeless-contemporary-luxury.png",
        },
      ],
    },
    area: { label: "พื้นที่ใช้สอย", value: "320", unit: "ตร.ม." },
    material: {
      label: "ระดับวัสดุและการตกแต่ง",
      selected: "Premium",
      swatches: [
        { label: "ไม้", color: "#75583E" },
        { label: "หิน", color: "#B6A58D" },
        { label: "กระจก", color: "#849097" },
        { label: "ผิวสีอ่อน", color: "#D8D0C4" },
      ],
    },
    budget: {
      label: "งบประมาณเริ่มต้น",
      value: "30 – 40 ล้านบาท",
      supporting: "ช่วงราคาประมาณการเบื้องต้น",
      detailLabel: "ดูรายละเอียด",
      disclaimer: "ตัวอย่างหน้าจอ · ไม่ใช่ราคาประเมิน",
    },
    share: {
      title: "Preview พร้อมแชร์",
      supporting: "ส่งให้ครอบครัวช่วยตัดสินใจ",
      imageAlt: "ภาพย่อ Preview บ้านสำหรับแชร์",
    },
  },
};

const landingContent: Partial<Record<LandingLocale, LandingContent>> = {
  th: thaiContent,
};

export function getLandingContent(locale: LandingLocale = "th"): LandingContent {
  return landingContent[locale] ?? thaiContent;
}
