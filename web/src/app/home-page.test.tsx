import { render, screen } from "@testing-library/react";
import HomePage from "./page";

test("presents one focused hero with the real KSB brand and planning action", () => {
  const { container } = render(<HomePage />);

  expect(container.querySelectorAll("main section")).toHaveLength(1);
  expect(screen.getByRole("heading", { name: "รู้พื้นที่และงบประมาณบ้าน ก่อนเริ่มสร้าง" })).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "โลโก้ KSB Architect" })).toHaveAttribute(
    "src",
    expect.stringContaining("ksb-architect-logo.png"),
  );
  expect(screen.getAllByRole("link", { name: "เริ่มวางแผนบ้าน" })).toHaveLength(1);
  expect(screen.getByRole("link", { name: "เริ่มวางแผนบ้าน" })).toHaveAttribute("href", "/configurator");
  expect(screen.getByText(/Preview แรกไม่ต้องกรอกข้อมูลส่วนตัว/)).toBeInTheDocument();
});

test("keeps architect contact clear without repeating the old process sections", () => {
  render(<HomePage />);

  expect(screen.getByRole("link", { name: "ปรึกษาสถาปนิก 091 991 4592" })).toHaveAttribute(
    "href",
    "tel:0919914592",
  );
  expect(screen.getByRole("link", { name: "ปรึกษาฟรี" })).toHaveAttribute("href", "tel:0919914592");
  expect(screen.queryByRole("link", { name: "ดูขั้นตอนการใช้งาน" })).not.toBeInTheDocument();
  expect(screen.queryByText("จากความต้องการ สู่กรอบโครงการที่คุยกับสถาปนิกได้")).not.toBeInTheDocument();
  expect(screen.getByAltText(/ภาพแนวคิดบ้านสไตล์ Contemporary Warm Luxury/)).toBeInTheDocument();
});
