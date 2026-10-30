# New flow map: onboarding through the first visit

The agreed flow for the build, from Lily's low-fi sketch, the 3d decisions and Lily's copy edits (Oct 29) in `docs/copy-draft.md`. Decisions are in `docs/decisions.md`.

Every screen has a "Talk to a person" help link, which opens the help panel, and the banner "Demo prototype: don't enter real information". All data is made up. Coverage, payment, messages and the visit are simulated, with one small line at the bottom of a page where something is simulated. The design rules every screen follows (fit, colour, progress, the desktop panel, motion) are in the build brief's design pass, section 4. Data loads with skeleton screens, not loading text. The AI always says "we", never "I".

## Fewer screens, fewer questions before value

Counts are for an insured patient. Self-pay patients answer the same number: "Do you have Medicaid or Medicare?" takes the plan's place.

| Moment | Today (walk) | New flow |
|---|---|---|
| Learn I'm covered (insured) or see the price (self-pay) | after 7 | after 4 (self-pay: 3) |
| See who I'd see | after 9 | after 8 |
| See the full cost and cancellation policy | after 20 | after 10 |
| Booked (card entered) | after 21 | after 15 |
| Screens before "You're booked" | 8 pages, plus a celebration screen | 5 |

## How the copy draft maps to this flow

Lily merged three screens into screen 1 and three into screen 5, so the copy draft's section numbers differ from these screen numbers.

| Screen here | Copy draft sections |
|---|---|
| 1. Let's get you care | 1, 2 and 3 |
| 2. What's going on? | 4 |
| 3. Here's what we understood | 5 |
| 4. Your provider | 6 |
| 5. Book your visit | 7, 8 and 9 |
| 6. You're booked | 10 |
| 7. Your first visit | 11 |
| 8. Inbox: check-in invite | 12 |
| 9. Pre-visit check-in | 13 |
| 10. Clinician view | 14 |
| 11. Inbox: reminders and join | 15 |
| 12. Demo controls | 16 |

## Part 1: Booking

