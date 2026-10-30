# Metric definitions (Legion's own list, from the JD)

Write the exact definition before computing anything. Every metric has a numerator, a denominator and a time window. Adjust to the columns Legion actually sends.

| Metric | Numerator | Denominator | Notes |
|---|---|---|---|
| Activation | Patients who complete the first meaningful step (define it) | Patients who signed up | Pick the step that predicts staying |
| Intake completion | Patients who finish intake | Patients who start intake | Split by device and drop-off question |
| Scheduling conversion | Patients who book a visit | Patients who finish intake | Split by insurance and time to first slot |
| First-visit completion | Patients with a completed first visit within 30 days of starting | Everyone who starts, minus people the fit check screens out | The one metric (`docs/requirements.md`, the build brief, `docs/decisions.md` Oct 28). Not the inverse of no-shows: people who quit before booking count against it |
| Screen-out rate | People the fit check screens out | Everyone who starts | Tracked next to the one metric, so over-screening can't make it look better. Split by reason |
| Time to care | Days from signup to first visit | Patients with a first visit | Report the median, not the mean |
| Repeat-visit rate | Patients with a second visit within [x] days | Patients with a first visit | |
| Renewal completion | Renewals done on time | Renewals due in the window | Utah AI renewals: also concordance and escalations |
| Retention | Patients still in care at day 30, 60, 90 | Patients who started in that cohort | Cohort by start month |
| No-show rate | Visits missed without cancelling | Visits booked | Split by lead time and reminder sent |
| Support burden | Tickets or messages | Active patients | Group by reason |
| Ops cost per visit | Ops minutes or dollars | Visits completed | Yash's unit economics |
| Clinician minutes per visit | Clinician minutes | Visits completed | Split into data collection, decision-making, education |
| NPS / CSAT | Promoters minus detractors | Responses | Note the response rate |

## Guardrails to pair with any "fewer minutes" metric

NPS, clinical quality, escalations caught, complaints, adverse events. If one gets worse, the change isn't a win.

## How the one metric is measured in this build

From the PostHog events in the build brief, section 5:

- **Starts:** `$pageview` on `/portal/join`. People are anonymous until they enter details, so starts count browsers, like Legion's data
- **Fit outcomes:** `portal.fit.submitted` fires on every fit outcome, with `result` (`eligible`, `screened_out` or `crisis`) and, for a screen-out, `reason` (`under_18`, `not_in_texas`, `medicaid_medicare`, `hospital_stay`). It fires on a one-tap answer, a step's Continue, the last step and the double-checks on confirm. `portal.fit.screened_out` fires with the same reason
- **Screened out means the last fit outcome was a screen-out,** not "was ever screened out". Someone who mistypes their date of birth, is screened out, corrects it and carries on was never ineligible, so they stay in the denominator and their completion counts (decision, Oct 30)
- **Denominator:** starts minus people whose last fit outcome was a screen-out. A crisis isn't a screen-out: people who say they're safe carry on, so they stay in
- **Details step:** `portal.onboarding.userCreated` for new details, or `portal.onboarding.signedIn` for someone who signs in instead, so returning people stay in the funnel
- **Numerator:** `portal.visit.completed` within 30 days of the start, for people in the denominator
- **Screen-out rate:** people whose last fit outcome was a screen-out ÷ starts

**In PostHog (project "Legion onboarding prototype"), all leaving out the test scripts' host `localhost:3300`:**

- **[First-visit completion rate (the one metric)](https://us.posthog.com/project/697908/insights/c4WNRWsM):** the number. A SQL insight that applies the last-outcome rule, with the screen-out rate beside it
- **[Onboarding funnel: portal join to first visit completed](https://us.posthog.com/project/697908/insights/L73lciqC):** the step-by-step view. Step 2 counts only `result: eligible`, and the details step is the action "Details step done (new or signed in)". A funnel can't express "last outcome", so its first step still includes people who were screened out in the end. Read the rate from the SQL insight
- **[Screen-outs by reason](https://us.posthog.com/project/697908/insights/NUHYk9Wp):** people screened out each day by reason, with the someone-else flag beside them. That flag isn't a fit-check screen-out (the person can say "this is for me" and carry on), so it doesn't leave the denominator

In the demo, visits are marked completed by hand in Demo controls. The rows so far are test runs, so read the rates as a check that the tracking works, not as results.
