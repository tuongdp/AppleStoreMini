import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test", quiet: true });
dotenv.config({ quiet: true });

const baseURL = process.env.TEST_BASE_URL || "http://localhost:5173";

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: "chromium", testIgnore: /.*\.api\.spec\.ts/, use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", testIgnore: /.*\.api\.spec\.ts/, use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", testIgnore: /.*\.api\.spec\.ts/, use: { ...devices["Desktop Safari"] } },
    { name: "mobile-chrome", testIgnore: /.*\.api\.spec\.ts/, use: { ...devices["Pixel 7"] } },
    { name: "mobile-safari", testIgnore: /.*\.api\.spec\.ts/, use: { ...devices["iPhone 15"] } },
    {
      name: "api",
      testMatch: /.*\.api\.spec\.ts/,
      use: { baseURL: process.env.TEST_API_URL || "http://localhost:5000/api" },
    },
  ],
  globalSetup: "./tests/global-setup.ts",
  outputDir: "test-results/artifacts",
});
