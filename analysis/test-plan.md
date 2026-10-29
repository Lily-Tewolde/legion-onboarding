# Rough test plan

How we'd know the new onboarding works. Every figure below comes from `python3 analysis/test_plan.py`, which reads Legion's funnel CSV. These are browser sessions, not patients.

## The test

- **Design:** 50/50 split of new starters between the current flow and the new one, assigned at the start page and kept for the visitor's later sessions
- **Primary metric:** first-visit completion rate within 30 days (definition in `docs/requirements.md`)
- **Guardrails:** safety, fit (screen-out rate), AI accuracy, no-shows and cost, as in `docs/requirements.md`
- **Statistics:** two-sided, alpha 0.05, power 0.80

## How long it takes to see a lift

Legion's funnel has about 197 starters a day, so about 98 per arm.

| What we measure | Baseline | +2 points | +3 points | +5 points |
|---|---|---|---|---|
| Reach the payment page (leading indicator) | 23.8% | about 75 days | about 34 days | about 13 days |
| Match page to provider selected | 63.4% | about 180 days | about 80 days | about 29 days |
| Fit check to conditions | 65.2% | about 96 days | about 43 days | about 16 days |
| First-visit completion, if the baseline were 10% | assumed | about 40 days | about 19 days | about 7 days |
| First-visit completion, if the baseline were 15% | assumed | about 54 days | about 25 days | about 10 days |
| First-visit completion, if the baseline were 20% | assumed | about 67 days | about 30 days | about 12 days |

- **First-visit completion has no baseline today.** The rows above are assumptions to show the range. The real baseline comes from the first 30 days of measurement
- **Add 30 days** after the last starter enrols, so their 30-day window can close before first-visit completion is read
- The match page sees half the traffic of the start page, so small lifts there take months to detect. Payment-page reach is the fastest leading indicator
- The first-visit completion rows use all starters for traffic. The real denominator leaves out screen-outs, so it's a little slower

## Claims we treat as tests

| Claim | How we'd test it | Metric |
|---|---|---|
| The new fit check recovers part of the 1,912 lost there | The 50/50 test above, with screen-out events by reason in both arms | Fit check to next step, excluding screen-outs; screen-out rate |
| One recommended provider fixes part of the 36.6% drop | Within the new flow: recommended provider first vs. a list, 50/50 | Match page to provider selected; share who book the recommended provider |
| Mobile is worse than desktop | Split each step's conversion by device type, in both arms | Step conversion by device |
| Removing testimonials helps | Within the new flow: no quote panel vs. a small quote, 50/50 | Start to booked |
| The cost surprise loses people | Compare drop at the card step in the current flow (cost shown late) vs. the new flow (cost shown before the card); add a one-question exit prompt | Drop at the card step; exit prompt answers |
