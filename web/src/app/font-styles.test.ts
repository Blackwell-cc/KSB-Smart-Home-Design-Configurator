import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

describe("global Prompt font mapping", () => {
  test("uses the self-hosted Prompt face without an unresolved root variable", () => {
    const css = readFileSync("src/app/globals.css", "utf8");

    expect(css).toContain('--font-thai: "Prompt", "Prompt Fallback", sans-serif;');
    expect(css).not.toContain("--font-thai: var(--font-prompt)");
  });
});
