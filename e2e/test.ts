import { type BrowserContext, test as base } from "@playwright/test";

// Every test's browser drops PostHog requests, so test runs never reach the
// funnel. Everything else, including the AI and Supabase, is real

export async function blockAnalytics(context: BrowserContext) {
  await context.route(/posthog\.com/, (route) => route.abort());
}

export const test = base.extend({
  context: async ({ context }, provide) => {
    await blockAnalytics(context);
    await provide(context);
  },
});

export { expect } from "@playwright/test";
