import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "vitest";
import { CONCEPT_CATALOG, VISIBLE_CONCEPT_CATALOG } from "./concept-catalog";

test("exposes the seven approved house styles in the requested order", () => {
  expect(VISIBLE_CONCEPT_CATALOG.map(({ id, thaiLabel, englishLabel }) => ({
    id,
    thaiLabel,
    englishLabel,
  }))).toEqual([
    { id: "classic-style", thaiLabel: "บ้านสไตล์คลาสสิก", englishLabel: "Classic Style" },
    { id: "modern-style", thaiLabel: "บ้านสไตล์โมเดิร์น", englishLabel: "Modern Style" },
    { id: "natural-style", thaiLabel: "บ้านสไตล์นอร์ดิก", englishLabel: "Nordic Style" },
    { id: "loft-style", thaiLabel: "บ้านสไตล์ลอฟท์", englishLabel: "Loft Style" },
    { id: "minimalist-style", thaiLabel: "บ้านสไตล์มินิมอล", englishLabel: "Minimalist Style" },
    { id: "luxury-style", thaiLabel: "สไตล์ทรอปิคอล", englishLabel: "Tropical" },
    { id: "vintage-style", thaiLabel: "สไตล์ร่วมสมัย", englishLabel: "Contemporary" },
  ]);
});

test("keeps former concept ids hidden so saved drafts remain readable", () => {
  const legacyIds = [
    "contemporary-warm-luxury",
    "modern-tropical-resort",
    "timeless-contemporary-luxury",
    "classic-timeless",
    "minimal-nordic",
    "luxury-courtyard",
  ];

  expect(CONCEPT_CATALOG.filter(({ id }) => legacyIds.includes(id)).every(({ visible }) => !visible)).toBe(true);
});

test("maps each visible house style to its supplied master image", () => {
  expect(VISIBLE_CONCEPT_CATALOG.map(({ id, image }) => ({ id, image }))).toEqual([
    { id: "classic-style", image: "/concepts/base-classic-2f-master.webp" },
    { id: "modern-style", image: "/concepts/base-modern-2f-master-2.webp" },
    { id: "natural-style", image: "/concepts/base-nordic-2f-master.webp" },
    { id: "loft-style", image: "/concepts/base-loft-2f-master.webp" },
    { id: "minimalist-style", image: "/concepts/base-minimal-2f-master.webp" },
    { id: "luxury-style", image: "/concepts/base-tropical-2f-master.webp?v=20260910-tropical-v3" },
    { id: "vintage-style", image: "/concepts/base-contemporary-2f-master.webp?v=20260910-contemporary-v3" },
  ]);
});

test("cache-busts every updated Contemporary floor image", () => {
  expect(CONCEPT_CATALOG).toContainEqual(expect.objectContaining({
    id: "vintage-style",
    floorImages: {
      1: "/concepts/base-contemporary-1f-master.webp?v=20260910-contemporary-v3",
      2: "/concepts/base-contemporary-2f-master.webp?v=20260910-contemporary-v3",
      3: "/concepts/base-contemporary-3f-master.webp?v=20260910-contemporary-v3",
    },
  }));
});

test("publishes and cache-busts every updated Tropical floor image", async () => {
  expect(CONCEPT_CATALOG).toContainEqual(expect.objectContaining({
    id: "luxury-style",
    floorImages: {
      1: "/concepts/base-tropical-1f-master.webp?v=20260910-tropical-v3",
      2: "/concepts/base-tropical-2f-master.webp?v=20260910-tropical-v3",
      3: "/concepts/base-tropical-3f-master.webp?v=20260910-tropical-v3",
    },
  }));

  const expectedHashes = [
    ["base-tropical-1f-master.webp", "b7132b69b7b7b0cad612dad4ff061d2a2776e22d50ff3969fb59536106f01b98"],
    ["base-tropical-2f-master.webp", "6bafa60f804421261ddd3a8f7364efb237cdbda5b6c4c7c199946c45a4bc621b"],
    ["base-tropical-3f-master.webp", "6698ca325da3686f6c0db3a7d967a96632af5d3e28fab91dcfa1c83779c40c27"],
  ] as const;

  for (const [fileName, expectedHash] of expectedHashes) {
    const image = await readFile(path.join(process.cwd(), "public", "concepts", fileName));
    expect(createHash("sha256").update(image).digest("hex")).toBe(expectedHash);
  }
});

test("publishes the approved Nordic one-floor master image", async () => {
  const image = await readFile(
    path.join(process.cwd(), "public", "concepts", "base-nordic-1f-master.webp"),
  );

  expect(createHash("sha256").update(image).digest("hex")).toBe(
    "8dde047ce21720b8e3a25012078413ae3418cc60e790820c8dc486290829e7e0",
  );
});

test("provides stable material preview keys without exposing legacy style ids in asset paths", () => {
  expect(VISIBLE_CONCEPT_CATALOG.map(({ id, materialPreviewKey }) => ({ id, materialPreviewKey }))).toEqual([
    { id: "classic-style", materialPreviewKey: "classic" },
    { id: "modern-style", materialPreviewKey: "modern" },
    { id: "natural-style", materialPreviewKey: "nordic" },
    { id: "loft-style", materialPreviewKey: "loft" },
    { id: "minimalist-style", materialPreviewKey: "minimal" },
    { id: "luxury-style", materialPreviewKey: "tropical" },
    { id: "vintage-style", materialPreviewKey: "contemporary" },
  ]);
});
