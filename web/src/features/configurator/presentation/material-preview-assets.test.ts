import { access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, test } from "vitest";
import { MATERIAL_CATALOG } from "../domain/material-catalog";

describe("Classic 2-floor material preview assets", () => {
  test.each([
    { categoryId: "roof", generatedSceneDirectory: "generated-roof-scenes" },
    { categoryId: "window", generatedSceneDirectory: "generated-window-scenes" },
    { categoryId: "door", generatedSceneDirectory: "generated-door-scenes" },
  ] as const)("provides the reviewed $categoryId mask and four pixel-locked overlays", async ({ categoryId, generatedSceneDirectory }) => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "classic", "2f");
    const expectedSize = [1672, 941];
    const category = MATERIAL_CATALOG.find(({ id }) => id === categoryId);
    expect(category).toBeDefined();
    const mask = path.join(sourceRoot, "masks", `${categoryId}.png`);
    await expect(access(mask), mask).resolves.toBeUndefined();
    const maskMetadata = await sharp(mask).metadata();
    expect([maskMetadata.width, maskMetadata.height], mask).toEqual(expectedSize);
    const maskPixels = await sharp(mask).greyscale().raw().toBuffer();
    for (const option of category?.options ?? []) {
      const generatedScene = path.join(sourceRoot, generatedSceneDirectory, `${option.id}.png`);
      await expect(access(generatedScene), generatedScene).resolves.toBeUndefined();
      const generatedMetadata = await sharp(generatedScene).metadata();
      expect([generatedMetadata.width, generatedMetadata.height], generatedScene).toEqual(expectedSize);
      const overlay = path.join(sourceRoot, "overlays", categoryId, `${option.id}.png`);
      await expect(access(overlay), overlay).resolves.toBeUndefined();
      const { data: overlayPixels, info } = await sharp(overlay).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const overlayAlpha = Buffer.alloc(expectedSize[0] * expectedSize[1]);
      for (let pixel = 0; pixel < overlayAlpha.length; pixel += 1) overlayAlpha[pixel] = overlayPixels[pixel * info.channels + 3];
      expect(overlayAlpha.equals(maskPixels), `${option.id} must use the exact reviewed mask`).toBe(true);
    }
  });
});

describe("Tropical 1-floor material preview assets", () => {
  test.each([
    { categoryId: "roof", generatedSceneDirectory: "generated-roof-scenes" },
    { categoryId: "wall", generatedSceneDirectory: "generated-wall-scenes" },
    { categoryId: "window", generatedSceneDirectory: "generated-window-scenes" },
    { categoryId: "door", generatedSceneDirectory: "generated-door-scenes" },
  ] as const)("provides the reviewed $categoryId mask and four pixel-locked overlays", async ({
    categoryId,
    generatedSceneDirectory,
  }) => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "tropical", "1f");
    const expectedSize = [1672, 941];
    const category = MATERIAL_CATALOG.find(({ id }) => id === categoryId);
    expect(category).toBeDefined();

    const mask = path.join(sourceRoot, "masks", `${categoryId}.png`);
    await expect(access(mask), mask).resolves.toBeUndefined();
    const maskMetadata = await sharp(mask).metadata();
    expect([maskMetadata.width, maskMetadata.height], mask).toEqual(expectedSize);
    const maskPixels = await sharp(mask).greyscale().raw().toBuffer();

    for (const option of category?.options ?? []) {
      const generatedScene = path.join(sourceRoot, generatedSceneDirectory, `${option.id}.png`);
      await expect(access(generatedScene), generatedScene).resolves.toBeUndefined();
      const generatedMetadata = await sharp(generatedScene).metadata();
      expect([generatedMetadata.width, generatedMetadata.height], generatedScene).toEqual(expectedSize);

      const overlay = path.join(sourceRoot, "overlays", categoryId, `${option.id}.png`);
      await expect(access(overlay), overlay).resolves.toBeUndefined();
      const overlayMetadata = await sharp(overlay).metadata();
      expect([overlayMetadata.width, overlayMetadata.height], overlay).toEqual(expectedSize);
      expect(overlayMetadata.hasAlpha, overlay).toBe(true);

      const { data: overlayPixels, info } = await sharp(overlay)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const overlayAlpha = Buffer.alloc(expectedSize[0] * expectedSize[1]);
      for (let pixel = 0; pixel < overlayAlpha.length; pixel += 1) {
        overlayAlpha[pixel] = overlayPixels[pixel * info.channels + 3];
      }
      expect(overlayAlpha.equals(maskPixels), `${option.id} must use the exact reviewed mask`).toBe(true);
    }
  });
});

describe("Tropical 2-floor material preview assets", () => {
  test.each([
    { categoryId: "roof", generatedSceneDirectory: "generated-roof-scenes" },
    { categoryId: "wall", generatedSceneDirectory: "generated-wall-scenes" },
    { categoryId: "window", generatedSceneDirectory: "generated-window-scenes" },
    { categoryId: "door", generatedSceneDirectory: "generated-door-scenes" },
  ] as const)("provides the reviewed $categoryId mask and four pixel-locked overlays", async ({
    categoryId,
    generatedSceneDirectory,
  }) => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "tropical", "2f");
    const expectedSize = [1672, 941];
    const category = MATERIAL_CATALOG.find(({ id }) => id === categoryId);
    expect(category).toBeDefined();

    const mask = path.join(sourceRoot, "masks", `${categoryId}.png`);
    await expect(access(mask), mask).resolves.toBeUndefined();
    const maskMetadata = await sharp(mask).metadata();
    expect([maskMetadata.width, maskMetadata.height], mask).toEqual(expectedSize);
    const maskPixels = await sharp(mask).greyscale().raw().toBuffer();

    for (const option of category?.options ?? []) {
      const generatedScene = path.join(sourceRoot, generatedSceneDirectory, `${option.id}.png`);
      await expect(access(generatedScene), generatedScene).resolves.toBeUndefined();
      const generatedMetadata = await sharp(generatedScene).metadata();
      expect([generatedMetadata.width, generatedMetadata.height], generatedScene).toEqual(expectedSize);

      const overlay = path.join(sourceRoot, "overlays", categoryId, `${option.id}.png`);
      await expect(access(overlay), overlay).resolves.toBeUndefined();
      const overlayMetadata = await sharp(overlay).metadata();
      expect([overlayMetadata.width, overlayMetadata.height], overlay).toEqual(expectedSize);
      expect(overlayMetadata.hasAlpha, overlay).toBe(true);

      const { data: overlayPixels, info } = await sharp(overlay)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const overlayAlpha = Buffer.alloc(expectedSize[0] * expectedSize[1]);
      for (let pixel = 0; pixel < overlayAlpha.length; pixel += 1) {
        overlayAlpha[pixel] = overlayPixels[pixel * info.channels + 3];
      }
      expect(overlayAlpha.equals(maskPixels), `${option.id} must use the exact reviewed mask`).toBe(true);
    }
  });
});

