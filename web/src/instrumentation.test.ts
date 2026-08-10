import { expect, test, vi } from "vitest";

const assertProductionEnvironment = vi.fn();
vi.mock("@/lib/env/production-environment", () => ({ assertProductionEnvironment }));

test("validates the environment when the Node server instance starts", async () => {
  vi.stubEnv("NEXT_RUNTIME", "nodejs");
  const { register } = await import("./instrumentation");
  await register();
  expect(assertProductionEnvironment).toHaveBeenCalledWith(process.env);
});
