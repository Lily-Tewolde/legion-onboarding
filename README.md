# Legion onboarding, rebuilt for an AI-native world: Lily Tewolde

> **Draft.** Lines marked [fill in] wait on the build, the walkthrough or the final numbers.

**Live:** [fill in] · **Repo:** [fill in] · **PRs:** [fill in] · **Walkthrough:** [fill in] · **AI history:** [fill in]

## How to try it

**Live:** [fill in]. Use made-up details only. The banner on every screen says so.

**The happy path, about 3 minutes:**

1. **Let's get you care:** any date of birth over 18, "Yes" to Texas, "Yes" to insurance, then pick a plan like Aetna. Answer "No" to the safety and hospital questions
2. **What's going on?:** type "I was diagnosed with ADHD and my medication ran out", or tap a chip
3. **Here's what we understood:** tap "Looks right"
4. **Your provider:** keep the recommended provider and time, and book it
5. **Your details:** a made-up name, email and phone, and the consent box
6. **Payment:** card 4242 4242 4242 4242 with any future expiry, any 3-digit code and any 5-digit ZIP, then "Book my visit"
7. **Your visit:** "Demo: skip to 72 hours", then "Start check-in" and answer a few questions
8. **Finish:** in Demo controls, open the clinician view, then mark the visit completed and rate it

**Demo controls:** on desktop, the "Demo controls" button pinned bottom left on every portal and clinician screen. On a phone, "Demo" at the top right of the portal screens, and bottom left on the clinician view. They mark the visit completed or a no-show, and switch between the patient portal and the clinician view.

**The crisis screen:** type "I don't want to be here anymore" in "What's going on?". The call and text buttons on the crisis screen are real links to 988 and 911, so look but don't tap them.

**The clinician view:** open it from Demo controls, in the same browser tab as the check-in, since the answers stay in that tab. With no check-in, "Load a sample check-in" shows a labelled example.

**Simulated:** the coverage check, payment, sign-in, the providers and their times, the inbox messages (nothing is sent) and the visit itself. The AI is real.

## The problem and the data

A Texas adult looking for psychiatric care has to get from "I need help" to a completed first visit. In Legion's last 30 days of data (to Aug 29, 2026), 5,898 sessions start onboarding and 1,403 reach the payment page (23.8%). Nothing after the payment page is measured, so no one knows how many of them end in a first visit, which is where onboarding ends.

- **Three cliffs, by rate:** fit check to conditions loses 1,912 (34.8%), the match page to choosing a provider loses 1,104 (36.6%), and patient details to account created loses 360 (20.4%)
- **Some of the fit-check drop is on purpose:** people under 18, outside Texas, on Medicaid or Medicare, or needing more support than online visits get screened out. The data can't tell how much
- **Payment isn't where people drop, as far as we can see:** every session that creates an account reaches the payment page (1,403 of 1,403). Nothing after it is tracked
- **These are browser sessions, not patients.** Every figure is an approximation of people

Every figure reproduces from Legion's data with `python3 analysis/size_funnel.py`. The full read is in `docs/data-read.md`.

## What I saw in the current flow

I walked the Texas flow by hand on Oct 28, on desktop and on my phone, in incognito, and stopped before reserving a real provider. Full notes are in `docs/flow-map.md` and `docs/step-1-findings.md`.

- I answered 7 questions before learning I was covered, 9 before seeing a provider, and 20 before seeing the full cost, fees and card requirement

| Questions answered before... | Legion today | My flow |
|---|---|---|
| Knowing I'm covered | 7 | 4 (self-pay sees the price after 3) |
| Seeing a provider | 9 | 8 |
| Seeing the full cost and cancellation policy | 20 | 10 |

- The fit check is six identical yes / no cards, and screen-out answers turn the card red
- The patient quote takes half the page on every step, even after someone has started
- The recommended provider wasn't first, and I had to scroll past a loading box to reach anyone
- Coming back, I was an "Anonymous User" with no way to sign in
- Mobile was worse: more scrolling, more red, and a back button that jumped between the top and bottom

## What I built and why

