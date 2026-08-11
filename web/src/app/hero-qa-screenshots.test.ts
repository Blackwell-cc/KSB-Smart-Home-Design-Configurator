import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "vitest";

const screenshots = [
  ["consumer-hero-desktop-1440x900.png", 1440, 900],
  ["consumer-hero-tablet-768x1024.png", 768, 1024],
  ["consumer-hero-mobile-375x812.png", 375, 812],
] as const;

test.each(screenshots)("stores %s at its declared dimensions", (filename, width, height) => {
  const png = readFileSync(resolve(process.cwd(), "..", "docs", "qa", "screenshots", filename));

  expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(png.readUInt32BE(16)).toBe(width);
  expect(png.readUInt32BE(20)).toBe(height);
});
