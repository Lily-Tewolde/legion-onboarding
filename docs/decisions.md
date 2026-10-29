# Decision log

One entry per decision, written the same session it's made. This becomes the spoken defence.

## 2026-10-28 · The repo holds only assignment material

- **What:** Everything committed to legion-onboarding is about the Legion take-home. No other projects, other interviews, personal details or leftover template instructions
- **Why:** Legion will read the repo and its commit history as part of the submission. Anything unrelated is noise, and git keeps it in the history even after it's deleted
- **Rejected:** A single cleanup pass at Step 6. Easy to miss things, and it can't remove what's already in the history
- **Revisit when:** Not expected to change

## 2026-10-28 · Log as we go, and reread docs/ after a compaction

- **What:** work-log.md gets updated at the end of every step. Every decision goes in decisions.md in the same session it's made. If a chat compacts, the Legion Cowork Session rereads the whole docs folder before doing anything else
- **Why:** Long chats compact and lose detail. The docs folder is the source of truth, so the record has to be complete before a compaction happens, not rebuilt afterwards
- **Rejected:** Relying on the chat history or a summary to carry context. A compacted summary drops the reasons and rejected options this log exists to keep
- **Revisit when:** Not expected to change

## 2026-10-28 · Link Vercel now, not at Step 4

- **What:** Linked the GitHub repo to a Vercel project (legion-onboarding) on day one, through the Vercel connector in this chat
- **Why:** Step 4 starts with a deployed blank page anyway. Linking now surfaces any auth, build or access problem before the build day, and every PR gets a preview URL from the first one
- **Rejected:** Linking at Step 4. It saves nothing and pushes the risk to the day with the least slack
- **Revisit when:** Not expected to change

## 2026-10-28 · Commit Legion's funnel table as a CSV, with a check script

- **What:** The 11-row table from the brief goes into the repo as a CSV. A script recomputes the "from previous", "from start" and drop columns and checks them against the brief's published figures
- **Why:** CLAUDE.md requires every number in the readout to be reproducible with one command. The data is aggregate, contains no patient-level information and was sent by Legion. The check catches typos from copying the table by hand
- **Rejected:** Keeping the numbers only in markdown. Nothing could be reproduced, and a typo would go unnoticed
- **Revisit when:** Legion sends more data, or event-level data

## 2026-10-28 · Nothing goes straight to main; the first PR is cleanup plus the logs

- **What:** PR 1 removes starter and template leftovers and adds work-log.md and decisions.md. Every later change, including log updates, goes through a PR
- **Why:** The repo and its history are part of the submission. A PR for every change keeps the history readable and matches CLAUDE.md
- **Rejected:** Committing the logs directly to main. Faster, but it breaks the rule the rest of the work follows
- **Revisit when:** Settled by "Build in several small PRs, with the last one left open" below

## 2026-10-28 · Delete funnel.py and profile_data.py

- **What:** Removed both prep-kit scripts from analysis/
- **Why:** funnel.py builds a funnel from event-level rows, and profile_data.py profiles folders of data files. Legion sent one aggregate table of 11 rows, so neither applies. The CSV check script replaces them
- **Rejected:** Keeping them in case they're needed. Unused code works against the clean-repo rule, and both are still in the first commit if we ever need them
- **Revisit when:** Legion sends event-level data, or we need to compute a funnel from the prototype's own events

## 2026-10-28 · Remove AGENTS.md and stop Next.js from regenerating it

- **What:** Deleted AGENTS.md and set `agentRules: false` in next.config.ts
- **Why:** `next dev` recreates AGENTS.md whenever it detects an AI coding agent, so deleting the file alone wouldn't hold once Claude Code runs the dev server in Step 4
- **Rejected:** Deleting it and gitignoring it. The file would still appear locally and the setting is the documented off switch
- **Revisit when:** If Claude Code makes mistakes from outdated Next.js knowledge, add a line to CLAUDE.md pointing it to `node_modules/next/dist/docs/` instead

## 2026-10-28 · Turn off Vercel Authentication

