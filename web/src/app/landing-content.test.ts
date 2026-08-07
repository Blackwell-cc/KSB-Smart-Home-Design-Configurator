import { getLandingContent } from "./landing-content";

test("provides Thai landing content and falls back for an untranslated locale", () => {
  expect(getLandingContent("th")).toMatchObject({
    eyebrow: "บริการวางแผนบ้านโดยสถาปนิก",
    heading: "รู้พื้นที่และงบประมาณบ้านก่อนเริ่มสร้าง",
    description: "เลือกความต้องการทีละขั้น และดู Preview ได้โดยไม่ต้องกรอกข้อมูลส่วนตัว",
    cta: "เริ่มออกแบบบ้าน",
  });
  expect(getLandingContent("en")).toEqual(getLandingContent("th"));
});
