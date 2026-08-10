import { render, screen, within } from "@testing-library/react";
import HomePage from "./page";

test("presents the planning value before asking for contact data", () => {
  render(<HomePage />);

  expect(screen.getByRole("heading", { name: "รู้พื้นที่และงบประมาณบ้านก่อนเริ่มสร้าง" })).toBeInTheDocument();
  expect(screen.getByText(/Preview แรกไม่ต้องกรอกข้อมูลส่วนตัว/)).toBeInTheDocument();
  const planningLinks = screen.getAllByRole("link", { name: "เริ่มวางแผนบ้าน" });
  expect(planningLinks).toHaveLength(2);
  planningLinks.forEach((link) => expect(link).toHaveAttribute("href", "/configurator"));
  expect(screen.getByRole("link", { name: "ดูขั้นตอนการใช้งาน" })).toHaveAttribute("href", "#process");
});

test("exposes the process, estimate scope and architect contact", () => {
  render(<HomePage />);

  const process = screen.getByRole("region", { name: "จากความต้องการ สู่กรอบโครงการที่คุยกับสถาปนิกได้" });
  expect(within(process).getAllByRole("heading", { level: 3 })).toHaveLength(3);
  expect(screen.getByText(/ไม่ใช่แบบก่อสร้าง ใบเสนอราคา หรือราคาผูกพัน/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "ปรึกษาสถาปนิก 091 991 4592" })).toHaveAttribute("href", "tel:0919914592");
  expect(screen.getByAltText(/ภาพแนวคิดบ้านสไตล์ Contemporary Warm Luxury/)).toBeInTheDocument();
});