describe("Tropical 3-floor material preview assets", () => {
  test.each([
    { categoryId: "roof", generatedSceneDirectory: "generated-roof-scenes" },
    { categoryId: "wall", generatedSceneDirectory: "generated-wall-scenes" },
    { categoryId: "window", generatedSceneDirectory: "generated-window-scenes" },
    { categoryId: "door", generatedSceneDirectory: "generated-door-scenes" },
  ] as const)("provides the reviewed $categoryId mask and four pixel-locked overlays", async ({
    categoryId,
    generatedSceneDirectory,
  }) => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "tropical", "3f");
    const expectedSize = [1672, 941];
    const category = MATERIAL_CATALOG.find(({ id }) => id === categoryId);
    expect(category).toBeDefined();

    const mask = path.join(sourceRoot, "masks", `${categoryId}.png`);
    await expect(access(mask), mask).resolves.toBeUndefined();
    const maskMetadata = await sharp(mask).metadata();
    expect([maskMetadata.width, maskMetadata.height], mask).toEqual(expectedSize);
    const maskPixels = await sharp(mask).greyscale().raw().toBuffer();

    for (const option of category?.options ?? []) {
      const generatedScene = path.join(sourceRoot, generatedSceneDirectory, `${option.id}.png`);
      await expect(access(generatedScene), generatedScene).resolves.toBeUndefined();
      const generatedMetadata = await sharp(generatedScene).metadata();
      expect([generatedMetadata.width, generatedMetadata.height], generatedScene).toEqual(expectedSize);

      const overlay = path.join(sourceRoot, "overlays", categoryId, `${option.id}.png`);
      await expect(access(overlay), overlay).resolves.toBeUndefined();
      const overlayMetadata = await sharp(overlay).metadata();
      expect([overlayMetadata.width, overlayMetadata.height], overlay).toEqual(expectedSize);
      expect(overlayMetadata.hasAlpha, overlay).toBe(true);

      const { data: overlayPixels, info } = await sharp(overlay).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const overlayAlpha = Buffer.alloc(expectedSize[0] * expectedSize[1]);
      for (let pixel = 0; pixel < overlayAlpha.length; pixel += 1) overlayAlpha[pixel] = overlayPixels[pixel * info.channels + 3];
      expect(overlayAlpha.equals(maskPixels), `${option.id} must use the exact reviewed mask`).toBe(true);
    }
  });
});

describe("Nordic 2-floor material preview assets", () => {
  test.each([
    { categoryId: "roof", generatedSceneDirectory: "generated-roof-scenes" },
    { categoryId: "wall", generatedSceneDirectory: "generated-wall-scenes" },
    { categoryId: "window", generatedSceneDirectory: "generated-window-scenes" },
    { categoryId: "door", generatedSceneDirectory: "generated-door-scenes" },
  ] as const)("provides the reviewed $categoryId mask and four pixel-locked overlays", async ({
    categoryId,
    generatedSceneDirectory,
  }) => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "nordic", "2f");
    const expectedSize = [1672, 941];
    const category = MATERIAL_CATALOG.find(({ id }) => id === categoryId);
    expect(category).toBeDefined();

    const mask = path.join(sourceRoot, "masks", `${categoryId}.png`);
    await expect(access(mask), mask).resolves.toBeUndefined();
    const maskMetadata = await sharp(mask).metadata();
    expect([maskMetadata.width, maskMetadata.height], mask).toEqual(expectedSize);
    const maskPixels = await sharp(mask).greyscale().raw().toBuffer();

    for (const option of category?.options ?? []) {
      const generatedScene = path.join(sourceRoot, generatedSceneDirectory, `${option.id}.png`);
      await expect(access(generatedScene), generatedScene).resolves.toBeUndefined();
      const generatedMetadata = await sharp(generatedScene).metadata();
      expect([generatedMetadata.width, generatedMetadata.height], generatedScene).toEqual(expectedSize);

      const overlay = path.join(sourceRoot, "overlays", categoryId, `${option.id}.png`);
      await expect(access(overlay), overlay).resolves.toBeUndefined();
      const overlayMetadata = await sharp(overlay).metadata();
      expect([overlayMetadata.width, overlayMetadata.height], overlay).toEqual(expectedSize);
      expect(overlayMetadata.hasAlpha, overlay).toBe(true);

      const { data: overlayPixels, info } = await sharp(overlay)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const overlayAlpha = Buffer.alloc(expectedSize[0] * expectedSize[1]);
      for (let pixel = 0; pixel < overlayAlpha.length; pixel += 1) {
        overlayAlpha[pixel] = overlayPixels[pixel * info.channels + 3];
      }
      expect(overlayAlpha.equals(maskPixels), `${option.id} must use the exact reviewed mask`).toBe(true);
    }
  });
});

describe("Nordic 1-floor material preview assets", () => {
  test.each([
    { categoryId: "roof", generatedSceneDirectory: "generated-roof-scenes" },
    { categoryId: "wall", generatedSceneDirectory: "generated-wall-scenes" },
    { categoryId: "window", generatedSceneDirectory: "generated-window-scenes" },
    { categoryId: "door", generatedSceneDirectory: "generated-door-scenes" },
  ] as const)("provides the reviewed $categoryId mask and four pixel-locked overlays", async ({
    categoryId,
    generatedSceneDirectory,
  }) => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "nordic", "1f");
    const expectedSize = [1672, 941];
    const category = MATERIAL_CATALOG.find(({ id }) => id === categoryId);
    expect(category).toBeDefined();

    const mask = path.join(sourceRoot, "masks", `${categoryId}.png`);
    await expect(access(mask), mask).resolves.toBeUndefined();
    const maskMetadata = await sharp(mask).metadata();
    expect([maskMetadata.width, maskMetadata.height], mask).toEqual(expectedSize);
    const maskPixels = await sharp(mask).greyscale().raw().toBuffer();

    for (const option of category?.options ?? []) {
      const generatedScene = path.join(sourceRoot, generatedSceneDirectory, `${option.id}.png`);
      await expect(access(generatedScene), generatedScene).resolves.toBeUndefined();
      const generatedMetadata = await sharp(generatedScene).metadata();
      expect([generatedMetadata.width, generatedMetadata.height], generatedScene).toEqual(expectedSize);

      const overlay = path.join(sourceRoot, "overlays", categoryId, `${option.id}.png`);
      await expect(access(overlay), overlay).resolves.toBeUndefined();
      const overlayMetadata = await sharp(overlay).metadata();
      expect([overlayMetadata.width, overlayMetadata.height], overlay).toEqual(expectedSize);
      expect(overlayMetadata.hasAlpha, overlay).toBe(true);

      const { data: overlayPixels, info } = await sharp(overlay)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const overlayAlpha = Buffer.alloc(expectedSize[0] * expectedSize[1]);
      for (let pixel = 0; pixel < overlayAlpha.length; pixel += 1) {
        overlayAlpha[pixel] = overlayPixels[pixel * info.channels + 3];
      }
      expect(overlayAlpha.equals(maskPixels), `${option.id} must use the exact reviewed mask`).toBe(true);
    }
  });
});

