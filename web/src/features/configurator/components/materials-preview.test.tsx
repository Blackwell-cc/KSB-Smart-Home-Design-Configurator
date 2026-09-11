import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { createDefaultConfiguration } from "../domain/configuration";
import { MaterialsPreview } from "./materials-preview";

describe("MaterialsPreview", () => {
  test("uses the Minimal roof color label in the selected-material summary", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "minimalist-style";
    configuration.floors = 1;
    configuration.materialSelections.roof = "metal-roof";

    render(<MaterialsPreview configuration={configuration} />);

    const summary = screen.getByRole("region", { name: "สรุปวัสดุที่เลือก" });
    expect(within(summary).getByText("สีซอฟต์เกรจ")).toBeVisible();
    expect(within(summary).queryByText("หลังคาเมทัลชีท")).not.toBeInTheDocument();
  });

  test("shows the Classic exterior wall as locked in the selected-material summary", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "classic-style";
    configuration.floors = 3;
    configuration.materialSelections.wall = "natural-stone";

    render(<MaterialsPreview configuration={configuration} />);

    const summary = screen.getByRole("region", { name: "สรุปวัสดุที่เลือก" });
    expect(within(summary).getByText("ล็อกตามแบบ Classic")).toBeVisible();
    expect(within(summary).queryByText("หินธรรมชาติ")).not.toBeInTheDocument();
  });

  test("shows the Contemporary roof color and locked exterior wall in the selected-material summary", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "vintage-style";
    configuration.floors = 1;
    configuration.materialSelections.roof = "metal-roof";
    configuration.materialSelections.wall = "natural-stone";

    render(<MaterialsPreview configuration={configuration} />);

    const summary = screen.getByRole("region", { name: "สรุปวัสดุที่เลือก" });
    expect(within(summary).getByText("สีซอฟต์เกรจ")).toBeVisible();
    expect(within(summary).getByText("ล็อกตามแบบ Contemporary")).toBeVisible();
    expect(within(summary).queryByText("หินธรรมชาติ")).not.toBeInTheDocument();
  });
});
