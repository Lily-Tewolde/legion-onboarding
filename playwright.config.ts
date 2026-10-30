import { defineConfig } from "@playwright/test";

// The test scripts: the happy path and every unhappy path, each screen checked
// for fit and accessibility as it's reached (e2e/helpers.ts). Three sizes:
// 390 x 844 and 390 x 700 for phones (the smaller is the fit rule from the
// design pass), and 1440 x 900 for desktop.
//
// By default this builds the app and serves it on port 3300 with .env.local,
// so the AI and Supabase calls are real; PostHog is blocked (e2e/test.ts), so
// test runs never reach the funnel. BASE_URL points the tests at
// a running app instead, like a preview. Uses the installed Chrome, so there's
// no browser download

const port = 3300;
const baseURL = process.env.BASE_URL ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: "e2e",
  timeout: 180_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  // Each test is a new visitor, but the AI limits are shared, so not too many at once
  workers: 3,
  // One retry, for the odd slow Chrome start; a retried pass shows as "flaky"
  retries: 1,
  reporter: [["list"]],
  use: {
    baseURL,
    channel: "chrome",
    trace: "retain-on-failure",
    actionTimeout: 20_000,
  },
  projects: [
    { name: "phone-844", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: "phone-700", use: { viewport: { width: 390, height: 700 }, isMobile: true, hasTouch: true } },
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npm run build && npm run start -- -p ${port}`,
        url: baseURL,
        timeout: 300_000,
        reuseExistingServer: true,
      },
});