describe("Nordic 3-floor material preview assets", () => {
  test.each([
    { categoryId: "roof", generatedSceneDirectory: "generated-roof-scenes" },
    { categoryId: "wall", generatedSceneDirectory: "generated-wall-scenes" },
    { categoryId: "window", generatedSceneDirectory: "generated-window-scenes" },
    { categoryId: "door", generatedSceneDirectory: "generated-door-scenes" },
  ] as const)("provides the reviewed $categoryId mask and four pixel-locked overlays", async ({
    categoryId,
    generatedSceneDirectory,
  }) => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "nordic", "3f");
    const expectedSize = [1672, 941];
    const category = MATERIAL_CATALOG.find(({ id }) => id === categoryId);
    expect(category).toBeDefined();

    const mask = path.join(sourceRoot, "masks", `${categoryId}.png`);
    await expect(access(mask), mask).resolves.toBeUndefined();
    const maskMetadata = await sharp(mask).metadata();
    expect([maskMetadata.width, maskMetadata.height], mask).toEqual(expectedSize);
    const maskPixels = await sharp(mask).greyscale().raw().toBuffer();

    for (const option of category?.options ?? []) {
      const generatedScene = path.join(sourceRoot, generatedSceneDirectory, `${option.id}.png`);
      await expect(access(generatedScene), generatedScene).resolves.toBeUndefined();
      const generatedMetadata = await sharp(generatedScene).metadata();
      expect([generatedMetadata.width, generatedMetadata.height], generatedScene).toEqual(expectedSize);

      const overlay = path.join(sourceRoot, "overlays", categoryId, `${option.id}.png`);
      await expect(access(overlay), overlay).resolves.toBeUndefined();
      const overlayMetadata = await sharp(overlay).metadata();
      expect([overlayMetadata.width, overlayMetadata.height], overlay).toEqual(expectedSize);
      expect(overlayMetadata.hasAlpha, overlay).toBe(true);

      const { data: overlayPixels, info } = await sharp(overlay)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const overlayAlpha = Buffer.alloc(expectedSize[0] * expectedSize[1]);
      for (let pixel = 0; pixel < overlayAlpha.length; pixel += 1) {
        overlayAlpha[pixel] = overlayPixels[pixel * info.channels + 3];
      }
      expect(overlayAlpha.equals(maskPixels), `${option.id} must use the exact reviewed mask`).toBe(true);
    }
  });
});

describe("Modern 1-floor material preview assets", () => {
  test.each([
    { categoryId: "roof", generatedSceneDirectory: "generated-roof-scenes" },
    { categoryId: "wall", generatedSceneDirectory: "generated-wall-scenes" },
    { categoryId: "window", generatedSceneDirectory: "generated-window-scenes" },
    { categoryId: "door", generatedSceneDirectory: "generated-door-scenes" },
  ] as const)("provides the reviewed $categoryId mask and four pixel-locked overlays", async ({
    categoryId,
    generatedSceneDirectory,
  }) => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "modern", "1f");
    const expectedSize = [1672, 941];
    const category = MATERIAL_CATALOG.find(({ id }) => id === categoryId);
    expect(category).toBeDefined();

    const mask = path.join(sourceRoot, "masks", `${categoryId}.png`);
    await expect(access(mask), mask).resolves.toBeUndefined();
    const maskMetadata = await sharp(mask).metadata();
    expect([maskMetadata.width, maskMetadata.height], mask).toEqual(expectedSize);
    const maskPixels = await sharp(mask).greyscale().raw().toBuffer();

    for (const option of category?.options ?? []) {
      const generatedScene = path.join(sourceRoot, generatedSceneDirectory, `${option.id}.png`);
      await expect(access(generatedScene), generatedScene).resolves.toBeUndefined();
      const generatedMetadata = await sharp(generatedScene).metadata();
      expect([generatedMetadata.width, generatedMetadata.height], generatedScene).toEqual(expectedSize);

      const overlay = path.join(sourceRoot, "overlays", categoryId, `${option.id}.png`);
      await expect(access(overlay), overlay).resolves.toBeUndefined();
      const overlayMetadata = await sharp(overlay).metadata();
      expect([overlayMetadata.width, overlayMetadata.height], overlay).toEqual(expectedSize);
      expect(overlayMetadata.hasAlpha, overlay).toBe(true);

      const { data: overlayPixels, info } = await sharp(overlay)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const overlayAlpha = Buffer.alloc(expectedSize[0] * expectedSize[1]);
      for (let pixel = 0; pixel < overlayAlpha.length; pixel += 1) {
        overlayAlpha[pixel] = overlayPixels[pixel * info.channels + 3];
      }
      expect(overlayAlpha.equals(maskPixels), `${option.id} must use the exact reviewed mask`).toBe(true);
    }
  });
});

