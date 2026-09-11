import { describe, expect, test } from "vitest";
import { createDefaultConfiguration } from "../domain/configuration";
import { buildMaterialPreviewScene } from "./material-preview-scene";

describe("buildMaterialPreviewScene", () => {
  test("removes original material categories from the composed preview", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "modern-style";
    configuration.floors = 2;
    configuration.materialSelections = {
      roof: "original",
      wall: "natural-stone",
      window: "original",
      door: "original",
      flooring: "original",
    };

    expect(buildMaterialPreviewScene(configuration).layers).toEqual([
      expect.objectContaining({ category: "wall", optionId: "natural-stone" }),
    ]);
  });

  test("keeps the Nordic base fixed and derives all reviewed material overlays", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "natural-style";
    configuration.floors = 2;
    configuration.materialSelections = {
      roof: "metal-roof",
      wall: "natural-stone",
      window: "black-aluminium",
      door: "teak",
      flooring: "terrazzo",
    };

    const scene = buildMaterialPreviewScene(configuration, new Set(["nordic-2f"]));

    expect(scene.sceneId).toBe("nordic-2f");
    expect(scene.baseSrc).toBe("/material-previews/nordic/2f/base.webp?v=20260825-window-door-ai-v1");
    expect(scene.layers.map(({ category, src }) => ({ category, src }))).toEqual([
      { category: "wall", src: "/material-previews/nordic/2f/wall/natural-stone.webp?v=20260825-window-door-ai-v1" },
      { category: "roof", src: "/material-previews/nordic/2f/roof/metal-roof.webp?v=20260825-window-door-ai-v1" },
      { category: "window", src: "/material-previews/nordic/2f/window/black-aluminium.webp?v=20260825-window-door-ai-v1" },
      { category: "door", src: "/material-previews/nordic/2f/door/metal-frame.webp?v=20260825-window-door-ai-v1" },
    ]);
    expect(scene.available).toBe(true);
  });

  test.each([
    ["teak", "metal-frame"],
    ["engineered-wood", "teak"],
    ["aluminium-glass", "engineered-wood"],
    ["metal-frame", "aluminium-glass"],
  ] as const)("maps the %s door choice to the reviewed %s preview", (selectionId, assetId) => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "natural-style";
    configuration.floors = 2;
    configuration.materialSelections.door = selectionId;

    const scene = buildMaterialPreviewScene(configuration, new Set(["nordic-2f"]));
    const doorLayer = scene.layers.find(({ category }) => category === "door");

    expect(doorLayer).toMatchObject({
      category: "door",
      optionId: selectionId,
      src: `/material-previews/nordic/2f/door/${assetId}.webp?v=20260825-window-door-ai-v1`,
    });
  });

  test("publishes the completed Nordic 2-floor scene by default", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "natural-style";
    configuration.floors = 2;

    expect(buildMaterialPreviewScene(configuration)).toMatchObject({
      sceneId: "nordic-2f",
      baseSrc: "/material-previews/nordic/2f/base.webp?v=20260825-window-door-ai-v1",
      available: true,
    });
  });

  test("publishes the completed Nordic 1-floor scene by default", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "natural-style";
    configuration.floors = 1;
    configuration.materialSelections = {
      roof: "natural-slate",
      wall: "exterior-timber",
      window: "solid-wood",
      door: "metal-frame",
      flooring: "natural-marble",
    };

    expect(buildMaterialPreviewScene(configuration)).toMatchObject({
      sceneId: "nordic-1f",
      baseSrc: "/material-previews/nordic/1f/base.webp?v=20260825-window-door-ai-v1",
      available: true,
      layers: [
        {
          category: "wall",
          optionId: "exterior-timber",
          src: "/material-previews/nordic/1f/wall/exterior-timber.webp?v=20260825-window-door-ai-v1",
        },
        {
          category: "roof",
          optionId: "natural-slate",
          src: "/material-previews/nordic/1f/roof/natural-slate.webp?v=20260825-window-door-ai-v1",
        },
        {
          category: "window",
          optionId: "solid-wood",
          src: "/material-previews/nordic/1f/window/solid-wood.webp?v=20260825-window-door-ai-v1",
        },
        {
          category: "door",
          optionId: "metal-frame",
          src: "/material-previews/nordic/1f/door/aluminium-glass.webp?v=20260825-window-door-ai-v1",
        },
      ],
    });
  });

  test("publishes the completed Nordic 3-floor scene by default", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "natural-style";
    configuration.floors = 3;
    configuration.materialSelections = {
      roof: "ceramic-tile",
      wall: "natural-stone",
      window: "natural-aluminium",
      door: "engineered-wood",
      flooring: "natural-marble",
    };

    expect(buildMaterialPreviewScene(configuration)).toMatchObject({
      sceneId: "nordic-3f",
      baseSrc: "/material-previews/nordic/3f/base.webp?v=20260825-window-door-ai-v1",
      available: true,
      layers: [
        {
          category: "wall",
          optionId: "natural-stone",
          src: "/material-previews/nordic/3f/wall/natural-stone.webp?v=20260825-window-door-ai-v1",
        },
        {
          category: "roof",
          optionId: "ceramic-tile",
          src: "/material-previews/nordic/3f/roof/ceramic-tile.webp?v=20260825-window-door-ai-v1",
        },
        {
          category: "window",
          optionId: "natural-aluminium",
          src: "/material-previews/nordic/3f/window/natural-aluminium.webp?v=20260825-window-door-ai-v1",
        },
        {
          category: "door",
          optionId: "engineered-wood",
          src: "/material-previews/nordic/3f/door/teak.webp?v=20260825-window-door-ai-v1",
        },
      ],
    });
  });

  test("publishes the completed Modern 1-floor scene by default", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "modern-style";
    configuration.floors = 1;
    configuration.materialSelections = {
      roof: "metal-roof",
      wall: "exposed-concrete",
      window: "black-aluminium",
      door: "teak",
      flooring: "natural-marble",
    };

    expect(buildMaterialPreviewScene(configuration)).toMatchObject({
      sceneId: "modern-1f",
      baseSrc: "/material-previews/modern/1f/base.webp?v=20260825-window-door-ai-v1",
      available: true,
      layers: [
        {
          category: "wall",
          optionId: "exposed-concrete",
          src: "/material-previews/modern/1f/wall/exposed-concrete.webp?v=20260825-window-door-ai-v1",
        },
        {
          category: "roof",
          optionId: "metal-roof",
          src: "/material-previews/modern/1f/roof/metal-roof.webp?v=20260825-window-door-ai-v1",
        },
        {
          category: "window",
          optionId: "black-aluminium",
          src: "/material-previews/modern/1f/window/black-aluminium.webp?v=20260825-window-door-ai-v1",
        },
        {
          category: "door",
          optionId: "teak",
          src: "/material-previews/modern/1f/door/metal-frame.webp?v=20260825-window-door-ai-v1",
        },
      ],
    });
  });

  test("publishes Classic 1-floor with its fixed wall and editable roof, window, and door layers", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "classic-style";
    configuration.floors = 1;
    configuration.materialSelections = {
      roof: "ceramic-tile",
      wall: "exterior-timber",
      window: "solid-wood",
      door: "engineered-wood",
      flooring: "natural-marble",
    };

    expect(buildMaterialPreviewScene(configuration)).toMatchObject({
      sceneId: "classic-1f",
      baseSrc: "/material-previews/classic/1f/base.webp?v=20260828-classic-1f-ai-v2",
      available: true,
      layers: [
        {
          category: "roof",
          optionId: "ceramic-tile",
          src: "/material-previews/classic/1f/roof/ceramic-tile.webp?v=20260828-classic-1f-ai-v2",
        },
        {
          category: "window",
          optionId: "solid-wood",
          src: "/material-previews/classic/1f/window/solid-wood.webp?v=20260828-classic-1f-ai-v2",
        },
        {
          category: "door",
          optionId: "engineered-wood",
          src: "/material-previews/classic/1f/door/teak.webp?v=20260828-classic-1f-ai-v2",
        },
      ],
    });
  });

  test("publishes Classic 3-floor with its fixed wall and editable roof, window, and door layers", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "classic-style";
    configuration.floors = 3;
    configuration.materialSelections = {
      roof: "natural-slate",
      wall: "natural-stone",
      window: "upvc",
      door: "metal-frame",
      flooring: "natural-marble",
    };

    expect(buildMaterialPreviewScene(configuration)).toMatchObject({
      sceneId: "classic-3f",
      baseSrc: "/material-previews/classic/3f/base.webp?v=20260909-classic-3f-ai-v1",
      available: true,
      layers: [
        {
          category: "roof",
          optionId: "natural-slate",
          src: "/material-previews/classic/3f/roof/natural-slate.webp?v=20260909-classic-3f-ai-v1",
        },
        {
          category: "window",
          optionId: "upvc",
          src: "/material-previews/classic/3f/window/upvc.webp?v=20260909-classic-3f-ai-v1",
        },
        {
          category: "door",
          optionId: "metal-frame",
          src: "/material-previews/classic/3f/door/aluminium-glass.webp?v=20260909-classic-3f-ai-v1",
        },
      ],
    });
  });

  test("publishes Classic 2-floor with its fixed wall and editable roof, window, and door layers", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "classic-style";
    configuration.floors = 2;
    configuration.materialSelections = {
      ...configuration.materialSelections,
      roof: "ceramic-tile",
      window: "solid-wood",
      door: "engineered-wood",
    };

    expect(buildMaterialPreviewScene(configuration)).toMatchObject({
      sceneId: "classic-2f",
      baseSrc: "/material-previews/classic/2f/base.webp?v=20260911-classic-2f-ai-v1",
      available: true,
      layers: [
        { category: "roof", optionId: "ceramic-tile", src: "/material-previews/classic/2f/roof/ceramic-tile.webp?v=20260911-classic-2f-ai-v1" },
        { category: "window", optionId: "solid-wood", src: "/material-previews/classic/2f/window/solid-wood.webp?v=20260911-classic-2f-ai-v1" },
        { category: "door", optionId: "engineered-wood", src: "/material-previews/classic/2f/door/teak.webp?v=20260911-classic-2f-ai-v1" },
      ],
    });
  });

  test.each([
    "classic-style", "modern-style", "natural-style", "loft-style",
    "minimalist-style", "luxury-style", "vintage-style",
  ])("publishes material previews for every floor of %s", (styleId) => {
    for (const floors of [1, 2, 3]) {
      const configuration = createDefaultConfiguration();
      configuration.styleId = styleId;
      configuration.floors = floors;
      configuration.materialSelections = {
        roof: "concrete-tile",
        wall: "smooth-plaster",
        window: "black-aluminium",
        door: "teak",
        flooring: "natural-marble",
      };
      const scene = buildMaterialPreviewScene(configuration);
      expect(scene.available, `${scene.sceneId} must be published`).toBe(true);
      expect(scene.layers.length, `${scene.sceneId} must contain editable layers`).toBeGreaterThan(0);
    }
  });

  test("publishes the completed Modern 2-floor scene by default", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "modern-style";
    configuration.floors = 2;
    configuration.materialSelections = {
      roof: "natural-slate",
      wall: "exterior-timber",
      window: "upvc",
      door: "metal-frame",
      flooring: "natural-marble",
    };

    expect(buildMaterialPreviewScene(configuration)).toMatchObject({
      sceneId: "modern-2f",
      baseSrc: "/material-previews/modern/2f/base.webp?v=20260825-window-door-ai-v1",
      available: true,
      layers: [
        {
          category: "wall",
          optionId: "exterior-timber",
          src: "/material-previews/modern/2f/wall/exterior-timber.webp?v=20260825-window-door-ai-v1",
        },
        {
          category: "roof",
          optionId: "natural-slate",
          src: "/material-previews/modern/2f/roof/natural-slate.webp?v=20260825-window-door-ai-v1",
        },
        {
          category: "window",
          optionId: "upvc",
          src: "/material-previews/modern/2f/window/upvc.webp?v=20260825-window-door-ai-v1",
        },
        {
          category: "door",
          optionId: "metal-frame",
          src: "/material-previews/modern/2f/door/aluminium-glass.webp?v=20260825-window-door-ai-v1",
        },
      ],
    });
  });

  test("publishes the completed Modern 3-floor scene by default", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "modern-style";
    configuration.floors = 3;
    configuration.materialSelections = {
      roof: "ceramic-tile",
      wall: "natural-stone",
      window: "solid-wood",
      door: "engineered-wood",
      flooring: "natural-marble",
    };

    expect(buildMaterialPreviewScene(configuration)).toMatchObject({
      sceneId: "modern-3f",
      baseSrc: "/material-previews/modern/3f/base.webp?v=20260825-window-door-ai-v1",
      available: true,
      layers: [
        {
          category: "wall",
          optionId: "natural-stone",
          src: "/material-previews/modern/3f/wall/natural-stone.webp?v=20260825-window-door-ai-v1",
        },
        {
          category: "roof",
          optionId: "ceramic-tile",
          src: "/material-previews/modern/3f/roof/ceramic-tile.webp?v=20260825-window-door-ai-v1",
        },
        {
          category: "window",
          optionId: "solid-wood",
          src: "/material-previews/modern/3f/window/solid-wood.webp?v=20260825-window-door-ai-v1",
        },
        {
          category: "door",
          optionId: "engineered-wood",
          src: "/material-previews/modern/3f/door/teak.webp?v=20260825-window-door-ai-v1",
        },
      ],
    });
  });

  test("publishes Loft 1-floor with only the editable window and door layers", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "loft-style";
    configuration.floors = 1;
    configuration.materialSelections = {
      roof: "ceramic-tile",
      wall: "natural-stone",
      window: "solid-wood",
      door: "engineered-wood",
      flooring: "natural-marble",
    };

    expect(buildMaterialPreviewScene(configuration)).toMatchObject({
      sceneId: "loft-1f",
      baseSrc: "/material-previews/loft/1f/base.webp?v=20260827-loft-1f-base-v2",
      available: true,
      layers: [
        {
          category: "window",
          optionId: "solid-wood",
          src: "/material-previews/loft/1f/window/solid-wood.webp?v=20260827-loft-1f-base-v2",
        },
        {
          category: "door",
          optionId: "engineered-wood",
          src: "/material-previews/loft/1f/door/teak.webp?v=20260827-loft-1f-base-v2",
        },
      ],
    });
  });

  test("publishes Loft 2-floor with only the editable window and door layers", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "loft-style";
    configuration.floors = 2;
    configuration.materialSelections = {
      roof: "ceramic-tile",
      wall: "natural-stone",
      window: "natural-aluminium",
      door: "metal-frame",
      flooring: "natural-marble",
    };

    expect(buildMaterialPreviewScene(configuration)).toMatchObject({
      sceneId: "loft-2f",
      baseSrc: "/material-previews/loft/2f/base.webp?v=20260827-loft-2f-ai-v1",
      available: true,
      layers: [
        {
          category: "window",
          optionId: "natural-aluminium",
          src: "/material-previews/loft/2f/window/natural-aluminium.webp?v=20260827-loft-2f-ai-v1",
        },
        {
          category: "door",
          optionId: "metal-frame",
          src: "/material-previews/loft/2f/door/aluminium-glass.webp?v=20260827-loft-2f-ai-v1",
        },
      ],
    });
  });

  test("publishes Loft 3-floor with only the editable window and door layers", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "loft-style";
    configuration.floors = 3;
    configuration.materialSelections = {
      roof: "natural-slate",
      wall: "exposed-concrete",
      window: "upvc",
      door: "aluminium-glass",
      flooring: "natural-marble",
    };

    expect(buildMaterialPreviewScene(configuration)).toMatchObject({
      sceneId: "loft-3f",
      baseSrc: "/material-previews/loft/3f/base.webp?v=20260827-loft-3f-ai-v1",
      available: true,
      layers: [
        {
          category: "window",
          optionId: "upvc",
          src: "/material-previews/loft/3f/window/upvc.webp?v=20260827-loft-3f-ai-v1",
        },
        {
          category: "door",
          optionId: "aluminium-glass",
          src: "/material-previews/loft/3f/door/engineered-wood.webp?v=20260827-loft-3f-ai-v1",
        },
      ],
    });
  });

  test("publishes the Minimal 1-floor scene with all four reviewed material layers", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "minimalist-style";
    configuration.floors = 1;
    configuration.materialSelections = {
      roof: "metal-roof",
      wall: "natural-stone",
      window: "solid-wood",
      door: "metal-frame",
      flooring: "natural-marble",
    };

    expect(buildMaterialPreviewScene(configuration)).toMatchObject({
      sceneId: "minimal-1f",
      baseSrc: "/material-previews/minimal/1f/base.webp?v=20260827-minimal-1f-ai-v1",
      available: true,
      layers: [
        {
          category: "wall",
          optionId: "natural-stone",
          src: "/material-previews/minimal/1f/wall/natural-stone.webp?v=20260827-minimal-1f-ai-v1",
        },
        {
          category: "roof",
          optionId: "metal-roof",
          src: "/material-previews/minimal/1f/roof/metal-roof.webp?v=20260827-minimal-1f-ai-v1",
        },
        {
          category: "window",
          optionId: "solid-wood",
          src: "/material-previews/minimal/1f/window/solid-wood.webp?v=20260827-minimal-1f-ai-v1",
        },
        {
          category: "door",
          optionId: "metal-frame",
          src: "/material-previews/minimal/1f/door/aluminium-glass.webp?v=20260827-minimal-1f-ai-v1",
        },
      ],
    });
  });

  test.each([
    { floors: 2, sceneId: "minimal-2f", version: "20260828-minimal-2f-ai-v1" },
    { floors: 3, sceneId: "minimal-3f", version: "20260828-minimal-3f-ai-v1" },
  ] as const)("publishes the Minimal $floors-floor scene with all four reviewed material layers", ({ floors, sceneId, version }) => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "minimalist-style";
    configuration.floors = floors;
    configuration.materialSelections = {
      roof: "ceramic-tile",
      wall: "exterior-timber",
      window: "natural-aluminium",
      door: "engineered-wood",
      flooring: "natural-marble",
    };

    expect(buildMaterialPreviewScene(configuration)).toMatchObject({
      sceneId,
      baseSrc: `/material-previews/minimal/${floors}f/base.webp?v=${version}`,
      available: true,
      layers: [
        {
          category: "wall",
          optionId: "exterior-timber",
          src: `/material-previews/minimal/${floors}f/wall/exterior-timber.webp?v=${version}`,
        },
        {
          category: "roof",
          optionId: "ceramic-tile",
          src: `/material-previews/minimal/${floors}f/roof/ceramic-tile.webp?v=${version}`,
        },
        {
          category: "window",
          optionId: "natural-aluminium",
          src: `/material-previews/minimal/${floors}f/window/natural-aluminium.webp?v=${version}`,
        },
        {
          category: "door",
          optionId: "engineered-wood",
          src: `/material-previews/minimal/${floors}f/door/teak.webp?v=${version}`,
        },
      ],
    });
  });

  test("publishes Contemporary 1-floor with its fixed wall and editable roof, window, and door layers", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "vintage-style";
    configuration.floors = 1;
    configuration.materialSelections = {
      roof: "natural-slate",
      wall: "natural-stone",
      window: "upvc",
      door: "metal-frame",
      flooring: "natural-marble",
    };

    expect(buildMaterialPreviewScene(configuration)).toMatchObject({
      sceneId: "contemporary-1f",
      baseSrc: "/material-previews/contemporary/1f/base.webp?v=20260910-contemporary-base-v3",
      available: true,
      layers: [
        {
          category: "roof",
          optionId: "natural-slate",
          src: "/material-previews/contemporary/1f/roof/natural-slate.webp?v=20260910-contemporary-base-v3",
        },
        {
          category: "window",
          optionId: "upvc",
          src: "/material-previews/contemporary/1f/window/upvc.webp?v=20260910-contemporary-base-v3",
        },
        {
          category: "door",
          optionId: "metal-frame",
          src: "/material-previews/contemporary/1f/door/aluminium-glass.webp?v=20260910-contemporary-base-v3",
        },
      ],
    });
  });

  test("publishes Contemporary 2-floor with its fixed wall and editable roof, window, and door layers", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "vintage-style";
    configuration.floors = 2;
    configuration.materialSelections = {
      roof: "natural-slate",
      wall: "natural-stone",
      window: "upvc",
      door: "metal-frame",
      flooring: "natural-marble",
    };

    expect(buildMaterialPreviewScene(configuration)).toMatchObject({
      sceneId: "contemporary-2f",
      baseSrc: "/material-previews/contemporary/2f/base.webp?v=20260910-contemporary-base-v3",
      available: true,
      layers: [
        {
          category: "roof",
          optionId: "natural-slate",
          src: "/material-previews/contemporary/2f/roof/natural-slate.webp?v=20260910-contemporary-base-v3",
        },
        {
          category: "window",
          optionId: "upvc",
          src: "/material-previews/contemporary/2f/window/upvc.webp?v=20260910-contemporary-base-v3",
        },
        {
          category: "door",
          optionId: "metal-frame",
          src: "/material-previews/contemporary/2f/door/aluminium-glass.webp?v=20260910-contemporary-base-v3",
        },
      ],
    });
  });

  test("publishes Contemporary 3-floor with its fixed wall and editable roof, window, and door layers", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "vintage-style";
    configuration.floors = 3;
    configuration.materialSelections = {
      roof: "natural-slate",
      wall: "natural-stone",
      window: "upvc",
      door: "metal-frame",
      flooring: "natural-marble",
    };

    expect(buildMaterialPreviewScene(configuration)).toMatchObject({
      sceneId: "contemporary-3f",
      baseSrc: "/material-previews/contemporary/3f/base.webp?v=20260910-contemporary-base-v3",
      available: true,
      layers: [
        { category: "roof", optionId: "natural-slate", src: "/material-previews/contemporary/3f/roof/natural-slate.webp?v=20260910-contemporary-base-v3" },
        { category: "window", optionId: "upvc", src: "/material-previews/contemporary/3f/window/upvc.webp?v=20260910-contemporary-base-v3" },
        { category: "door", optionId: "metal-frame", src: "/material-previews/contemporary/3f/door/aluminium-glass.webp?v=20260910-contemporary-base-v3" },
      ],
    });
  });

  test("uses the selected style and floor base image when production layers are unavailable", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "classic-style";
    configuration.floors = 2;
    configuration.specialFeatures = ["pool", "outdoor-pavilion", "smart-home"];

    expect(buildMaterialPreviewScene(configuration, new Set())).toMatchObject({
      sceneId: "classic-2f",
      baseSrc: "/concepts/base-classic-2f-master.webp",
      available: false,
      layers: [],
      featureLayers: [
        {
          featureId: "pool",
          src: "/material-previews/shared/special-features/pool.png?v=20260825-special-features-v4",
        },
        {
          featureId: "outdoor-pavilion",
          src: "/material-previews/shared/special-features/outdoor-pavilion.png?v=20260825-special-features-v4",
        },
      ],
    });
  });

  test("publishes Tropical 1-floor with editable wall, roof, window, and door layers", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "luxury-style";
    configuration.floors = 1;
    configuration.materialSelections = {
      ...configuration.materialSelections,
      roof: "ceramic-tile",
      wall: "exterior-timber",
      window: "solid-wood",
      door: "metal-frame",
    };

    expect(buildMaterialPreviewScene(configuration)).toMatchObject({
      sceneId: "tropical-1f",
      baseSrc: "/material-previews/tropical/1f/base.webp?v=20260910-tropical-1f-ai-v1",
      available: true,
      layers: [
        { category: "wall", optionId: "exterior-timber", src: "/material-previews/tropical/1f/wall/exterior-timber.webp?v=20260910-tropical-1f-ai-v1" },
        { category: "roof", optionId: "ceramic-tile", src: "/material-previews/tropical/1f/roof/ceramic-tile.webp?v=20260910-tropical-1f-ai-v1" },
        { category: "window", optionId: "solid-wood", src: "/material-previews/tropical/1f/window/solid-wood.webp?v=20260910-tropical-1f-ai-v1" },
        { category: "door", optionId: "metal-frame", src: "/material-previews/tropical/1f/door/aluminium-glass.webp?v=20260910-tropical-1f-ai-v1" },
      ],
    });
  });

  test("publishes Tropical 2-floor with editable wall, roof, window, and door layers", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "luxury-style";
    configuration.floors = 2;
    configuration.materialSelections = {
      ...configuration.materialSelections,
      roof: "natural-slate",
      wall: "natural-stone",
      window: "upvc",
      door: "engineered-wood",
    };

    expect(buildMaterialPreviewScene(configuration)).toMatchObject({
      sceneId: "tropical-2f",
      baseSrc: "/material-previews/tropical/2f/base.webp?v=20260910-tropical-2f-ai-v1",
      available: true,
      layers: [
        { category: "wall", optionId: "natural-stone", src: "/material-previews/tropical/2f/wall/natural-stone.webp?v=20260910-tropical-2f-ai-v1" },
        { category: "roof", optionId: "natural-slate", src: "/material-previews/tropical/2f/roof/natural-slate.webp?v=20260910-tropical-2f-ai-v1" },
        { category: "window", optionId: "upvc", src: "/material-previews/tropical/2f/window/upvc.webp?v=20260910-tropical-2f-ai-v1" },
        { category: "door", optionId: "engineered-wood", src: "/material-previews/tropical/2f/door/teak.webp?v=20260910-tropical-2f-ai-v1" },
      ],
    });
  });

  test("publishes Tropical 3-floor with editable wall, roof, window, and door layers", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "luxury-style";
    configuration.floors = 3;
    configuration.materialSelections = {
      ...configuration.materialSelections,
      roof: "metal-roof",
      wall: "exposed-concrete",
      window: "natural-aluminium",
      door: "aluminium-glass",
    };

    expect(buildMaterialPreviewScene(configuration)).toMatchObject({
      sceneId: "tropical-3f",
      baseSrc: "/material-previews/tropical/3f/base.webp?v=20260911-tropical-3f-ai-v1",
      available: true,
      layers: [
        { category: "wall", optionId: "exposed-concrete", src: "/material-previews/tropical/3f/wall/exposed-concrete.webp?v=20260911-tropical-3f-ai-v1" },
        { category: "roof", optionId: "metal-roof", src: "/material-previews/tropical/3f/roof/metal-roof.webp?v=20260911-tropical-3f-ai-v1" },
        { category: "window", optionId: "natural-aluminium", src: "/material-previews/tropical/3f/window/natural-aluminium.webp?v=20260911-tropical-3f-ai-v1" },
        { category: "door", optionId: "aluminium-glass", src: "/material-previews/tropical/3f/door/engineered-wood.webp?v=20260911-tropical-3f-ai-v1" },
      ],
    });
  });

  test("does not create visual layers for non-visual special features", () => {
    const configuration = createDefaultConfiguration();
    configuration.styleId = "modern-style";
    configuration.specialFeatures = ["smart-home", "solar"];

    expect(buildMaterialPreviewScene(configuration).featureLayers).toEqual([]);
  });

  test("falls back safely when a saved draft has no selected style", () => {
    const configuration = createDefaultConfiguration();

    const scene = buildMaterialPreviewScene(configuration, new Set());

    expect(scene.available).toBe(false);
    expect(scene.layers).toEqual([]);
    expect(scene.baseSrc).toBeTruthy();
  });
});