### 1. Let's get you care (start, quick facts and coverage)
- **Shows at the top:** "Let's get you care", "All visits are by video" (confirm with Legion) and the one AI notice: "We use AI to help with some steps. You can talk to a person any time." On desktop, a side panel with a photo placeholder, the patient quote and the phase progress. Returning on the same device: "Welcome back. Pick up where you left off."
- **Three steps, so nothing scrolls on a phone:** date of birth and Texas; then insurance on its own; then the safety and hospital questions. Progress is one bar in four segments across the booking screens, one per phase (About you, What's going on, Your provider, Book), with the phase name as a small label above the heading
- **Asks:** date of birth; "Will you be in Texas for your visits?" (yes or no); "Do you have health insurance?" (yes or no; "No" is self-pay); the plan, if insured, or "Do you have Medicaid or Medicare?" (yes or no), if self-pay; then two direct questions: "Are you thinking about harming yourself or others?" and the hospital-stay question (confirm with Legion's clinical team). Explanations are hint text under each question, not expanding cards
- **Coverage inline:** once a plan is picked, "You're covered. Your plan is in network. Most patients pay $0 to $40 a visit." shows under the field (from Legion's current flow; coverage check simulated). Plan names are text, with no insurer logos. Right after "You're covered", the proof moment: how many Texas clinicians take the plan, the earliest visit and the typical cost (demo numbers). Self-pay sees the price inline: $250 for the first visit, $150 for follow-ups. "I don't see my plan" opens the full plan list with search first; only if the plan still isn't there does it offer self-pay or a person
- **Rules, not AI:** every one-tap answer acts as soon as it's tapped: "No" to Texas, Medicaid or Medicare (from the plan list or the self-pay question) and "Yes" to the hospital stay go straight to their kind screen-out; "Yes" to the safety question goes straight to the crisis path. Under 18 is checked on Continue
- **Questions so far:** 6
- **Fixes:** the 34.8% drop (a test, not a fact)
- **Events:** page view on /portal/join on load; /portal/join/fit recorded when the first fact is answered; `portal.coverage.shown` with insured or self-pay; `portal.fit.submitted` with the result; `portal.fit.screened_out` with the reason; `portal.crisis.shown` with where it came from

### 2. What's going on? (AI)
- **Asks:** one question, "What's going on?". The patient can tap starter chips (Legion's full list with line icons: ADHD, Anxiety, Depression, Insomnia & sleep, PTSD, OCD, Panic disorder, Bipolar disorder, then Not sure), type, or both. Typing is the default, and the text box grows as they type; a visible mic button uses the browser's speech-to-text with live dictation ("Listening...", then each word as it's heard), and the AI doesn't talk back. "Use a simple form instead" is always there. Plain form if the AI is down
- **Unreadable input** (mashed keys): one gentle retry, then the simple form. **Someone else** ("My husband needs help"): the someone-else screen. Typed text never fills the quick facts
- **Replaces:** the conditions and needs pages
- **Questions so far:** 7
- **Events:** page view on /portal/join/conditions (keeps Legion's milestone); `portal.concern.submitted` with typed, spoken, chips or form

### 3. Here's what we understood (AI)
- **Shows:** what we understood, as chips the patient can remove or add to, in the patient's language with the standard English label behind each. One short policy line only for the concern it applies to, for example for Anxiety: "We don't prescribe benzodiazepines over 1 mg a day." (wording to confirm with Legion). "This only repeats what you told us. It isn't a diagnosis." For each concern where we don't know whether it's been diagnosed (for example, only a chip was tapped), one row: "Have you been diagnosed with {concern}?" Yes / No / Not sure. One small double-check row for anything that doesn't match screen 1, with the same rules. "Start over" goes back one step
- **Questions so far:** 8
- **Events:** page view on /portal/join/needs (keeps Legion's milestone); `portal.concern.confirmed` with whether it was corrected

### 4. Your provider
- **Shows:** one recommended made-up provider first, with full name and credential and a reason ("Why we recommend Alex Rivera, PMHNP: treats ADHD · takes your plan · available Thursday"; self-pay leaves out "takes your plan"). "Video visit · about 60 minutes" (from Legion's current flow). A few made-up times; no calendar integration. A one-sentence summary at the top, like "Aetna providers in Texas for anxiety". Tapping a provider expands it to show its own availability as a short day strip. "See more providers" opens a list of provider cards, each with a reason line and the next available time, the recommended one pinned at the top, three at a time with "Show more providers". "Tell me if an earlier time opens" with a simulated notification. No loading box
- **Fixes:** the 36.6% drop (a test, not a fact)
- **Questions so far:** 10 (a provider and a time)
- **Events:** page view on /portal/join/match; `portal.provider_selected` with whether it was the recommended one; `portal.provider.reservation.created`; `portal.earlier_time.requested`

### 5. Book your visit (two steps: details, then payment)
- **Visit card:** two or three labelled rows (date and time, who they're seeing, video visit) on a white card, with "What if I cancel?" inside it. Cost shows once: in the desktop panel, and on the Details step on mobile. Field labels sit inside the inputs
- **Summary card at the top:** the visit, the cost (insured $0 to $40; self-pay $250 first visit, $150 follow-ups), when they're charged (insured: for what insurance doesn't cover, about 5 days after the visit; self-pay: after the visit), "Free to cancel up to 48 hours before", and "What if I cancel?" with Legion's full policy, including the 10-minute no-show rule. All from Legion's current flow. Cost shows before the card fields
- **Your details (step 1):** name, email, mobile phone. "This email already has an account" offers sign-in and keeps progress
- **Payment (step 2):** "You won't be charged now." A collapsed visit summary above the payment card (date, provider, video visit) that opens inside the same card. The card number on its own row, then expiry, security code and ZIP. Payment simulated, noted in one line at the bottom. Right before "Book my visit": the notices for Terms, Privacy, the HIPAA notice and how we use AI as links, and one "I consent to treatment" checkbox (a proposed pattern, for Legion's counsel)
- **Button:** "Book my visit"
- **Saves progress** to Supabase when the details section is complete, on the same device
- **Fixes:** the 20.4% drop (a test, not a fact)
- **Questions so far:** 15 (name, email, phone, consent, card)
- **Events, one per step so combining the pages doesn't hide where people drop:** page view on /portal/join/patient when the details step shows; `portal.onboarding.userCreated` when details are saved, which links the session to the person; page view on /portal/join/payment when the payment step shows; `portal.payment.method_added`; `portal.appointment.confirmed`

### 6. You're booked
- **Shows:** a compact confirmation card with the date, time, provider and the next step. "We'll send you a reminder before your visit." "Add to calendar" with the Google, Apple and Outlook logos in one row (icons only on mobile), which actually work: Google as a link, Apple and Outlook as a calendar file. On desktop, the side panel slides away so the booked moment has the full screen. "Go to my visit page". The booking questions end here
- **Events:** `portal.calendar.added` with which calendar

## Part 2: Booked to first visit

### 7. Your first visit (portal)
- **Portal:** the visit page and the inbox are one portal, with Visit, Inbox and Profile as a bottom tab bar on mobile and a left sidebar on desktop. Profile is only an entry point. Milestone cards with a small "Completed" tag (for example booked, check-in done, first visit)
- **Shows:** the visit with a calendar preview and "Add to calendar", what to expect (about 60 minutes, somewhere quiet and private), reschedule, cancel, and an inbox. The optional pre-visit check-in card: "About 5 minutes. Your provider can spend more of your visit on you. You can skip it." It opens any time after booking. The 72-hour reminder is a nudge, not a lock. "Demo: skip to 72 hours" sits beside the visit card, then moves on to 24 hours and 1 hour. Reschedule and Cancel are text-style buttons, and both show Legion's 48-hour policy first. Reschedule books the new time straight away, since the details and card are done
- **Events:** `portal.visit_page.viewed`

### 8. Inbox: check-in invite
- **Shows:** in the portal's in-app inbox, labelled "Also sent to your email and phone (demo)". Nothing real is sent. The message includes the AI sentence: "We use AI to help with some steps. You can talk to a person any time."
- **Events:** `portal.intake.invited`

### 9. Pre-visit check-in (AI, built fully)
- **Shows:** one question at a time, form-style, not chat bubbles. 6 starting questions (confirm with Legion's clinical team); the AI writes each next question from the answers so far, 5 to 8 in all. One stepper shows progress. Type, or tap the mic icon inside the answer box (the same live dictation as screen 2); the answer box opens to about 6 or 7 lines, then scrolls inside. "Next" is the primary button, with "Skip this question" under it, and a small "Skip the check-in" link at the bottom; skipping never blocks the visit. Never advice or a diagnosis. A topic already covered is confirmed and extended, not re-asked. One gentle note after two skips in a row. A soft inline note for questions we can't answer here. At the end, "Did we get your medications right?", shown as the patient said them or as heard, with "Yes, that's right" as the primary button, "Fix something" under it and the "Skip the check-in" link at the bottom; when what we heard isn't a real drug, "Did you mean {drug}?" so the patient decides; when it's a real drug that doesn't fit, "Can you check the name of this medication?" with no other drug suggested. A medication question gets "We'll pass your question to your provider." If the patient says they're under 18, it stops with a calm message (confirm with Legion's clinical and legal team). Crisis words or the AI flag stop it and go to the crisis path. Plain form if the AI is down
- **Events:** `portal.intake.started`; `portal.intake.completed` with questions answered; `portal.intake.skipped`; `portal.intake.fallback_used`; AI cost per check-in

### 10. Clinician view (AI summary)
- **Leads with:** what a doctor scans first: the safety flag if there is one (the quote and the link), the concern in one line with its source link, and current medications. Everything else is behind "All answers", a text-style button. The page is centred
- **Shows:** a one-page structured summary, like a clipboard. Safety and eligibility flags at the top. Sections (confirm with Legion's clinical team): main concern in the patient's words, what's been happening, past mental health care, medications (current and recently stopped), sleep, other health and allergies, goals for the visit, unclear answers. Each line links to the answer it came from, and the summary uses only what the patient said. A side panel shows all questions and answers. "AI summary for clinician review. Not a diagnosis."
- **Where the data lives:** in the patient's browser, so this view works on the same device. "Load a sample check-in" shows a clearly labelled made-up example
- **Events:** `portal.intake.summary_viewed`

### 11. Inbox: reminders and join
- **Shows:** 24-hour and 1-hour reminders in the in-app inbox and on the calendar preview, with reschedule and one-tap "Join visit". Labelled "Also sent to your email and phone (demo)"
- **Events:** `portal.reminder.viewed`; `portal.visit.joined`

### 12. Demo controls
- **Shows:** a small "Demo controls" button pinned in a corner of every portal and clinician screen (bottom left on desktop; clear of the tab bar on mobile). It opens a panel, a sheet on mobile, with "Mark visit completed", "Mark no-show" and switching between the patient portal and the clinician view. A no-show shows the unhappy path on the visit page: "You missed your visit. Want to book a new time?" with "Reschedule" and the no-show fee line from Legion's current flow. The no-show screen shows the $250 fee for a missed first visit, since the demo visit is a first visit
- **NPS:** once the visit is marked completed, a small dialog in the corner of the portal: "How was your first visit?" 0 to 10. Never during onboarding. A high score can lead into asking for a review. `portal.visit.rated` with the score only
- **Events:** `portal.visit.completed` with whether the check-in was done (the north-star event); `portal.visit.no_show`

## Side paths

- **Screened out kindly:** from screen 1 (under 18, not in Texas, Medicaid or Medicare, or a hospital stay in the past year). One calm screen with the right resources for the reason. Logs the reason, which the north star's denominator needs
- **Crisis path:** from screen 1 ("Yes"), or in any free-text step when the word list or the AI flag catches it. Stops immediately. "Call 988" is the primary button, with "Text 988", "Call 911" and "Talk to a person" as text-style buttons under it (one tap on phones; numbers shown clearly on desktop), and the "I'm safe" checkbox and Continue on their own at the bottom. "Talk to a person" at Legion (who answers and when, to confirm with Legion). The AI can only escalate. The patient continues only after confirming they're safe (confirm with Legion's clinical team), and the check stays on after that. Versions: immediate danger shows "Call 911" first, with "Call or text 988" under it; being hurt by someone else pauses the check-in and shows safety resources ("Call the hotline" primary, "Text the hotline" and "Call 911" under it) and a "Leave this page" quick exit at the top, including the National Domestic Violence Hotline, with the same "I'm safe" option and a clinician flag; past risk escalates and flags the clinician (all to confirm with Legion's clinical team). If the AI crisis flag fails, the word list still runs and 988 stays in the help panel
- **Eligibility surprise:** in "What's going on?", a calm double-check and the fit check rules run again. In the check-in, a flag for a person and a calm note
- **Someone else:** from screen 2, when the patient is filling it in for another person. A calm screen: they'll need to sign up themselves, with 988 if they're worried about the person's safety, and "This is for me" to go back
- **AI down or wrong:** screens 2, 3 and 9 fall back to a plain form. Corrections and fallback use are tracked
- **Email already has an account:** from screen 5. Offer sign-in and keep progress
- **Talk to a person:** the help link on every screen, and the main button on the screen-outs. It opens the help panel everywhere. Logs `portal.help.clicked` with the screen
- **Unhappy paths:** each one is built on both sizes and linked from where it would happen. "Leave this page" on the being-hurt screen opens google.com

## Comparing with Legion's funnel

Legion's milestone names are kept and recorded where the same thing happens: start, fit check, conditions, needs, match, provider selected, reservation, details, account created and payment. The order of the questions has changed (insurance is now on screen 1), so step-to-step comparisons with Legion's funnel only hold at milestones both flows share in the same order: start, provider selected, account created and payment page.

## Open questions

- **"All visits are by video"**, the hospital-stay question, the condition policy lines, the check-in questions, the clinician summary sections, the consent and notices, and who answers "Talk to a person": all to confirm with Legion or Legion's clinical team
- **Spanish-speaking patients:** confirm with Legion whether they support them
- **Event names** above are proposals in Legion's portal.* style, fixed in the build brief
