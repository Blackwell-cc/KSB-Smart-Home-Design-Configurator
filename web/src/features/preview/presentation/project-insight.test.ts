import { describe, expect, test } from "vitest";
import { createDefaultConfiguration, projectDesignBriefConfiguration } from "@/features/configurator/domain/configuration";
import { buildProjectInsight } from "./project-insight";

function configuration(overrides: Partial<ReturnType<typeof createDefaultConfiguration>> = {}) {
  return projectDesignBriefConfiguration({
    ...createDefaultConfiguration(),
    styleId: "contemporary-warm-luxury",
    ...overrides,
  });
}

describe("buildProjectInsight", () => {
  test.each([
    ["classic-style", /ภูมิฐาน|สง่างาม/],
    ["modern-style", /อบอุ่น|เรียบหรู/],
    ["natural-style", /โปร่ง|ธรรมชาติ/],
    ["loft-style", /อบอุ่น|เรียบหรู/],
    ["minimalist-style", /เรียบง่าย/],
    ["luxury-style", /สง่างาม|เหนือกาลเวลา/],
    ["vintage-style", /ภูมิฐาน|เหนือกาลเวลา/],
  ] as const)("provides a tailored presentation for %s", (styleId, expectedTitle) => {
    const insight = buildProjectInsight(configuration({ styleId }));

    expect(insight.conceptDirection.title).toMatch(expectedTitle);
  });

  test("maps Modern Tropical selections to a positive, shareable lifestyle insight", () => {
    const insight = buildProjectInsight(configuration({
      styleId: "modern-tropical-resort",
      specialFeatures: ["pool", "smart-home"],
    }));

    expect(insight.conceptDirection.title).toContain("โปร่ง");
    expect(insight.personality.traits).toHaveLength(4);
    expect(insight.personality.traits.map(({ title }) => title).join(" ")).toMatch(/พักผ่อน|ธรรมชาติ/);
    expect(insight.personality.traits.map(({ title }) => title).join(" ")).toMatch(/สะดวก|เทคโนโลยี/);
  });

  test("changes the profile when the selected style and family requirements change", () => {
    const insight = buildProjectInsight(configuration({
      styleId: "minimal-nordic",
      functions: { office: false, elderlyRoom: true, thaiKitchen: false, multipurposeRoom: false },
    }));

    expect(insight.conceptDirection.title).toContain("เรียบง่าย");
    expect(insight.personality.traits.map(({ title }) => title).join(" ")).toMatch(/ครอบครัว|ทุกช่วงวัย/);
    expect(JSON.stringify(insight)).not.toMatch(/minimal-nordic|elderlyRoom|smart-home/);
  });
});