describe("Modern 2-floor material preview assets", () => {
  test.each([
    { categoryId: "roof", generatedSceneDirectory: "generated-roof-scenes" },
    { categoryId: "wall", generatedSceneDirectory: "generated-wall-scenes" },
    { categoryId: "window", generatedSceneDirectory: "generated-window-scenes" },
    { categoryId: "door", generatedSceneDirectory: "generated-door-scenes" },
  ] as const)("provides the reviewed $categoryId mask and four pixel-locked overlays", async ({
    categoryId,
    generatedSceneDirectory,
  }) => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "modern", "2f");
    const expectedSize = [1672, 941];
    const category = MATERIAL_CATALOG.find(({ id }) => id === categoryId);
    expect(category).toBeDefined();

    const mask = path.join(sourceRoot, "masks", `${categoryId}.png`);
    await expect(access(mask), mask).resolves.toBeUndefined();
    const maskMetadata = await sharp(mask).metadata();
    expect([maskMetadata.width, maskMetadata.height], mask).toEqual(expectedSize);
    const maskPixels = await sharp(mask).greyscale().raw().toBuffer();

    for (const option of category?.options ?? []) {
      const generatedScene = path.join(sourceRoot, generatedSceneDirectory, `${option.id}.png`);
      await expect(access(generatedScene), generatedScene).resolves.toBeUndefined();
      const generatedMetadata = await sharp(generatedScene).metadata();
      expect([generatedMetadata.width, generatedMetadata.height], generatedScene).toEqual(expectedSize);

      const overlay = path.join(sourceRoot, "overlays", categoryId, `${option.id}.png`);
      await expect(access(overlay), overlay).resolves.toBeUndefined();
      const overlayMetadata = await sharp(overlay).metadata();
      expect([overlayMetadata.width, overlayMetadata.height], overlay).toEqual(expectedSize);
      expect(overlayMetadata.hasAlpha, overlay).toBe(true);

      const { data: overlayPixels, info } = await sharp(overlay)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const overlayAlpha = Buffer.alloc(expectedSize[0] * expectedSize[1]);
      for (let pixel = 0; pixel < overlayAlpha.length; pixel += 1) {
        overlayAlpha[pixel] = overlayPixels[pixel * info.channels + 3];
      }
      expect(overlayAlpha.equals(maskPixels), `${option.id} must use the exact reviewed mask`).toBe(true);
    }
  });
});

describe("Modern 3-floor material preview assets", () => {
  test.each([
    { categoryId: "roof", generatedSceneDirectory: "generated-roof-scenes" },
    { categoryId: "wall", generatedSceneDirectory: "generated-wall-scenes" },
    { categoryId: "window", generatedSceneDirectory: "generated-window-scenes" },
    { categoryId: "door", generatedSceneDirectory: "generated-door-scenes" },
  ] as const)("provides the reviewed $categoryId mask and four pixel-locked overlays", async ({
    categoryId,
    generatedSceneDirectory,
  }) => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "modern", "3f");
    const expectedSize = [1672, 941];
    const category = MATERIAL_CATALOG.find(({ id }) => id === categoryId);
    expect(category).toBeDefined();

    const mask = path.join(sourceRoot, "masks", `${categoryId}.png`);
    await expect(access(mask), mask).resolves.toBeUndefined();
    const maskMetadata = await sharp(mask).metadata();
    expect([maskMetadata.width, maskMetadata.height], mask).toEqual(expectedSize);
    const maskPixels = await sharp(mask).greyscale().raw().toBuffer();

    for (const option of category?.options ?? []) {
      const generatedScene = path.join(sourceRoot, generatedSceneDirectory, `${option.id}.png`);
      await expect(access(generatedScene), generatedScene).resolves.toBeUndefined();
      const generatedMetadata = await sharp(generatedScene).metadata();
      expect([generatedMetadata.width, generatedMetadata.height], generatedScene).toEqual(expectedSize);

      const overlay = path.join(sourceRoot, "overlays", categoryId, `${option.id}.png`);
      await expect(access(overlay), overlay).resolves.toBeUndefined();
      const overlayMetadata = await sharp(overlay).metadata();
      expect([overlayMetadata.width, overlayMetadata.height], overlay).toEqual(expectedSize);
      expect(overlayMetadata.hasAlpha, overlay).toBe(true);

      const { data: overlayPixels, info } = await sharp(overlay)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const overlayAlpha = Buffer.alloc(expectedSize[0] * expectedSize[1]);
      for (let pixel = 0; pixel < overlayAlpha.length; pixel += 1) {
        overlayAlpha[pixel] = overlayPixels[pixel * info.channels + 3];
      }
      expect(overlayAlpha.equals(maskPixels), `${option.id} must use the exact reviewed mask`).toBe(true);
    }
  });
});

describe("Loft 1-floor material preview assets", () => {
  test.each([
    { categoryId: "window", generatedSceneDirectory: "generated-window-scenes" },
    { categoryId: "door", generatedSceneDirectory: "generated-door-scenes" },
  ] as const)("provides the reviewed $categoryId mask and four pixel-locked overlays", async ({
    categoryId,
    generatedSceneDirectory,
  }) => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "loft", "1f");
    const expectedSize = [1672, 941];
    const category = MATERIAL_CATALOG.find(({ id }) => id === categoryId);
    expect(category).toBeDefined();

    const mask = path.join(sourceRoot, "masks", `${categoryId}.png`);
    await expect(access(mask), mask).resolves.toBeUndefined();
    const maskMetadata = await sharp(mask).metadata();
    expect([maskMetadata.width, maskMetadata.height], mask).toEqual(expectedSize);
    const maskPixels = await sharp(mask).greyscale().raw().toBuffer();

    for (const option of category?.options ?? []) {
      const generatedScene = path.join(sourceRoot, generatedSceneDirectory, `${option.id}.png`);
      await expect(access(generatedScene), generatedScene).resolves.toBeUndefined();
      const generatedMetadata = await sharp(generatedScene).metadata();
      expect([generatedMetadata.width, generatedMetadata.height], generatedScene).toEqual(expectedSize);

      const overlay = path.join(sourceRoot, "overlays", categoryId, `${option.id}.png`);
      await expect(access(overlay), overlay).resolves.toBeUndefined();
      const overlayMetadata = await sharp(overlay).metadata();
      expect([overlayMetadata.width, overlayMetadata.height], overlay).toEqual(expectedSize);
      expect(overlayMetadata.hasAlpha, overlay).toBe(true);

      const { data: overlayPixels, info } = await sharp(overlay)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const overlayAlpha = Buffer.alloc(expectedSize[0] * expectedSize[1]);
      for (let pixel = 0; pixel < overlayAlpha.length; pixel += 1) {
        overlayAlpha[pixel] = overlayPixels[pixel * info.channels + 3];
      }
      expect(overlayAlpha.equals(maskPixels), `${option.id} must use the exact reviewed mask`).toBe(true);
    }
  });

  test("does not publish selectable roof or wall layers for Loft", async () => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "loft", "1f");
    await expect(access(path.join(sourceRoot, "overlays", "roof"))).rejects.toThrow();
    await expect(access(path.join(sourceRoot, "overlays", "wall"))).rejects.toThrow();
  });
});

