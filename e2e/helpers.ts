import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, type TestInfo } from "@playwright/test";
import { copy } from "@/copy";

// Shared steps and checks for the test scripts. Strings come from src/copy.ts,
// so a copy change doesn't break a test

// Every screen, as it's reached:
// - Fit: nothing scrolls sideways, and the primary button (the one filled
//   blue button) is inside the first screen. On phones that's above the
//   portal's tab bar where there is one; on desktop it's inside 1440 x 900
// - Accessibility: no WCAG 2.1 A or AA problems axe can find
export async function checkScreen(page: Page, testInfo: TestInfo, name: string, { loading = false } = {}) {
  await settle(page, loading);
  const fit = await page.evaluate(() => {
    window.scrollTo(0, 0);
    const shown = (element: Element) => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return box.width > 0 && box.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    };
    const primary = [...document.querySelectorAll("button, a")].find(
      (element) => shown(element) && /(^|\s)bg-action(\s|$)/.test(element.className),
    );
    const tabBar = [...document.querySelectorAll("nav")]
      .filter(shown)
      .map((nav) => nav.getBoundingClientRect().top)
      .filter((top) => top > innerHeight / 2);
    const limit = tabBar.length ? Math.min(...tabBar) : innerHeight;
    const box = primary?.getBoundingClientRect();
    return {
      sideways: document.documentElement.scrollWidth > innerWidth,
      primary: primary?.textContent?.trim() ?? null,
      inView: box ? box.top >= 0 && box.bottom <= limit + 0.5 : null,
      bottom: box ? Math.round(box.bottom) : null,
      limit: Math.round(limit),
    };
  });
  expect(fit.sideways, `${name}: scrolls sideways`).toBe(false);
  if (fit.primary !== null) {
    expect(fit.inView, `${name}: "${fit.primary}" ends at ${fit.bottom}px, past ${fit.limit}px`).toBe(true);
  }

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const problems = results.violations.map(
    (violation) => `${violation.id} (${violation.impact}): ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
  );
  expect(problems, `${name}: accessibility`).toEqual([]);
  testInfo.annotations.push({ type: "screen", description: `${name}: fits, no accessibility problems` });
}

// Lets any loading skeleton and the arrival motion finish, so nothing is
// checked halfway through fading in
async function settle(page: Page, loading: boolean) {
  await page.waitForLoadState("load");
  // A screen checked while it's meant to be loading keeps its skeleton
  if (!loading) await expect(page.locator(".shimmer, [aria-busy=true]")).toHaveCount(0);
  await page.evaluate(async () => {
    const finite = document.getAnimations().filter((animation) => animation.effect?.getTiming().iterations !== Infinity);
    await Promise.race([Promise.all(finite.map((animation) => animation.finished.catch(() => {}))), new Promise((done) => setTimeout(done, 3000))]);
  });
  await page.waitForTimeout(300);
}

export const isDesktop = (testInfo: TestInfo) => testInfo.project.name === "desktop";

// A yes-or-no question by its wording
export async function answer(page: Page, question: string, choice: string) {
  await page.getByRole("group", { name: question }).getByText(choice, { exact: true }).click();
}

export const madeUpEmail = () => `test.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`;

// Screen 1: date of birth and Texas
export async function aboutYou(page: Page, testInfo: TestInfo, { dateOfBirth = "01151990", inTexas = "Yes" } = {}) {
  await page.goto("/join");
  await expect(page.getByRole("heading", { name: copy.join.title })).toBeVisible();
  await page.getByLabel(copy.join.dateOfBirth).pressSequentially(dateOfBirth);
  await checkScreen(page, testInfo, "About you");
  // "No" to Texas goes straight to its screen-out when tapped
  await answer(page, copy.join.inTexas, inTexas);
  if (inTexas === "No") return;
  await page.getByRole("button", { name: copy.common.continue }).click();
}

// Insurance with a plan from the list, then the proof screen
export async function insurance(page: Page, testInfo: TestInfo, plan = "Aetna") {
  await expect(page).toHaveURL(/\/join\/insurance$/);
  await answer(page, copy.join.payMethod, copy.join.withInsurance);
  await checkScreen(page, testInfo, "Insurance, plan list open");
  await page.getByRole("radio", { name: plan, exact: true }).click();
  await checkScreen(page, testInfo, "Insurance, plan picked");
  await page.getByRole("button", { name: copy.common.continue }).click();
  await expect(page).toHaveURL(/\/join\/your-plan$/);
  await expect(page.getByRole("heading", { name: copy.coverage.proofTitle })).toBeVisible();
  await checkScreen(page, testInfo, "Care that takes your plan");
  await page.getByRole("link", { name: copy.common.continue }).click();
}

// The safety question, then the hospital question
export async function safety(page: Page, testInfo: TestInfo, { harm = "No", hospital = "No" } = {}) {
  await expect(page).toHaveURL(/\/join\/safety$/);
  await answer(page, copy.join.safety, harm);
  if (harm === "Yes") return;
  await checkScreen(page, testInfo, "Safety");
  // "Yes" to the hospital question goes straight to its screen-out when tapped
  await answer(page, copy.join.hospital, hospital);
  if (hospital === "Yes") return;
  await page.getByRole("button", { name: copy.common.continue }).click();
}

export async function toWhatsGoingOn(page: Page, testInfo: TestInfo) {
  await aboutYou(page, testInfo);
  await insurance(page, testInfo);
  await safety(page, testInfo);
  await expect(page).toHaveURL(/\/join\/whats-going-on$/);
}

export async function describe(page: Page, words: string) {
  await page.getByRole("textbox").fill(words);
  await page.getByRole("button", { name: copy.common.continue }).click();
}

// The confirm screen: "No" to each diagnosis question, then "Looks right"
export async function confirm(page: Page, testInfo: TestInfo) {
  await expect(page).toHaveURL(/\/join\/confirm$/, { timeout: 45_000 });
  await expect(page.getByRole("heading", { name: copy.confirm.title })).toBeVisible();
  const questions = page.getByRole("group", { name: /^Have you been diagnosed with/ });
  for (const question of await questions.all()) {
    await question.getByText(copy.join.no, { exact: true }).click();
  }
  await checkScreen(page, testInfo, "Here's what we understood");
  await page.getByRole("button", { name: copy.confirm.looksRight }).click();
}

// The provider, details and payment, up to "You're booked"
export async function book(page: Page, testInfo: TestInfo, email = madeUpEmail()) {
  await expect(page).toHaveURL(/\/join\/provider$/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: copy.provider.title })).toBeVisible();
  await checkScreen(page, testInfo, "Recommended for you");
  await page.getByRole("button", { name: /^Book / }).click();
  await details(page, testInfo, email);
  await payment(page, testInfo);
  await expect(page).toHaveURL(/\/join\/booked$/);
  await expect(page.getByRole("heading", { name: copy.booked.title })).toBeVisible();
  await checkScreen(page, testInfo, "You're booked");
}

export async function details(page: Page, testInfo: TestInfo, email: string) {
  await expect(page).toHaveURL(/\/join\/book$/);
  await page.getByLabel(copy.checkout.name).fill("Sam Tester");
  await page.getByLabel(copy.checkout.email).fill(email);
  await page.getByLabel(copy.checkout.phone).fill("5550100199");
  await page.getByRole("checkbox").check();
  await checkScreen(page, testInfo, "Your details");
  await page.getByRole("button", { name: copy.common.continue }).click();
}

// A payment provider's published test card. The card is never sent anywhere
export async function payment(page: Page, testInfo: TestInfo, card = "4242424242424242") {
  await expect(page).toHaveURL(/\/join\/book\/payment$/);
  await page.getByLabel(copy.checkout.cardNumber).fill(card);
  await page.getByLabel(copy.checkout.expiry).fill("0829");
  await page.getByLabel(copy.checkout.securityCode).fill("123");
  await page.getByLabel(copy.checkout.zip).fill("78701");
  await checkScreen(page, testInfo, "Payment");
  await page.getByRole("button", { name: copy.checkout.bookMyVisit }).click();
}

// A whole booking with a typed answer to "What's going on?", for the tests
// that start after booking. The AI step is answered by mockUnderstood
export async function bookedVisitor(page: Page, testInfo: TestInfo) {
  await mockWhatsGoingOn(page, understood());
  await toWhatsGoingOn(page, testInfo);
  await describe(page, "I was diagnosed with ADHD and my medication ran out.");
  await confirm(page, testInfo);
  await book(page, testInfo);
}

// "What's going on?" answers from the AI step, in the route's own shape
// (src/lib/whats-going-on/step.ts), for the paths that depend on what the
// model says. The happy path uses the real model
type Flag = "age" | "state" | "insurance" | "hospital_stay" | "someone_else";
export function understood({
  status = "ok",
  flags = [] as Flag[],
  label = "ADHD" as string,
} = {}) {
  return {
    result: "understood",
    understanding: {
      status,
      clarifying_question: null,
      concerns: status === "not_understood" ? [] : [{ label, quote: "", diagnosed: "yes" }],
      need: "medication_support",
      eligibility_flags: flags.map((type) => ({ type, quote: "" })),
      chips: status === "not_understood" ? [] : [{ label, display: label }],
      diagnosed: "yes",
    },
  };
}

export async function mockWhatsGoingOn(page: Page, body: object, delayMs = 0) {
  await page.route("**/api/ai/whats-going-on", async (route) => {
    if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.fulfill({ json: body }).catch(() => {});
  });
}
