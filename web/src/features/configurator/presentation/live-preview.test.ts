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
