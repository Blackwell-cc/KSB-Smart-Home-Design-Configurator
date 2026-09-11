# Landing Cinematic Gold Reveal Design

## Goal

Add a premium first-load reveal to the existing KSB Architect landing hero. The motion should make the page feel cinematic and distinctive while preserving the current layout, content, dimensions, responsive breakpoints, links, and interaction flow.

## Approved Direction

Use a `Cinematic Gold Reveal` lasting about 1.8–2 seconds. The house image establishes the scene first, followed by the headline, supporting content, calls to action, floating configurator cards, benefits, and steps. A restrained gold light pass ties the sequence to KSB's architectural identity.

## Visual Treatment

- Keep the current black, ivory, warm gold, and architectural photography palette.
- Reveal the background from slightly enlarged and softly veiled to its current scale and clarity.
- Add a narrow, diffused gold light sweep across the hero during the opening sequence.
- Add a quiet ambient radial glow near the house after the entrance completes.
- Preserve the current floating-card motion after the entrance; the reveal only controls their initial appearance.
- Avoid flashes, hard cuts, excessive blur, particle effects, and changes to the page composition.

## Motion Sequence

1. **0–450 ms:** Header fades and settles downward by a short distance. The background begins a subtle scale-down from approximately `1.03` to `1`.
2. **180–900 ms:** The two headline lines reveal upward with a short stagger. Gold emphasis appears after the ivory lead line.
3. **450–1,150 ms:** Supporting copy, explanation, and calls to action reveal in order.
4. **500–1,500 ms:** Floating cards reveal in a stagger from small offsets with opacity and restrained depth. Their existing idle float begins after the entrance.
5. **1,050–1,750 ms:** Benefits and the three-step card reveal.
6. **350–1,800 ms:** A diffused gold light sweep crosses the house area once and fades completely.

The sequence runs once whenever the landing page is newly loaded or mounted. It does not block clicks or delay navigation.

## Implementation Boundaries

- Do not rearrange elements or change grid areas, spacing, page copy, image assets, or content hierarchy.
- Add semantic animation classes to existing elements and use CSS pseudo-elements for lighting.
- Keep animation styles in `src/app/landing-page.module.css`.
- Use CSS animations rather than adding a runtime animation dependency.
- Ensure decorative lighting cannot receive pointer input and does not affect document size.
- Preserve the current Next.js server-component structure.

## Responsive Behavior

- Desktop uses the complete sequence and light sweep.
- Tablet and mobile use the same order with shorter translations and restrained scale so content remains stable.
- Existing normal-flow mobile card layout remains unchanged.
- No animation may introduce horizontal or vertical overflow beyond the page's current behavior.

## Accessibility and Performance

- Under `prefers-reduced-motion: reduce`, disable every entrance animation, scale, light sweep, and animated transition so all content is immediately visible.
- Keep focus order, accessible names, links, headings, and landmarks unchanged.
- Animate only `opacity`, `transform`, and pseudo-element gradients where possible.
- Avoid JavaScript timers and hydration solely for animation.
- Keep the hero usable before the animation completes.

## Verification

- Unit/style tests verify the presence of the orchestration keyframes and the complete reduced-motion override.
- Playwright screenshots verify the finished landing page at desktop, tablet, and mobile sizes.
- Browser checks confirm no overflow, no console errors, and working calls to action.
- Run lint, typecheck, related tests, full unit tests, and production build.

