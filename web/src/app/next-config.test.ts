import { expect, test } from "vitest";
import createNextConfig from "../../next.config";

test("hides the Next.js development indicator", () => {
  expect(createNextConfig("phase-development-server").devIndicators).toBe(false);
});