describe("Loft 2-floor material preview assets", () => {
  test.each([
    { categoryId: "window", generatedSceneDirectory: "generated-window-scenes" },
    { categoryId: "door", generatedSceneDirectory: "generated-door-scenes" },
  ] as const)("provides the reviewed $categoryId mask and four pixel-locked overlays", async ({
    categoryId,
    generatedSceneDirectory,
  }) => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "loft", "2f");
    const expectedSize = [1672, 941];
    const category = MATERIAL_CATALOG.find(({ id }) => id === categoryId);
    expect(category).toBeDefined();

    const mask = path.join(sourceRoot, "masks", `${categoryId}.png`);
    await expect(access(mask), mask).resolves.toBeUndefined();
    const maskMetadata = await sharp(mask).metadata();
    expect([maskMetadata.width, maskMetadata.height], mask).toEqual(expectedSize);
    const maskPixels = await sharp(mask).greyscale().raw().toBuffer();

    for (const option of category?.options ?? []) {
      const generatedScene = path.join(sourceRoot, generatedSceneDirectory, `${option.id}.png`);
      await expect(access(generatedScene), generatedScene).resolves.toBeUndefined();
      const generatedMetadata = await sharp(generatedScene).metadata();
      expect([generatedMetadata.width, generatedMetadata.height], generatedScene).toEqual(expectedSize);

      const overlay = path.join(sourceRoot, "overlays", categoryId, `${option.id}.png`);
      await expect(access(overlay), overlay).resolves.toBeUndefined();
      const overlayMetadata = await sharp(overlay).metadata();
      expect([overlayMetadata.width, overlayMetadata.height], overlay).toEqual(expectedSize);
      expect(overlayMetadata.hasAlpha, overlay).toBe(true);

      const { data: overlayPixels, info } = await sharp(overlay)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const overlayAlpha = Buffer.alloc(expectedSize[0] * expectedSize[1]);
      for (let pixel = 0; pixel < overlayAlpha.length; pixel += 1) {
        overlayAlpha[pixel] = overlayPixels[pixel * info.channels + 3];
      }
      expect(overlayAlpha.equals(maskPixels), `${option.id} must use the exact reviewed mask`).toBe(true);
    }
  });

  test("does not publish selectable roof or wall layers for Loft", async () => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "loft", "2f");
    await expect(access(path.join(sourceRoot, "overlays", "roof"))).rejects.toThrow();
    await expect(access(path.join(sourceRoot, "overlays", "wall"))).rejects.toThrow();
  });
});

describe("Loft 3-floor material preview assets", () => {
  test.each([
    { categoryId: "window", generatedSceneDirectory: "generated-window-scenes" },
    { categoryId: "door", generatedSceneDirectory: "generated-door-scenes" },
  ] as const)("provides the reviewed $categoryId mask and four pixel-locked overlays", async ({
    categoryId,
    generatedSceneDirectory,
  }) => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "loft", "3f");
    const expectedSize = [1672, 941];
    const category = MATERIAL_CATALOG.find(({ id }) => id === categoryId);
    expect(category).toBeDefined();

    const mask = path.join(sourceRoot, "masks", `${categoryId}.png`);
    await expect(access(mask), mask).resolves.toBeUndefined();
    const maskMetadata = await sharp(mask).metadata();
    expect([maskMetadata.width, maskMetadata.height], mask).toEqual(expectedSize);
    const maskPixels = await sharp(mask).greyscale().raw().toBuffer();

    for (const option of category?.options ?? []) {
      const generatedScene = path.join(sourceRoot, generatedSceneDirectory, `${option.id}.png`);
      await expect(access(generatedScene), generatedScene).resolves.toBeUndefined();
      const generatedMetadata = await sharp(generatedScene).metadata();
      expect([generatedMetadata.width, generatedMetadata.height], generatedScene).toEqual(expectedSize);

      const overlay = path.join(sourceRoot, "overlays", categoryId, `${option.id}.png`);
      await expect(access(overlay), overlay).resolves.toBeUndefined();
      const overlayMetadata = await sharp(overlay).metadata();
      expect([overlayMetadata.width, overlayMetadata.height], overlay).toEqual(expectedSize);
      expect(overlayMetadata.hasAlpha, overlay).toBe(true);

      const { data: overlayPixels, info } = await sharp(overlay)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const overlayAlpha = Buffer.alloc(expectedSize[0] * expectedSize[1]);
      for (let pixel = 0; pixel < overlayAlpha.length; pixel += 1) {
        overlayAlpha[pixel] = overlayPixels[pixel * info.channels + 3];
      }
      expect(overlayAlpha.equals(maskPixels), `${option.id} must use the exact reviewed mask`).toBe(true);
    }
  });

  test("does not publish selectable roof or wall layers for Loft", async () => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "loft", "3f");
    await expect(access(path.join(sourceRoot, "overlays", "roof"))).rejects.toThrow();
    await expect(access(path.join(sourceRoot, "overlays", "wall"))).rejects.toThrow();
  });
});

