import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { createDefaultConfiguration } from "../domain/configuration";
import { MaterialHousePreview } from "./material-house-preview";

describe("MaterialHousePreview", () => {
  test("shows the fixed Nordic base with every reviewed material overlay", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "natural-style";
    configuration.floors = 2;
    configuration.materialSelections = {
      roof: "concrete-tile",
      wall: "smooth-plaster",
      window: "black-aluminium",
      door: "teak",
      flooring: "natural-marble",
    };

    render(<MaterialHousePreview configuration={configuration} sizes="860px" />);

    expect(screen.getByTestId("material-preview-scene")).toHaveAttribute("data-scene", "nordic-2f");
    expect(screen.getByRole("img", { name: /Nordic Style 2/ })).toHaveAttribute(
      "src",
      expect.stringContaining(
        "material-previews%2Fnordic%2F2f%2Fbase.webp%3Fv%3D20260825-window-door-ai-v1",
      ),
    );
    expect(screen.getAllByTestId("material-preview-layer")).toHaveLength(4);
    expect(screen.getAllByTestId("material-preview-layer").map((layer) => layer.dataset.category)).toEqual([
      "wall",
      "roof",
      "window",
      "door",
    ]);
    expect(screen.queryByText(/อยู่ระหว่างจัดเตรียม/)).not.toBeInTheDocument();
  });

  test("retains the previous roof until the selected roof overlay has loaded", async () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "natural-style";
    configuration.floors = 2;
    configuration.materialSelections.roof = "concrete-tile";

    const { rerender } = render(
      <MaterialHousePreview configuration={configuration} sizes="860px" />,
    );
    const concrete = screen.getAllByTestId("material-preview-layer").find(
      (layer) => layer.dataset.category === "roof",
    );
    expect(concrete).toBeDefined();
    expect(concrete).toHaveAttribute("data-option", "concrete-tile");

    configuration.materialSelections.roof = "ceramic-tile";
    rerender(<MaterialHousePreview configuration={configuration} sizes="860px" />);

    await waitFor(() => {
      expect(
        screen
          .getAllByTestId("material-preview-layer")
          .filter((item) => item.dataset.category === "roof")
          .map((item) => item.getAttribute("data-option")),
      ).toEqual(["concrete-tile", "ceramic-tile"]);
    });
    const loadingLayers = screen
      .getAllByTestId("material-preview-layer")
      .filter((item) => item.dataset.category === "roof");
    fireEvent.load(loadingLayers[1]);
    await waitFor(() => {
      expect(screen.getAllByTestId("material-preview-layer")[1]).toHaveAttribute(
        "data-ready",
        "true",
      );
    });
  });

  test.each([
    "classic-style",
    "modern-style",
    "natural-style",
    "loft-style",
    "minimalist-style",
    "luxury-style",
    "vintage-style",
  ] as const)("shows pool and outdoor pavilion overlays on %s", (styleId) => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = styleId;
    configuration.floors = 1;
    configuration.specialFeatures = ["pool", "outdoor-pavilion", "smart-home"];

    render(<MaterialHousePreview configuration={configuration} sizes="860px" />);

    expect(screen.getAllByTestId("special-feature-preview-layer")).toHaveLength(2);
    expect(
      screen.getAllByTestId("special-feature-preview-layer").map((layer) => layer.dataset.feature),
    ).toEqual(["pool", "outdoor-pavilion"]);
  });
});
