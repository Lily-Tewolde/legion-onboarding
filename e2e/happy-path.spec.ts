import { expect, test } from "./test";
import { copy } from "@/copy";
import { book, checkScreen, confirm, describe, toWhatsGoingOn } from "./helpers";

// The happy path, start to a completed first visit, with the real AI: screen
// 1, "What's going on?", the confirm screen, the provider, details, payment,
// "You're booked", the visit page, the inbox, the check-in with the
// medication check, the clinician view, then the visit marked completed and
// the rating

test("a new patient books, checks in and completes their first visit", async ({ page }, testInfo) => {
  await toWhatsGoingOn(page, testInfo);
  await checkScreen(page, testInfo, "What's going on?");
  await describe(page, "I was diagnosed with ADHD years ago and my Adderall prescription ran out last month.");
  await confirm(page, testInfo);
  await book(page, testInfo);

  await page.getByRole("link", { name: copy.booked.goToVisit }).click();
  await expect(page.getByRole("heading", { name: copy.visit.title })).toBeVisible();
  await checkScreen(page, testInfo, "Your first visit");

  await page.goto("/visit/inbox");
  await expect(page.getByRole("heading", { name: copy.inbox.title })).toBeVisible();
  await checkScreen(page, testInfo, "Inbox");

  // The check-in: answer each question the AI asks until the medication check
  await page.goto("/visit/check-in");
  await expect(page.getByRole("heading", { name: copy.checkIn.title })).toBeVisible();
  await checkScreen(page, testInfo, "Check-in");
  const answers = [
    "Help with my ADHD medication and staying focused at work.",
    "Mostly okay, but I can't focus without my medication.",
    "Adderall 20 mg every morning. It ran out last month.",
    "I saw a psychiatrist for a few years. The Adderall helped.",
    "About seven hours a night.",
    "No allergies, nothing else.",
    "Nothing else.",
    "No.",
  ];
  const box = page.locator("#check-in-answer");
  const medications = page.getByRole("heading", { name: copy.checkIn.medsTitle });
  for (const answer of answers) {
    await expect(box.or(medications)).toBeVisible({ timeout: 45_000 });
    if (await medications.isVisible()) break;
    await box.fill(answer);
    await page.getByRole("button", { name: copy.checkIn.next }).click();
    await expect(box).toHaveValue("", { timeout: 45_000 }).catch(() => {});
  }
  await expect(medications).toBeVisible({ timeout: 45_000 });
  await checkScreen(page, testInfo, "Did we get your medications right?");
  await page.getByRole("button", { name: copy.checkIn.medsYes }).click();
  await expect(page.getByText(copy.checkIn.done)).toBeVisible({ timeout: 60_000 });
  await checkScreen(page, testInfo, "Check-in done");

  await page.goto("/clinician");
  await expect(page.getByText(copy.clinician.label)).toBeVisible();
  await expect(page.getByText(/Adderall/).first()).toBeVisible();
  await checkScreen(page, testInfo, "Clinician view");

  // The visit happens: marked completed from the demo controls
  await page.goto("/demo");
  await page.getByRole("button", { name: copy.demo.markCompleted }).click();
  await expect(page.getByText(copy.demo.markedCompleted)).toBeVisible();
  await page.goto("/visit");
  await expect(page.getByText(copy.visit.done)).toBeVisible();
  await checkScreen(page, testInfo, "After the visit");

  await page.getByRole("button", { name: "9", exact: true }).click();
  await expect(page.getByText(copy.nps.reviewAsk)).toBeVisible();
});