describe("Minimal 1-floor material preview assets", () => {
  test.each([
    { categoryId: "roof", generatedSceneDirectory: "generated-roof-scenes" },
    { categoryId: "wall", generatedSceneDirectory: "generated-wall-scenes" },
    { categoryId: "window", generatedSceneDirectory: "generated-window-scenes" },
    { categoryId: "door", generatedSceneDirectory: "generated-door-scenes" },
  ] as const)("provides the reviewed $categoryId mask and four pixel-locked overlays", async ({
    categoryId,
    generatedSceneDirectory,
  }) => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "minimal", "1f");
    const expectedSize = [1672, 941];
    const category = MATERIAL_CATALOG.find(({ id }) => id === categoryId);
    expect(category).toBeDefined();

    const mask = path.join(sourceRoot, "masks", `${categoryId}.png`);
    await expect(access(mask), mask).resolves.toBeUndefined();
    const maskMetadata = await sharp(mask).metadata();
    expect([maskMetadata.width, maskMetadata.height], mask).toEqual(expectedSize);
    const maskPixels = await sharp(mask).greyscale().raw().toBuffer();

    for (const option of category?.options ?? []) {
      const generatedScene = path.join(sourceRoot, generatedSceneDirectory, `${option.id}.png`);
      await expect(access(generatedScene), generatedScene).resolves.toBeUndefined();
      const generatedMetadata = await sharp(generatedScene).metadata();
      expect([generatedMetadata.width, generatedMetadata.height], generatedScene).toEqual(expectedSize);

      const overlay = path.join(sourceRoot, "overlays", categoryId, `${option.id}.png`);
      await expect(access(overlay), overlay).resolves.toBeUndefined();
      const overlayMetadata = await sharp(overlay).metadata();
      expect([overlayMetadata.width, overlayMetadata.height], overlay).toEqual(expectedSize);
      expect(overlayMetadata.hasAlpha, overlay).toBe(true);

      const { data: overlayPixels, info } = await sharp(overlay)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const overlayAlpha = Buffer.alloc(expectedSize[0] * expectedSize[1]);
      for (let pixel = 0; pixel < overlayAlpha.length; pixel += 1) {
        overlayAlpha[pixel] = overlayPixels[pixel * info.channels + 3];
      }
      expect(overlayAlpha.equals(maskPixels), `${option.id} must use the exact reviewed mask`).toBe(true);
    }
  });
});

describe.each([
  { floor: "2f", label: "2-floor" },
  { floor: "3f", label: "3-floor" },
])("Minimal $label material preview assets", ({ floor }) => {
  test.each([
    { categoryId: "roof", generatedSceneDirectory: "generated-roof-scenes" },
    { categoryId: "wall", generatedSceneDirectory: "generated-wall-scenes" },
    { categoryId: "window", generatedSceneDirectory: "generated-window-scenes" },
    { categoryId: "door", generatedSceneDirectory: "generated-door-scenes" },
  ] as const)("provides the reviewed $categoryId mask and four pixel-locked overlays", async ({
    categoryId,
    generatedSceneDirectory,
  }) => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "minimal", floor);
    const expectedSize = [1672, 941];
    const category = MATERIAL_CATALOG.find(({ id }) => id === categoryId);
    expect(category).toBeDefined();

    const mask = path.join(sourceRoot, "masks", `${categoryId}.png`);
    await expect(access(mask), mask).resolves.toBeUndefined();
    const maskMetadata = await sharp(mask).metadata();
    expect([maskMetadata.width, maskMetadata.height], mask).toEqual(expectedSize);
    const maskPixels = await sharp(mask).greyscale().raw().toBuffer();

    for (const option of category?.options ?? []) {
      const generatedScene = path.join(sourceRoot, generatedSceneDirectory, `${option.id}.png`);
      await expect(access(generatedScene), generatedScene).resolves.toBeUndefined();
      const generatedMetadata = await sharp(generatedScene).metadata();
      expect([generatedMetadata.width, generatedMetadata.height], generatedScene).toEqual(expectedSize);

      const overlay = path.join(sourceRoot, "overlays", categoryId, `${option.id}.png`);
      await expect(access(overlay), overlay).resolves.toBeUndefined();
      const overlayMetadata = await sharp(overlay).metadata();
      expect([overlayMetadata.width, overlayMetadata.height], overlay).toEqual(expectedSize);
      expect(overlayMetadata.hasAlpha, overlay).toBe(true);

      const { data: overlayPixels, info } = await sharp(overlay)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const overlayAlpha = Buffer.alloc(expectedSize[0] * expectedSize[1]);
      for (let pixel = 0; pixel < overlayAlpha.length; pixel += 1) {
        overlayAlpha[pixel] = overlayPixels[pixel * info.channels + 3];
      }
      expect(overlayAlpha.equals(maskPixels), `${option.id} must use the exact reviewed mask`).toBe(true);
    }
  });
});

describe.each([
  { floor: "1f", label: "1-floor" },
  { floor: "3f", label: "3-floor" },
])("Classic $label material preview assets", ({ floor }) => {
  test.each([
    { categoryId: "roof", generatedSceneDirectory: "generated-roof-scenes" },
    { categoryId: "window", generatedSceneDirectory: "generated-window-scenes" },
    { categoryId: "door", generatedSceneDirectory: "generated-door-scenes" },
  ] as const)("provides the reviewed $categoryId mask and four pixel-locked overlays", async ({
    categoryId,
    generatedSceneDirectory,
  }) => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "classic", floor);
    const expectedSize = [1672, 941];
    const category = MATERIAL_CATALOG.find(({ id }) => id === categoryId);
    expect(category).toBeDefined();

    const mask = path.join(sourceRoot, "masks", `${categoryId}.png`);
    await expect(access(mask), mask).resolves.toBeUndefined();
    const maskMetadata = await sharp(mask).metadata();
    expect([maskMetadata.width, maskMetadata.height], mask).toEqual(expectedSize);
    const maskPixels = await sharp(mask).greyscale().raw().toBuffer();

    for (const option of category?.options ?? []) {
      const generatedScene = path.join(sourceRoot, generatedSceneDirectory, `${option.id}.png`);
      await expect(access(generatedScene), generatedScene).resolves.toBeUndefined();
      const generatedMetadata = await sharp(generatedScene).metadata();
      expect([generatedMetadata.width, generatedMetadata.height], generatedScene).toEqual(expectedSize);

      const overlay = path.join(sourceRoot, "overlays", categoryId, `${option.id}.png`);
      await expect(access(overlay), overlay).resolves.toBeUndefined();
      const overlayMetadata = await sharp(overlay).metadata();
      expect([overlayMetadata.width, overlayMetadata.height], overlay).toEqual(expectedSize);
      expect(overlayMetadata.hasAlpha, overlay).toBe(true);

      const { data: overlayPixels, info } = await sharp(overlay)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const overlayAlpha = Buffer.alloc(expectedSize[0] * expectedSize[1]);
      for (let pixel = 0; pixel < overlayAlpha.length; pixel += 1) {
        overlayAlpha[pixel] = overlayPixels[pixel * info.channels + 3];
      }
      expect(overlayAlpha.equals(maskPixels), `${option.id} must use the exact reviewed mask`).toBe(true);
    }
  });
});

