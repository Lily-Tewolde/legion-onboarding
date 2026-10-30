import { expect, test } from "./test";
import { copy } from "@/copy";
import {
  aboutYou,
  answer,
  bookedVisitor,
  checkScreen,
  confirm,
  describe,
  details,
  insurance,
  madeUpEmail,
  mockWhatsGoingOn,
  payment,
  safety,
  toWhatsGoingOn,
  understood,
} from "./helpers";
import { blockAnalytics } from "./test";

// Every unhappy path in the design handoff (boards U01 to U16). The ones that
// depend on what the AI says get the AI step's answer from a mock in the
// route's own shape, so they're the same every run. The crisis word list,
// the fit rules and everything after the AI step are real

test.describe("screen-outs", () => {
  test("U01 under 18", async ({ page }, testInfo) => {
    await aboutYou(page, testInfo, { dateOfBirth: "01152012" });
    await expect(page).toHaveURL(/\/join\/not-a-fit\/under_18$/);
    await expect(page.getByText(copy.screenOut.under18[0])).toBeVisible();
    await checkScreen(page, testInfo, "Under 18");
    // "Answered by mistake? Go back" returns to the step with the answer kept
    await page.getByRole("link", { name: copy.screenOut.goBack }).first().click();
    await expect(page).toHaveURL(/\/join$/);
  });

  test("U02 not in Texas", async ({ page }, testInfo) => {
    await aboutYou(page, testInfo, { inTexas: "No" });
    await expect(page).toHaveURL(/\/join\/not-a-fit\/not_in_texas$/);
    await expect(page.getByText(copy.screenOut.notInTexas[0])).toBeVisible();
    await checkScreen(page, testInfo, "Not in Texas");
  });

  test("U03 Medicaid or Medicare", async ({ page }, testInfo) => {
    await aboutYou(page, testInfo);
    await answer(page, copy.join.payMethod, copy.join.withInsurance);
    await page.getByRole("radio", { name: "Medicaid", exact: true }).click();
    await expect(page).toHaveURL(/\/join\/not-a-fit\/medicaid_medicare$/);
    await expect(page.getByText(copy.screenOut.medicaidMedicare[0])).toBeVisible();
    await checkScreen(page, testInfo, "Medicaid or Medicare");
  });

  test("U03 self-pay with Medicaid", async ({ page }, testInfo) => {
    await aboutYou(page, testInfo);
    await answer(page, copy.join.payMethod, copy.join.selfPay);
    await answer(page, copy.join.selfPayMedicaid, copy.join.yes);
    await expect(page).toHaveURL(/\/join\/not-a-fit\/medicaid_medicare$/);
  });

  test("U04 a hospital stay", async ({ page }, testInfo) => {
    await aboutYou(page, testInfo);
    await insurance(page, testInfo);
    await safety(page, testInfo, { hospital: "Yes" });
    await expect(page).toHaveURL(/\/join\/not-a-fit\/hospital_stay$/);
    await expect(page.getByText(copy.screenOut.hospitalStay[0])).toBeVisible();
    await checkScreen(page, testInfo, "Hospital stay");
  });
});

test("U05 the confirm screen double-checks another state", async ({ page }, testInfo) => {
  await mockWhatsGoingOn(page, understood({ status: "eligibility_check", flags: ["state"] }));
  await toWhatsGoingOn(page, testInfo);
  await describe(page, "I have ADHD. I'm living in Oklahoma for school right now.");
  await expect(page).toHaveURL(/\/join\/confirm$/);
  const recheck = `${copy.confirm.recheck.stateLead} ${copy.join.inTexas}`;
  await expect(page.getByRole("group", { name: recheck })).toBeVisible();
  await checkScreen(page, testInfo, "Double-check");
  await answer(page, recheck, copy.join.no);
  await expect(page).toHaveURL(/\/join\/not-a-fit\/not_in_texas$/);
});

