# Final PR description (draft)

For the last PR in the build brief's plan (section 7, PR 10: polish from the review), which stays open for the submission. [fill in] marks what isn't built or known yet. Paste everything below the line into the PR.

---

## What

The last PR of the build: the design pass and the fixes from the full review, on top of the working flow from "Let's get you care" to a completed first visit. It stays open for the submission.

- **Design pass:** [fill in: what changed, checked against the design pass in `docs/build-brief.md`, section 4]
- **Fixes from the review:** [fill in]
- **Readability:** [fill in: strings over grade 8, and what changed]
- **Mobile checks:** [fill in]

**Live:** [fill in] · **This PR's preview:** [fill in]

## Why

Legion's flow loses most sessions at the fit check (34.8%), choosing a provider (36.6%) and creating an account (20.4%), and nothing after the payment page is measured. The earlier PRs rebuilt the flow through the first visit and made each step measurable. This one makes it look and feel finished, to the spec in `docs/decisions.md` and Claude Design's style boards.

## The build, PR by PR

| PR | What | Status |
|---|---|---|
| [fill in] | Foundation: tokens, components, page shell | Merged |
| [fill in] | Data: Supabase, visitor cookie, made-up providers and slots | Merged |
| [fill in] | Screen 1 and the rules | Merged |
| [fill in] | Eval harness and crisis layers | Merged |
| [fill in] | "What's going on?" and the confirm screen | Merged |
| [fill in] | Provider, checkout and booked | [fill in] |
| [fill in] | Portal, inbox and demo controls | [fill in] |
| [fill in] | Check-in and clinician view | [fill in] |
| [fill in] | Tracking and limits | [fill in] |
| This PR | Polish from the review | Open |

Docs PRs from the Cowork session: [fill in]

## How I checked it

- [ ] **Works on the preview URL:** [fill in], opened in an incognito window with no login
- [ ] **The happy path on a real phone and on desktop:** start to "visit completed" [fill in: device and browser]
- [ ] **Every unhappy path:** each screen-out, the crisis screen and its versions, someone else, the double-checks, plan not listed, AI slow or down, the retry, email already used, card error, no-show and no times [fill in]
- [ ] **Checked two ways:** each event on screen and in PostHog with the right properties, no free text in any event; rows in Supabase as expected, no free text in any table, and the browser can't read any table [fill in]
- [ ] **Design pass:** every screen against the checklist in the build brief, at 390 × 844 and 1440 × 900 [fill in]
- [ ] **Reduce Motion:** animations turn into gentle fades [fill in]
- [ ] **AI prompt, schema or model changed:** `npm run eval` passes [fill in, or "no AI changes in this PR"]

`npm run eval`:
```
[fill in]
```

`npm run eval:grader-check`:
```
[fill in]
```

`npm test`:
```
[fill in]
```

## Not in this PR

- **Built simply, on purpose:** coverage, payment, messages and the visit are simulated and labelled. Sign-in is simulated, and progress saves on the same device only
- **Not built:** real authentication, real payments, real email or text, a real calendar, standard screeners, and Profile beyond its tab
- **To confirm with Legion:** the crisis copy and what happens after "I'm safe right now", the hospital-stay question, the conditions list and policy lines, the consent and notices, and who answers "Talk to a person"
- **What I'd do next:** in `docs/next.md` and the README
- [fill in: anything else left out]
