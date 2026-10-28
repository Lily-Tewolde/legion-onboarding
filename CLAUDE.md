# CLAUDE.md: Legion Health take-home

## What this is

A take-home for the Founding Product Manager role at Legion Health (AI-native psychiatry, covered by insurance). Graded on: can Lily build, how she works out requirements, how she thinks about user experience, how she makes sense of data.

- **The brief, in their words:** [paste]
- **Graded hardest, in order:** [1] [2] [3]
- **Out of scope (theirs):** [paste]
- **Out of scope (ours):** roles and permissions, admin panels, auth beyond what's asked, dark mode, landing page, seed data beyond what the brief needs, a second feature nobody asked for

## Stack (matches Legion's)

TypeScript, Next.js App Router on Vercel, Postgres (Supabase), Tailwind, no component library. PostHog-style event tracking for the one metric that matters. Python and pandas for the data work under `analysis/`.

## How we work

- **Small PRs, always.** Every change on its own branch, merged through a PR using `.github/PULL_REQUEST_TEMPLATE.md`. One concern per PR. Never commit straight to main. The PR history is part of the submission
- **Push every PR.** Vercel is connected to GitHub, so each PR gets a preview URL. Paste it into the PR description
- **Decisions get written down.** Anything decided goes in `docs/decisions.md` the same session: what, why, what we rejected, what would make us revisit it
- **Open questions come back to Lily.** If the brief or the build brief doesn't decide something, stop and ask. Don't guess
- **Copy is Lily's.** User-facing strings come from the build brief. If one is missing, ask
- **Precise language.** Don't call something a queue, worker, model or AI feature unless it is one. Don't make clinical or HIPAA claims
- **No patient data.** Use only the data Legion provides

## Verifying

- Test against the deployed preview, not just localhost
- Check two ways wherever possible: UI and database, sent and delivered, chart and raw query
- Every number in the readout must be reproducible from `analysis/` with one command
- Before submission: run a full structured review of the repo, fix what's real, re-test on the live link

## Files

- `docs/requirements.md`: the problem, the user, the job, the one metric
- `docs/build-brief.md`: the locked spec for the build
- `docs/decisions.md`: the decision log
- `analysis/`: metric definitions, notebooks or scripts, outputs
- `README.md`: the readout, written last, in the brief's sections and order
