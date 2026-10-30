# Code review: main and open PRs #23, #25, #26, #27

Reviewed on Oct 30, 2026, read-only. This covers bugs, security (secrets, and patient text reaching logs or PostHog), accessibility, dead code, and mismatches with `docs/build-brief.md`. Findings are in severity order.

**Refs reviewed:**

| Ref | What it is |
|---|---|
| `origin/main` (4ad626a) | main |
| `origin/build/10-design` | #23, the design pass |
| `origin/test/11-test-scripts` | #25, the e2e tests |
| `origin/build/12-insurer-logos` | #26, insurer logos |
| `origin/docs/consent-reversal` | #27, docs only |

**How to read the tags and line numbers:**
- Line numbers are on #23 (`origin/build/10-design`) unless a finding says main.
- **Seen**: a reviewer would notice it by clicking the live link, reading the README or the PRs, or doing a basic keyboard or data check.
- **Code**: you'd only find it by reading the code.

## High

### 1. "Leave this page" leaves the patient's words one Back away
**Seen if tested. Main and #23.**
- `src/app/help-now/being-hurt/LeaveThisPage.tsx:14` calls `window.location.replace("https://www.google.com")`. That replaces only the being-hurt page in the browser history.
- The crisis screen is reached by `router.push` from `/join/whats-going-on` (`src/app/join/whats-going-on/WhatsGoingOnForm.tsx:165`).
- What the patient typed stays in `sessionStorage` under `lh_whats_going_on.text` (`src/lib/whats-going-on/stored.ts:29`), and the quick exit never clears it.
- So pressing Back on Google opens "What's going on?" with the person's description of being hurt still filled in.
- The brief (:149) asks that the quick exit "replaces this one in the browser history", and the code does that. It isn't enough to hide what was typed.

### 2. Arrow keys on Yes/No questions trigger screen-outs and the crisis page
**Seen. Main and #23.**
- `src/components/SegmentedControl.tsx:43` uses native radios with `onChange={() => onChange(option.value)}`.
- The parent passes that straight to `tap()`, which calls `useLeave` (`src/lib/fit/use-leave.ts:15-30`) and navigates right away.
- With native radios, arrow keys change the selection. So:
  - arrowing to "No" on "Are you in Texas?" opens the not-in-Texas screen;
  - arrowing to "Yes" on the safety question opens `/help-now`.
- Affected: `src/app/join/FitStepForm.tsx:267` (Texas), `:288` (safety), `:300` (hospital) and `:425` (Medicaid), and `src/app/join/confirm/ConfirmForm.tsx:330`. On main: `FitStepForm.tsx:207, 228, 240, 350`.
- Each accidental change also saves `fit_result` on the server and fires `portal.fit.screened_out` or `portal.crisis.shown`, which skews the screen-out rate.
- WCAG 3.2.2 (On Input).

### 3. Anyone can read and overwrite another person's details with just their email
**Code. Main and #23.**
- `src/app/api/join/sign-in/route.ts:23-25` links any existing person to the current visitor's session:
  ```ts
  const person = await findPersonByEmail(parsed.data.email);
  if (!person) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await updateSession(visitorId, { person_id: person.id });
  ```
- After that:
  - `/visit/profile` (`src/app/visit/profile/page.tsx:28-36`) shows that person's full name, email and phone.
  - Saving the details again calls `updatePerson(session.person_id, ...)` (`src/app/api/join/details/route.ts:34`), which overwrites their name, email, phone and `consented_at`.
  - The 404 vs 200 reply, and the `email_taken` reply, tell anyone whether an email is registered.
  - `identify(personId)` merges both visitors into one PostHog person.
- Sign-in is labelled as simulated and the data is made up, but a reviewer may type real details. The #25 test U14 depends on this behaviour.

### 4. Consent is given before the terms notice is shown (#23)
**Seen. PR #27 points this out itself.**
- The consent checkbox stays on details (`src/app/join/book/DetailsForm.tsx:186-193`, comment at :18-20).
- The terms and privacy notice moved to payment (`src/app/join/book/payment/PaymentForm.tsx:146-147`).
- `consented_at` is saved on details (`src/app/api/join/details/route.ts:31`), so the person consents before they've seen the notice.
- This contradicts:
  - the merged decision in #24 ("Keep the privacy notice and consent on the details step");
  - `docs/decisions.md:903-907`;
  - main's `docs/new-flow-map.md:70`.
