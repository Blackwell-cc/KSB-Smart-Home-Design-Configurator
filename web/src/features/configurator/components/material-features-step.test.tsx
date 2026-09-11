import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { createDefaultConfiguration } from "../domain/configuration";
import { MaterialFeaturesStep } from "./material-features-step";

describe("MaterialFeaturesStep", () => {
  test.each([
    ["classic-style", 3],
    ["modern-style", 4],
    ["natural-style", 4],
    ["loft-style", 2],
    ["minimalist-style", 4],
    ["luxury-style", 4],
    ["vintage-style", 3],
  ])("offers Original for every editable category of %s", (styleId, expectedCount) => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = styleId;

    render(<MaterialFeaturesStep configuration={configuration} onChange={vi.fn()} />);

    expect(screen.getAllByRole("button", { name: /รีเซ็ต.*เป็น Original/ })).toHaveLength(expectedCount);
  });

  test("lets the user restore every editable material category to the original house finish", async () => {
    const user = userEvent.setup();
    const configuration = createDefaultConfiguration();
    configuration.styleId = "modern-style";
    configuration.materialSelections.roof = "metal-roof";
    const onChange = vi.fn();

    render(<MaterialFeaturesStep configuration={configuration} onChange={onChange} />);

    expect(screen.getAllByText("ค่าปัจจุบัน:")).toHaveLength(4);
    await user.click(screen.getByRole("button", { name: "รีเซ็ตหลังคาเป็น Original" }));

    expect(onChange).toHaveBeenCalledWith({
      materialSelections: {
        ...configuration.materialSelections,
        roof: "original",
      },
    });
  });

  test("shows the four Minimal roof colors with their supplied thumbnails", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "minimalist-style";
    configuration.floors = 1;

    render(<MaterialFeaturesStep configuration={configuration} onChange={vi.fn()} />);

    const roof = screen.getByRole("radiogroup", { name: "หลังคา" });
    expect(within(roof).getAllByRole("radio").filter((radio) => radio.getAttribute("value") !== "original").map((radio) => radio.parentElement?.textContent)).toEqual([
      "สีชาร์โคล",
      "สีโอลีฟเกรย์",
      "สีซอฟต์เกรจ",
      "สีวอร์มเทาป์",
    ]);
    expect(Array.from(roof.querySelectorAll("img")).map((image) => image.getAttribute("src"))).toEqual([
      "/materials/roof/minimal/roof-charcoal.png",
      "/materials/roof/minimal/roof-olive-gray.png",
      "/materials/roof/minimal/roof-soft-greige.png",
      "/materials/roof/minimal/roof-warm-taupe.png",
    ]);
  });

  test("shows Classic roof colors and locks only the exterior wall choices", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "classic-style";
    configuration.floors = 1;

    render(<MaterialFeaturesStep configuration={configuration} onChange={vi.fn()} />);

    const roof = screen.getByRole("radiogroup", { name: "หลังคา" });
    expect(within(roof).getAllByRole("radio").filter((radio) => radio.getAttribute("value") !== "original").map((radio) => radio.parentElement?.textContent)).toEqual([
      "สีชาร์โคล",
      "สีโอลีฟเกรย์",
      "สีซอฟต์เกรจ",
      "สีวอร์มเทาป์",
    ]);
    expect(Array.from(roof.querySelectorAll("img")).map((image) => image.getAttribute("src"))).toEqual([
      "/materials/roof/classic/roof-charcoal.png",
      "/materials/roof/classic/roof-olive-gray.png",
      "/materials/roof/classic/roof-soft-greige.png",
      "/materials/roof/classic/roof-warm-taupe.png",
    ]);

    const wall = screen.getByRole("radiogroup", { name: "ผนังภายนอก" });
    expect(wall.closest("fieldset")).toHaveAttribute("data-locked", "true");
    expect(within(wall).getAllByRole("radio", { hidden: true })).toHaveLength(4);
    expect(screen.getByText("ล็อกตามดีไซน์ Classic")).toBeInTheDocument();
    expect(screen.getByText(/ผนังภายนอกเป็นองค์ประกอบหลักที่กำหนดเอกลักษณ์ของบ้านสไตล์ Classic/)).toBeInTheDocument();

    expect(screen.getByRole("radiogroup", { name: "หลังคา" }).closest("fieldset")).not.toBeDisabled();
    expect(screen.getByRole("radiogroup", { name: "หน้าต่าง" }).closest("fieldset")).not.toBeDisabled();
    expect(screen.getByRole("radiogroup", { name: "ประตูทางเข้า" }).closest("fieldset")).not.toBeDisabled();
  });

  test("shows Minimal roof colors for Contemporary and locks only the exterior wall choices", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "vintage-style";
    configuration.floors = 1;

    render(<MaterialFeaturesStep configuration={configuration} onChange={vi.fn()} />);

    const roof = screen.getByRole("radiogroup", { name: "หลังคา" });
    expect(within(roof).getAllByRole("radio").filter((radio) => radio.getAttribute("value") !== "original").map((radio) => radio.parentElement?.textContent)).toEqual([
      "สีชาร์โคล",
      "สีโอลีฟเกรย์",
      "สีซอฟต์เกรจ",
      "สีวอร์มเทาป์",
    ]);
    expect(Array.from(roof.querySelectorAll("img")).map((image) => image.getAttribute("src"))).toEqual([
      "/materials/roof/minimal/roof-charcoal.png",
      "/materials/roof/minimal/roof-olive-gray.png",
      "/materials/roof/minimal/roof-soft-greige.png",
      "/materials/roof/minimal/roof-warm-taupe.png",
    ]);

    const wall = screen.getByRole("radiogroup", { name: "ผนังภายนอก" });
    expect(wall.closest("fieldset")).toHaveAttribute("data-locked", "true");
    expect(within(wall).getAllByRole("radio", { hidden: true })).toHaveLength(4);
    expect(screen.getByText("ล็อกตามดีไซน์ Contemporary")).toBeInTheDocument();
    expect(screen.getByText(/ผนังภายนอกเป็นองค์ประกอบหลักที่กำหนดเอกลักษณ์ของบ้านสไตล์ Contemporary/)).toBeInTheDocument();

    expect(roof.closest("fieldset")).not.toBeDisabled();
    expect(screen.getByRole("radiogroup", { name: "หน้าต่าง" }).closest("fieldset")).not.toBeDisabled();
    expect(screen.getByRole("radiogroup", { name: "ประตูทางเข้า" }).closest("fieldset")).not.toBeDisabled();
  });
});
