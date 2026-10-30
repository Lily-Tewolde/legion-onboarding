# Build brief: AI-native onboarding, start to first visit

**Locked Oct 29, 2026.** Changes after this go through `docs/decisions.md`.

For Claude Code. This is a spec, not a discussion. Everything here is decided. Anything undecided that comes up during the build is marked OPEN QUESTION and comes back to Lily unanswered. The reasons behind each decision are in `docs/decisions.md`; the screen-by-screen flow is `docs/new-flow-map.md`; the AI behaviour and tests are `docs/evals.md`.

## 0. Before writing code

Working directory: `~/Projects/legion-onboarding`. Run and report: `pwd`, `node --version`, `gh auth status`, `vercel whoami`, `git status`. If gh or vercel isn't logged in, stop and say so.

- This is Next.js 16.4 with the App Router. Before using an API you're not sure of, check the matching guide in `node_modules/next/dist/docs/`
- Read `CLAUDE.md` first. Its rules apply to every PR
- Secrets come from `.env.local` (names in `.env.example`). Never print them, never commit them

## 1. What this is

- **User:** a Texas adult, up to about 65, looking for psychiatric care, usually on a phone, paying with insurance or self-pay. Includes people coming back to finish
- **Job:** get from "I need help" to a completed first visit, knowing early whether I'm covered, what it costs and who I'll see
- **The one metric:** first-visit completion rate. Numerator: patients with a completed first visit within 30 days of starting. Denominator: everyone who starts, minus people the fit check screens out. The screen-out rate is tracked next to it. Second metric: median days from start to completed first visit
- **Graded hardest:** Legion didn't rank its criteria (build, requirements, user experience, data). Most of the build time goes to the AI pre-visit check-in and clinician summary, built fully, and to measuring the flow all the way to visit completed

## 2. Hard rules

