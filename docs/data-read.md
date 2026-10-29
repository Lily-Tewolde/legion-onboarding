# Data read: Legion's current onboarding funnel

Source: Legion's PostHog funnel from the brief, saved as `analysis/data/legion_funnel_30d_to_2026-08-29.csv`. Production traffic, rolling 30 days ending Aug 29, 2026. Every figure is in sessions per 30 days. Finding numbers refer to `docs/step-1-findings.md`.

**Reproduce every figure from Legion's data** (the "What I saw" lines are walk observations):

- `python3 analysis/check_funnel.py` confirms the CSV matches the brief's table
- `python3 analysis/size_funnel.py` prints every figure below. Each section names the part of its output it comes from

## Caveats

These are browser sessions, not patients. Repeat visits, identity stitching, blocked analytics and sessions that continue in a later visit all affect the counts, so read every figure as an approximation of people. The same applies everywhere below and isn't repeated.

## 1. Headline

5,898 sessions start and 1,403 reach the payment page (23.8%). Nothing after the payment page is measured, so no one knows how many of these sessions end in a completed first visit.

*Source: `size_funnel.py`, section 1.*

## 2. Real decisions vs. automatic steps

From the brief's milestone definitions and the conversion rates, checked against the walk. On desktop the walk went through to the payment page.

| Step | What kind of step | Why |
|---|---|---|
| Fit check | Real choice | The patient answers fit questions and decides whether to go on. 1,912 lost |
| Conditions, insurance, needs | Question pages | The patient answers and continues. Each loses 2.6% to 7.3% |
| Choosing a provider | Real choice | The patient picks from the match page. 1,104 lost |
| Reservation created | System step after selection | An event, not a page. 145 lost (7.6%). The data can't show whether the patient or the system drops these. On the walk, tapping Book created the reservation |
| Patient details | Redirect | 1,763 of 1,764 arrive (99.9%) |
| Creating an account | Real choice | The patient enters details and creates an account. 360 lost |
| Payment page | Redirect | 1,403 of 1,403 arrive (100%) |

*Source: `size_funnel.py`, section 2 (drops between steps), and `check_funnel.py` (sessions at each step).*

From the walk: I answered 20 questions before I saw the full cost, fees and the card requirement, which only appear on the payment page.

## 3. The three cliffs

| Cliff | Lost | Rate | Rank by count | Rank by rate |
|---|---|---|---|---|
| Fit check to conditions | 1,912 | 34.8% | 1 | 2 |
| Match page to provider selected | 1,104 | 36.6% | 2 | 1 |
| Patient details to account created | 360 | 20.4% | 4 | 3 |

By count, account creation is fourth. Start to fit check loses more (408, 6.9%), but at a low rate. These three are the top three by rate.

*Source: `size_funnel.py`, section 2, which ranks all ten step-to-step drops.*

## 4. Guesses to test

Guesses only. Which ones hold, and what to fix first, gets decided in Step 3.

### Fit check to conditions (1,912 lost)

- My guess is part of this drop is screening on purpose: people under 18, outside the states Legion serves, or with needs Legion doesn't treat. We'd test it by logging a screened-out event with the reason, and comparing screened-out sessions to the total drop.
    - What I saw: I saw six fit questions: Texas, Medicaid or Medicare, self-harm risk, a hospital stay in the past year, 18 or older, and virtual only. Several screen you out with resources, so part of this drop is on purpose. I can’t tell how much from the data.
- My guess is some people leave because they're asked about themselves before they learn whether they're covered or what it costs. We'd test it by showing coverage and cost earlier to half of new sessions and comparing how many reach conditions.
    - What I saw: I answered the fit check and conditions before seeing anything about coverage. The “$0 to $40” estimate only showed on the insurance page, and the full fees only at payment.
- My guess is the fit check is harder to finish on a phone. We'd test it by splitting this drop by device type in PostHog.
    - What I saw: On mobile I saw a bounce between questions, more scrolling, and the back button moving between the bottom and the top (findings 24 to 27).

### Match page to provider selected (1,104 lost)

- My guess is people don't see a provider available soon enough. We'd test it by logging the earliest slot shown on the match page and comparing selection rates by how soon it is.
    - What I saw: Not what I saw. The earliest slot was Monday Nov 2, 3 business days (5 calendar days) after my walk on Wednesday Oct 28.
