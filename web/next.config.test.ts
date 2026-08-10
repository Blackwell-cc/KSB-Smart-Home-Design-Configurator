import { PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } from "next/constants";
import { expect, test, vi } from "vitest";
import createNextConfig from "./next.config";

test("fails the production-server phase before opening a listener when mandatory environment is absent", () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("SUPABASE_URL", "");

  expect(() => createNextConfig(PHASE_PRODUCTION_SERVER)).toThrowError("PRODUCTION_ENVIRONMENT_INVALID");
  expect(() => createNextConfig(PHASE_PRODUCTION_BUILD)).not.toThrow();
});
