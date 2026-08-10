# Configurator restoration review

## Verification evidence

The restored journey was checked with automated tests and a live local-browser
walkthrough at desktop (`1280x720`) and mobile (`390x844`) sizes.

| Journey check | Automated evidence |
| --- | --- |
| Image-backed style choices | The focused Playwright journey requires four style cards, four images, and the approved Contemporary image source. |
| Live preview responds to choices | The journey changes the style with keyboard `Space`, then increases bedrooms and asserts that the live preview shows four bedrooms. |
| Preview before lead capture | The journey reaches the project summary and estimate before the full-project-summary CTA; it asserts no phone, email, or LINE ID input is present first. |
| Development estimate disclosure | Both focused journeys assert the visible Thai label `ข้อมูลทดสอบเพื่อพัฒนาระบบ`. |
| Keyboard and accessibility | Style radio choice is completed through focus plus `Space`; the public journey runs Axe checks with no serious or critical WCAG 2 A/AA violations. |
| Mobile concept-caption containment | A CSS regression test verifies that the mobile concept panel remains a positioned containing block, so the caption stays inside its image panel instead of overlapping the facts summary. |

## Production calibration gate

**The development demo is not a production price.** It is a documented
development-only baseline, shown with an explicit Thai disclosure, and must
never be represented as a calibrated KSB construction price.

Before production release, KSB must validate and publish a Supabase price book
with approved rates and supporting calibration evidence. Production remains
fail-closed: a missing, unavailable, malformed, or unpublished production
price book must not fall back to the development fixture. The pricing
calibration checklist and outstanding approver evidence are maintained in
`docs/qa/pricing-calibration-report.md`.

## Typography licensing limitation

The interface requests `local("DB Heavent")` first and then uses the Noto
fallback stack. No DB Heavent font binaries are copied into this repository.
Before a hosted deployment uses DB Heavent beyond a locally installed font,
KSB must obtain and document the applicable webfont/distribution licence (or
keep the fallback stack).

## Visual browser review

- Desktop 1280x720: verified the 48/52 decision-canvas and live-preview split,
  2x2 image-backed style choices, readable hierarchy, selected-state treatment,
  and the Obsidian / Ivory / Champagne Gold luxury direction.
- Mobile 390x844: verified the compact preview-first layout, one-column choice
  flow, current-step visibility, sticky actions with bottom clearance, and no
  horizontal document overflow (`scrollWidth` stayed within the viewport).
- Preview result: verified the concept image, project facts, wide budget range,
  visible development-data disclosure, design-fee separation, supervision
  exclusion, and the value-first Full Report CTA before contact fields appear.
- A browser pass exposed the mobile concept caption escaping its image panel and
  overlapping the facts. The panel is now a positioned containing block on
  mobile; a regression test was added and the 390x844 browser view was checked
  again with no overlap.
- The focused Playwright run completed all three tests, including the public
  share page privacy check, after starting Next.js with the E2E Supabase fixture
  environment: `3 passed`.