describe("Contemporary 1-floor material preview assets", () => {
  test("preserves the supplied roof-surface mask and expands the published mask to cover roof edges", async () => {
    const maskRoot = path.join(process.cwd(), "assets", "material-previews", "contemporary", "1f", "masks");
    const surfaceOnly = await sharp(path.join(maskRoot, "roof-surface-only.png")).greyscale().raw().toBuffer();
    const expanded = await sharp(path.join(maskRoot, "roof.png")).greyscale().raw().toBuffer();
    const selectedPixels = (pixels: Buffer) => pixels.reduce((total, value) => total + Number(value > 0), 0);

    expect(selectedPixels(expanded)).toBeGreaterThan(selectedPixels(surfaceOnly));
  });

  test.each([
    { categoryId: "roof", generatedSceneDirectory: "generated-roof-scenes" },
    { categoryId: "window", generatedSceneDirectory: "generated-window-scenes" },
    { categoryId: "door", generatedSceneDirectory: "generated-door-scenes" },
  ] as const)("provides the reviewed $categoryId mask and four pixel-locked overlays", async ({
    categoryId,
    generatedSceneDirectory,
  }) => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "contemporary", "1f");
    const expectedSize = [1672, 941];
    const category = MATERIAL_CATALOG.find(({ id }) => id === categoryId);
    expect(category).toBeDefined();

    const mask = path.join(sourceRoot, "masks", `${categoryId}.png`);
    await expect(access(mask), mask).resolves.toBeUndefined();
    const maskMetadata = await sharp(mask).metadata();
    expect([maskMetadata.width, maskMetadata.height], mask).toEqual(expectedSize);
    const maskPixels = await sharp(mask).greyscale().raw().toBuffer();

    for (const option of category?.options ?? []) {
      const generatedScene = path.join(sourceRoot, generatedSceneDirectory, `${option.id}.png`);
      await expect(access(generatedScene), generatedScene).resolves.toBeUndefined();
      const generatedMetadata = await sharp(generatedScene).metadata();
      expect([generatedMetadata.width, generatedMetadata.height], generatedScene).toEqual(expectedSize);

      const overlay = path.join(sourceRoot, "overlays", categoryId, `${option.id}.png`);
      await expect(access(overlay), overlay).resolves.toBeUndefined();
      const overlayMetadata = await sharp(overlay).metadata();
      expect([overlayMetadata.width, overlayMetadata.height], overlay).toEqual(expectedSize);
      expect(overlayMetadata.hasAlpha, overlay).toBe(true);

      const { data: overlayPixels, info } = await sharp(overlay)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const overlayAlpha = Buffer.alloc(expectedSize[0] * expectedSize[1]);
      for (let pixel = 0; pixel < overlayAlpha.length; pixel += 1) {
        overlayAlpha[pixel] = overlayPixels[pixel * info.channels + 3];
      }
      expect(overlayAlpha.equals(maskPixels), `${option.id} must use the exact reviewed mask`).toBe(true);
    }
  });

  test("keeps the reviewed exterior-wall mask without publishing editable wall overlays", async () => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "contemporary", "1f");
    const wallMask = path.join(sourceRoot, "masks", "wall.png");
    await expect(access(wallMask), wallMask).resolves.toBeUndefined();
    await expect(access(path.join(sourceRoot, "overlays", "wall"))).rejects.toThrow();
  });
});

describe("Contemporary 2-floor material preview assets", () => {
  test("preserves the supplied roof-surface mask and expands the published mask to cover roof edges", async () => {
    const maskRoot = path.join(process.cwd(), "assets", "material-previews", "contemporary", "2f", "masks");
    const surfaceOnly = await sharp(path.join(maskRoot, "roof-surface-only.png")).greyscale().raw().toBuffer();
    const expanded = await sharp(path.join(maskRoot, "roof.png")).greyscale().raw().toBuffer();
    const selectedPixels = (pixels: Buffer) => pixels.reduce((total, value) => total + Number(value > 0), 0);

    expect(selectedPixels(expanded)).toBeGreaterThan(selectedPixels(surfaceOnly));
  });

  test.each([
    { categoryId: "roof", generatedSceneDirectory: "generated-roof-scenes" },
    { categoryId: "window", generatedSceneDirectory: "generated-window-scenes" },
    { categoryId: "door", generatedSceneDirectory: "generated-door-scenes" },
  ] as const)("provides the reviewed $categoryId mask and four pixel-locked overlays", async ({
    categoryId,
    generatedSceneDirectory,
  }) => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "contemporary", "2f");
    const expectedSize = [1672, 941];
    const category = MATERIAL_CATALOG.find(({ id }) => id === categoryId);
    expect(category).toBeDefined();

    const mask = path.join(sourceRoot, "masks", `${categoryId}.png`);
    await expect(access(mask), mask).resolves.toBeUndefined();
    const maskMetadata = await sharp(mask).metadata();
    expect([maskMetadata.width, maskMetadata.height], mask).toEqual(expectedSize);
    const maskPixels = await sharp(mask).greyscale().raw().toBuffer();

    for (const option of category?.options ?? []) {
      const generatedScene = path.join(sourceRoot, generatedSceneDirectory, `${option.id}.png`);
      await expect(access(generatedScene), generatedScene).resolves.toBeUndefined();
      const generatedMetadata = await sharp(generatedScene).metadata();
      expect([generatedMetadata.width, generatedMetadata.height], generatedScene).toEqual(expectedSize);

      const overlay = path.join(sourceRoot, "overlays", categoryId, `${option.id}.png`);
      await expect(access(overlay), overlay).resolves.toBeUndefined();
      const overlayMetadata = await sharp(overlay).metadata();
      expect([overlayMetadata.width, overlayMetadata.height], overlay).toEqual(expectedSize);
      expect(overlayMetadata.hasAlpha, overlay).toBe(true);

      const { data: overlayPixels, info } = await sharp(overlay)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const overlayAlpha = Buffer.alloc(expectedSize[0] * expectedSize[1]);
      for (let pixel = 0; pixel < overlayAlpha.length; pixel += 1) {
        overlayAlpha[pixel] = overlayPixels[pixel * info.channels + 3];
      }
      expect(overlayAlpha.equals(maskPixels), `${option.id} must use the exact reviewed mask`).toBe(true);
    }
  });

  test("keeps the reviewed exterior-wall mask without publishing editable wall overlays", async () => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "contemporary", "2f");
    const wallMask = path.join(sourceRoot, "masks", "wall.png");
    await expect(access(wallMask), wallMask).resolves.toBeUndefined();
    await expect(access(path.join(sourceRoot, "overlays", "wall"))).rejects.toThrow();
  });
});

