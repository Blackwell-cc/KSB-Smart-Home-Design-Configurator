import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

const css = readFileSync("src/app/landing-page.module.css", "utf8");

test("defines the approved floating-card motion and reduced-motion fallback", () => {
  expect(css).toMatch(/@keyframes\s+cardFloat/);
  expect(css).toMatch(/\.cardFloat\s*\{[^}]*animation:/);
  expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*animation:\s*none/);
});

test("switches floating cards into normal flow below 900px", () => {
  const mobile = css.slice(css.indexOf("@media (max-width: 899px)"));
  expect(mobile).toMatch(/\.previewCards\s*\{[^}]*position:\s*static/);
  expect(mobile).toMatch(/\.cardFloat\s*\{[^}]*position:\s*static/);
  expect(mobile).toMatch(/\.hero\s*\{[^}]*grid-template-areas:\s*"content"\s*"house"\s*"benefits"\s*"steps"/);
});

test("keeps touch targets and visible focus rings", () => {
  expect(css).toMatch(/\.primaryCta[\s\S]*min-height:\s*48px/);
  expect(css).toMatch(/:focus-visible[\s\S]*outline:/);
});
