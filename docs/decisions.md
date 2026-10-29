# Decision log

One entry per decision, written the same session it's made. This becomes the spoken defence.

## 2026-10-28 · The repo holds only assignment material

- **What:** Everything committed to legion-onboarding is about the Legion take-home. No other projects, other interviews, personal details or leftover template instructions
- **Why:** Legion will read the repo and its commit history as part of the submission. Anything unrelated is noise, and git keeps it in the history even after it's deleted
- **Rejected:** A single cleanup pass at Step 6. Easy to miss things, and it can't remove what's already in the history
- **Revisit when:** Not expected to change

## 2026-10-28 · Log as we go, and reread docs/ after a compaction

- **What:** B-log.md gets updated at the end of every step. Every decision goes in decisions.md in the same session it's made. If a chat compacts, Station B rereads the whole docs folder before doing anything else
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

- **What:** PR 1 removes starter and template leftovers and adds B-log.md and decisions.md. Every later change, including log updates, goes through a PR
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
- **Rejected:** A label on every AI screen. It repeats the message and makes each step feel riskier. Also rejected: showing the notice again at the start of the pre-visit intake
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