test.describe("crisis", () => {
  test("U06 yes to the safety question", async ({ page }, testInfo) => {
    await aboutYou(page, testInfo);
    await insurance(page, testInfo);
    await safety(page, testInfo, { harm: "Yes" });
    await expect(page).toHaveURL(/\/help-now$/);
    await expect(page.getByRole("heading", { name: copy.crisis.title })).toBeVisible();
    await expect(page.getByRole("link", { name: copy.crisis.call988 })).toHaveAttribute("href", "tel:988");
    await checkScreen(page, testInfo, "Crisis");
    // Continue stays off until the box is ticked, then goes back with the answers kept
    const keepGoing = page.getByRole("button", { name: copy.common.continue });
    await expect(keepGoing).toBeDisabled();
    await page.getByLabel(copy.crisis.safeNow).check();
    await expect(keepGoing).toBeEnabled();
    await keepGoing.click();
    await expect(page).toHaveURL(/\/join\/safety$/);
  });

  test("U06 a crisis in what they type", async ({ page }, testInfo) => {
    await toWhatsGoingOn(page, testInfo);
    await describe(page, "Honestly some days I want to die.");
    await expect(page).toHaveURL(/\/help-now$/);
    await expect(page.getByText(copy.crisis.fromText)).toBeVisible();
    await checkScreen(page, testInfo, "Crisis from free text");
  });

  test("U07 immediate danger", async ({ page }, testInfo) => {
    await toWhatsGoingOn(page, testInfo);
    await describe(page, "I took too many pills an hour ago.");
    await expect(page).toHaveURL(/\/help-now\/immediate-danger$/);
    await expect(page.getByRole("link", { name: copy.crisis.immediate.call911 })).toHaveAttribute("href", "tel:911");
    await checkScreen(page, testInfo, "Call 911 now");
    // A way back, in case the classifier is wrong: Continue stays off until
    // "I'm safe right now" is ticked, then goes back with the words kept
    const keepGoing = page.getByRole("button", { name: copy.common.continue });
    await expect(keepGoing).toBeDisabled();
    await page.getByLabel(copy.crisis.safeNow).check();
    await keepGoing.click();
    await expect(page).toHaveURL(/\/join\/whats-going-on$/);
  });

  test("U08 being hurt by someone else", async ({ page }, testInfo) => {
    await mockWhatsGoingOn(page, { result: "crisis", kind: "being_harmed", source: "ai_flag" });
    await toWhatsGoingOn(page, testInfo);
    await describe(page, "My partner hurts me when he drinks.");
    await expect(page).toHaveURL(/\/help-now\/being-hurt$/);
    await expect(page.getByRole("button", { name: copy.crisis.beingHurt.leave })).toBeVisible();
    await checkScreen(page, testInfo, "Being hurt");
  });
});

test("U09 someone else", async ({ page }, testInfo) => {
  await mockWhatsGoingOn(page, understood({ flags: ["someone_else"], label: "Anxiety" }));
  await toWhatsGoingOn(page, testInfo);
  await describe(page, "My husband needs help with his anxiety.");
  await expect(page).toHaveURL(/\/join\/someone-else$/);
  await checkScreen(page, testInfo, "Someone else");
  // "This is for me" goes back with the words kept, and doesn't ask again
  await page.getByRole("button", { name: copy.someoneElse.forMe }).click();
  await expect(page).toHaveURL(/\/join\/whats-going-on$/);
  await expect(page.getByRole("textbox")).toHaveValue("My husband needs help with his anxiety.");
  await page.getByRole("button", { name: copy.common.continue }).click();
  await expect(page).toHaveURL(/\/join\/confirm$/);
});

test("U10 plan search, plan not covered", async ({ page }, testInfo) => {
  await aboutYou(page, testInfo);
  await answer(page, copy.join.payMethod, copy.join.withInsurance);
  await page.getByRole("link", { name: copy.join.planNotListed }).click();
  await expect(page).toHaveURL(/\/join\/plan-search$/);
  await page.getByLabel(copy.coverage.searchLabel).fill("Ambetter");
  await checkScreen(page, testInfo, "Plan search");
  await page.getByRole("button", { name: copy.coverage.stillNotListed }).click();
  await expect(page.getByText(copy.coverage.notListed)).toBeVisible();
  await checkScreen(page, testInfo, "Plan not found");
  // Self-pay goes back to insurance, so the Medicaid question is still asked
  await page.getByRole("button", { name: copy.coverage.continueSelfPay }).click();
  await expect(page).toHaveURL(/\/join\/insurance$/);
  await expect(page.getByRole("group", { name: copy.join.selfPayMedicaid })).toBeVisible();
});

