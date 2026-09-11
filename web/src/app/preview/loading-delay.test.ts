import { expect, test } from "vitest";
import { MINIMUM_PREVIEW_LOADING_MS, remainingPreviewLoadingDelay } from "./loading-delay";

test("keeps the cost-summary reveal within the requested 3–5 second window", () => {
  expect(MINIMUM_PREVIEW_LOADING_MS).toBeGreaterThanOrEqual(3_000);
  expect(MINIMUM_PREVIEW_LOADING_MS).toBeLessThanOrEqual(5_000);
  expect(remainingPreviewLoadingDelay(1_000, 1_600)).toBe(MINIMUM_PREVIEW_LOADING_MS - 600);
  expect(remainingPreviewLoadingDelay(1_000, 6_000)).toBe(0);
});