- #23's own `docs/copy-draft.md:291-293` and `docs/new-flow-map.md:72` put both on payment, so the docs disagree with each other too.

### 5. The README on main is still a draft
**Seen.**
- `[fill in]` remains for Live, Repo, PRs, Walkthrough, AI history, "How to try it", "What I built" and Demo controls (`README.md:3-13, 52`).
- The brief requires two things the README doesn't have:
  - the credit line "Components adapted from my own design library (Inspo Book 01)." (brief :31);
  - photo credits (brief :122).
- It describes the checkout as on one page, but the brief (:104) asks for two steps: details, then payment.

### 6. A placeholder patient quote shows on every desktop screen (#23)
**Seen.**
- `src/copy.ts:53-54` holds `quote: "[A short quote from a real Legion patient]"` and `quoteNote: "Placeholder: Legion to supply"`.
- They're shown in a dashed box at `src/components/PathPanel.tsx:113-116`, on every screen that has the desktop panel.

### 7. The tracking can't measure the one metric
**Seen by a data reviewer.**
- **Wrong denominator in `analysis/metrics.md:10`:** it defines first-visit completion as "Patients who attend their first visit / Patients who booked one". The brief (:19) and `docs/decisions.md:82-84` define the denominator as everyone who starts, minus fit-check screen-outs, within 30 days.
- **The #25 PostHog funnel** (`$pageview /portal/join` through `portal.visit.completed`) doesn't take screen-outs out, although its PR description says it matches the one metric.
- **`portal.fit.submitted` misses screen-outs:** it fires only on the last step's submit (`src/app/join/FitStepForm.tsx:172-173`). Tap screen-outs and under-18 leave through `src/lib/fit/use-leave.ts:17-22`, which never fires it.
  - So in practice `result` is always `"eligible"`.
  - And the drop from step 1 to step 2 mixes screen-outs with people who quit.
- **Sign-in users drop out of the funnel:** `portal.onboarding.userCreated` fires only `if (created)` (`src/app/join/book/DetailsForm.tsx:71`). Someone who uses "Sign in to continue" can book and finish a visit but still falls out at step 5.

## Medium

### 8. Health data goes to PostHog on an identified person
**Code. Matches brief §5, so this is a judgement call.**
- Two events carry health data:
  - `portal.concern.confirmed` sends `labels`, the patient's mental-health concerns (`src/app/join/confirm/ConfirmForm.tsx:173`);
  - `portal.crisis.shown` sends `kind`, the crisis type (`src/app/join/whats-going-on/WhatsGoingOnForm.tsx:161`, `src/app/visit/check-in/actions.ts:44`).
- Both end up on a person once `identify()` runs after details are saved.
- In `src/lib/analytics/events.ts`, `portal.crisis.shown` types `kind` as `string | null`. So the file's claim that only fixed values can be sent isn't enforced for this field. Typing it as `CrisisKind | null` would enforce it.

### 9. On phones, some sheets have no close button a screen reader can reach (#23)
**Code.**
- `src/components/Sheet.tsx:125` hides the Close button below 768px (`hidden ... md:flex`). On phones that leaves only dragging, tapping the backdrop, or Escape.
- Two sheets have no close control of their own:
  - the clinician's "All answers" sheet (`src/app/clinician/ClinicianView.tsx:198-212`);
  - the cancelled-visit state (`src/app/visit/VisitActions.tsx:64-67`).
- WCAG 2.1.1 and 4.1.2.

### 10. Errors aren't announced and focus doesn't move to them
**Seen with a screen reader. Main and #23 unless noted.**
- Empty "What's going on?": `src/app/join/whats-going-on/WhatsGoingOnForm.tsx:119-121` sets the message, and `:242` and `:291` render it, with no focus move and no live region.
- The simple form: `WhatsGoingOnForm.tsx:326-328` and `:339-341`. The "need" error at `:418` has no `id` and isn't linked to its list.
- The confirm screen: `src/app/join/confirm/ConfirmForm.tsx:146-148`.
- The "I'm safe" checkbox: `src/app/help-now/SafeToContinue.tsx:39-41` with `src/components/Checkbox.tsx:56`. Focus stays on Continue.
- Consent: `src/app/join/book/DetailsForm.tsx:122` and `:186` move focus to `<div id="consent" tabIndex={-1}>`, not to the checkbox, so its error isn't read.
- "Email already used" is a regression in #23: it's now a plain field error (`DetailsForm.tsx:172`), where main used a `role="alert"` block (`CheckoutForm.tsx:176` on main).
- WCAG 3.3.1 and 4.1.3.

