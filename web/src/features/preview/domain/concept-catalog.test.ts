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
    { id: "luxury-style", image: "/concepts/base-tropical-2f-master.webp" },
    { id: "vintage-style", image: "/concepts/base-contemporary-2f-master.webp" },
  ]);
});
