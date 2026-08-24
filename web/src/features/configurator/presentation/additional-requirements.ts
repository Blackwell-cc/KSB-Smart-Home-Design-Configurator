import type { HouseConfiguration } from "../domain/configuration";

export const ADDITIONAL_REQUIREMENT_OPTIONS = [
  { code: "prayer-room", label: "ห้องพระ", description: "พื้นที่สงบสำหรับการสักการะ", icon: "prayer" },
  { code: "laundry", label: "ห้องซักรีด", description: "แยกงานซักและจัดเก็บอย่างเป็นสัดส่วน", icon: "laundry" },
  { code: "home-theater", label: "ห้องดูหนัง", description: "พื้นที่พักผ่อนสำหรับทั้งครอบครัว", icon: "theater" },
  { code: "fitness", label: "ห้องฟิตเนส", description: "รองรับการออกกำลังกายภายในบ้าน", icon: "fitness" },
  { code: "pantry", label: "Pantry", description: "มุมเตรียมอาหารและเครื่องดื่ม", icon: "pantry" },
  { code: "pet-area", label: "พื้นที่สัตว์เลี้ยง", description: "พื้นที่ใช้งานที่ดูแลง่ายและปลอดภัย", icon: "pet" },
  { code: "maid-room", label: "ห้องแม่บ้าน", description: "บันทึกไว้สำหรับวางผังในขั้นออกแบบ", icon: "maid" },
  { code: "separate-living", label: "ห้องรับแขกแยก", description: "แยกพื้นที่ต้อนรับออกจากพื้นที่ส่วนตัว", icon: "living" },
] as const satisfies ReadonlyArray<{
  code: HouseConfiguration["additionalRequirements"][number];
  label: string;
  description: string;
  icon: string;
}>;

export const ADDITIONAL_REQUIREMENT_LABELS = Object.fromEntries(
  ADDITIONAL_REQUIREMENT_OPTIONS.map(({ code, label }) => [code, label]),
) as Record<HouseConfiguration["additionalRequirements"][number], string>;
