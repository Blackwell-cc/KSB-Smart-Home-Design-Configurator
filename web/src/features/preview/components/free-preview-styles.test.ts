import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

const stylesheet = readFileSync("src/features/preview/components/free-preview.module.css", "utf8");

test("matches the configurator navigation scale and three-part alignment", () => {
  expect(stylesheet).toMatch(/\.masthead\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?min-height:\s*78px;[\s\S]*?display:\s*grid;/);
  expect(stylesheet).toMatch(/\.masthead\s*\{[\s\S]*?padding:\s*0 38px;/);
  expect(stylesheet).toMatch(/\.brandLogoFrame\s*\{[\s\S]*?width:\s*132px;[\s\S]*?height:\s*50px;/);
  expect(stylesheet).toMatch(/\.brandSubtitle\s*\{[\s\S]*?font-family:\s*var\(--font-data\);/);
  expect(stylesheet).toMatch(/\.startOverButton\s*\{[\s\S]*?min-height:\s*42px;/);
});

test("subdues the preliminary status below the start-over action", () => {
  expect(stylesheet).toMatch(/\.masthead\s*\{[^}]*grid-template-columns:\s*minmax\(330px,\s*1fr\)\s+auto;/);
  expect(stylesheet).toMatch(/\.headerUtilities\s*\{[^}]*align-items:\s*center;[^}]*gap:\s*10px;[^}]*justify-content:\s*flex-end;/);
  expect(stylesheet).toMatch(/\.statusBadge\s*\{[^}]*min-height:\s*34px;[^}]*color:\s*#9d8b6d;[^}]*border:\s*1px solid rgba\(215,\s*170,\s*90,\s*0\.14\);[^}]*font-size:\s*0\.68rem;/);
  expect(stylesheet).toMatch(/\.startOverButton\s*\{[^}]*border:\s*1px solid rgba\(215,\s*170,\s*90,\s*0\.42\);[^}]*background:\s*rgba\(216,\s*173,\s*98,\s*0\.09\);/);
});

test("uses the reference two-column result composition with a dominant project preview", () => {
  expect(stylesheet).toMatch(/\.experience\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*1fr\)/);
  expect(stylesheet).toMatch(/\.conceptPanel\s*\{[\s\S]*?grid-area:\s*concept;/);
  expect(stylesheet).toMatch(/\.introBlock\s*\{[\s\S]*?grid-area:\s*intro;/);
  expect(stylesheet).toMatch(/\.metrics\s*\{[\s\S]*?grid-template-columns:\s*repeat\(5,/);
  expect(stylesheet).toMatch(/\.lowerCards\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*\.9fr\)/);
});

test("stacks the experience intentionally on tablet and mobile", () => {
  const responsiveStyles = stylesheet.slice(stylesheet.indexOf("@media (max-width: 1199px)"));

  expect(responsiveStyles).toMatch(/\.experience\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  expect(responsiveStyles).toMatch(/grid-template-areas:\s*"intro"\s*"concept"\s*"metrics"\s*"lower"\s*"personality"\s*"actions"/);
});

test("keeps the mobile concept caption contained by its panel", () => {
  const mobileStyles = stylesheet.slice(stylesheet.indexOf("@media (max-width: 899px)"));

  expect(mobileStyles).toMatch(/\.conceptPanel\s*\{[^}]*position:\s*relative;/);
  expect(mobileStyles).not.toMatch(/\.conceptPanel\s*\{[^}]*position:\s*static;/);
});

test("keeps the reference thumbnail stack while reserving space beside the concept copy", () => {
  expect(stylesheet).toMatch(/\.conceptCaption\s*\{[\s\S]*?padding:\s*72px 440px 28px 38px;/);
  expect(stylesheet).toMatch(/\.additionalViews\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?right:\s*14px;[\s\S]*?bottom:\s*52px;/);
  expect(stylesheet).toMatch(/\.viewStack\s*\{[\s\S]*?display:\s*grid;/);
  expect(stylesheet).toMatch(/\.viewThumbnail:nth-child\(1\)[\s\S]*?transform:\s*rotate\(-/);
  expect(stylesheet).toMatch(/\.viewThumbnail:nth-child\(3\)[\s\S]*?transform:\s*rotate\(/);
  expect(stylesheet).toMatch(/\.viewDetails\s*\{[\s\S]*?position:\s*relative;[\s\S]*?border:\s*1px solid rgba\(215,\s*170,\s*90/);
  expect(stylesheet).toMatch(/\.viewDetails\s*\{[\s\S]*?margin-left:\s*-\d+px;/);
  expect(stylesheet).toMatch(/\.viewCount\s*\{[\s\S]*?border-radius:\s*50%/);
});

test("sizes and crops the additional views as a distinct reference-style fan stack", () => {
  expect(stylesheet).toMatch(/\.viewStack\s*\{[\s\S]*?width:\s*2[1-9]\dpx;[\s\S]*?height:\s*[89]\dpx;/);
  expect(stylesheet).toMatch(/\.viewThumbnail\s*\{[\s\S]*?width:\s*10\dpx;[\s\S]*?height:\s*7\dpx;/);
  expect(stylesheet).toMatch(/\.viewThumbnail:nth-child\(2\)\s*\{[\s\S]*?z-index:\s*3;[\s\S]*?transform:\s*rotate\(-/);
  expect(stylesheet).toMatch(/\.viewThumbnail:nth-child\(1\) img\s*\{[\s\S]*?transform:\s*scale\(1\.[4-9]/);
  expect(stylesheet).toMatch(/\.viewThumbnail:nth-child\(3\) img\s*\{[\s\S]*?transform:\s*scale\(1\.[4-9]/);
});

test("uses a restrained golden aura to focus the preliminary budget", () => {
  expect(stylesheet).toMatch(/\.budgetCard\s*\{[\s\S]*?position:\s*relative;[\s\S]*?isolation:\s*isolate;/);
  expect(stylesheet).toMatch(/\.budgetCard::before\s*\{[\s\S]*?radial-gradient[\s\S]*?filter:\s*blur\(/);
  expect(stylesheet).toMatch(/\.budgetCard\s*\{[\s\S]*?box-shadow:[\s\S]*?rgba\(215,\s*170,\s*90/);
});

test("presents the reference four-channel share toolbar with labels", () => {
  expect(stylesheet).toMatch(/\.shareBlock\s*\{[\s\S]*?text-align:\s*center;/);
  expect(stylesheet).toMatch(/\.shareButtons\s*\{[\s\S]*?grid-template-columns:\s*repeat\(4,/);
  expect(stylesheet).toMatch(/\.shareButtons button\s*\{[\s\S]*?display:\s*grid;/);
  expect(stylesheet).toMatch(/\.shareButtonIcon\s*\{[\s\S]*?border-radius:\s*50%/);
});

test("emphasizes the total estimate with the reference Thai typeface and larger figures", () => {
  expect(stylesheet).toMatch(/\.budgetRows > div:last-child dd\s*\{[\s\S]*?font-family:\s*var\(--font-thai\);[\s\S]*?font-size:\s*clamp\(0\.9/);
  expect(stylesheet).toMatch(/\.budgetRows > div:last-child dd\s*\{[\s\S]*?font-variant-numeric:\s*tabular-nums;/);
});

test("shows copy feedback before slowly fading it away", () => {
  expect(stylesheet).toMatch(/\.shareStatus\s*\{[\s\S]*?animation:\s*shareStatusFade\s+4/);
  expect(stylesheet).toMatch(/\.shareStatus\s*\{[\s\S]*?font-size:\s*0\.6[5-9]rem/);
  expect(stylesheet).toMatch(/@keyframes\s+shareStatusFade\s*\{\s*0%\s*\{[^}]*opacity:\s*1;[\s\S]*?opacity:\s*0;/);
  const reducedMotion = stylesheet.slice(stylesheet.indexOf("@media (prefers-reduced-motion: reduce)"));
  expect(reducedMotion).toMatch(/\.shareStatus\s*\{[\s\S]*?animation:\s*none;/);
});

test("orchestrates a one-shot cinematic result reveal with a reduced-motion fallback", () => {
  expect(stylesheet).toMatch(/\[data-result-reveal="cinematic"\][\s\S]*?houseReveal/);
  expect(stylesheet).toMatch(/\.conceptPanel::after[\s\S]*?goldSweep/);
  expect(stylesheet).toMatch(/\.metrics > div:nth-child\(5\)[\s\S]*?animation-delay/);
  expect(stylesheet).toMatch(/\.budgetCard[\s\S]*?budgetPulse/);

  const reducedMotion = stylesheet.slice(stylesheet.indexOf("@media (prefers-reduced-motion: reduce)"));
  expect(reducedMotion).toMatch(/\[data-result-reveal="cinematic"\][\s\S]*?animation:\s*none/);
});
