import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const WIDTH = 1672;
const HEIGHT = 941;
const root = process.cwd();
const scenes = [
  {
    id: "classic-1f",
    categoryIds: ["roof", "window", "door"],
    sourceRoot: path.join(root, "assets", "material-previews", "classic", "1f"),
    publicRoot: path.join(root, "public", "material-previews", "classic", "1f"),
    baseSource: path.join(root, "public", "concepts", "base-classic-1f-master.webp"),
  },
  {
    id: "classic-2f",
    categoryIds: ["roof", "window", "door"],
    sourceRoot: path.join(root, "assets", "material-previews", "classic", "2f"),
    publicRoot: path.join(root, "public", "material-previews", "classic", "2f"),
    baseSource: path.join(root, "public", "concepts", "base-classic-2f-master.webp"),
  },
  {
    id: "classic-3f",
    categoryIds: ["roof", "window", "door"],
    sourceRoot: path.join(root, "assets", "material-previews", "classic", "3f"),
    publicRoot: path.join(root, "public", "material-previews", "classic", "3f"),
    baseSource: path.join(root, "public", "concepts", "base-classic-3f-master.webp"),
  },
  {
    id: "contemporary-1f",
    categoryIds: ["roof", "window", "door"],
    sourceRoot: path.join(root, "assets", "material-previews", "contemporary", "1f"),
    publicRoot: path.join(root, "public", "material-previews", "contemporary", "1f"),
    baseSource: path.join(root, "public", "concepts", "base-contemporary-1f-master.webp"),
  },
  {
    id: "contemporary-2f",
    categoryIds: ["roof", "window", "door"],
    sourceRoot: path.join(root, "assets", "material-previews", "contemporary", "2f"),
    publicRoot: path.join(root, "public", "material-previews", "contemporary", "2f"),
    baseSource: path.join(root, "public", "concepts", "base-contemporary-2f-master.webp"),
  },
  {
    id: "contemporary-3f",
    categoryIds: ["roof", "window", "door"],
    sourceRoot: path.join(root, "assets", "material-previews", "contemporary", "3f"),
    publicRoot: path.join(root, "public", "material-previews", "contemporary", "3f"),
    baseSource: path.join(root, "public", "concepts", "base-contemporary-3f-master.webp"),
  },
  {
    id: "tropical-1f",
    sourceRoot: path.join(root, "assets", "material-previews", "tropical", "1f"),
    publicRoot: path.join(root, "public", "material-previews", "tropical", "1f"),
    baseSource: path.join(root, "public", "concepts", "base-tropical-1f-master.webp"),
  },
  {
    id: "tropical-2f",
    sourceRoot: path.join(root, "assets", "material-previews", "tropical", "2f"),
    publicRoot: path.join(root, "public", "material-previews", "tropical", "2f"),
    baseSource: path.join(root, "public", "concepts", "base-tropical-2f-master.webp"),
  },
  {
    id: "tropical-3f",
    sourceRoot: path.join(root, "assets", "material-previews", "tropical", "3f"),
    publicRoot: path.join(root, "public", "material-previews", "tropical", "3f"),
    baseSource: path.join(root, "public", "concepts", "base-tropical-3f-master.webp"),
  },
  {
    id: "loft-1f",
    categoryIds: ["window", "door"],
    sourceRoot: path.join(root, "assets", "material-previews", "loft", "1f"),
    publicRoot: path.join(root, "public", "material-previews", "loft", "1f"),
    baseSource: path.join(root, "public", "concepts", "base-loft-1f-master.webp"),
  },
  {
    id: "loft-2f",
    categoryIds: ["window", "door"],
    sourceRoot: path.join(root, "assets", "material-previews", "loft", "2f"),
    publicRoot: path.join(root, "public", "material-previews", "loft", "2f"),
    baseSource: path.join(root, "public", "concepts", "base-loft-2f-master.webp"),
  },
  {
    id: "loft-3f",
    categoryIds: ["window", "door"],
    sourceRoot: path.join(root, "assets", "material-previews", "loft", "3f"),
    publicRoot: path.join(root, "public", "material-previews", "loft", "3f"),
    baseSource: path.join(root, "public", "concepts", "base-loft-3f-master.webp"),
  },
  {
    id: "modern-1f",
    sourceRoot: path.join(root, "assets", "material-previews", "modern", "1f"),
    publicRoot: path.join(root, "public", "material-previews", "modern", "1f"),
    baseSource: path.join(root, "public", "concepts", "base-modern-1f-master-2.webp"),
  },
  {
    id: "minimal-1f",
    sourceRoot: path.join(root, "assets", "material-previews", "minimal", "1f"),
    publicRoot: path.join(root, "public", "material-previews", "minimal", "1f"),
    baseSource: path.join(root, "public", "concepts", "base-minimal-1f-master.webp"),
  },
  {
    id: "minimal-2f",
    sourceRoot: path.join(root, "assets", "material-previews", "minimal", "2f"),
    publicRoot: path.join(root, "public", "material-previews", "minimal", "2f"),
    baseSource: path.join(root, "public", "concepts", "base-minimal-2f-master.webp"),
  },
  {
    id: "minimal-3f",
    sourceRoot: path.join(root, "assets", "material-previews", "minimal", "3f"),
    publicRoot: path.join(root, "public", "material-previews", "minimal", "3f"),
    baseSource: path.join(root, "public", "concepts", "base-minimal-3f-master.webp"),
  },
  {
    id: "modern-2f",
    sourceRoot: path.join(root, "assets", "material-previews", "modern", "2f"),
    publicRoot: path.join(root, "public", "material-previews", "modern", "2f"),
    baseSource: path.join(root, "public", "concepts", "base-modern-2f-master-2.webp"),
  },
  {
    id: "modern-3f",
    sourceRoot: path.join(root, "assets", "material-previews", "modern", "3f"),
    publicRoot: path.join(root, "public", "material-previews", "modern", "3f"),
    baseSource: path.join(root, "public", "concepts", "base-modern-3f-master-2.webp"),
  },
  {
    id: "nordic-1f",
    sourceRoot: path.join(root, "assets", "material-previews", "nordic", "1f"),
    publicRoot: path.join(root, "public", "material-previews", "nordic", "1f"),
    baseSource: path.join(root, "public", "concepts", "base-nordic-1f-master.webp"),
  },
  {
    id: "nordic-2f",
    sourceRoot: path.join(root, "assets", "material-previews", "nordic", "2f"),
    publicRoot: path.join(root, "public", "material-previews", "nordic", "2f"),
    baseSource: path.join(root, "public", "concepts", "base-nordic-2f-master.webp"),
  },
  {
    id: "nordic-3f",
    sourceRoot: path.join(root, "assets", "material-previews", "nordic", "3f"),
    publicRoot: path.join(root, "public", "material-previews", "nordic", "3f"),
    baseSource: path.join(root, "public", "concepts", "base-nordic-3f-master.webp"),
  },
];
const categories = [
  {
    id: "roof",
    generatedSceneDirectory: "generated-roof-scenes",
    options: ["concrete-tile", "ceramic-tile", "metal-roof", "natural-slate"],
  },
  {
    id: "wall",
    generatedSceneDirectory: "generated-wall-scenes",
    options: ["smooth-plaster", "natural-stone", "exterior-timber", "exposed-concrete"],
  },
  {
    id: "window",
    generatedSceneDirectory: "generated-window-scenes",
    options: ["black-aluminium", "natural-aluminium", "solid-wood", "upvc"],
  },
  {
    id: "door",
    generatedSceneDirectory: "generated-door-scenes",
    options: ["teak", "engineered-wood", "aluminium-glass", "metal-frame"],
  },
];