- **Don't build:** roles and permissions, admin panels, real authentication (sign-in is simulated), dark mode, a landing page, a real coverage check, real payments, real email or text sending, a real calendar or scheduling system, standard screeners (PHQ-9, GAD-7), anything not in section 4
- **Language:** don't call anything a diagnosis, treatment recommendation or clinical decision. No HIPAA, legal or clinical claims. The AI only restates what the patient said
- **Data:** made-up data only. Free text (what patients type or say) is never stored in Supabase. Every screen shows the banner "Demo prototype: don't enter real information"
- **Safety:** crisis detection is a word list plus a separate AI flag that can only escalate. Eligibility is decided by rules, never by the AI
- **Copy:** every user-facing string comes from section 6. If one is missing, stop and ask
- **Evals:** no AI prompt, schema or model change merges without `npm run eval` passing (section 8)
- **Design:** follow `Design fundamentals.md` (in Lily's attachments folder; copy the parts used into `docs/design.md` in PR 1). Inter for body text, Inter Display for headings (both SIL Open Font License; self-host the font files if `next/font` can't load Inter Display), 16px body minimum, Legion's palette with the darker blue for buttons and links, Atlassian's 8px spacing, tap targets at least 44px, contrast at least 4.5:1. No red except for errors and the crisis path. One progress style for the whole flow. One primary button per screen, with the secondary action as a text-style button underneath. Copy is warm, accurate and short enough to fit on mobile and desktop. Desktop has a side panel with a photo, the patient quote, the phase progress and short summaries, except on the crisis screens and screen-outs (Lily's design feedback, Oct 29; see the design pass in section 4). Hint text, not expanding cards. Skeleton loading, not loading text
- **Components:** adapted from Lily's own design library (Inspo Book 01), rebuilt on Legion's colours and Inter. Bring in only what's used: Button, Chip, SegmentedControl, Switch, List, and Tag or IconButton if needed. No Satoshi font files in the repo. Credit line in the README: "Components adapted from my own design library (Inspo Book 01)."

## 3. Data model

Supabase Postgres. Data API on, new tables not exposed automatically, row-level security on. **No table is readable or writable from the browser.** All access goes through server routes using the secret key. Every table gets RLS on with no policies for `anon` or `authenticated`, and explicit grants to `service_role` only. One committed migration: `supabase/migrations/0001_init.sql`.

```sql
-- Progress for a visitor on one device (no free text, ever)
create table public.onboarding_sessions (
  id uuid primary key default gen_random_uuid(),
  anon_id text not null unique,            -- random id kept in a first-party cookie
  person_id uuid,                          -- set when details are saved
  current_screen text not null default 'facts',
  pay_method text check (pay_method in ('insurance','self_pay')),
  plan_id text,
  fit_result text check (fit_result in ('eligible','screened_out','crisis')),
  screen_out_reason text check (screen_out_reason in ('under_18','not_in_texas','medicaid_medicare','hospital_stay')),
  concern_labels text[],                   -- standard English labels only
  provider_id text,
  slot_start timestamptz,
  booked_at timestamptz,
  visit_outcome text check (visit_outcome in ('completed','no_show')),
  intake_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The made-up person behind a session (from the checkout's details section)
create table public.people (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text not null,
  consented_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Rate limiting for the AI routes (no content)
create table public.ai_calls (
  id bigint generated always as identity primary key,
  anon_id text not null,
  route text not null,
  cost_usd numeric(10,6) not null default 0, -- estimated from token counts, for the daily cap
  created_at timestamptz not null default now()
);
create index ai_calls_anon_recent on public.ai_calls (anon_id, created_at desc);
create index ai_calls_recent on public.ai_calls (created_at desc);

alter table public.onboarding_sessions enable row level security;
alter table public.people enable row level security;
alter table public.ai_calls enable row level security;
revoke all on public.onboarding_sessions, public.people, public.ai_calls from anon, authenticated;
grant select, insert, update on public.onboarding_sessions, public.people to service_role;
grant select, insert on public.ai_calls to service_role;
grant usage on sequence public.ai_calls_id_seq to service_role;
```

Not in Supabase: providers, slots and insurance plans (made-up JSON in `src/data/`), the "What's going on?" text and the check-in answers and summary (kept in the browser's session storage, per `docs/decisions.md`), and the sample check-in (in the code).

**Insurance plans:** the real insurer names from Legion's current flow, as text only, no logos: Aetna, Blue Cross Blue Shield, Cigna, UnitedHealthcare and Oscar, plus Medicaid and Medicare (which screen out) and "I don't see my plan". The coverage check stays labelled "Demo: coverage check simulated".

## 4. Screens and flows

The full screen-by-screen spec is `docs/new-flow-map.md`. Every screen: the banner, the "Talk to a person" help link (opens the help panel), skeleton loading where data loads, and the error state from section 6.

**Routes**

| Route | Screen |
|---|---|
| `/join` | 1. Let's get you care (start, quick facts, coverage inline) |
| `/join/whats-going-on` | 2. What's going on? |
| `/join/confirm` | 3. Here's what we understood |
| `/join/provider` | 4. Your provider |
| `/join/book` | 5. Book your visit (two steps: details, then payment) |
| `/join/booked` | 6. You're booked |
| `/join/not-a-fit/[reason]` | Screen-outs |
| `/help-now` | Crisis screen, with versions for immediate danger (911 first) and for being hurt by someone else (safety resources) |
| `/join/someone-else` | Someone else screen |
| `/visit` | 7. Your first visit (the Visit tab) |
| `/visit/inbox` | 8 and 11. The inbox (the Inbox tab) |
| `/visit/profile` | The Profile tab, an entry point only |
| `/visit/check-in` | 9. Pre-visit check-in |
| `/clinician` | 10. Clinician view |
| `/demo` | 12. Demo controls |

**Design pass (from Lily's design feedback, Oct 29).** The design pass checks every screen against these. The full entries, starting at "Design: the phone frame, fit and colour", are in `docs/decisions.md`, and Claude Design's two style boards are the handoff spec (tokens, type, spacing, radius, shadows, motion, and every component in each state).

- **Fit:** mobile 390 × 844 with Continue and the portal tab bar pinned to the bottom, safe area included; the content above fits within about 700 px. Desktop 1440 × 900 scrolls slightly at most
- **Colour:** the page stays white, blue only in the background, a white card behind anything people read, and the demo banner never covered
- **One way of doing each thing:** a check only on a valid typed field, never inside a choice. Yes then No. An 8px spacing scale, the same card padding and radius for each kind of thing, at least 12px of padding inside chips and options, chip labels at 16px. Icons and avatars line up with the first line of text. No label wraps; the short date ("Mon, Nov 2") where the full one would wrap; phone numbers on one line
- **Progress:** one row on mobile: the back arrow and one bar in four segments, one per phase. The phase name is a small label above the heading, same spot on every screen. Screen readers hear "About you, part 2 of 3". No dots, no "Step x of 4", no time left. On the desktop panel, a ring around each phase number that turns into a check, a one-line summary under each finished phase, then "Typical cost" and "Earliest visit". The check-in has one stepper
- **Desktop panel and photos:** Lily's photos, one per phase (about-you, whats-going-on, your-provider, book), resized for the web; your-provider also goes on the proof moment after insurance, and book on "You're booked". Credits in the README, from `CREDITS.md`. Provider avatars stay as initials. The panel changes photo per phase, the quote on every panel screen, no panel on the crisis screens and screen-outs. A logo placeholder at the top sized for Legion's logo
- **Screen 1:** plan names as text, no insurer logos. "I don't see my plan" opens the full plan list with search first. The proof moment right after "You're covered": Texas clinicians who take the plan, the earliest visit and the typical cost (demo numbers)
- **"What's going on?":** Legion's full conditions list as starter chips with line icons, "Not sure" last. Live dictation. The text box grows as they type (on the check-in, to about 6 or 7 lines, then scrolls)
- **Provider:** a one-sentence summary at the top. Tapping a provider shows its own day strip of times. "See more providers" as its own screen: three cards, then "Show more providers", the recommended one pinned at the top
- **Checkout:** the visit card on two or three labelled rows on a white card. Labels inside the inputs. A collapsed visit summary above payment, opening inside the same card. The card number on its own row, then expiry, security code and ZIP. Cost once per layout (desktop panel, mobile Details step)
- **Booked:** the panel slides away for the booked moment. "Add to calendar" with Google, Apple and Outlook logos in one row
- **Portal:** Visit, Inbox and Profile as a bottom tab bar on mobile and a left sidebar on desktop (Profile is an entry point only). Milestone cards with a "Completed" tag. "Demo: skip to 72 hours" beside the visit card. Reschedule and Cancel as text-style buttons
- **NPS:** a small corner dialog, "How was your first visit?" 0 to 10, only after the visit is marked completed; a high score can lead into a review ask
- **Check-in:** on the medication check, "Yes, that's right" primary, "Fix something" under it, "Skip the check-in" as the small link at the bottom
- **Clinician view:** the safety flag first (quote and link), the concern in one line with its source link, current medications; everything else behind "All answers", a text-style button. Centred
- **Demo controls:** a small "Demo controls" button pinned in a corner of every portal and clinician screen (bottom left on desktop; clear of the tab bar on mobile), opening "Mark visit completed", "Mark no-show" and switching between the patient portal and the clinician view
- **Help and unhappy paths:** "Talk to a person" opens the help panel everywhere. Every unhappy path is built at both sizes and linked from where it happens. "Leave this page" opens google.com. No "From Legion's current flow" or "Demo number" tags on patient screens; one small line at the bottom where something is simulated
- **Motion:** springs with no bounce, about 0.4 to 0.5 seconds; pressed state on touch; forward slides in from the right, Back returns to the right; heading first, then the cards; exits quicker than entrances and interruptible; sheets from the bottom on mobile, fade and grow on desktop; selected colours fade in; expanding sections animate their height; soft shimmer for loading; nothing on first load; Reduce Motion turns it all into gentle fades

**Rules (plain code, unit-tested, never AI)**

- Under 18 from the date of birth, on today's date in Central time → screen out `under_18`, checked on Continue
- "Will you be in Texas for your visits?" No → `not_in_texas`, as soon as it's tapped
- Plan is Medicaid or Medicare → `medicaid_medicare`, as soon as it's tapped
- Self-pay, "Do you have Medicaid or Medicare?" Yes → `medicaid_medicare`, as soon as it's tapped, with the same screen-out copy. Legion doesn't see Medicaid or Medicare patients even as self-pay
- Hospital stay Yes → `hospital_stay`, as soon as it's tapped
- Safety question Yes → crisis screen, as soon as it's tapped
- Every rule has a unit test, including the self-pay question

**Behaviour added from Lily's golden-set review (Oct 29)** (each one has cases in `evals/golden-set.yaml`)

- **Word list:** English plus a few clear Spanish phrases (for example "quiero morir", "me quiero matar", "ya no quiero vivir"), matched as whole phrases so everyday expressions like "me muero de sueño" don't trigger. Final list to confirm with Legion's clinical team
- **Crisis kinds:** the crisis flag returns a kind. Immediate danger shows the 911-first version: "Call 911" as the primary button, "Call or text 988" as a text-style button under it, and no "I'm safe" checkbox. Being hurt by someone else pauses the check-in and shows safety resources, with a "Leave this page" quick exit always visible at the top (it opens a neutral page and replaces this one in the browser history), including the National Domestic Violence Hotline, with the same "I'm safe right now and want to keep going" option and a flag for the clinician. Past risk escalates and flags the clinician. The crisis check stays on after "I'm safe right now". If the crisis flag call fails, the word list still runs, 988 stays in the help panel, and the crisis screen isn't shown to everyone
- **"What's going on?":** unreadable input gets one gentle retry, then the simple form. Someone filling it in for another person goes to the someone-else screen. Typed text never fills the required quick facts
- **Confirm screen:** for each concern where we don't know whether it's been diagnosed (for example, only a chip was tapped), one row under the chips: "Have you been diagnosed with {concern}?" Yes / No / Not sure. No AI question
- **Check-in:** a topic already covered is confirmed and extended, never skipped or repeated word for word. A soft inline note when the patient asks something we can't answer here, and the check-in continues. At the end, the patient confirms their medications as they said them (or as heard). Normalization is plain code with a list of known drugs: only a one-letter typo that matches exactly one known drug, with nothing else close, is fixed. Anything else stays "unclear". If what we heard isn't a real drug, the medication check asks "Did you mean {drug}?", so the patient decides. If it's a real drug that doesn't fit what they told us, no other drug is suggested: "Can you check the name of this medication?", and it stays unclear. A medication question gets "We'll pass your question to your provider." One gentle note after two skips in a row. If the patient says they're under 18, the check-in stops after the flag with a calm message (to confirm with Legion's clinical and legal team)
- **Clinician summary:** important facts mentioned in passing (for example, pregnancy or drinking) are kept, worded neutrally. Clinician-only flags (for example, taking someone else's prescription) are never shown to the patient

**Portal (PR 16):** the demo clock ("Demo: skip to 72 hours", then 24 hours and 1 hour) is a cookie, `lh_demo_clock`, not a column. It only moves forward and resets when a time is booked, rescheduled or cancelled. Reschedule and Cancel both show Legion's 48-hour policy first. Reschedule then books the new time straight away, since the details and card are done, clears a no-show and keeps the check-in. Cancel frees the time and keeps the details.

**Recommended provider:** the first made-up provider who treats a confirmed concern and, if insured, takes the plan; ties broken by the earliest slot. The reason line is built from that data, never written by the AI.

**AI routes (server only)**

- `POST /api/ai/whats-going-on`: Sonnet, structured output per `docs/evals.md`
- `POST /api/ai/check-in/next`: Sonnet, returns the next question or done
- `POST /api/ai/check-in/summary`: Sonnet, the clinician summary with citations
- `POST /api/ai/crisis-flag`: Haiku, run on every patient message, in parallel with the word list

Models: `claude-sonnet-5-5` for both AI steps, `claude-haiku-5-5` for the crisis flag, `claude-opus-5-5` for the eval grader (current IDs on Anthropic's models page, Oct 29). If the Haiku flag misses any crisis case in the evals, switch it to `claude-sonnet-5-5` and log the result in `docs/decisions.md`.

Structured outputs use `output_config.format` with `type: "json_schema"`. The API can't enforce string lengths, so every response is also validated in the app (zod), including lengths and that every citation points to a real answer. A refusal, a truncated response or anything that fails validation sends the step to the plain form, logs `portal.ai.fallback_used` without the patient's text, and never retries.

- **Slow responses:** at 5 seconds, show "Still working on it…". At 10 seconds, offer "Use a simple form instead" and keep what the patient typed. The step only switches to the form on its own on a real error (a failed call, a refusal, a truncated response or a validation failure)
- **Rate limit:** about 30 "What's going on?" calls per visitor per hour (the crisis flag never counts toward it), plus a daily spending cap for the whole demo (`AI_DAILY_CAP_USD`, default $10, estimated from the token counts each call returns, the crisis flag included). Over either limit, the step opens as the simple form with its note
- **Patient text limit:** 1,000 characters per answer, with "That's the limit here. You can tell your provider the rest at your visit." at the limit. Names up to 100 characters

## 5. Events to track

PostHog (US Cloud), `posthog-js` in the browser. Keep Legion's names where the same thing happens; new events follow their `portal.*` style. `posthog.identify` with the made-up `person_id` when details are saved, so later events link to the person. No free text in any event.

| Event | When it fires | Properties |
|---|---|---|
| `$pageview` /portal/join | Screen 1 loads | |
| `$pageview` /portal/join/fit | First fact answered | |
| `portal.coverage.shown` | Coverage or self-pay price shows | pay_method |
| `portal.fit.submitted` | Screen 1 submitted | result |
| `portal.fit.screened_out` | Any screen-out | reason |
| `portal.crisis.shown` | Crisis screen shows | source (safety_question, word_list, ai_flag), kind, step |
| `portal.concern.retry_shown` | Unreadable input gets the retry message | |
| `portal.someone_else.flagged` | Someone-else screen shows | |
| `$pageview` /portal/join/conditions | Screen 2 loads | |
| `portal.concern.submitted` | Screen 2 submitted | mode (typed, spoken, chips, mixed, form) |
| `$pageview` /portal/join/needs | Screen 3 loads | |
| `portal.concern.confirmed` | "Looks right" | corrected (true or false), labels |
| `$pageview` /portal/join/match | Screen 4 loads | |
| `portal.provider_selected` | A provider and time are chosen | recommended (true or false) |
| `portal.provider.reservation.created` | "Book {day} at {time}" | |
| `portal.earlier_time.requested` | Earlier-time box checked | |
| `$pageview` /portal/join/patient | Details section in view | |
| `portal.onboarding.userCreated` | Details saved | |
| `$pageview` /portal/join/payment | Payment section in view | |
| `portal.payment.method_added` | Card entered | simulated: true |
| `portal.appointment.confirmed` | "Book my visit" succeeds | days_to_visit |
| `portal.calendar.added` | Any calendar link | calendar |
| `portal.visit_page.viewed` | `/visit` loads | |
| `portal.intake.invited` | Invite appears in the inbox | |
| `portal.intake.started` | First check-in answer | |
| `portal.intake.completed` | Check-in done | questions_answered |
| `portal.intake.skipped` | "Skip the check-in" | |
| `portal.intake.medications_confirmed` | Medication check at the end | changed (true or false) |
| `portal.intake.stopped` | Check-in stops early | reason (under_18, crisis) |
| `portal.intake.summary_viewed` | Clinician view opens with a summary | sample (true or false) |
| `portal.ai.fallback_used` | Any AI step falls back | step, reason |
| `portal.reminder.viewed` | A reminder is opened in the inbox | hours_before |
| `portal.visit.joined` | "Join visit" | |
| `portal.visit.completed` | Demo: mark completed | intake_done |
| `portal.visit.no_show` | Demo: mark no-show | |
| `portal.visit.rated` | A score is picked in "How was your first visit?" | score (0 to 10) |
| `portal.help.clicked` | Help link | screen |

This is enough to compute the one metric (`portal.visit.completed` within 30 days ÷ starters minus `portal.fit.screened_out`), the screen-out rate, median days to the first visit, and each step's conversion.

## 6. Copy

Every user-facing string is in `docs/copy-draft.md` (Lily's edited version, Oct 29). Build it into one file, `src/copy.ts`, so the readability check (section 8) can read every string. Labels like **[Confirm with Legion]** in the draft are notes for Lily, not on-screen text. This section links to the draft instead of copying it, so there's one source of truth. Lines marked **[drafted]** are waiting for Lily's OK: build them, but list them in the PR as pending.

## 7. PR plan

Ship in this order, one PR each. Each PR merges into main after it's checked on its preview. The last one stays open for the submission.

1. **Foundation:** design tokens on Legion's palette and Inter, the adapted components, the page shell (banner, help link and panel, progress style), `docs/design.md`, remove the starter dark mode
2. **Data:** Supabase migration, server data layer, the anonymous visitor cookie, made-up providers, slots and plans
3. **Screen 1 and the rules:** quick facts, coverage inline, screen-outs, crisis screen, rule unit tests
4. **Eval harness:** `npm run eval` and `npm run eval:grader-check` per `docs/evals.md`, the crisis word list and the AI crisis flag, with the crisis cases passing
5. **"What's going on?" and confirm:** the AI step, the form fallback, chips, speech-to-text, the confirm screen. Evals pass
6. **Provider, checkout and booked:** recommendation, one-page checkout, the email-already-used path, add to calendar
7. **Portal:** visit page, inbox, reminders, demo panel with the no-show path
8. **Check-in and clinician view:** the AI check-in, the summary with citations, the sample check-in. Evals pass
9. **Tracking and limits:** every event in section 5, `identify`, rate limits, timeouts
10. **Polish from the review:** the full structured review's fixes, the readability check's list, mobile checks. Left open for the submission

## 8. Verification

Each check is observed two ways where possible.

- **Every rule:** unit tests at the edges (18 today, one day short, Texas No, Medicaid, Medicare, hospital Yes, safety Yes), and clicked through on the preview
- **Evals:** `npm run eval` passes every bar in `docs/evals.md`; the summary is pasted into each AI PR. The grader check passes against Lily's blind scores
- **Readability:** every patient-facing string in `src/copy.ts` scored; strings over grade 8 listed for Lily. Known exceptions: the two longer check-in questions about medications and other health, which keep "medications" and "allergies"
- **Events:** every event in section 5 fires on screen (PostHog's debug view) and shows in PostHog with the right properties. No free text in any event
- **Supabase:** rows written as expected, checked in the table editor. No free text in any table. The browser can't read any table with the publishable key (tested)
- **Fallbacks:** a slow response shows "Still working on it…" at 5 seconds and offers the form at 10 with the text kept; a failed call, a bad output, the visitor limit and the daily cap each open the form (forced in a test)
- **Mobile:** the whole flow on a real phone and in Chrome's device mode
- **Links:** the preview opens in an incognito window with no login

## 9. Return to Lily

The live URL, the PR list with preview links, the eval summary, anything implemented differently from this brief and why, and the OPEN QUESTIONs. Don't write the README.
