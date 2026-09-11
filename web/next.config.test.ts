import { PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } from "next/constants";
import { expect, test, vi } from "vitest";
import createNextConfig from "./next.config";

test("fails the production-server phase before opening a listener when mandatory environment is absent", () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("SUPABASE_URL", "");

  expect(() => createNextConfig(PHASE_PRODUCTION_SERVER)).toThrowError("PRODUCTION_ENVIRONMENT_INVALID");
  expect(() => createNextConfig(PHASE_PRODUCTION_BUILD)).not.toThrow();
});

test("allows versioned local material preview images", () => {
  const config = createNextConfig(PHASE_PRODUCTION_BUILD);

  expect(config.serverExternalPackages).toEqual(expect.arrayContaining(["sharp", "pdfkit", "fontkit"]));

  expect(config.images?.localPatterns).toContainEqual({
    pathname: "/material-previews/**",
    search: "?v=20260825-window-door-ai-v1",
  });
  expect(config.images?.localPatterns).toContainEqual({
    pathname: "/material-previews/classic/1f/**",
    search: "?v=20260828-classic-1f-ai-v2",
  });
  expect(config.images?.localPatterns).toContainEqual({
    pathname: "/material-previews/classic/2f/**",
    search: "?v=20260911-classic-2f-ai-v1",
  });
  expect(config.images?.localPatterns).toContainEqual({
    pathname: "/material-previews/classic/3f/**",
    search: "?v=20260909-classic-3f-ai-v1",
  });
  expect(config.images?.localPatterns).toContainEqual({
    pathname: "/material-previews/contemporary/1f/**",
    search: "?v=20260910-contemporary-base-v3",
  });
  expect(config.images?.localPatterns).toContainEqual({
    pathname: "/material-previews/contemporary/2f/**",
    search: "?v=20260910-contemporary-base-v3",
  });
  expect(config.images?.localPatterns).toContainEqual({
    pathname: "/material-previews/contemporary/3f/**",
    search: "?v=20260910-contemporary-base-v3",
  });
  expect(config.images?.localPatterns).toContainEqual({
    pathname: "/material-previews/tropical/1f/**",
    search: "?v=20260910-tropical-1f-ai-v1",
  });
  expect(config.images?.localPatterns).toContainEqual({
    pathname: "/material-previews/tropical/2f/**",
    search: "?v=20260910-tropical-2f-ai-v1",
  });
  expect(config.images?.localPatterns).toContainEqual({
    pathname: "/material-previews/tropical/3f/**",
    search: "?v=20260911-tropical-3f-ai-v1",
  });
  expect(config.images?.localPatterns).toContainEqual({
    pathname: "/material-previews/loft/1f/**",
    search: "?v=20260827-loft-1f-base-v2",
  });
  expect(config.images?.localPatterns).toContainEqual({
    pathname: "/material-previews/loft/2f/**",
    search: "?v=20260827-loft-2f-ai-v1",
  });
  expect(config.images?.localPatterns).toContainEqual({
    pathname: "/material-previews/loft/3f/**",
    search: "?v=20260827-loft-3f-ai-v1",
  });
  expect(config.images?.localPatterns).toContainEqual({
    pathname: "/material-previews/minimal/1f/**",
    search: "?v=20260827-minimal-1f-ai-v1",
  });
  expect(config.images?.localPatterns).toContainEqual({
    pathname: "/material-previews/shared/special-features/**",
    search: "?v=20260825-special-features-v4",
  });
  expect(config.images?.localPatterns).toContainEqual({
    pathname: "/**",
    search: "",
  });
});

test("allows the versioned Contemporary replacement images", () => {
  const config = createNextConfig(PHASE_PRODUCTION_BUILD);

  expect(config.images?.localPatterns).toContainEqual({
    pathname: "/concepts/base-contemporary-*f-master.webp",
    search: "?v=20260910-contemporary-v3",
  });
});

test("allows the versioned Tropical replacement images", () => {
  const config = createNextConfig(PHASE_PRODUCTION_BUILD);

  expect(config.images?.localPatterns).toContainEqual({
    pathname: "/concepts/base-tropical-*f-master.webp",
    search: "?v=20260910-tropical-v3",
  });
});
