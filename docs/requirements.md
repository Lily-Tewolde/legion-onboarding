# Requirements

Draft framing for Step 3. Decisions behind it are in `docs/decisions.md`. The scope of the build is decided later in Step 3.

## The problem

5,898 sessions start Legion's onboarding in 30 days and 1,403 reach the payment page (23.8%). Nothing after that is measured, so no one knows how many reach a completed first visit, which is where onboarding ends. On the walk, I answered 7 questions before learning I'm covered, 9 before seeing a provider, and 20 before seeing the full cost.

## User

- A Texas adult, up to about 65, looking for psychiatric care, usually on a phone
- Pays with insurance or self-pays. Self-pay needs a clear path, not a dead end
- Includes people coming back to finish what they started
- People the fit check screens out (under 18, Medicaid or Medicare, outside Texas, needing a higher level of care) aren't the target user, but they get a kind way out to the right resources

## Job

Get from "I need help" to a completed first visit, knowing early whether I'm covered, what it costs and who I'll see.

## North-star metric: first-visit completion rate

- **Numerator:** patients with a completed first visit within 30 days of starting
- **Denominator:** everyone who starts, minus people the fit check screens out
- **Tracked next to it:** the screen-out rate (screened out ÷ everyone who starts), so over-screening can't hide
- **Unit:** people are anonymous until they enter their details, so the denominator counts browsers, like Legion's data. The numerator counts patients
- **Window:** 30 days from starting. Speed is measured separately by the second metric

## Second metric

Median days from start to a completed first visit.

## Diagnostics (not goals)

- Conversion at each step, from start to visit completed
- Questions answered before learning coverage, cost and who I'll see (today: 7, 20 and 9)

## Guardrails

- **Safety:** every crisis disclosure reaches crisis resources and a person. The AI never diagnoses or gives medical advice
- **Fit:** the screen-out rate holds steady, and clinicians don't flag more first visits as a poor fit
- **AI accuracy:** how often patients correct what the AI understood, and how often the form fallback is used
- **No-shows:** the no-show rate doesn't rise
- **Cost:** AI cost per completed onboarding, and clinician minutes per first visit

## Experience

- **Speed first:** the goal inside onboarding is getting patients through the questions as fast as possible
- **NPS:** asked from time to time in the portal after the first visit, never inside the onboarding questions

## Transparency

One blanket notice at the very start of onboarding, shown once: "We use AI to help with some steps. You can talk to a person any time." Readable text, not alarming. No per-step disclosures or markers.

- **Pre-visit intake:** no notice on the screen. The reminder email or text that invites the patient to the intake includes the same sentence, so they see it right before the AI step
- **Help on every screen:** a "talk to a person" help link on every screen, like Legion's "Need help? Call us". It's a help link, not an AI marker, and it backs up the notice's promise

## How Legion grades the take-home

From Yash Patel, Oct 27: can Lily build, how she works out requirements, how she thinks about user experience, and how she makes sense of data. Legion didn't rank them.