- **What:** Turned off Vercel Authentication on the legion-onboarding project, so preview and production links open without a Vercel login. Checked in an incognito window: the preview loads with no login
- **Why:** The prototype uses made-up data only, and Legion's own onboarding is public. Legion's reviewers shouldn't hit a login screen
- **Rejected:** Keeping it on. Every reviewer would need a Vercel account with access to the project
- **Revisit when:** The prototype ever handles real personal or patient data

## 2026-10-28 · Turn off the Vercel Toolbar

- **What:** Turned off the Vercel Toolbar for preview and production deployments
- **Why:** It's a Vercel tool, not part of the prototype. Legion should see only the product
- **Rejected:** Leaving it on for comments on previews. Review happens in the GitHub PRs, so it adds nothing
- **Revisit when:** We want reviewers to comment directly on preview pages

## 2026-10-28 · Build in several small PRs, with the last one left open

- **What:** PR 1 (cleanup) and PR 2 (funnel CSV) merge into main. The build in Step 4 ships as a series of small PRs, one concern each, following the plan in the build brief. Each merges into main once checked on its preview, and the last one stays open for the submission
- **Why:** Each PR is small enough to review on its own, and the PR list shows how the work was sequenced. It's the workflow CLAUDE.md and the build brief already describe. Leaving the last PR open still meets the brief's "repository and open pull request"
- **Rejected:** One build branch with a single open PR (the game plan's option). It matches the brief's wording more literally and keeps one preview link, but it puts the whole build in one large diff
- **Revisit when:** The build runs short on time and PR overhead starts costing more than it saves

## 2026-10-28 · Use Supabase to save progress so patients can come back

- **What:** The prototype saves a patient's progress in Supabase (Postgres), so they can leave and pick up where they left off. Settings: Data API on, new tables not exposed automatically, row-level security on automatically. Every table gets explicit grants and access rules. The secret key is used only on the server
- **Why:** In the current flow, coming back puts the patient in onboarding again as "Anonymous User", and Login leads back into onboarding (findings 1, 20, 32). Onboarding now runs through the first visit, which happens days later, so progress has to survive across sessions and devices. Postgres also matches Legion's stack
- **Rejected:** Browser storage only. It's lost in incognito, on another device, or when storage is cleared, and the server can't send a link back to it. Also rejected: no saving at all, which repeats the current problem
- **Revisit when:** The build runs short on time and saving progress isn't in the slice we build fully. Browser storage could then stand in for the demo, labelled as such

## 2026-10-28 · North-star denominator: everyone who starts, minus people screened out

- **What:** First-visit completion rate = patients with a completed first visit ÷ (everyone who starts − people the fit check screens out). The screen-out rate is tracked next to it
- **Why:** Screening out the wrong patients kindly is the product working, so it shouldn't count as a failure. Keeping everyone else in, including people who quit during the fit check, means abandonment there still counts against us. Tracking the screen-out rate stops over-screening from making the metric look better
- **Rejected:** Everyone who starts: directly comparable to Legion's 5,898, but it would reward letting the wrong patients through. Only people who pass the fit check: it would hide everyone who gives up during the fit check
- **Revisit when:** Screen-out reasons turn out to be fuzzy (for example, people screened out who should have been helped), which would make the subtraction unreliable

## 2026-10-28 · Tell patients about AI once, at the start

- **What:** One blanket notice at the very start of onboarding, shown once: "We use AI to help with some steps. You can talk to a person any time." Readable text, not alarming. No per-step disclosures or markers
- **Why:** Patients should know up front and know how to reach a person, without being alarmed on every screen. Texas requires clear disclosure of AI use in health care before or at the time of interaction (docs/research.md, question 4)
- **Rejected:** A label on every AI screen. It repeats the message and makes each step feel riskier. Also rejected: showing the notice again at the start of the pre-visit intake. Instead, the reminder email or text that invites the patient to the intake includes the same sentence, and every screen has a "talk to a person" help link
- **Revisit when:** A patient reaches an AI step without passing the start screen (for example, the pre-visit intake days later, or on another device), or Legion's counsel says one notice isn't enough

## 2026-10-28 · NPS after the first visit, never inside onboarding

- **What:** NPS is asked from time to time in the portal after the first visit. Onboarding never asks for it
- **Why:** The goal inside onboarding is getting patients through the questions as fast as possible. Every extra question adds to the 20 asked today
- **Rejected:** A rating at the end of onboarding. It adds a question at the point where patients are most likely to drop
- **Revisit when:** Post-visit response rates are too low to read

## 2026-10-28 · Self-pay patients are in scope, with a clear path

- **What:** The user is insured or self-pay. Self-pay gets a clear path through onboarding, not a dead end
- **Why:** Legion shows a cash price at payment today, so self-pay patients exist. A clear path keeps them from leaving at insurance
- **Rejected:** Insured patients only. Simpler, but anyone without accepted insurance would hit a dead end
- **Revisit when:** Not expected to change

## 2026-10-28 · AI accuracy is a guardrail

- **What:** Track how often patients correct what the AI understood, and how often the form fallback is used
- **Why:** If the AI misreads people often, it slows them down and erodes trust, even if completion goes up
- **Rejected:** No AI-specific guardrail. The north star alone wouldn't show the AI getting things wrong
- **Revisit when:** Corrections turn out to mean patients are adding detail rather than fixing mistakes, which would need a split

## 2026-10-28 · A 30-day window for a completed first visit

- **What:** The north star counts first visits completed within 30 days of starting
- **Why:** The metric needs a window to be calculated. 30 days leaves room for rescheduling (the earliest slot on the walk was 4 days out), and speed is measured separately by median days to the first visit
- **Rejected:** A shorter window. It would mix speed into the completion metric, which the second metric already covers
- **Revisit when:** Median days to the first visit gets close to 30

## 2026-10-28 · A "talk to a person" help link on every screen

- **What:** Every screen has a help link to reach a person, like Legion's "Need help? Call us"
- **Why:** The AI notice promises "You can talk to a person any time", so a person has to be one tap away everywhere. It's a help link, not an AI marker
- **Rejected:** Help only on some screens, or only on AI steps. The promise covers the whole flow
- **Revisit when:** Not expected to change

## 2026-10-28 · Build the AI pre-visit intake fully (B2)

- **What:** The one part built fully: an optional AI pre-visit intake in the portal, about 72 hours before the visit. A real AI conversation of 5 to 8 questions and a clinician summary, using made-up data, plus a simple clinician view. It never blocks the visit. Crisis words stop it and go to crisis resources and a person. A plain form is the fallback
- **Why:** It's where AI does the clinical data-collection work Yash described, and the clearest path to fewer clinician minutes per patient. It sits in the stretch the brief adds (booked to visit completed), which Legion doesn't measure today
- **How we'd prove it:** intake completion; clinician minutes against the 60-minute first visit, for patients who did the intake vs. skipped it; no-show rate; AI cost per intake
- **Rejected:** Building the booking questions fully instead. They're where the measured drops are, but they're mostly layout fixes that can be built simply. Also rejected: an AI fit check (F4) and an insurance card photo (X2), which scored lowest on completion
- **Revisit when:** The intake raises no-shows or patients skip it most of the time, or clinicians don't use the summary

## 2026-10-28 · Card at booking, charged after the visit (B4a)

- **What:** The patient adds a card when booking and is charged after the visit
- **Why:** There's no evidence that payment is where people drop: every session that creates an account reaches the payment page (1,403 of 1,403), and nothing after that is measured. A card at booking protects against no-shows, and it's how Talkiatry and Headway work. Full cost and the cancellation policy show before the card is asked for
- **Rejected:** Book now and add the card 24 to 72 hours before, or the booking is released (B4b). It goes in "what I'd do next" (`docs/next.md`), with Rula's reserve-first approach as the precedent, to test once payment success is tracked
- **Revisit when:** Payment success is tracked and the card step turns out to be a large drop of its own

## 2026-10-28 · What gets built simply

- **What:** Built simply: the fit check that asks facts (F3 reworked, taking on F1 and F2), one recommended provider (M1), providers on the first screen (M2), full cost and cancellation policy before the card (M3), a shorter details page (A2), sign-in instead of the email error (A3), booking confirmed and an upcoming-visit screen (B1), reminders shown as previews (B3), and the visit-completed demo control (B5). Supabase saves progress on the same device
- **Why:** They address the measured drops and the steps after booking with small, evidence-backed changes, leaving time to build the intake fully
- **Rejected:** The email sign-in link from A1, deferred because it needs an email service. Progress saves on the same device only for now
- **Revisit when:** There's time after the intake works end to end

## 2026-10-28 · One "What's going on?" question, on the intake's AI engine (X1 light)

- **What:** At the start, one "What's going on?" question, typed or spoken. The AI reflects back what it understood for the patient to confirm or correct, and that feeds the reason shown for the recommended provider. It reuses the intake's conversation engine
- **Why:** It replaces the conditions and needs pages with one answer in the patient's own words, gives M1 a real reason, and costs little extra once the intake engine exists
- **Rejected:** A full conversation in booking. Those two pages lose few sessions today (6.7% and 2.6%), and chat can be slower (research, question 2)
- **Revisit when:** Patients correct the reflection often, or the fallback form gets used a lot

## 2026-10-28 · The fit check asks facts, with direct questions only for safety (F3 reworked)

- **What:** Date of birth, state, and insurance plan or self-pay, then "Are you thinking about harming yourself or others?" Age, state and Medicaid or Medicare are worked out from the answers. A "Yes" goes straight to crisis resources and a person. Re-scored 8 out of 9. *(Updated the same day: the hospital-stay question stays as a second direct question, see below. Coverage now shows after 5 answers instead of 7.)*
- **Why:** Rula screens with facts and shows in-network providers straight after (research, question 5). Six identical yes/no cards were the friction on the walk (findings 5 to 7)
- **Rejected:** Six yes/no cards (today's flow), and an AI conversation for the fit check (F4)
- **Revisit when:** Screen-out reasons get mixed up, or Legion's clinical team needs a question this drops

## 2026-10-28 · Five claims are tests, not facts

- **What:** Treated as tests: that the new fit check recovers the 1,912, that the recommended provider fixes the 36.6%, that mobile is worse, that removing testimonials helps, and that the cost surprise loses people. Each has a test in `analysis/test-plan.md`
- **Why:** They come from one walk and the funnel data, which show where people drop but not why
- **Rejected:** Stating them as findings in the readout
- **Revisit when:** A test reads out

## 2026-10-28 · Keep Legion's event names, measure through visit completed, link sessions to a person

- **What:** Keep Legion's milestone names (page views on /portal/join paths, portal.provider_selected, portal.provider.reservation.created, portal.onboarding.userCreated). Add the missing events through visit completed, in the same portal.* style. Link the browser session to a person once details are saved
- **Why:** The same names keep the new flow comparable with Legion's funnel. Linking to a person is what lets the numerator count patients, not sessions
- **Rejected:** A new naming scheme, which would break comparison. Also rejected: sessions only, which can't follow a patient from booking to the visit days later
- **Revisit when:** Not expected to change

## 2026-10-28 · Test the new flow 50/50 against the current one

- **What:** A rough plan for a 50/50 test against the current flow, with how long each lift takes to detect, in `analysis/test-plan.md`
- **Why:** The prototype can't prove a lift. A test plan shows how we'd know
- **Rejected:** A before-and-after comparison, which mixes in seasonality and traffic changes
- **Revisit when:** The first 30 days of measurement give a real first-visit completion baseline

## 2026-10-28 · Keep the hospital-stay question, labelled for Legion's clinical team

- **What:** The fit check keeps "Have you been hospitalized for mental health or substance use in the past year?" as a second direct question next to self-harm, labelled "Confirm with Legion's clinical team". "Yes" screens out kindly with specialized treatment resources, as today's flow does
- **Why:** It's Legion's clinical screen for the intensity of care they can offer, so removing it isn't ours to decide
- **Rejected:** Dropping it to shorten the fit check (the first version of F3 reworked)
- **Revisit when:** Legion's clinical team says it can change or go

## 2026-10-28 · Add "Tell me if an earlier time opens" (M4)

- **What:** A checkbox on the provider screen, with a simulated notification
- **Why:** It was in the sketch, I liked it on the walk (finding 18), and it costs little to show as a checkbox
- **Rejected:** Leaving it out of the slice
- **Revisit when:** Not expected to change

## 2026-10-28 · Drop the virtual-care question; say "All visits are by video" up front

- **What:** The fit check no longer asks "Are you looking for virtual care only?" The start screen says "All visits are by video" instead, labelled "Confirm with Legion"
- **Why:** Answering "No" didn't screen me out on the walk (mobile recording, about 0:58), so the question informs rather than screens. A plain line tells every patient up front, with one fewer answer
- **Rejected:** Keeping it as a question. The label stays in case Legion uses the answer for something we can't see
- **Revisit when:** Legion says they use the answer

## 2026-10-28 · Crisis detection: a word list plus an AI flag that can only escalate

- **What:** In every free-text step, a word list and an AI flag both check for crisis. Either one stops the conversation and shows crisis resources and a person immediately. The AI can never decide it's fine to continue. The patient can continue only after confirming they're safe, labelled "Confirm with Legion's clinical team"
- **Why:** A word list misses indirect phrasing ("I don't want to be here anymore"). The AI catches more, but the decision to keep going can't rest on it (pre-mortem, failure 1)
- **Rejected:** A word list only, which misses indirect phrasing. AI only, which leaves safety to the AI
- **Revisit when:** Legion's clinical team sets the rule for continuing after a flag

## 2026-10-28 · A demo banner on every screen, no free text in Supabase, and a rate limit on the AI

- **What:** One banner on every screen: "Demo prototype: don't enter real information". Free text (what the patient types or says) stays out of Supabase. The AI route is rate-limited
- **Why:** Preview links open without a login and the AI calls are real, so a real person could type real health details, and anyone with the link could run up costs (pre-mortem, failures 5 and 6)
- **Rejected:** A warning next to every text box. One banner says it once, everywhere
- **Revisit when:** The prototype moves behind a login

## 2026-10-28 · The clinician summary uses only what the patient said

- **What:** The summary draws only on the patient's own answers. The clinician view shows the full conversation next to it
- **Why:** A summary that adds something the patient didn't say could mislead a clinician (pre-mortem, failure 10). Showing the conversation lets the clinician check
- **Rejected:** A summary on its own
- **Revisit when:** Not expected to change

## 2026-10-28 · The intake conversation stays in the browser, with a sample for the clinician view

- **What:** The intake conversation and summary stay in the patient's browser, so the clinician view shows them on the same device. A "Load a sample conversation" button on the clinician view shows a clearly labelled made-up example for anyone who opens it without doing an intake. The sample lives in the code, not in Supabase
- **Why:** Free text stays out of Supabase (pre-mortem, failure 5), and the demo is clicked through on one device. The sample means a reviewer can see the clinician view without doing an intake first
- **Rejected:** Storing made-up example conversations in Supabase. A patient's own conversation still wouldn't show, and it adds a table for no gain
- **Revisit when:** The clinician view needs to work on a different device from the patient's

## 2026-10-28 · Use Legion's real prices and cancellation fees, labelled

- **What:** The copy uses Legion's prices from the current flow's payment page: self-pay $250 for the first visit and $150 for follow-ups; late cancellation (within 48 hours) or no-show $250 for first visits and $100 for follow-ups; most insured patients pay $0 to $40. Each is labelled "From Legion's current flow"
- **Why:** Real numbers make the cost screen honest and show the change is about when the cost is shown, not what it is
- **Rejected:** Made-up demo prices
- **Revisit when:** Legion's prices change

## 2026-10-28 · Font: Inter, with Inter Display for headings

- **What:** Body text in Inter, headings in Inter Display. 16px body minimum, per `Design fundamentals.md`
- **Why:** It's the face Legion's site already uses, so the prototype reads as Legion. It's free under the SIL Open Font License, so it can live in a public repo
- **Rejected:** Satoshi, from Lily's Inspo Book 01: its licence says not to put the font files in a public repo. SF Pro: Apple's system font, not Legion's
- **Revisit when:** Not expected to change

## 2026-10-28 · Bring in only the components the build uses, rebuilt as Legion

- **What:** Components adapted from my own design library (Inspo Book 01). Only the ones the build uses come into the repo: Button, Chip, SegmentedControl, Switch, List, and any others the build needs (for example Tag or IconButton). They're rebuilt on Legion's colours and Inter. The rest of the library stays out (Tabs, UnitToggle, NavLink, LiveIndicator, FeatureCard, ActionNode, MockWindow, GridBackground), and so does the Satoshi font
- **Why:** A ready, tested base saves build time. Rebuilding on Legion's palette and font makes it read as Legion. Leaving the rest out keeps the public repo to what the assignment uses
- **Rejected:** Copying the whole library as is: its colours and Satoshi font aren't Legion's, and Satoshi's licence rules out a public repo. Building every component from scratch: slower, for no gain
- **Revisit when:** Not expected to change

## 2026-10-29 · Evals: crisis pass bars per layer

- **What:** The word list must catch 100% of direct-wording crisis cases (run once, since it's a fixed list). The AI flag must catch 100% of all crisis cases, direct and indirect, with each case run 5 times. The two together must catch 100%. A few non-crisis cases that sound alarming ("this ADHD is killing me") measure the false-alarm rate, which is reported without a hard bar
- **Why:** Each layer is held to what it can do: a fixed list can't catch indirect wording, so the AI flag carries that, and running each case 5 times catches an AI flag that only works some of the time. False alarms send someone to crisis resources unnecessarily, which is safe but worth watching
- **Rejected:** Both layers at 100% on everything: the word list would need to flag ordinary sentences and still might not get there. Only a combined bar: a weak AI flag could hide behind the word list on direct cases
- **Revisit when:** The false-alarm rate is high enough to put patients off

## 2026-10-29 · Eligibility surprises: double-check before booking, flag after

- **What:** When a free-text answer contradicts the quick facts (for example "I'm 16", "I just moved to Oklahoma", "I'm on Medicaid now"), the AI never decides eligibility. In "What's going on?", before booking, the patient gets a calm double-check ("You mentioned you're 16. Can you confirm your date of birth?") and the fit check rules run again, so the rules decide. In the pre-visit intake, after booking, the AI flags it and the patient continues, with a calm note that someone will check one detail before the visit. The flag shows in the clinician view. Eval cases cover both
- **Why:** Before booking, the rules can settle it on the spot. After booking, a person should check rather than cancel a visit automatically
- **Rejected:** Flag and continue in both steps, which could let someone ineligible book. Pausing for a person, which is a dead end in a prototype. Sending everyone back to the quick facts, which could feel like being caught out after booking
- **Revisit when:** Legion's team sets how eligibility changes after booking are handled

## 2026-10-29 · When the AI is unsure: one clarifying question, then "Not sure"; the form only for failures

- **What:** The AI asks at most one clarifying question. If the answer is still vague but real ("everything's just off"), it's recorded as "Not sure, needs help" and the patient continues; the intake summary quotes it as said. The step switches to the plain form only when the AI's output doesn't fit the format or it can't make sense of the input at all. Evals check: no guessing, at most one clarifying question, vague answers map to "Not sure", format failures fall back to the form
- **Why:** Vague answers are common and real in mental health, and "I'm not sure, but I need help" is already one of Legion's needs options. Sending vague answers to the form would make it common; guessing would put words in the patient's mouth
- **Rejected:** Straight to the form on any doubt, which would show the form often. Asking until sure, which can loop and slow patients down
- **Revisit when:** "Not sure" turns out to be most answers, or clinicians find the quotes unhelpful

## 2026-10-29 · Models: mid tier for the AI steps, a separate fast crisis flag, a top-tier grader

- **What:** Both AI steps run on a mid-tier model (Sonnet class). The crisis flag is a separate call with its own short prompt on a fast model (Haiku class), run on every message. The rubric grader is a top-tier model (Opus class), different from the model being graded. If the fast model misses any crisis case in the evals, the crisis flag moves up to the mid tier, and the eval result that decided it is logged here. Exact model IDs are checked against Anthropic's docs in the build brief
- **Why:** The mid tier balances quality on summaries and follow-ups against speed and AI cost per intake. A separate crisis call is harder for a prompt injection in the main conversation to switch off. A grader from a different, stronger model is less likely to share the graded model's blind spots
- **Rejected:** All fast tier: cheapest, but weaker on nuance and on faithful summaries. Top tier for the steps: best quality, but the slowest and most expensive per intake
- **Revisit when:** The crisis flag misses a case (move it up), or AI cost per intake is too high
- **Eval result:** not run yet

## 2026-10-29 · Check the grader against 10 cases I score blind

- **What:** I score 10 rubric cases before seeing the grader's results. At least 4 are deliberately bad outputs: a summary that adds something the patient didn't say, one that misses something they did say, and a follow-up that drifts into advice. The grader must agree on at least 9 of 10, and any disagreement on a safety item (advice, diagnosis, crisis) means fixing the grader before trusting it. Re-checked whenever the grader prompt changes
- **Why:** A grader that only sees good outputs can pass by approving everything. Planted failures show it actually catches them, and scoring blind keeps my scores independent
- **Rejected:** Scoring every rubric case at 100% agreement, which doubles review time. 5 cases at 4 of 5, too few to show the grader is reliable
- **Revisit when:** The grader disagrees with me on a safety item

## 2026-10-29 · Roll out the AI intake the way Legion rolls out Utah renewals

- **What:** Clinicians check every summary against the full conversation for the first 250 intakes, then audit 10% of the next 1,000. The AI pauses and the intake goes back to the form immediately on any missed crisis or any made-up statement that could affect care, and also if more than 2% of audited summaries have an error. It resumes only after a fix, a passing eval run and sign-off from Legion's clinical lead. Clinician time savings are measured from the audit phase, since full checks add time at first. All numbers are proposals for Legion's clinical team
- **Why:** It mirrors how Legion already introduces AI (Utah renewals: the first 250 with human and AI agreement, then a human audit of the next 1,000), so the clinical team knows the pattern
- **Rejected:** A smaller first phase of 50, too small a sample to trust. Full checks until sign-off with no set numbers, which has no end point and uses up the clinician minutes the intake is meant to save
- **Revisit when:** Legion's clinical team sets different numbers

## 2026-10-29 · Write the golden set now, build the harness first in Step 4

- **What:** The eval spec, the 40-case golden set and the grader check are written now, in Step 3. The harness is built in Step 4, before any AI prompt is merged
- **Why:** The cases define what the AI steps must do, so they belong with the spec. The harness needs the prompt code, which doesn't exist until Step 4
- **Rejected:** Writing the cases after the prompts, which tends to fit the tests to what the prompts already do
- **Revisit when:** Not expected to change

## 2026-10-29 · Patient text is data; outputs follow a strict schema; anything else goes to the form

- **What:** Patient text only goes in the user turn, inside tagged blocks the system prompt marks as the patient's words, never instructions. The model has no tools and no secrets. The word list runs before any model, and the crisis flag is a separate call. Eligibility is decided by rules. Model output must fit an exact schema per step (in `docs/evals.md`), enforced by the API's structured output and validated in the app. Anything that doesn't fit is rejected and the step falls back to the form, without a retry. Output is shown as plain text only
- **Why:** Keeps a prompt injection from changing what the AI does, what the clinician sees, or whether a crisis is caught. The fallback follows the "unsure" decision: format failures go to the form
- **Rejected:** Free-text output parsed loosely, which an injection can bend. Retrying on a bad output, which makes the patient wait twice
- **Revisit when:** The fallback rate in the evals or after launch is high enough to hurt the experience

## 2026-10-29 · A lean harness: `npm run eval`, run before merging prompt changes

- **What:** `npm run eval` runs the golden set, scores it (exact, rule or model-graded), and prints pass rates per category and behaviour, failures, crisis results per layer, the false-alarm rate, speed and AI cost. `npm run eval:grader-check` compares the grader with my scores. Cases live in YAML so I can read and edit them. The rule is in CLAUDE.md and the PR template: run it before merging any prompt, schema or model change, paste the summary into the PR, don't merge on a failure
- **Why:** About an hour to build, and it makes every prompt change show its effect before it ships
- **Rejected:** Running evals automatically on every PR in GitHub Actions: it would need the API key as a repository secret and costs a run on every push, including docs changes. Worth adding later
- **Revisit when:** Prompt changes become frequent enough that a manual run gets skipped

---

# Spoken defence (fill before the review call)

## Strengths

- [strength]: [one line on why it holds]

## Weaknesses, each with its trigger

- [weakness]. Fix: [what]. Trigger: [when it would matter]

## Questions they'll probably ask

- Why this stack?
- Why this slice first?
- What would you change with another week?
- Walk me through [main file]
- How would you know it worked?