[fill in: 2 to 4 lines on what's live once the build is done]

The flow goes from "Let's get you care" to a completed first visit, in 12 screens (`docs/new-flow-map.md`):

1. **Let's get you care:** a few quick facts (date of birth, Texas, insurance), with coverage or the self-pay price shown right under the plan. Screen-outs are plain rules, never the AI
2. **What's going on?** One answer in the patient's own words, typed, spoken or tapped as chips. It replaces Legion's conditions and needs pages
3. **Here's what we understood:** the AI restates it as chips for the patient to fix, and asks only what we don't know
4. **Your provider:** one recommended provider first, with a short reason
5. **Book your visit:** two steps, your details and then payment, with the full cost and cancellation policy before the card
6. **You're booked**, then a portal with Visit, Inbox and Profile tabs, an **AI pre-visit check-in**, a **clinician view** that leads with what a doctor scans first, reminders, demo controls to finish the visit, and an NPS question only after the visit

| Step | The patient | The AI | Rules decide | A person |
|---|---|---|---|---|
| Let's get you care | Date of birth, Texas, insurance, and two direct safety questions | Nothing | Under 18, outside Texas, Medicaid or Medicare, and a recent hospital stay screen out. "Yes" to safety opens the crisis screen | "Talk to a person" on every screen |
| What's going on? | Types, speaks or taps chips | Restates it as concerns, with at most one clarifying question. A separate flag checks for crisis | A word list runs first. Over a limit, or if the AI fails, it's a simple form | 988, 911 and Legion's number on the crisis screen |
| Here's what we understood | Fixes the chips, says what's been diagnosed | Its restatement, never a diagnosis | Anything that contradicts screen 1 runs screen 1's rules again | |
| Your provider | Picks a time | Nothing | The recommended provider, from the concern, the plan and the earliest time | "Talk to a person" when there are no times |
| Book your visit | Details and consent, then a made-up card on the payment step | Nothing | Field checks. An email that's already used offers sign-in | |
| Portal | Adds it to a calendar, reads the inbox, reschedules or cancels | Nothing | When each message arrives (72 hours, 24 hours, 1 hour), and the late fee | |
| Pre-visit check-in (optional) | Answers 5 to 8 questions, typed or spoken, and confirms medications | Writes each next question, then a summary for the clinician. The crisis flag runs on every answer | 5 to 8 questions, no repeats, no doses, under 18 stops it. Medication names are matched in code | Crisis or being hurt goes to resources and a person |
| Clinician view | | The summary, with every line linked to the answer it came from | Flags are only ever shown to the clinician | The clinician reads it before the visit |
| First visit | Joins, then rates the visit | Nothing | NPS only after the visit is marked completed | The provider runs the visit (simulated, with demo controls) |

**Built fully:** the AI pre-visit check-in and the clinician summary. That's where AI does real clinical data-collection work, and it sits in the stretch from booked to first visit that Legion doesn't measure today. **Built simply:** the booking screens, which are mostly layout fixes to the measured drops.

**Safety:** a word list and a separate AI flag check every free-text answer. Either one can send the patient to crisis resources and a person, and neither can clear the other. The AI never diagnoses or gives medical advice.

All data is made up. Coverage, payment, messages and the visit are simulated, with one small demo line at the bottom of each screen where it applies.

**From Legion's current flow:** the prices (self-pay $250 for the first visit and $150 for follow-ups, and most insured patients paying $0 to $40 a visit), the cancellation and no-show policy (free up to 48 hours before; otherwise $250 for a first visit and $100 for a follow-up, and a no-show means not joining within 10 minutes), when insured patients are charged (about 5 days after the visit), the 60-minute first visit, the hospital-stay question, the conditions list (Legion's conditions page, with eight condition cards) and the three needs options in the simple form. They're credited here instead of on screen.

## Key decisions and tradeoffs

The full log, with what I rejected and when I'd revisit each one, is in `docs/decisions.md`.

