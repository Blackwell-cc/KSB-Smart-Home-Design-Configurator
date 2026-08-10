import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

const stylesheet = readFileSync("src/features/preview/components/free-preview.module.css", "utf8");

test("keeps the mobile concept caption contained by its panel", () => {
  const mobileStyles = stylesheet.slice(stylesheet.indexOf("@media (max-width: 899px)"));

  expect(mobileStyles).toMatch(/\.conceptPanel\s*\{[^}]*position:\s*relative;/);
  expect(mobileStyles).not.toMatch(/\.conceptPanel\s*\{[^}]*position:\s*static;/);
});
