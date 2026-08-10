import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "vitest";

const seedPath = resolve(process.cwd(), "../supabase/seed.sql");

test("keeps the local seed unpublishable, anonymous and clearly marked as QA-only", () => {
  const seed = readFileSync(seedPath, "utf8");

  expect(seed).toContain("TH-2026Q2-QA-0.1");
  expect(seed).toMatch(/'review'/i);
  expect(seed).toMatch(/golden_cases_passed[\s\S]*false/i);
  expect(seed).toMatch(/QA ONLY|NOT APPROVED/i);
  expect(seed).not.toMatch(/'published'/i);
  expect(seed).not.toMatch(/customer_name|phone|email|line_id|exact_address|title_deed/i);
});
