import { existsSync, readFileSync } from "node:fs";

const stylesheet = readFileSync("src/features/configurator/components/configurator-shell.module.css", "utf8");
const materialSelectorStylesheet = readFileSync("src/features/configurator/components/material-features-step.module.css", "utf8");
const materialsPreviewPath = "src/features/configurator/components/materials-preview.module.css";
const materialsPreviewStylesheet = existsSync(materialsPreviewPath) ? readFileSync(materialsPreviewPath, "utf8") : "";
const assetPlaceholderStylesheet = readFileSync("src/features/configurator/components/asset-placeholder.module.css", "utf8");

test("locks the desktop configurator to one viewport and scrolls only the style list", () => {
  expect(stylesheet).toMatch(/\.page\s*\{[^}]*width:\s*100%;[^}]*min-height:\s*100svh;/);
  expect(stylesheet).toMatch(/\.page\[data-step="style"\]\s*\{[^}]*height:\s*100svh;[^}]*overflow:\s*hidden;/);
  expect(stylesheet).toMatch(/\.masthead\s*\{[^}]*min-height:\s*78px;/);
  expect(stylesheet).toMatch(/\.shell\[data-step="style"\]\s*\{[^}]*height:\s*calc\(100svh - 78px\);[^}]*grid-template-columns:\s*450px minmax\(0, 1fr\);/);
  expect(stylesheet).toMatch(/\.shell\[data-step="style"\] \.formPanel\s*\{[^}]*display:\s*flex;[^}]*overflow:\s*hidden;/);
  expect(stylesheet).toMatch(/\.shell\[data-step="style"\] \.conceptGrid\s*\{[^}]*overflow-y:\s*auto;/);
  expect(stylesheet).toContain("--config-gold: #d8ad62");
  expect(stylesheet).toMatch(/\.formPanel h1:focus-visible\s*\{[^}]*border-left:/);
});

test("keeps desktop viewport ownership out of unscoped base selectors", () => {
  expect(stylesheet).not.toMatch(/^\.shell\s*\{[^}]*height:/m);
  expect(stylesheet).not.toMatch(/^\.shell\s*\{[^}]*overflow:\s*hidden;/m);
  expect(stylesheet).not.toMatch(/^\.formPanel\s*\{[^}]*max-height:/m);
  expect(stylesheet).not.toMatch(/^\.formPanel\s*\{[^}]*overflow-y:/m);
});

test("fills the right stage with the house image and renders zones as labels only", () => {
  expect(stylesheet).toMatch(/\.mainHousePreviewPlaceholder\s*\{[^}]*inset:\s*0;[^}]*border:\s*0;[^}]*border-radius:\s*0;[^}]*transform:\s*none;/);
  expect(stylesheet).toMatch(/\.reservedZone\s*\{[^}]*border:\s*0;[^}]*background:\s*transparent;[^}]*box-shadow:\s*none;/);
  expect(stylesheet).not.toContain(".templateCard");
});

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

test("does not redisplay optional metrics at the narrow mobile breakpoint", () => {
  expect(stylesheet).not.toContain(".metricList > div { display: grid; }");
  expect(stylesheet).toMatch(/\.metricList\s*>\s*\.mobileOptionalMetric\s*\{\s*display:\s*none;/);
});

test("scopes Step 4 to a 44/56 viewport with one divider and fixed controls", () => {
  expect(stylesheet).toMatch(/\.page\[data-step="materials"\]\s*\{[^}]*height:\s*100svh;[^}]*display:\s*grid;[^}]*grid-template-rows:\s*auto minmax\(0, 1fr\);[^}]*overflow:\s*hidden;/);
  expect(stylesheet).toMatch(/\.shell\[data-step="materials"\]\s*\{[^}]*height:\s*100%;[^}]*min-height:\s*0;[^}]*grid-template-columns:\s*minmax\(0, 44fr\) minmax\(0, 56fr\);[^}]*gap:\s*0;/);
  expect(materialSelectorStylesheet).toMatch(/\.scrollArea\s*\{[^}]*overflow-y:\s*auto;/);
  expect(materialSelectorStylesheet).toMatch(/\.qualityFieldset\s*\{[^}]*flex-shrink:\s*0;/);
  expect(materialSelectorStylesheet).not.toMatch(/\.section\s*\+\s*\.section[^{]*\{[^}]*margin-top:\s*24px;/);
  expect(materialsPreviewStylesheet.match(/\.preview::before/g)).toHaveLength(1);
  expect(materialsPreviewStylesheet).not.toContain(".preview::after");
  expect(materialsPreviewStylesheet).toMatch(/\.preview::before\s*\{[^}]*width:\s*1px;[^}]*radial-gradient[^}]*background-size:\s*100% (?:1[0-5]\d|100)px,/);
  expect(assetPlaceholderStylesheet).toMatch(/\.placeholder\[data-placeholder-type="preview"\]\s*\{[^}]*aspect-ratio:\s*16 \/ 10;/);
});

test("restores Step 4 document flow and two-column choices on compact viewports", () => {
  expect(stylesheet).toMatch(/@media \(max-width:\s*1199px\)[\s\S]*?\.page\[data-step="materials"\]\s*\{[^}]*height:\s*auto;[^}]*overflow:\s*visible;/);
  expect(stylesheet).toMatch(/@media \(max-width:\s*1199px\)[\s\S]*?\.shell\[data-step="materials"\]\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\);[^}]*overflow:\s*visible;/);
  expect(materialSelectorStylesheet).toMatch(/@media \(max-width:\s*1199px\)[\s\S]*?\.optionGrid,[\s\S]*?\.featureGrid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/);
});
