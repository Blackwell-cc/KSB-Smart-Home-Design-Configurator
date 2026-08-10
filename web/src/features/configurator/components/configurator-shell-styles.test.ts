import { readFileSync } from "node:fs";

const stylesheet = readFileSync("src/features/configurator/components/configurator-shell.module.css", "utf8");

test("reserves mobile clearance below the form for the sticky action bar", () => {
  expect(stylesheet).toMatch(/@media \(max-width: 560px\)[\s\S]*?\.formPanel\s*\{[^}]*padding-bottom:/);
});

test("applies preview dividers only to explicitly right-column metrics", () => {
  expect(stylesheet).toMatch(/\.metricColumnRight\s*\{[^}]*border-left:/);
  expect(stylesheet).not.toMatch(/\.metricList\s*>\s*div\s*\+\s*div\s*\{[^}]*border-left:/);
});

test("keeps usable area in the visible right column on compact previews", () => {
  expect(stylesheet).toMatch(/@media \(max-width: 899px\)[\s\S]*?\[data-live-metric="usable-area"\]\s*\{[^}]*border-left:/);
});
