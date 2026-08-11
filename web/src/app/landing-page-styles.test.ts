import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

const css = readFileSync("src/app/landing-page.module.css", "utf8");

function rule(source: string, selector: string) {
  const start = source.indexOf(`${selector} {`);
  expect(start, `missing ${selector}`).toBeGreaterThanOrEqual(0);
  const end = source.indexOf("}", start);
  return source.slice(start, end + 1);
}

function mediaBlock(query: string) {
  const marker = `@media ${query} {`;
  const start = css.indexOf(marker);
  expect(start, `missing ${marker}`).toBeGreaterThanOrEqual(0);
  const end = css.indexOf("\n@media", start + marker.length);
  return css.slice(start, end === -1 ? undefined : end);
}

function cardDuration(selector: string) {
  const match = rule(css, selector).match(/animation-duration: (\d+(?:\.\d+)?)s/);
  if (!match) throw new Error(`missing animation duration for ${selector}`);
  return Number(match[1]);
}

test("keeps floating-card motion within the approved travel, duration, and reduced-motion limits", () => {
  const keyframes = css.slice(css.indexOf("@keyframes cardFloat"), css.indexOf("\n\n", css.indexOf("@keyframes cardFloat")));
  expect(keyframes).toContain("translate3d(0, -3px, 0)");
  expect(keyframes).toContain("translate3d(0, 3px, 0)");
  expect(rule(css, ".cardFloat")).toContain("animation: cardFloat 9s");

  for (const selector of [".stylePosition", ".areaPosition", ".materialPosition", ".budgetPosition", ".sharePosition"]) {
    expect(cardDuration(selector)).toBeGreaterThanOrEqual(7);
    expect(cardDuration(selector)).toBeLessThanOrEqual(11);
  }

  const reducedMotion = mediaBlock("(prefers-reduced-motion: reduce)");
  const reducedMotionCards = rule(reducedMotion, ".cardFloat, .previewCard, .primaryCta, .secondaryCta, .headerCta");
  expect(reducedMotionCards).toContain("animation: none");
  expect(reducedMotionCards).toContain("transition: none");
});

test("switches constrained layouts to normal flow before desktop tracks overflow", () => {
  const mobile = mediaBlock("(max-width: 1023px)");
  expect(rule(mobile, ".previewCards")).toContain("position: static");
  expect(rule(mobile, ".cardFloat")).toContain("position: static");

  const mobileHero = rule(mobile, ".hero");
  expect(mobileHero).toContain('grid-template-areas: "content" "house" "benefits" "steps"');
  expect(mobileHero).toContain("grid-template-columns: minmax(0, 1fr)");
});

test("uses a one-column card grid at 375px", () => {
  const narrow = mediaBlock("(max-width: 599px)");
  expect(rule(narrow, ".previewCards")).toContain("grid-template-columns: 1fr");
});

test("scopes the primary touch target and visible focus ring", () => {
  expect(rule(css, ".primaryCta")).toContain("min-height: 48px");
  expect(rule(css, ".brand:focus-visible, .desktopNav a:focus-visible, .phoneLink:focus-visible, .headerCta:focus-visible, .mobileMenu summary:focus-visible, .mobileMenu nav a:focus-visible, .primaryCta:focus-visible, .secondaryCta:focus-visible, .faq summary:focus-visible")).toContain("outline:");
});

test("gives every hero call-to-action a visible pressed state", () => {
  const pressedCtas = rule(css, ".primaryCta:active, .secondaryCta:active, .headerCta:active");
  expect(pressedCtas).toContain("transform: translateY(1px)");
});

test("overrides every transformed hover or pressed state when motion is reduced", () => {
  const reducedMotion = mediaBlock("(prefers-reduced-motion: reduce)");
  const motionShutdown = rule(reducedMotion, ".cardFloat, .previewCard, .primaryCta, .secondaryCta, .headerCta");
  expect(motionShutdown).toContain("animation: none");
  expect(motionShutdown).toContain("transition: none");

  const transformReset = rule(reducedMotion, ".previewCard:hover, .primaryCta:hover, .secondaryCta:hover, .primaryCta:active, .secondaryCta:active, .headerCta:active");
  expect(transformReset).toContain("transform: none");
});
