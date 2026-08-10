import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://127.0.0.1:3000",
    ...devices["Desktop Chrome"],
    trace: "retain-on-failure",
  },
  webServer: [
    {
      name: "Supabase E2E fixture",
      command: "node src/e2e/fixtures/supabase-mock-server.mjs",
      url: "http://127.0.0.1:43123/health",
      reuseExistingServer: false,
    },
    {
      name: "Next.js",
      command: "npm run dev",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        SUPABASE_URL: "http://127.0.0.1:43123",
        SUPABASE_SERVICE_ROLE_KEY: "e2e-service-role",
        PROJECT_ACCESS_TOKEN_SECRET: "e2e-project-access-secret-at-least-32-bytes",
        PROJECT_SESSION_SECRET: "e2e-project-session-secret-at-least-32-bytes",
        RATE_LIMIT_SECRET: "e2e-rate-limit-secret-at-least-32-bytes",
      },
    },
  ],
});
