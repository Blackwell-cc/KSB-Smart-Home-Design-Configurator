import { getLandingContent } from "./landing-content";

test("provides the approved consumer hero content and safe demo budget", () => {
  const content = getLandingContent("th");

  expect(content.hero).toMatchObject({
    headingLead: "บ้านในฝันของคุณ",
    headingAccent: "ราคาเท่าไหร่?",
    primaryCta: "เริ่มประเมินฟรี",
    secondaryCta: "ดูตัวอย่างบ้าน",
  });
  expect(content.navigation.map((item) => item.label)).toEqual([
    "เริ่มต้น",
    "แบบบ้าน",
    "วิธีใช้งาน",
    "คำถามที่พบบ่อย",
  ]);
  expect(content.benefits).toHaveLength(3);
  expect(content.steps).toHaveLength(3);
  expect(content.showcase.budget.disclaimer).toBe("ตัวอย่างหน้าจอ · ไม่ใช่ราคาประเมิน");
  expect(content.showcase.budget.value).toBe("5.8 – 6.9 ล้านบาท");
  expect(content.faqs).toHaveLength(3);
});

test("falls back to Thai for an untranslated locale", () => {
  expect(getLandingContent("en")).toEqual(getLandingContent("th"));
});