const sceneFlagIndex = process.argv.indexOf("--scene");
const requestedSceneId = sceneFlagIndex >= 0 ? process.argv[sceneFlagIndex + 1] : undefined;
if (sceneFlagIndex >= 0 && !requestedSceneId) {
  throw new Error("--scene requires a scene id");
}
const selectedScenes = requestedSceneId
  ? scenes.filter(({ id }) => id === requestedSceneId)
  : scenes;
if (requestedSceneId && selectedScenes.length === 0) {
  throw new Error(`Unknown material preview scene: ${requestedSceneId}`);
}

async function createAlphaMask(sourceRoot, categoryId) {
  const maskSource = path.join(sourceRoot, "masks", `${categoryId}.png`);
  const { data, info } = await sharp(maskSource)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (info.width !== WIDTH || info.height !== HEIGHT) {
    throw new Error(`${categoryId} mask must be ${WIDTH}x${HEIGHT}px`);
  }

  const rgba = Buffer.alloc(WIDTH * HEIGHT * 4, 255);
  for (let pixel = 0; pixel < WIDTH * HEIGHT; pixel += 1) {
    rgba[pixel * 4 + 3] = data[pixel];
  }

  return sharp(rgba, {
    raw: { width: WIDTH, height: HEIGHT, channels: 4 },
  })
    .png()
    .toBuffer();
}

async function createOverlay(scene, category, optionId, alphaMask) {
  const generatedScene = path.join(
    scene.sourceRoot,
    category.generatedSceneDirectory,
    `${optionId}.png`,
  );
  const metadata = await sharp(generatedScene).metadata();
  if (metadata.width !== WIDTH || metadata.height !== HEIGHT) {
    throw new Error(`${optionId} generated scene must be ${WIDTH}x${HEIGHT}px`);
  }

  const overlay = await sharp(generatedScene)
    .ensureAlpha()
    .composite([{ input: alphaMask, blend: "dest-in" }])
    .png()
    .toBuffer();

  const sourceOverlayRoot = path.join(scene.sourceRoot, "overlays", category.id);
  const publicCategoryRoot = path.join(scene.publicRoot, category.id);
  await Promise.all([
    sharp(overlay)
      .png({ compressionLevel: 9 })
      .toFile(path.join(sourceOverlayRoot, `${optionId}.png`)),
    sharp(overlay)
      .webp({ lossless: true, effort: 5 })
      .toFile(path.join(publicCategoryRoot, `${optionId}.webp`)),
  ]);
}

for (const scene of selectedScenes) {
  const sceneCategories = scene.categoryIds
    ? categories.filter(({ id }) => scene.categoryIds.includes(id))
    : categories;
  await mkdir(scene.publicRoot, { recursive: true });
  for (const category of sceneCategories) {
    await Promise.all([
      mkdir(path.join(scene.sourceRoot, "overlays", category.id), { recursive: true }),
      mkdir(path.join(scene.publicRoot, category.id), { recursive: true }),
    ]);
  }

  await sharp(scene.baseSource)
    .resize(WIDTH, HEIGHT, { fit: "fill" })
    .webp({ lossless: true, effort: 5 })
    .toFile(path.join(scene.publicRoot, "base.webp"));

  for (const category of sceneCategories) {
    const alphaMask = await createAlphaMask(scene.sourceRoot, category.id);
    for (const optionId of category.options) {
      await createOverlay(scene, category, optionId, alphaMask);
    }
  }

  console.log(`Published AI-generated, Photoshop-masked material overlays for ${scene.id}`);
}
