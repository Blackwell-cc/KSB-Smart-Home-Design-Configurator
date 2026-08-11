import { readFileSync } from "node:fs";

const stylesheet = readFileSync("src/features/configurator/components/configurator-shell.module.css", "utf8");

test("defines the full-screen step-one sidebar and architectural preview stage", () => {
  expect(stylesheet).toMatch(/\.page\s*\{[^}]*width:\s*100%;[^}]*min-height:\s*100svh;/);
  expect(stylesheet).toMatch(/\.masthead\s*\{[^}]*min-height:\s*78px;/);
  expect(stylesheet).toMatch(/\.shell\[data-step="style"\]\s*\{[^}]*grid-template-columns:\s*450px minmax\(0, 1fr\);/);
  expect(stylesheet).toMatch(/\.previewStage\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*10;/);
  expect(stylesheet).toContain("--config-gold: #d8ad62");
  expect(stylesheet).toMatch(/\.formPanel h1:focus-visible\s*\{[^}]*border-left:/);
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
