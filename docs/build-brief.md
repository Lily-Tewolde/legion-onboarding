# Build brief: AI-native onboarding, start to first visit

For Claude Code. This is a spec, not a discussion. Everything here is decided, except items marked **OPEN QUESTION**, which come back to Lily unanswered. The reasons behind each decision are in `docs/decisions.md`; the screen-by-screen flow is `docs/new-flow-map.md`; the AI behaviour and tests are `docs/evals.md`.

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
- **Design:** follow `Design fundamentals.md` (in Lily's attachments folder; copy the parts used into `docs/design.md` in PR 1). Inter for body text, Inter Display for headings (both SIL Open Font License; self-host the font files if `next/font` can't load Inter Display), 16px body minimum, Legion's palette with the darker blue for buttons and links, Atlassian's 8px spacing, tap targets at least 44px, contrast at least 4.5:1. No red except for errors and the crisis path. One progress style for the whole flow. Desktop gives the task the full page; no split screen, no testimonial panel. Hint text, not expanding cards. Skeleton loading, not loading text
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
  created_at timestamptz not null default now()
);
create index ai_calls_anon_recent on public.ai_calls (anon_id, created_at desc);

alter table public.onboarding_sessions enable row level security;
alter table public.people enable row level security;
alter table public.ai_calls enable row level security;
revoke all on public.onboarding_sessions, public.people, public.ai_calls from anon, authenticated;
grant select, insert, update on public.onboarding_sessions, public.people to service_role;
grant select, insert on public.ai_calls to service_role;
grant usage on sequence public.ai_calls_id_seq to service_role;
```

Not in Supabase: providers, slots and insurance plans (made-up JSON in `src/data/`), the "What's going on?" text and the check-in answers and summary (kept in the browser's session storage, per `docs/decisions.md`), and the sample check-in (in the code).

**OPEN QUESTION:** the insurance plan list. Real insurer names (as Legion's current flow shows) look realistic, but with a simulated coverage check they could read as claims about who's in network. Made-up plan names avoid that but look less real.

## 4. Screens and flows

The full screen-by-screen spec is `docs/new-flow-map.md`. Every screen: the banner, the "Talk to a person" help link (opens the help panel), skeleton loading where data loads, and the error state from section 6.

**Routes**

| Route | Screen |
|---|---|
| `/join` | 1. Let's get you care (start, quick facts, coverage inline) |
| `/join/whats-going-on` | 2. What's going on? |
| `/join/confirm` | 3. Here's what we understood |
| `/join/provider` | 4. Your provider |
| `/join/book` | 5. Book your visit (one-page checkout) |
| `/join/booked` | 6. You're booked |
| `/join/not-a-fit/[reason]` | Screen-outs |
| `/help-now` | Crisis screen |
| `/visit` | 7. Your first visit, with the inbox (8 and 11) |
| `/visit/check-in` | 9. Pre-visit check-in |
| `/clinician` | 10. Clinician view |
| `/demo` | 12. Demo controls |

**Rules (plain code, unit-tested, never AI)**

- Under 18 from the date of birth, on today's date in Central time → screen out `under_18`
- "Will you be in Texas for your visits?" No → `not_in_texas`
- Plan is Medicaid or Medicare → `medicaid_medicare`
- Hospital stay Yes → `hospital_stay`
- Safety question Yes → crisis screen

**Recommended provider:** the first made-up provider who treats a confirmed concern and, if insured, takes the plan; ties broken by the earliest slot. The reason line is built from that data, never written by the AI.

**AI routes (server only)**

- `POST /api/ai/whats-going-on`: Sonnet, structured output per `docs/evals.md`
- `POST /api/ai/check-in/next`: Sonnet, returns the next question or done
- `POST /api/ai/check-in/summary`: Sonnet, the clinician summary with citations
- `POST /api/ai/crisis-flag`: Haiku, run on every patient message, in parallel with the word list

Models: `claude-sonnet-5-5` for both AI steps, `claude-haiku-5-5` for the crisis flag, `claude-opus-5-5` for the eval grader (current IDs on Anthropic's models page, Oct 29). If the Haiku flag misses any crisis case in the evals, switch it to `claude-sonnet-5-5` and log the result in `docs/decisions.md`.

Structured outputs use `output_config.format` with `type: "json_schema"`. The API can't enforce string lengths, so every response is also validated in the app (zod), including lengths and that every citation points to a real answer. A refusal, a truncated response or anything that fails validation sends the step to the plain form, logs `portal.ai.fallback_used` without the patient's text, and never retries.

- **Timeout:** **OPEN QUESTION.** Proposal: 10 seconds per AI call, then the form
- **Rate limit:** **OPEN QUESTION.** Proposal: 30 AI calls per visitor per hour, then a calm message and the form
- **Patient text limit:** 2,000 characters per answer

## 5. Events to track

PostHog (US Cloud), `posthog-js` in the browser. Keep Legion's names where the same thing happens; new events follow their `portal.*` style. `posthog.identify` with the made-up `person_id` when details are saved, so later events link to the person. No free text in any event.

| Event | When it fires | Properties |
|---|---|---|
| `$pageview` /portal/join | Screen 1 loads | |
| `$pageview` /portal/join/fit | First fact answered | |
| `portal.coverage.shown` | Coverage or self-pay price shows | pay_method |
| `portal.fit.submitted` | Screen 1 submitted | result |
| `portal.fit.screened_out` | Any screen-out | reason |
| `portal.crisis.shown` | Crisis screen shows | source (safety_question, word_list, ai_flag), step |
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
| `portal.intake.skipped` | "Skip, I'll cover it in my visit" | |
| `portal.intake.summary_viewed` | Clinician view opens with a summary | sample (true or false) |
| `portal.ai.fallback_used` | Any AI step falls back | step, reason |
| `portal.reminder.viewed` | A reminder is opened in the inbox | hours_before |
| `portal.visit.joined` | "Join visit" | |
| `portal.visit.completed` | Demo: mark completed | intake_done |
| `portal.visit.no_show` | Demo: mark no-show | |
| `portal.help.clicked` | Help link | screen |

This is enough to compute the one metric (`portal.visit.completed` within 30 days ÷ starters minus `portal.fit.screened_out`), the screen-out rate, median days to the first visit, and each step's conversion.

## 6. Copy

Every user-facing string is in `docs/copy-draft.md` (Lily's edited version, Oct 29). Build it into one file, `src/copy.ts`, so the readability check (section 8) can read every string. Labels like **[Confirm with Legion]** in the draft are notes for Lily, not on-screen text. **OPEN QUESTION:** lock `docs/copy-draft.md` as section 6 as it stands, or copy it in here.

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
- **Readability:** every patient-facing string in `src/copy.ts` scored; strings over grade 8 listed for Lily
- **Events:** every event in section 5 fires on screen (PostHog's debug view) and shows in PostHog with the right properties. No free text in any event
- **Supabase:** rows written as expected, checked in the table editor. No free text in any table. The browser can't read any table with the publishable key (tested)
- **Fallbacks:** AI timeout, a bad output and the rate limit each send the step to the form (forced in a test)
- **Mobile:** the whole flow on a real phone and in Chrome's device mode
- **Links:** the preview opens in an incognito window with no login

## 9. Return to Lily

The live URL, the PR list with preview links, the eval summary, anything implemented differently from this brief and why, and the OPEN QUESTIONs. Don't write the README.
