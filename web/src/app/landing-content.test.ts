import { getLandingContent } from "./landing-content";

test("provides concise Thai content for the single premium hero", () => {
  const content = getLandingContent("th");

  expect(content).toMatchObject({
    brand: "KSB ARCHITECT",
    contactLabel: "ปรึกษาสถาปนิก",
    contactNumber: "091 991 4592",
    eyebrow: "บริการวางแผนบ้านโดยสถาปนิก",
    heading: "รู้พื้นที่และงบประมาณบ้าน ก่อนเริ่มสร้าง",
    primaryCta: "เริ่มวางแผนบ้าน",
    secondaryCta: "ปรึกษาฟรี",
    conceptLabel: "Contemporary Warm Luxury",
  });
  expect(content.helper).toContain("ไม่ต้องกรอกข้อมูลส่วนตัว");
  expect(content).not.toHaveProperty("values");
  expect(content).not.toHaveProperty("processSteps");
  expect(content).not.toHaveProperty("finalHeading");
});

test("falls back to Thai for an untranslated locale", () => {
  expect(getLandingContent("en")).toEqual(getLandingContent("th"));
});
