import type { NextConfig } from "next";
import { PHASE_PRODUCTION_SERVER } from "next/constants";
import { assertProductionEnvironment } from "./src/lib/env/production-environment";

export default function createNextConfig(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_SERVER) assertProductionEnvironment(process.env);
  return { allowedDevOrigins: ["127.0.0.1"] };
}
