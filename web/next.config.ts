import type { NextConfig } from "next";
import { PHASE_PRODUCTION_SERVER } from "next/constants";
import { assertProductionEnvironment } from "./src/lib/env/production-environment";

export default function createNextConfig(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_SERVER) assertProductionEnvironment(process.env);
  return {
    allowedDevOrigins: ["127.0.0.1"],
    devIndicators: false,
    serverExternalPackages: ["sharp", "pdfkit", "fontkit"],
    images: {
      localPatterns: [
        {
          pathname: "/**",
          search: "",
        },
        {
          pathname: "/concepts/base-contemporary-*f-master.webp",
          search: "?v=20260910-contemporary-v3",
        },
        {
          pathname: "/concepts/base-tropical-*f-master.webp",
          search: "?v=20260910-tropical-v3",
        },
        {
          pathname: "/material-previews/**",
          search: "?v=20260825-window-door-ai-v1",
        },
    {
      pathname: "/material-previews/classic/1f/**",
      search: "?v=20260828-classic-1f-ai-v2",
    },
    {
      pathname: "/material-previews/classic/2f/**",
      search: "?v=20260911-classic-2f-ai-v1",
    },
        {
          pathname: "/material-previews/classic/3f/**",
          search: "?v=20260909-classic-3f-ai-v1",
        },
        {
          pathname: "/material-previews/contemporary/1f/**",
          search: "?v=20260910-contemporary-base-v3",
        },
        {
          pathname: "/material-previews/contemporary/2f/**",
          search: "?v=20260910-contemporary-base-v3",
        },
    {
      pathname: "/material-previews/contemporary/3f/**",
      search: "?v=20260910-contemporary-base-v3",
    },
    {
      pathname: "/material-previews/tropical/1f/**",
      search: "?v=20260910-tropical-1f-ai-v1",
    },
    {
      pathname: "/material-previews/tropical/2f/**",
      search: "?v=20260910-tropical-2f-ai-v1",
    },
    {
      pathname: "/material-previews/tropical/3f/**",
      search: "?v=20260911-tropical-3f-ai-v1",
    },
        {
          pathname: "/material-previews/loft/1f/**",
          search: "?v=20260827-loft-1f-base-v2",
        },
        {
          pathname: "/material-previews/loft/2f/**",
          search: "?v=20260827-loft-2f-ai-v1",
        },
        {
          pathname: "/material-previews/loft/3f/**",
          search: "?v=20260827-loft-3f-ai-v1",
        },
        {
          pathname: "/material-previews/minimal/1f/**",
          search: "?v=20260827-minimal-1f-ai-v1",
        },
        {
          pathname: "/material-previews/minimal/2f/**",
          search: "?v=20260828-minimal-2f-ai-v1",
        },
        {
          pathname: "/material-previews/minimal/3f/**",
          search: "?v=20260828-minimal-3f-ai-v1",
        },
        {
          pathname: "/material-previews/shared/special-features/**",
          search: "?v=20260825-special-features-v4",
        },
      ],
    },
  };
}
