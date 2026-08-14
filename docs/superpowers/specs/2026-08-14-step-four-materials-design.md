# Step 4 Materials and Special Features Design

Date: 2026-08-14  
Status: Approved for implementation

## Goal

Redesign only Step 4, “วัสดุและส่วนพิเศษ”, to closely match the supplied 1672 × 941 reference while preserving existing navigation, saved selections, configurator behavior, and pricing compatibility. The desktop page remains viewport-height: the material catalog scrolls inside the left column while the right preview remains stable.

## Layout

- Keep the existing configurator header at approximately 72–80px with Step 4 active.
- Use a 44/56 desktop split separated by one low-opacity champagne-gold divider with a small central highlight.
- Left column is a flex column containing a compact heading, an independently scrollable catalog, a fixed quality selector, and the existing Back/Next navigation.
- Right column contains a dominant empty 16:10 house-preview placeholder and a compact material summary below it. No preview overlays, controls, labels, recommendation cards, or guidance cards are allowed.
- Tablet and mobile stack the selector, quality, preview, summary, and navigation without horizontal overflow. Material and feature choices use two columns on mobile.

## Material Catalog

Normal material categories are single-select radio groups and contain exactly four visible choices each:

1. หลังคา: concrete tile, ceramic tile, metal roof, natural slate
2. ผนังภายนอก: smooth plaster, natural stone, exterior timber, exposed concrete
3. หน้าต่าง: black aluminium, natural aluminium, solid wood, uPVC
4. ประตูทางเข้า: teak, engineered wood, aluminium and glass, metal frame
5. พื้น: natural marble, engineered wood, porcelain tile, terrazzo
6. ฝ้าเพดาน: flat ceiling, timber slats, recessed ceiling, solid timber
7. รายละเอียดฟาซาด: timber screen, decorative stone, metal screen, green facade
8. แสงและบรรยากาศ: warm ambient, architectural light, landscape light, accent lighting

The section titles are not numbered. Options are data-driven rather than repeated inline markup. Every selection has native radio semantics, a visible check indicator, keyboard focus, and a restrained selected border.

## Special Features

Special features are a multi-select checkbox group with a data-driven catalog that supports 6–12+ choices. The initial catalog includes the existing priced feature codes plus additional design requirements such as an internal garden, skylight, home theater, wine room, outdoor pavilion, security system, fitness room, and pet area.

Existing pricing-supported special features continue to flow into the pricing request. Newly introduced design-only features are persisted and shown in the Step 4 summary but are filtered out of the current pricing payload until pricing rules exist. No unsupported feature receives an invented price.

## Material Quality and Pricing Compatibility

The user-facing quality selector has four single-select values:

- `standard`
- `premium`
- `signature`
- `bespoke`

The exact selected value is persisted separately as `materialQualityId`. Existing `materialLevel` remains the pricing-compatible field:

- `standard` maps to the existing `select` price level.
- `premium` maps to `premium`.
- `signature` maps to `signature`.
- `bespoke` is persisted as `bespoke` but temporarily maps to `signature` for pricing.

This preserves existing estimate behavior without inventing a Bespoke multiplier. The UI shows no exact price or percentage. It states only that material quality affects overall quality and project budget.

## Placeholder System

A reusable `AssetPlaceholder` component provides blank, non-interactive image surfaces. Placeholders contain no image, icon, text, remote URL, or generated artwork.

Production-size rules are documented beside the component:

- Normal material thumbnail: display about 120 × 68px; source 800 × 450px; 16:9; minimum 640 × 360px.
- Special-feature thumbnail: display about 100 × 58px; source 800 × 450px; 16:9.
- Main house preview: display about 860 × 520px; source 2000 × 1250px; minimum 1600 × 1000px; 16:10.
- Optional summary thumbnail: display 40 × 40px; source 400 × 400px; 1:1.

## Visual System

Reuse the existing approved Thai font and Step 2–3 configurator language. Use near-black architectural surfaces, warm-white type, muted secondary text, and restrained champagne-gold borders. Gold glow is limited to the active Step 4 navigation, selected controls, the divider highlight, and subtle CTA feedback. Material cards do not compete visually with the future house preview.

## Components

- `MaterialFeaturesStep`: coordinates Step 4 selection UI and fixed quality area.
- `MaterialScrollArea`: owns the internal scroll region.
- `MaterialSection` and `MaterialOptionCard`: reusable radio sections and choices.
- `SpecialFeaturesSection` and `SpecialFeatureCard`: reusable checkbox catalog.
- `MaterialQualitySelector`: persists the four user-facing quality levels and maps them to pricing compatibility.
- `AssetPlaceholder`: reusable blank aspect-ratio surface.
- `MaterialsPreview`: Step 4-only empty preview and selected-material summary.

Components remain focused and reuse existing configurator update handlers. Step 5 and the other steps keep their current layouts.

## State and Migration

Add data-driven material selections with safe defaults for each category and add `materialQualityId`. Existing drafts without these fields receive defaults derived from their legacy `materialLevel`; existing special-feature selections remain intact. Draft migration must not remove unrelated configuration values.

## Accessibility and Interaction

- Material categories and quality use radio semantics.
- Special features use checkbox semantics.
- All options support keyboard access and visible `focus-visible` styling.
- Selected state is communicated by check indicators and text/semantics, not color alone.
- Touch targets remain at least 44px on compact viewports.
- Reduced-motion preferences disable optional lift transitions.

## Verification

Implementation follows test-first development. Required verification includes focused component/domain tests, draft migration coverage, lint, typecheck, production build, and visual checks at 375px, 768px, 1440px, 1672 × 941, and a wide desktop viewport. Desktop verification must confirm that the document does not become unnecessarily tall, the catalog alone scrolls, the quality selector remains visible, the preview contains no UI overlays, state persists, and no console errors or horizontal overflow occur.

## Out of Scope

- Final material or house imagery
- Image-generation or asset-compositing logic
- New Bespoke pricing rules
- Pricing rules for newly introduced design-only special features
- Redesigning Step 5 or any unrelated page
