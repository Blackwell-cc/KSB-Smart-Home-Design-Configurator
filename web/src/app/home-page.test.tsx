import { render, screen, within } from "@testing-library/react";
import HomePage from "./page";

test("renders the consumer acquisition header and one focused hero", () => {
  const { container } = render(<HomePage />);

  expect(container.querySelectorAll("main section")).toHaveLength(1);
  expect(screen.getByRole("heading", { name: "บ้านในฝันของคุณราคาเท่าไหร่?" })).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "โลโก้ KSB Architect" })).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: "เริ่มต้น" })[0]).toHaveAttribute("href", "#start");
  expect(screen.getAllByRole("link", { name: "แบบบ้าน" })[0]).toHaveAttribute("href", "#house-preview");
  expect(screen.getAllByRole("link", { name: "วิธีใช้งาน" })[0]).toHaveAttribute("href", "#how-it-works");
  expect(screen.getByRole("link", { name: "ลองประเมินฟรี" })).toHaveAttribute("href", "/configurator");
  expect(screen.getByRole("link", { name: "เริ่มประเมินฟรี" })).toHaveAttribute("href", "/configurator");
  expect(screen.getByRole("link", { name: "ดูตัวอย่างบ้าน" })).toHaveAttribute("href", "#house-preview");
  expect(container.querySelector("#faq")).not.toBeInTheDocument();
  expect(container.querySelectorAll('a[href="#faq"]')).toHaveLength(0);
});

test("renders five non-interactive demo cards with safe sample pricing", () => {
  const { container } = render(<HomePage />);

  const showcase = screen.getByRole("group", { name: "ตัวอย่างหน้าจอวางแผนบ้าน" });
  expect(within(showcase).getAllByRole("article")).toHaveLength(5);
  expect(within(showcase).queryByRole("button")).not.toBeInTheDocument();
  expect(within(showcase).queryByRole("slider")).not.toBeInTheDocument();
  expect(within(showcase).getByText("5.8 – 6.9 ล้านบาท")).toBeInTheDocument();
  expect(within(showcase).getByText("ตัวอย่างหน้าจอ · ไม่ใช่ราคาประเมิน")).toBeInTheDocument();
  expect(screen.getAllByText(/ใช้เวลา 3–5 นาที/)).toHaveLength(1);
  expect(screen.getByRole("heading", { name: "3 ขั้นตอนง่าย ๆ เพื่อบ้านในฝัน" })).toBeInTheDocument();
  const mobileMenuSummary = container.querySelector("details summary");
  expect(mobileMenuSummary).toHaveAttribute("aria-label", "เมนูหลัก");
  expect(mobileMenuSummary).not.toHaveAttribute("aria-label", "เปิดเมนูหลัก");

  const swatches = container.querySelector("[class*='swatches']");
  expect(swatches).toHaveAttribute("aria-hidden", "true");
  expect(swatches?.querySelectorAll("[aria-label]")).toHaveLength(0);
});
