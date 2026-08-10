import { getLandingContent } from "./landing-content";

test("provides the complete Thai premium landing content", () => {
  const content = getLandingContent("th");

  expect(content).toMatchObject({
    brand: "KSB ARCHITECT",
    productLabel: "HOME PLANNING STUDIO",
    contactLabel: "ปรึกษาสถาปนิก",
    contactNumber: "091 991 4592",
    eyebrow: "บริการวางแผนบ้านโดยสถาปนิก",
    heading: "รู้พื้นที่และงบประมาณบ้านก่อนเริ่มสร้าง",
    primaryCta: "เริ่มวางแผนบ้าน",
    secondaryCta: "ดูขั้นตอนการใช้งาน",
    conceptLabel: "Contemporary Warm Luxury",
    processHeading: "จากความต้องการ สู่กรอบโครงการที่คุยกับสถาปนิกได้",
    finalHeading: "บ้านที่อยู่ได้จริง เริ่มจาก Brief ที่ชัดเจน",
  });
  expect(content.helper).toContain("ไม่ต้องกรอกข้อมูลส่วนตัว");
  expect(content.scopeNote).toContain("ไม่ใช่แบบก่อสร้าง");
  expect(content.values).toHaveLength(3);
  expect(content.processSteps).toHaveLength(3);
});

test("falls back to Thai for an untranslated locale", () => {
  expect(getLandingContent("en")).toEqual(getLandingContent("th"));
});