### 11. Some choice lists don't work with arrow keys (#23)
**Code.**
- These use `<button role="radio">` with no arrow-key handling, and each option is its own Tab stop:
  - `src/app/join/FitStepForm.tsx:383-399` (plan list)
  - `src/app/join/plan-search/PlanSearch.tsx:134-154`
  - `src/app/join/provider/Availability.tsx:27-47` and `:50-69`
  - `src/app/visit/check-in/MedicationCheck.tsx:143-162`
- Picking Medicaid or Medicare leaves the page (`FitStepForm.tsx:390`, `PlanSearch.tsx:57-58`).
- A link and an error message sit inside the plan radiogroup (`FitStepForm.tsx:400-409`).
- WCAG 4.1.2.

### 12. Placeholder text fails contrast (#23)
**Seen with a contrast check.**
- `placeholder:text-line-control` (#8590a2) is 3.23:1 on white.
- Set at `src/components/Dictate.tsx:111` and `src/components/TextField.tsx:73`.
- It shows in the example text on "What's going on?" (`WhatsGoingOnForm.tsx:231`) and in the check-in (`src/app/visit/check-in/CheckInFlow.tsx:184`).
- WCAG 1.4.3.

### 13. The AI cost limits can be dodged
**Code. Main and #23.**
- **Simple-form check-in:** with `form: true`, every answer from `checkFrom` gets a crisis-flag AI call, and `checkLimits` is skipped (`src/lib/check-in/step.ts:44, 54-60`). One request can make more than 10 paid calls with no cap.
- **Cookie reset:** the per-visitor hourly limit is keyed on the visitor cookie, and `src/proxy.ts` issues a new cookie to any request without one. `src/app/api/ai/whats-going-on/route.ts:25-37` doesn't require a session either.
- **Daily cap:** `src/server/ai-calls.ts:42-47` sums `cost_usd` from a plain `select` with no paging. Supabase's API returns at most 1,000 rows by default, so after about 1,000 AI calls in a day the total is undercounted and the cap stops working. I didn't check this project's max-rows setting.
- **Race:** `checkLimits` counts and then calls, so parallel requests all pass the hourly check.

### 14. Answering screen 1 again changes a booked visit
**Code. Main and #23.**
- `src/app/api/join/fit/route.ts:57-65` updates `fit_result`, `pay_method` and `plan_id` without checking `booked_at`.
- A booked patient who opens `/join` and answers "under 18":
  - gets `fit_result = screened_out`;
  - is redirected out of the portal by `missingFor`;
  - but the booking stays in the database and the funnel still counts it.
- Changing the plan instead leaves them booked with a provider who may not take it.

### 15. A reserved time can be booked after it has passed
**Code. Main and #23.**
- `src/app/api/join/book/route.ts:18-22` only checks that `slot_start` exists.
- A visitor who reserves a time, leaves, and comes back the next week through "Welcome back" can finish payment and book a visit in the past.

### 16. The demo controls can count a completed visit twice
**Code. Main and #23.**
- `src/components/DemoControls.tsx:41` and `src/app/demo/DemoControls.tsx:41` fire `portal.visit.completed` on every click.
- Clicking completed, then no-show, then completed counts the one metric twice.
- `src/app/api/demo/outcome/route.ts:11-21` has no environment guard, and the outcome can be set before the visit time.

### 17. The double-save fix in #23 only covers unchanged details
**Code.**
- `src/app/join/book/DetailsForm.tsx:44-52` returns the in-flight save only when the name, email and phone are the same (`inFlight.current?.key === key`).
- If the visitor edits a field while the first save is still running, a second POST runs at the same time. On the server, `src/app/api/join/details/route.ts:24-37` reads the session and then creates the person:
  - same email: a false "email already used";
  - a different email: an orphan `people` row.
- The fix belongs on the server: when the conflicting person is the one this session just created, update it.

### 18. The insurer logos (#26) contradict the brief, and the credits file is wrong
**Seen.**
- The brief says "as text only, no logos" (:90) and "plan names as text, no insurer logos" (:123). `docs/new-flow-map.md:44` says the same.
- #26 adds `src/components/InsurerLogo.tsx` and five SVGs in `public/insurers/`. It logs the change in `docs/decisions.md`, but the brief and the flow map aren't updated.
- The logos are trademarks downloaded from each insurer's site, and they're now in a public repo.
- `public/photos/CREDITS.md` (#23 and #26) lists `about-you.jpg`, `whats-going-on.jpg`, `your-provider.jpg`, `book.jpg` and `legion-logo.png`. The repo has `.webp` files and `public/legion-health-logo.png`.

### 19. The terms notice has no links
**Seen. Main and #23.**
- The notice is plain text (`src/app/join/book/payment/PaymentForm.tsx:147` on #23). It names a "HIPAA Notice of Privacy Practices" (`src/copy.ts:305`) with no page behind it.
- `docs/copy-draft.md:292-293` says each item is a link and adds "Read the consent". That string isn't in `src/copy.ts`.

## Low

### 20. Smaller accessibility issues (#23)
- **The 0–10 rating** (`src/app/visit/NpsDialog.tsx`):
  - the buttons are named only "0" to "10" (`:57-72`), and the "0 = Not good" and "10 = Great" labels (`:73-76`) aren't linked to them;
  - clicking a score removes the button, so focus drops to the page;
  - the thank-you `role="status"` is added together with its text (`:85, :99, :107`), so screen readers often skip it.
- **"Q2" button:** its `aria-label` is "See answer 2" while it shows "Q2" (`src/app/clinician/ClinicianView.tsx:120`), so voice control won't match it. WCAG 2.5.3.
- **No focus outline** after jumping to an answer: `outline-none` on a focusable `li` (`ClinicianView.tsx:203`). WCAG 2.4.7.
- **Hover contrast:** 14px `text-action` on `hover:bg-tag` is 4.37:1 (`ClinicianView.tsx:122`).
- **Text below the 16px floor** decided on Oct 29 (`docs/decisions.md`). These use `text-label` (14px):
  - `src/components/TextField.tsx:58`
  - `src/components/SegmentedControl.tsx:70`
  - `src/app/visit/check-in/CheckInFlow.tsx:224`
  - `src/app/visit/PortalNav.tsx:28`
  - `src/app/join/book/payment/PaymentForm.tsx:147`
- **Heading order:**
  - on desktop, the panel's `<h2>` (`src/components/PathPanel.tsx:71`) comes before the page `<h1>` (`src/components/Screen.tsx:56-62`);
  - the section `<h2>`s at `ClinicianView.tsx:239` sit inside a sheet whose title is also an `<h2>`.
- **Loading:**
  - `src/components/Skeleton.tsx:7` is hidden from screen readers with no busy state or loading announcement;
  - in the slow state, `WhatsGoingOnForm.tsx:216-223` removes the whole form, including the `<h1>`, and focus goes with it.
- **Unverified:**
  - the empty `role="status"` in `src/components/Dictate.tsx:147` is `display:none`, which some screen readers won't announce from;
  - `whitespace-nowrap` text may be clipped at 320px wide.

### 21. README wording
- "Three cliffs, by rate" lists 34.8% before 36.6% (`README.md:39`).
- "The AI never diagnoses or gives medical advice" (`README.md:63`) is an absolute guarantee the evals can only support, not prove.
- "That's where AI does real clinical data-collection work" (`README.md:61`) reads as a clinical claim.

### 22. Tool names in PR text
- The #23 PR description names "Claude Design" and "Cowork".
- `evals/grader-check-key.yaml:3` names the "Legion Cowork Session".
- CLAUDE.md says not to name the chat or tool.

### 23. Text length limits don't match
- The server accepts 2,000 characters of patient text (`src/app/api/ai/whats-going-on/route.ts:14`), but #23's screens stop at 1,000.
- The browser sends back `clarification.question` (up to 300 characters, `:20`), and it goes to the model without being checked against what the AI asked.

### 24. Error handling
- `src/app/join/book/payment/PaymentForm.tsx:68` ignores the `path` in a 409 `not_ready` reply and shows "Try again", so the visitor can loop.
- Pages and check-in routes use `getSession(...).catch(() => null)`. A Supabase outage sends the visitor back to `/join`, or returns 409 instead of a 500.
- `src/components/Sheet.tsx:47` never clears its close `setTimeout`, so `onClose` can fire after unmount.
- `src/components/useSpeech.ts:47` stops recognition in cleanup without detaching `onend` (`:69-73`). So "We didn't hear anything" can be set while the page is hidden.
- `src/lib/central-time.ts:31-34` reads the time-zone offset at the wrong instant. Times from 02:00 to 06:59 on a daylight-saving change day come out an hour off. Nothing uses those hours today.

### 25. Dead code (#23)
- **Unused copy keys in `src/copy.ts`:** `common.fromLegion`, `join.planPlaceholder`, `provider.pickTime`, `checkout.title`, `checkIn.speak`, `clinician.source`, `visit.demoControls`.
- **Exports never imported:**
  - `Camera` and `AlertCircle` (`src/components/icons.tsx:23, 45`);
  - `SummaryFlagType` (`src/lib/ai/check-in-summary.ts:72`);
  - `previousStep` (`src/lib/fit/flow.ts:22`);
  - `cardLooksValid` (used only by tests).
- **Duplicate demo controls:** `src/app/demo/DemoControls.tsx` copies the `mark()` logic in `src/components/DemoControls.tsx`, and the two have drifted (only the first resets its state when the page is hidden).

### 26. The e2e suite (#25) writes to the real database
- `playwright.config.ts` runs against whatever Supabase `.env.local` points at, using the real AI and the shared daily cap.
- `madeUpEmail()` rows are never deleted.
- `reuseExistingServer: true` on port 3300 can test a stale server.

### 27. Problems only on main, fixed by #23
These matter only if #23 doesn't merge:
- **No two-step checkout:** there's one `/join/book` page and no payment route (brief :104, :126).
- **Tags the brief rules out** (brief :133):
  - "From Legion's current flow" tags on patient screens: `src/app/join/FitStepForm.tsx:315, 339`, `src/app/join/book/page.tsx:45, 50`, `src/app/join/book/WhatIfCancel.tsx:20`, `src/app/join/provider/ProviderPicker.tsx:139`, `src/app/visit/VisitActions.tsx:58`;
  - "Demo number" tags: `src/app/help-now/page.tsx:34`, `src/app/help-now/being-hurt/page.tsx:24`, `src/components/HelpPanel.tsx:76, 82`.
- **Five strings that differ from the copy draft** (all lines in `src/copy.ts` on main):

  | Line | Main says | Copy draft says |
  |---|---|---|
  | :254 | "Use any made-up card number." | "Any made-up card works." (draft :290) |
  | :257 | "Please enter your first and last name." | "Please enter your full name." (draft :298) |
  | :310 | "That's right" | "Yes, that's right" (draft :403) |
  | :329 | ends with "See the answers." | no "See the answers." (draft :421) |
  | :17, :19 | "Demo number" / "Demo hours" | "Demo number and hours" (draft :46) |

## Checked and clean
- **No secrets** in any branch or in git history. `.env*` is ignored except `.env.example`, which has names only.
- **The Supabase secret key** is read only in `src/server/supabase.ts`, which imports `server-only`. No client file imports `@/server`.
- **Database access:** `supabase/migrations/0001_init.sql` turns on row-level security for all three tables, adds no policies, revokes `anon` and `authenticated`, and grants only `service_role`.
- **Logs:** the AI routes log only fixed reason codes (`src/app/api/ai/*/route.ts`), and the crisis check logs only the failure code (`src/lib/crisis/check.ts:23-25`). Route catch blocks log Supabase error messages, which don't include row values. No patient text reaches the logs.
- **PostHog** (`src/instrumentation-client.ts`): autocapture, session recording, automatic pageviews, heatmaps, surveys and IP are all off. No event takes free text.
- **No id from the browser is trusted.** Every route keys off the httpOnly `lh_visitor` cookie, and `providerId` and `slotStart` are checked against the server's own list (`src/app/api/join/reserve/route.ts:24-29`). The exception is the sign-in path in finding 3.
- **Every number in the README reproduces** from `analysis/size_funnel.py`, `analysis/check_funnel.py` and `analysis/test_plan.py`. I ran them on a copy of main.
- **Events:** every event in brief §5 exists in `src/lib/analytics/events.ts` with the right properties.
- **Images:** icons and insurer logos are hidden from screen readers, and the photos have alt text.
- **Dialogs:** the sheet is a native modal `<dialog>` with a label and Escape.
- **Reduced motion** is handled.

## How this was checked
- Code was read with `git show` against the refs above.
- Findings 1, 2, 3, 4, 6, 7, 13 and 14 were re-read in the source after they were found.
- The accessibility findings come from reading the code, not from a screen-reader run.
