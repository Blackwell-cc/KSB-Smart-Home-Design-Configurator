import { calculateArea } from "@/features/area-planning/domain/calculate-area";
import { QA_AREA_CATALOG } from "@/features/area-planning/domain/area-catalog";
import { createDefaultConfiguration, type HouseConfiguration } from "../domain/configuration";
import { buildLivePreview } from "./live-preview";

test("builds an architect concept and active room metrics from the configuration", () => {
  const configuration = {
    ...createDefaultConfiguration(),
    styleId: "modern-tropical-resort",
    floors: 3,
    bedrooms: 5,
    bathrooms: 6,
    parkingSpaces: 3,
  } satisfies HouseConfiguration;
  const area = calculateArea(configuration, QA_AREA_CATALOG);

  const preview = buildLivePreview(configuration, area);

  expect(preview.concept).toMatchObject({
    id: "modern-tropical-resort",
    thaiLabel: "ทรอปิคอล รีสอร์ต",
    englishLabel: "Tropical Resort",
    image: "/concepts/modern-tropical-resort.png",
  });
  expect(preview.metricRows).toEqual(expect.arrayContaining([
    { id: "floors", label: "จำนวนชั้น", value: "3 ชั้น" },
    { id: "bedrooms", label: "ห้องนอน", value: "5 ห้อง" },
    { id: "bathrooms", label: "ห้องน้ำ", value: "6 ห้อง" },
    { id: "parking-spaces", label: "ที่จอดรถ", value: "3 คัน" },
    { id: "usable-area", label: "พื้นที่ใช้สอย", value: `${area.usableAreaM2} ตร.ม.` },
    { id: "construction-floor-area", label: "พื้นที่ก่อสร้างรวม (CFA)", value: `${area.constructionFloorAreaM2} ตร.ม.` },
  ]));
});

test("uses the chosen material board and labels only the active special features", () => {
  const configuration = {
    ...createDefaultConfiguration(),
    styleId: "contemporary-warm-luxury",
    materialQualityId: "bespoke",
    materialLevel: "signature",
    specialFeatures: ["pool", "smart-home", "ev-charger"],
  } satisfies HouseConfiguration;

  const preview = buildLivePreview(configuration, calculateArea(configuration, QA_AREA_CATALOG));

  expect(preview.material).toMatchObject({
    level: "signature",
    label: "BESPOKE",
  });
  expect(preview.material.swatches).toHaveLength(3);
  expect(preview.material.swatches.map((swatch) => swatch.label)).toEqual(["ผนัง", "ไม้", "โลหะและกระจก"]);
  expect(preview.activeFeatures).toEqual([
    { code: "pool", label: "สระว่ายน้ำ" },
    { code: "smart-home", label: "ระบบ Smart Home" },
    { code: "ev-charger", label: "ที่ชาร์จรถ EV" },
  ]);
});

test("labels design-only special features from the central catalog", () => {
  const configuration = {
    ...createDefaultConfiguration(),
    specialFeatures: ["internal-garden"],
  } satisfies HouseConfiguration;

  const preview = buildLivePreview(configuration, calculateArea(configuration, QA_AREA_CATALOG));

  expect(preview.activeFeatures).toEqual([
    { code: "internal-garden", label: "สวนภายในบ้าน" },
  ]);
});

test("uses canonical province names and a polite fallback in the live metrics", () => {
  const selectedProvince = {
    ...createDefaultConfiguration(),
    provinceCode: "50",
  } satisfies HouseConfiguration;
  const unselectedProvince = createDefaultConfiguration();

  expect(buildLivePreview(selectedProvince, calculateArea(selectedProvince, QA_AREA_CATALOG)).metricRows).toContainEqual({
    id: "province",
    label: "จังหวัด",
    value: "เชียงใหม่",
  });
  expect(buildLivePreview(unselectedProvince, calculateArea(unselectedProvince, QA_AREA_CATALOG)).metricRows).toContainEqual({
    id: "province",
    label: "จังหวัด",
    value: "ยังไม่ได้เลือกจังหวัด",
  });
});

