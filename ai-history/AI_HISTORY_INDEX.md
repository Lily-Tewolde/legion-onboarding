# AI history index

The AI sessions used for this assignment. Each one is the session's own record, unedited apart from labelled redactions, which cover only credentials, secrets and personal information unrelated to this assignment. No real patient information appears anywhere; all data in the prototype is made up.

| # | Tool | Dates | What it was for | File |
|---|---|---|---|---|
| 01 | Claude (Cowork) | Oct 28-30, 2026 | The work: flow map, data read, the spec, every decision, reviewing each pull request | Legion Cowork Session - the work.md |
| 02 | Claude Code | Oct 28-30, 2026 | The build, in small pull requests | Legion Claude Code - the build.txt |
| 03 | Claude (Cowork) | Oct 29, 2026 | Competitor onboarding research (Brightside, Rula, Talkiatry, Headway), with made-up answers and no personal data | Legion Cowork Session 2 - Competitor onboarding.md |
| 04 | Claude Design | Oct 29, 2026 | The visual design of the flow, desktop and mobile, over rounds of my feedback | Claude Design - Legion onboarding redesign.md |
| 05 | Claude Code | Oct 30, 2026 | A second, read-only review session: the whole repo and every open pull request, then the final secrets scan before making the repo public | Legion Claude Code 2 - the review.txt |
| 06 | Claude Code | Oct 30, 2026 | The last round of fixes: the design-audit findings, the code review's, my own hand-testing notes, and the final polish before submission | Legion Claude Code 3 - the Friday fixes.jsonl |

## How these were captured

Claude's cloud sessions have no export button, and the account-level data export doesn't include them. A long session also resets its context as it fills up, and that rewrites its stored transcript, so the earlier conversation is no longer in the file.

- **Session 01** was captured from the session's own chat window, which still held the full conversation after its transcript had been reset. Tool calls appear as the interface renders them.
- **Session 02** is Claude Code's own `/export`.
- **Session 03** came from the session's own stored transcript, with full tool calls and results.
- **Session 04** is in two parts: the earlier conversation from the chat window, then the stored transcript from the point its context was reset. Both parts are labelled in the file. The session reset twice, and the very first design round was already gone before it could be captured. The instructions I gave in that round are in the feedback documents I sent it, and the decisions are in `docs/decisions.md`.

- **Session 05** is Claude Code's own `/export`. It was run read-only: it changed no repo files and wrote nothing to the database.

- **Session 06** is the session's own stored transcript rather than an `/export`. Its context reset late in the day, and an export taken after that would hold only the summary and what came after it. The stored file still has the whole session, from the first instruction that morning, so that is what's here. The reset is marked in the file.

The decision trail is also recorded outside these sessions as the work happened, in `docs/decisions.md` (every decision with why and what I rejected) and `docs/work-log.md`.

## Where to look

- **Choosing the north-star metric and its denominator** (everyone who starts, minus people screened out on purpose): session 01, Oct 28
- **Reviewing the golden set and adding cases** (partner harm, pregnancy, low literacy, booking for someone else, Spanglish, drug names misheard by speech-to-text): session 01, Oct 29
- **Scoring the grader blind before seeing its results**: it agreed on 9 of 10, and the miss was my answer key, which I corrected and logged: session 01, Oct 29
- **Catching the self-pay Medicaid gap in a pull request review**, then making every one-tap screen-out behave the same way: session 01, Oct 29
- **Safety decisions the evals forced**: immediate danger can't be downgraded by the AI flag; a maximum-dose question escalates to the crisis screen: session 02
- **Design feedback rounds**: one progress bar on mobile, white cards over the blue background, Apple-like motion, then a measured final round: session 04