1. **The fit check asks facts, not six yes / no cards.** Fewer taps and coverage much earlier. The tradeoff: a typed date of birth can be mistyped, so the age rule is tested at its edges
2. **One "What's going on?" question instead of the conditions and needs pages.** It gives the recommended provider a real reason. Those two pages lose few sessions today, so I didn't build a full chat in booking
3. **Card at booking, charged after the visit.** There's no evidence payment is where people drop, and a card protects against no-shows. Reserve-first is in what's next, to test once payment is tracked
4. **The AI check-in rolls out the way Legion rolls out Utah renewals:** clinicians check every summary for the first 250, then audit 10% of the next 1,000, with clear pause rules. The 250 and 1,000 come from Legion's Utah pilot (`docs/research.md`, question 6); the 10% and the pause rules are proposals for Legion's clinical team
5. **Tell patients about AI once, at the start,** with a "Talk to a person" link on every screen

## How I'd measure it through the first visit

- **North star:** first-visit completion within 30 days of starting. The denominator is everyone who starts, minus people the fit check screens out, with the screen-out rate tracked next to it so over-screening can't hide
- **Second metric:** median days from starting to a completed first visit
- **Guardrails:** safety (every crisis disclosure reaches resources and a person), fit, AI accuracy (how often patients correct the AI, and how often the form is used), no-shows, and AI cost
- **Events:** Legion's `portal.*` names, carried through payment, booking, reminders, joining and the visit completed, so the funnel runs to the end
- **The test:** 50/50 against the current flow. Reaching the payment page is the fastest leading indicator: at about 98 new starters per arm per day, a 3-point lift shows in about 34 days. First-visit completion has no baseline yet, so the first 30 days of measurement set it (`analysis/test-plan.md`)

## What I'd do next

From `docs/next.md`:

- **Book first, add the card later,** tested once payment success is tracked
- **An emailed sign-in link** to pick up on any device
- **Standard screeners like the PHQ-9 and GAD-7 in the check-in,** if Legion's clinical team wants them
- **A path for people helping someone else sign up**
- **The whole flow in the patient's language,** not just the chips

## Known gaps

- **Things to confirm with Legion:** the crisis copy, the hospital-stay question, what happens after "I'm safe right now", the conditions list and the policy lines. Each is marked in `docs/copy-draft.md`
- **Progress saves on the same device only.** Trigger to fix: real patients coming back on another device
- **The flow is in English, except the chips.** Trigger to fix: Legion confirms which languages it supports
- **First-visit completion has no baseline.** Trigger to fix: the first 30 days of measurement
- **Returning patients see the AI notice only if they start from the beginning.** Trigger to fix: returning patients reach the AI steps without having seen it
- [fill in: anything the build leaves out]

## How I used AI

- **Two Cowork sessions, Claude Design and Claude Code, one spec:** one Cowork session for the work (the research, the data read, the spec, the docs and reviewing every PR) and one for the competitor research; Claude Design for the visual design, over rounds of my feedback; and Claude Code for the build, in small PRs, each checked against the spec before I merged it
- **Evals before prompts ship:** a 70-case golden set and `npm run eval`. I scored 10 grader cases blind before seeing the grader's results. It agreed with me on 9 of 10 at first, and the miss was the answer key, which I corrected and logged
- **Every decision is mine,** and I edited or approved every line of copy. Where I changed an AI draft, the doc says so (for example, "Changes from the AI draft" in `docs/data-read.md`)
- **The AI history, unedited, with its index:** [fill in]


## Credits

Components adapted from my own design library (Inspo Book 01).

**Photos:** from Pexels, free for personal and commercial use under the Pexels license (`public/photos/CREDITS.md`).

| File | Shows | Used on |
|---|---|---|
| `about-you.webp` | An older man laughing on a phone call | Desktop panel, "About you" |
| `whats-going-on.webp` | A woman resting on a sofa with a laptop | Desktop panel, "What's going on" |
| `your-provider.webp` | A clinician smiling at a laptop | Desktop panel, "Your provider", and "Care that takes your plan" |
| `book.webp` | A woman with a coffee in morning light | Desktop panel, "Book", and "You're booked" |

**Logos:** Legion Health's own logo, from legionhealth.com. The insurer logos (Aetna, Blue Cross Blue Shield, Cigna, UnitedHealthcare and Oscar) are each insurer's own, from its website, and belong to their owners. The Google Calendar, Apple and Outlook marks on the calendar buttons belong to Google, Apple and Microsoft. All are used only in this prototype for Legion.

---

**Time:** [fill in]