test.describe("when the AI can't help", () => {
  test("U11 slow, then the simple form", async ({ page }, testInfo) => {
    await mockWhatsGoingOn(page, understood(), 60_000);
    await toWhatsGoingOn(page, testInfo);
    await describe(page, "I was diagnosed with ADHD and my medication ran out.");
    await expect(page.getByText(copy.whatsGoingOn.stillWorking)).toBeVisible({ timeout: 8_000 });
    const useForm = page.getByRole("button", { name: copy.whatsGoingOn.useForm });
    await expect(useForm).toBeVisible({ timeout: 8_000 });
    await checkScreen(page, testInfo, "AI slow", { loading: true });
    await useForm.click();
    await expect(page.getByText(copy.whatsGoingOn.formNote)).toBeVisible();
  });

  test("U12 the simple form", async ({ page }, testInfo) => {
    await toWhatsGoingOn(page, testInfo);
    await page.getByRole("button", { name: copy.whatsGoingOn.useForm }).click();
    await expect(page.getByText(copy.whatsGoingOn.formNote)).toBeVisible();
    await checkScreen(page, testInfo, "Simple form, conditions");
    // Nothing chosen asks for an answer
    await page.getByRole("button", { name: copy.common.continue }).click();
    await expect(page.getByText(copy.join.errors.required)).toBeVisible();
    await page.getByRole("button", { name: copy.conditions.Anxiety }).click();
    await page.getByRole("button", { name: copy.common.continue }).click();
    await page.getByText(copy.whatsGoingOn.needs.new_diagnosis_or_medication).click();
    await checkScreen(page, testInfo, "Simple form, need");
    await page.getByRole("button", { name: copy.common.continue }).click();
    await confirm(page, testInfo);
    await expect(page).toHaveURL(/\/join\/provider$/, { timeout: 30_000 });
  });

  test("U13 not understood, then try again", async ({ page }, testInfo) => {
    await mockWhatsGoingOn(page, understood({ status: "not_understood" }));
    await toWhatsGoingOn(page, testInfo);
    await describe(page, "asdfgh jkl");
    await expect(page.getByText(/We didn't quite catch that/)).toBeVisible();
    await checkScreen(page, testInfo, "Retry");
    // A second miss goes to the simple form
    await page.getByRole("button", { name: copy.common.continue }).click();
    await expect(page.getByText(copy.whatsGoingOn.formNote)).toBeVisible();
  });

  test("U13 the AI step fails", async ({ page }, testInfo) => {
    await page.route("**/api/ai/whats-going-on", (route) => route.fulfill({ status: 500, body: "" }));
    await toWhatsGoingOn(page, testInfo);
    await describe(page, "I was diagnosed with ADHD and my medication ran out.");
    await expect(page.getByText(copy.whatsGoingOn.formNote)).toBeVisible();
  });
});

test("U14 the email is already used", async ({ browser, page }, testInfo) => {
  const email = madeUpEmail();
  await bookedVisitorWithEmail(page, testInfo, email);

  // A second visitor with the same email
  const other = await browser.newContext({ viewport: page.viewportSize() ?? undefined });
  await blockAnalytics(other);
  const second = await other.newPage();
  await mockWhatsGoingOn(second, understood());
  await toWhatsGoingOn(second, testInfo);
  await describe(second, "I was diagnosed with ADHD and my medication ran out.");
  await confirm(second, testInfo);
  await expect(second).toHaveURL(/\/join\/provider$/, { timeout: 30_000 });
  await second.getByRole("button", { name: /^Book / }).click();
  await details(second, testInfo, email);
  await expect(second.getByText(copy.checkout.emailTaken)).toBeVisible();
  await expect(second.getByRole("button", { name: copy.checkout.signIn })).toBeVisible();
  await checkScreen(second, testInfo, "Email used");
  await other.close();
});

test("U15 the card can't be saved", async ({ page }, testInfo) => {
  await mockWhatsGoingOn(page, understood());
  await toWhatsGoingOn(page, testInfo);
  await describe(page, "I was diagnosed with ADHD and my medication ran out.");
  await confirm(page, testInfo);
  await expect(page).toHaveURL(/\/join\/provider$/, { timeout: 30_000 });
  await page.getByRole("button", { name: /^Book / }).click();
  await details(page, testInfo, madeUpEmail());
  await payment(page, testInfo, "1234");
  await expect(page.getByText(copy.checkout.errors.card)).toBeVisible();
  await expect(page).toHaveURL(/\/join\/book\/payment$/);
  await checkScreen(page, testInfo, "Card error");
});

test("U16 a missed visit", async ({ page }, testInfo) => {
  await bookedVisitor(page, testInfo);
  await page.goto("/demo");
  await page.getByRole("button", { name: copy.demo.markNoShow }).click();
  await expect(page.getByText(copy.demo.markedNoShow)).toBeVisible();
  await page.goto("/visit");
  await expect(page.getByText(copy.visit.missed)).toBeVisible();
  await expect(page.getByText(copy.visit.missedFee)).toBeVisible();
  await checkScreen(page, testInfo, "No-show");
});

test("the visit can be cancelled from the visit page", async ({ page }, testInfo) => {
  await bookedVisitor(page, testInfo);
  await page.goto("/visit");
  await page.getByRole("button", { name: copy.visit.cancel }).click();
  await expect(page.getByRole("dialog", { name: copy.visit.cancelCheck })).toBeVisible();
  await checkScreen(page, testInfo, "Cancel this visit?");
  await page.getByRole("button", { name: copy.visit.keep }).click();
  await expect(page.getByRole("dialog", { name: copy.visit.cancelCheck })).toBeHidden();
});

async function bookedVisitorWithEmail(page: Parameters<typeof bookedVisitor>[0], testInfo: Parameters<typeof bookedVisitor>[1], email: string) {
  await mockWhatsGoingOn(page, understood());
  await toWhatsGoingOn(page, testInfo);
  await describe(page, "I was diagnosed with ADHD and my medication ran out.");
  await confirm(page, testInfo);
  await expect(page).toHaveURL(/\/join\/provider$/, { timeout: 30_000 });
  await page.getByRole("button", { name: /^Book / }).click();
  await details(page, testInfo, email);
  await expect(page).toHaveURL(/\/join\/book\/payment$/);
}
