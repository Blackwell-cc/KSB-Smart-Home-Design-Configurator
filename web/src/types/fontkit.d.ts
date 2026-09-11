declare module "fontkit" {
  type GlyphPosition = Readonly<{ xAdvance: number; yAdvance: number; xOffset: number; yOffset: number }>;
  type Glyph = Readonly<{ path: Readonly<{ toSVG(): string }> }>;
  type LayoutRun = Readonly<{ glyphs: readonly Glyph[]; positions: readonly GlyphPosition[] }>;
  type Font = Readonly<{ unitsPerEm: number; layout(value: string): LayoutRun }>;

  export function create(source: Buffer): Font;
}