test("selects the matching house image from the chosen style and floor count", () => {
  const oneFloor = {
    ...createDefaultConfiguration(),
    styleId: "natural-style",
    floors: 1,
  } satisfies HouseConfiguration;
  const threeFloors = { ...oneFloor, floors: 3 } satisfies HouseConfiguration;
  const classicOneFloor = {
    ...createDefaultConfiguration(),
    styleId: "classic-style",
    floors: 1,
  } satisfies HouseConfiguration;
  const classicThreeFloors = { ...classicOneFloor, floors: 3 } satisfies HouseConfiguration;
  const classicTwoFloors = { ...classicOneFloor, floors: 2 } satisfies HouseConfiguration;
  const minimalThreeFloors = {
    ...createDefaultConfiguration(),
    styleId: "minimalist-style",
    floors: 3,
  } satisfies HouseConfiguration;
  const minimalOneFloor = { ...minimalThreeFloors, floors: 1 } satisfies HouseConfiguration;
  const minimalTwoFloors = { ...minimalThreeFloors, floors: 2 } satisfies HouseConfiguration;
  const loftOneFloor = {
    ...createDefaultConfiguration(),
    styleId: "loft-style",
    floors: 1,
  } satisfies HouseConfiguration;
  const loftTwoFloors = { ...loftOneFloor, floors: 2 } satisfies HouseConfiguration;
  const loftThreeFloors = { ...loftOneFloor, floors: 3 } satisfies HouseConfiguration;
  const contemporaryOneFloor = {
    ...createDefaultConfiguration(),
    styleId: "vintage-style",
    floors: 1,
  } satisfies HouseConfiguration;
  const contemporaryTwoFloors = { ...contemporaryOneFloor, floors: 2 } satisfies HouseConfiguration;
  const contemporaryThreeFloors = { ...contemporaryOneFloor, floors: 3 } satisfies HouseConfiguration;
  const tropicalOneFloor = {
    ...createDefaultConfiguration(),
    styleId: "luxury-style",
    floors: 1,
  } satisfies HouseConfiguration;
  const tropicalTwoFloors = { ...tropicalOneFloor, floors: 2 } satisfies HouseConfiguration;
  const tropicalThreeFloors = { ...tropicalOneFloor, floors: 3 } satisfies HouseConfiguration;

  expect(buildLivePreview(oneFloor, calculateArea(oneFloor, QA_AREA_CATALOG)).concept.image)
    .toBe("/concepts/base-nordic-1f-master.webp");
  expect(buildLivePreview(classicOneFloor, calculateArea(classicOneFloor, QA_AREA_CATALOG)).concept.image)
    .toBe("/material-previews/classic/1f/base.webp?v=20260828-classic-1f-ai-v2");
  expect(buildLivePreview(classicTwoFloors, calculateArea(classicTwoFloors, QA_AREA_CATALOG)).concept.image)
    .toBe("/material-previews/classic/2f/base.webp?v=20260911-classic-2f-ai-v1");
  expect(buildLivePreview(classicThreeFloors, calculateArea(classicThreeFloors, QA_AREA_CATALOG)).concept.image)
    .toBe("/material-previews/classic/3f/base.webp?v=20260909-classic-3f-ai-v1");
  expect(buildLivePreview(threeFloors, calculateArea(threeFloors, QA_AREA_CATALOG)).concept.image)
    .toBe("/concepts/base-nordic-3f-master.webp");
  expect(buildLivePreview(minimalOneFloor, calculateArea(minimalOneFloor, QA_AREA_CATALOG)).concept.image)
    .toBe("/material-previews/minimal/1f/base.webp?v=20260827-minimal-1f-ai-v1");
  expect(buildLivePreview(minimalTwoFloors, calculateArea(minimalTwoFloors, QA_AREA_CATALOG)).concept.image)
    .toBe("/material-previews/minimal/2f/base.webp?v=20260828-minimal-2f-ai-v1");
  expect(buildLivePreview(minimalThreeFloors, calculateArea(minimalThreeFloors, QA_AREA_CATALOG)).concept.image)
    .toBe("/material-previews/minimal/3f/base.webp?v=20260828-minimal-3f-ai-v1");
  expect(buildLivePreview(loftOneFloor, calculateArea(loftOneFloor, QA_AREA_CATALOG)).concept.image)
    .toBe("/material-previews/loft/1f/base.webp?v=20260827-loft-1f-base-v2");
  expect(buildLivePreview(loftTwoFloors, calculateArea(loftTwoFloors, QA_AREA_CATALOG)).concept.image)
    .toBe("/material-previews/loft/2f/base.webp?v=20260827-loft-2f-ai-v1");
  expect(buildLivePreview(loftThreeFloors, calculateArea(loftThreeFloors, QA_AREA_CATALOG)).concept.image)
    .toBe("/material-previews/loft/3f/base.webp?v=20260827-loft-3f-ai-v1");
  expect(buildLivePreview(contemporaryOneFloor, calculateArea(contemporaryOneFloor, QA_AREA_CATALOG)).concept.image)
    .toBe("/material-previews/contemporary/1f/base.webp?v=20260910-contemporary-base-v3");
  expect(buildLivePreview(contemporaryTwoFloors, calculateArea(contemporaryTwoFloors, QA_AREA_CATALOG)).concept.image)
    .toBe("/material-previews/contemporary/2f/base.webp?v=20260910-contemporary-base-v3");
  expect(buildLivePreview(contemporaryThreeFloors, calculateArea(contemporaryThreeFloors, QA_AREA_CATALOG)).concept.image)
    .toBe("/material-previews/contemporary/3f/base.webp?v=20260910-contemporary-base-v3");
  expect(buildLivePreview(tropicalOneFloor, calculateArea(tropicalOneFloor, QA_AREA_CATALOG)).concept.image)
    .toBe("/material-previews/tropical/1f/base.webp?v=20260910-tropical-1f-ai-v1");
  expect(buildLivePreview(tropicalTwoFloors, calculateArea(tropicalTwoFloors, QA_AREA_CATALOG)).concept.image)
    .toBe("/material-previews/tropical/2f/base.webp?v=20260910-tropical-2f-ai-v1");
  expect(buildLivePreview(tropicalThreeFloors, calculateArea(tropicalThreeFloors, QA_AREA_CATALOG)).concept.image)
    .toBe("/material-previews/tropical/3f/base.webp?v=20260911-tropical-3f-ai-v1");
});
