import { render, screen } from "@testing-library/react";
import HomePage from "./page";

test("explains the free preview before asking for contact data", () => {
  render(<HomePage />);
  expect(screen.getByRole("heading", { name: "รู้พื้นที่และงบประมาณบ้านก่อนเริ่มสร้าง" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "เริ่มออกแบบบ้าน" })).toHaveAttribute("href", "/configurator");
  expect(screen.getByText(/ดู Preview ได้โดยไม่ต้องกรอกข้อมูลส่วนตัว/)).toBeInTheDocument();
});