- My guess is too many choices with too little to go on makes picking hard. We'd test it by logging how many providers each session sees, and trying a recommended provider with a short reason against today's list.
    - What I saw: I had to scroll past the loading box to reach providers. The “Highly recommended” provider wasn’t first, and I missed its badge on desktop (findings 14, 17, 34).
- My guess is people still don't know what they'll pay, so they stop before committing to a person. We'd test it by adding a one-question exit prompt on the match page, and by showing cost there for half of sessions.
    - What I saw: Partly. I saw the estimate earlier, but the late-cancellation fee, cash price and card requirement only showed at payment.

### Patient details to account created (360 lost)

- My guess is this is the first time the flow asks for identifying details, and some people stop there. We'd test it by logging which field each session last touched before leaving.
    - What I saw: I saw six fields and three consent checkboxes on one page (finding 19).
- My guess is some sessions hit form errors, like an email that's already registered or a phone number format. We'd test it by logging validation errors by field.
    - What I saw: I hit “this email already has an account” and had to switch emails.
- My guess is some returning visitors already have an account and come back in a new session, so they look like a drop here. We'd test it by checking how many dropped sessions belong to people who already have an account.
    - What I saw: When I came back, I was an “Anonymous User” with no way to log in, and Login sent me back into onboarding (findings 1, 20, 32).

## 5. Sizing

Assumption for every figure here: if one step converts better, every later step keeps converting at today's rate. "Reach payment" means reaching the payment page, not paying.

| Cliff | Today | Per +1 point: more reach payment | Worked example: +10 points |
|---|---|---|---|
| Fit check to conditions | 65.2% (3,578 of 5,490) | about 21.5 | 65.2% to 75.2%: about 549 more reach conditions, about 215 more reach payment |
| Match page to provider selected | 63.4% (1,909 of 3,013) | about 22.1 | 63.4% to 73.4%: about 301 more select a provider, about 221 more reach payment |
| Patient details to account created | 79.6% (1,403 of 1,763) | about 17.6 | 79.6% to 89.6%: about 176 more create an account, about 176 more reach payment |

- Per point, the first two cliffs are nearly tied. More sessions pass through fit check, but fewer of them go on to reach payment (39.2%, against 73.5% after choosing a provider).
- The worked examples use the same +10 points for every cliff so they can be compared. A +10 point lift isn't a target or a forecast.
- **The fit check figure assumes the whole drop is recoverable.** If part of it is screening on purpose, the recoverable share is smaller, and pushing more of those sessions through would be the wrong outcome.

*Source: `size_funnel.py`, section 3.*

## 6. The blind spot: everything after the payment page

The brief says onboarding ends when the first visit is completed. The data stops at reaching the payment page, and two earlier milestones aren't what they sound like: a reservation isn't a confirmed appointment, and reaching the payment page isn't a payment.

| Step | Measured today? | What we'd track |
|---|---|---|
| Payment succeeds or fails | No | A payment success event, and a failure event with the reason |
| Booking confirmed | No | An appointment-confirmed event with the time until the visit |
| Reminders | No | Reminder sent and opened, with the channel and hours before the visit |
| Reschedule or cancel | No | Rescheduled and cancelled events, with who made the change |
| Showing up | No | Patient joined the visit, with minutes late |
| Visit completed | No | Visit completed, the milestone onboarding ends on |

Event names will follow Legion's `portal.*` style, and get fixed in the build brief. With these, the funnel runs from start to visit completed.

## Changes from the AI draft

- **"The match-page fix is worth the most per point" was misleading.** Per point it's nearly a tie with fit check (22.1 vs 21.5). The draft's match figure looked bigger because it assumed a bigger lift there (16.6 points, against 9.8 and 10.4 for the others). *Source: `size_funnel.py`, section 4.* Which cliff to fix first is a Step 3 decision, so the doc doesn't rank fixes
- **"Three cliffs by people lost" wasn't accurate.** By count, start to fit check (408) loses more than account creation (360). The three cliffs are the top three by rate
- **"A month" is now "per 30 days, in sessions",** matching the data's window and unit
- **The conditions sizing now says it assumes the whole drop is recoverable**
- **Guesses now say how we'd test each one,** with what I saw on the walk
- **Added the steps between the cliffs** (section 2) and **the full blind spot** after the payment page (section 6)