describe("Contemporary 3-floor material preview assets", () => {
  test("preserves the supplied roof-surface mask and expands the published mask to cover roof edges", async () => {
    const maskRoot = path.join(process.cwd(), "assets", "material-previews", "contemporary", "3f", "masks");
    const surfaceOnly = await sharp(path.join(maskRoot, "roof-surface-only.png")).greyscale().raw().toBuffer();
    const expanded = await sharp(path.join(maskRoot, "roof.png")).greyscale().raw().toBuffer();
    const selectedPixels = (pixels: Buffer) => pixels.reduce((total, value) => total + Number(value > 0), 0);
    expect(selectedPixels(expanded)).toBeGreaterThan(selectedPixels(surfaceOnly));
  });

  test.each([
    { categoryId: "roof", generatedSceneDirectory: "generated-roof-scenes" },
    { categoryId: "window", generatedSceneDirectory: "generated-window-scenes" },
    { categoryId: "door", generatedSceneDirectory: "generated-door-scenes" },
  ] as const)("provides the reviewed $categoryId mask and four pixel-locked overlays", async ({ categoryId, generatedSceneDirectory }) => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "contemporary", "3f");
    const expectedSize = [1672, 941];
    const category = MATERIAL_CATALOG.find(({ id }) => id === categoryId);
    expect(category).toBeDefined();
    const mask = path.join(sourceRoot, "masks", `${categoryId}.png`);
    await expect(access(mask), mask).resolves.toBeUndefined();
    expect([(await sharp(mask).metadata()).width, (await sharp(mask).metadata()).height], mask).toEqual(expectedSize);
    const maskPixels = await sharp(mask).greyscale().raw().toBuffer();

    for (const option of category?.options ?? []) {
      const generatedScene = path.join(sourceRoot, generatedSceneDirectory, `${option.id}.png`);
      await expect(access(generatedScene), generatedScene).resolves.toBeUndefined();
      const generatedMetadata = await sharp(generatedScene).metadata();
      expect([generatedMetadata.width, generatedMetadata.height], generatedScene).toEqual(expectedSize);
      const overlay = path.join(sourceRoot, "overlays", categoryId, `${option.id}.png`);
      await expect(access(overlay), overlay).resolves.toBeUndefined();
      const overlayMetadata = await sharp(overlay).metadata();
      expect([overlayMetadata.width, overlayMetadata.height], overlay).toEqual(expectedSize);
      expect(overlayMetadata.hasAlpha, overlay).toBe(true);
      const { data: overlayPixels, info } = await sharp(overlay).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const overlayAlpha = Buffer.alloc(expectedSize[0] * expectedSize[1]);
      for (let pixel = 0; pixel < overlayAlpha.length; pixel += 1) overlayAlpha[pixel] = overlayPixels[pixel * info.channels + 3];
      expect(overlayAlpha.equals(maskPixels), `${option.id} must use the exact reviewed mask`).toBe(true);
    }
  });

  test("keeps the reviewed exterior-wall mask without publishing editable wall overlays", async () => {
    const sourceRoot = path.join(process.cwd(), "assets", "material-previews", "contemporary", "3f");
    const wallMask = path.join(sourceRoot, "masks", "wall.png");
    await expect(access(wallMask), wallMask).resolves.toBeUndefined();
    await expect(access(path.join(sourceRoot, "overlays", "wall"))).rejects.toThrow();
  });
});

describe("shared special-feature preview assets", () => {
  test.each([
    { featureId: "pool", reviewedMaskFile: "swiming.png" },
    { featureId: "outdoor-pavilion", reviewedMaskFile: "stay.png" },
  ])("publishes the exact reviewed $featureId Photoshop cutout", async ({
    featureId,
    reviewedMaskFile,
  }) => {
    const reviewedMask = path.join(
      process.cwd(),
      "assets",
      "material-previews",
      "nordic",
      "2f",
      "masks",
      reviewedMaskFile,
    );
    const asset = path.join(
      process.cwd(),
      "public",
      "material-previews",
      "shared",
      "special-features",
      `${featureId}.png`,
    );

    await expect(access(reviewedMask), reviewedMask).resolves.toBeUndefined();
    await expect(access(asset), asset).resolves.toBeUndefined();
    const reviewedMetadata = await sharp(reviewedMask).metadata();
    const metadata = await sharp(asset).metadata();
    expect([reviewedMetadata.width, reviewedMetadata.height]).toEqual([1672, 941]);
    expect(reviewedMetadata.hasAlpha).toBe(true);
    expect([metadata.width, metadata.height]).toEqual([1672, 941]);
    expect(metadata.hasAlpha).toBe(true);

    const reviewedPixels = await sharp(reviewedMask).ensureAlpha().raw().toBuffer();
    const { data, info } = await sharp(asset).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    expect(data.equals(reviewedPixels), `${featureId} must preserve the exact reviewed RGBA pixels`).toBe(true);

    const pixelCount = info.width * info.height;
    let visiblePixels = 0;
    let featheredPixels = 0;
    let left = info.width;
    let top = info.height;
    let right = 0;
    let bottom = 0;
    for (let pixel = 0; pixel < pixelCount; pixel += 1) {
      const alpha = data[pixel * info.channels + 3];
      if (alpha > 0) {
        visiblePixels += 1;
        const x = pixel % info.width;
        const y = Math.floor(pixel / info.width);
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
      if (alpha > 0 && alpha < 255) featheredPixels += 1;
    }

    expect(visiblePixels / pixelCount).toBeGreaterThan(0.01);
    expect(visiblePixels / pixelCount).toBeLessThan(0.2);
    expect(featheredPixels / pixelCount).toBeLessThan(0.04);
    const expectedBounds = featureId === "pool"
      ? { left: [900, 915], top: [530, 545], right: [1360, 1375], bottom: [800, 815] }
      : { left: [1245, 1260], top: [365, 380], right: [1590, 1605], bottom: [610, 625] };
    expect(left).toBeGreaterThanOrEqual(expectedBounds.left[0]);
    expect(left).toBeLessThanOrEqual(expectedBounds.left[1]);
    expect(top).toBeGreaterThanOrEqual(expectedBounds.top[0]);
    expect(top).toBeLessThanOrEqual(expectedBounds.top[1]);
    expect(right).toBeGreaterThanOrEqual(expectedBounds.right[0]);
    expect(right).toBeLessThanOrEqual(expectedBounds.right[1]);
    expect(bottom).toBeGreaterThanOrEqual(expectedBounds.bottom[0]);
    expect(bottom).toBeLessThanOrEqual(expectedBounds.bottom[1]);
  });
});
