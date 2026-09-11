import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const WIDTH = 1672;
const HEIGHT = 941;
const root = process.cwd();
const reviewedMaskRoot = path.join(
  root,
  "assets",
  "material-previews",
  "nordic",
  "2f",
  "masks",
);
const publicRoot = path.join(
  root,
  "public",
  "material-previews",
  "shared",
  "special-features",
);

const features = [
  { id: "pool", reviewedMaskFile: "swiming.png" },
  { id: "outdoor-pavilion", reviewedMaskFile: "stay.png" },
];

await mkdir(publicRoot, { recursive: true });

for (const feature of features) {
  const reviewedMask = path.join(reviewedMaskRoot, feature.reviewedMaskFile);
  const metadata = await sharp(reviewedMask).metadata();

  if (metadata.width !== WIDTH || metadata.height !== HEIGHT || !metadata.hasAlpha) {
    throw new Error(
      `${feature.reviewedMaskFile} must be a transparent ${WIDTH}x${HEIGHT}px Photoshop cutout`,
    );
  }

  // Publish the reviewed Photoshop cutout pixel-for-pixel. Do not rebuild its
  // silhouette with a polygon because that reintroduces overlap and edge errors.
  await sharp(reviewedMask)
    .ensureAlpha()
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicRoot, `${feature.id}.png`));
}

console.log(`Published exact reviewed special-feature cutouts in ${publicRoot}`);
