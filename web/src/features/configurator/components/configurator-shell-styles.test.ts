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

test("removes the unused house-style category controls", () => {
  expect(stylesheet).not.toMatch(/^\.styleFilters\b/m);
  expect(stylesheet).not.toMatch(/^\.filterChip\b/m);
});

test("keeps desktop viewport ownership out of unscoped base selectors", () => {
  expect(stylesheet).not.toMatch(/^\.shell\s*\{[^}]*height:/m);
  expect(stylesheet).not.toMatch(/^\.shell\s*\{[^}]*overflow:\s*hidden;/m);
  expect(stylesheet).not.toMatch(/^\.formPanel\s*\{[^}]*max-height:/m);
  expect(stylesheet).not.toMatch(/^\.formPanel\s*\{[^}]*overflow-y:/m);
});

test("scopes the Step 3 viewport layout, single divider, budget radios, preview and summary", () => {
  expect(stylesheet).toMatch(/\.page\[data-step="site-budget"\]\s*\{[^}]*height:\s*100svh;[^}]*overflow:\s*hidden;/);
  expect(stylesheet).toMatch(/\.shell\[data-step="site-budget"\]\s*\{[^}]*height:\s*calc\(100svh - 78px\);[^}]*grid-template-columns:\s*minmax\(0, 43fr\) minmax\(0, 57fr\);[^}]*gap:\s*0;/);
  expect(stylesheet).toMatch(/\.siteBudgetPreview::before\s*\{[^}]*width:\s*1px;[^}]*background:/);
  expect(stylesheet).toMatch(/\.siteBudgetPreview::after\s*\{[^}]*height:\s*140px;[^}]*radial-gradient/);
  expect(stylesheet).toMatch(/\.siteBudgetConceptImage img\s*\{[^}]*object-fit:\s*contain;/);
  expect(stylesheet).toMatch(/\.siteBudgetPreview\s*\{[^}]*grid-template-rows:\s*minmax\(0, 1fr\) auto;/);
  expect(stylesheet).toMatch(/\.budgetRangeGrid\s*\{[^}]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\);/);
  expect(stylesheet).toMatch(/\.budgetRangeOption:has\(input:focus-visible\)\s*\{[^}]*outline:/);
});

test("keeps Step 3 budget choices inside a scroll region above the action bar", () => {
  expect(stylesheet).toMatch(/\.siteBudgetStack\s*\{[^}]*overflow-y:\s*auto;[^}]*overscroll-behavior:\s*contain;/);
  expect(stylesheet).toMatch(/\.shell\[data-step="site-budget"\] \.actions\s*\{[^}]*position:\s*relative;[^}]*z-index:\s*2;[^}]*flex-shrink:\s*0;[^}]*background:/);
  expect(stylesheet).toMatch(/@media \(max-width: 1199px\)[\s\S]*?\.siteBudgetStack\s*\{[^}]*overflow:\s*visible;/);
});

test("scopes the Step 2 split layout, divider glow, and clean contained preview", () => {
  expect(stylesheet).toMatch(/\.page\[data-step="functions"\]\s*\{[^}]*height:\s*100svh;[^}]*overflow:\s*hidden;/);
  expect(stylesheet).toMatch(/\.shell\[data-step="functions"\]\s*\{[^}]*grid-template-columns:\s*minmax\(0, 43fr\) minmax\(0, 57fr\);[^}]*gap:\s*0;/);
  expect(stylesheet).toMatch(/\.functionsPreview::before\s*\{[^}]*width:\s*1px;[^}]*background:/);
  expect(stylesheet).toMatch(/\.functionsPreview::after\s*\{[^}]*height:\s*140px;[^}]*radial-gradient/);
  expect(stylesheet).toMatch(/\.functionsPreviewImage img\s*\{[^}]*object-fit:\s*cover;/);
  expect(stylesheet).toMatch(/\.functionsPreview\s*\{[^}]*grid-template-rows:\s*minmax\(0, 1fr\) auto;/);
  expect(stylesheet).toMatch(/\.functionsPreviewImage\s*\{[^}]*linear-gradient[^}]*#07111a/);
  expect(stylesheet).toMatch(/\.functionCarouselTrack\s*\{[^}]*overflow-x:\s*auto;[^}]*overflow-y:\s*hidden;/);
  expect(stylesheet).toMatch(/\.functionsPreviewImage img\s*\{[^}]*filter:\s*brightness\(1\.08\)[^}]*animation:\s*functionsPreviewReveal/);
  expect(stylesheet).toMatch(/@keyframes functionsPreviewReveal\s*\{[\s\S]*?filter:\s*brightness\(1\.08\)/);
});

test("keeps the Step 2 heading hierarchy clear and aligns the function carousel heading", () => {
  expect(stylesheet).toMatch(/\.shell\[data-step="functions"\] \.eyebrow\s*\{[^}]*line-height:\s*1\.25;/);
  expect(stylesheet).toMatch(/\.shell\[data-step="functions"\] \.formPanel h1\s*\{[^}]*margin-top:\s*10px;/);
  expect(stylesheet).toMatch(/\.shell\[data-step="functions"\] \.intro\s*\{[^}]*margin-top:\s*3px;/);
  expect(stylesheet).toMatch(/\.choiceHeading\s*\{[^}]*justify-content:\s*space-between;/);
  expect(stylesheet).toMatch(/\.choiceTitle\s*\{[^}]*display:\s*flex;[^}]*align-items:\s*baseline;/);
});

test("fills the right stage with the house image without environment labels", () => {
  expect(stylesheet).toMatch(/\.mainHousePreviewPlaceholder\s*\{[^}]*inset:\s*0;[^}]*border:\s*0;[^}]*border-radius:\s*0;[^}]*transform:\s*none;/);
  expect(stylesheet).not.toContain(".reservedZone");
  expect(stylesheet).not.toContain(".plotDimension");
  expect(stylesheet).not.toContain(".templateCard");
});

test("sizes and crops the configurator logo asset for the header", () => {
  expect(stylesheet).toMatch(/\.configuratorLogoFrame\s*\{[^}]*width:\s*132px;[^}]*height:\s*50px;[^}]*overflow:\s*hidden;/);
  expect(stylesheet).toMatch(/\.configuratorLogo\s*\{[^}]*object-fit:\s*cover;[^}]*object-position:\s*50% 54%;/);
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
  expect(stylesheet).toMatch(/\.shell\[data-step="materials"\]\s*\{[^}]*grid-template-areas:\s*"form preview"\s*"actions preview";[^}]*grid-template-rows:\s*minmax\(0, 1fr\) auto;/);
  expect(stylesheet).toMatch(/\.shell\[data-step="materials"\]\s*>\s*\.actions\s*\{[^}]*grid-area:\s*actions;/);
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
  expect(stylesheet).toMatch(/@media \(max-width:\s*1199px\)[\s\S]*?\.shell\[data-step="materials"\]\s*\{[^}]*grid-template-areas:\s*"form"\s*"preview"\s*"actions";/);
  expect(materialSelectorStylesheet).toMatch(/@media \(max-width:\s*1199px\)[\s\S]*?\.optionGrid,[\s\S]*?\.featureGrid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/);
});
