# New flow map: onboarding through the first visit

The agreed flow for the build, from Lily's low-fi sketch and the 3d decisions in `docs/decisions.md`. The overall flow is agreed; UI details (like the speak buttons) will change in the build brief.

Every screen has a "Talk to a person" help link and the banner "Demo prototype: don't enter real information". All data is made up. Coverage, payment, messages and the visit are simulated and labelled on screen.

## Questions before value: today vs. new

| Moment | Today (walk) | New flow |
|---|---|---|
| Learn I'm covered | after 7 | after 5 |
| See who I'd see | after 9 | after 7 |
| See the full cost and cancellation policy | after 20 | after 9 |

Counts for the new flow are from this map and will be rechecked in the build.

## Part 1: Booking

### 1. Start
- **Shows:** "Let's get you care" and what happens next. "All visits are by video", labelled "Confirm with Legion". The one AI notice: "We use AI to help with some steps. You can talk to a person any time." No testimonial panel
- **Questions so far:** 0
- **Events:** page view on /portal/join (Legion's start milestone)

### 2. Quick facts (fit check)
- **Asks:** date of birth, state, insurance plan or self-pay, then two direct questions: "Are you thinking about harming yourself or others?" and "Have you been hospitalized for mental health or substance use in the past year?" The hospital-stay question is labelled "Confirm with Legion's clinical team": it's their clinical screen
- **Rules, not AI:** under 18, outside Texas, or Medicaid or Medicare screen the patient out kindly. "Yes" to the safety question goes straight to the crisis path. "Yes" to the hospital stay screens out kindly with specialized treatment resources, as today's flow does (mobile recording, about 0:40)
- **Fixes:** the 34.8% drop (a test, not a fact)
- **Questions so far:** 5
- **Events:** page view on /portal/join/fit; `portal.fit.submitted` with the result; `portal.fit.screened_out` with the reason; `portal.crisis.shown` with where it came from

### 3. Covered (or self-pay)
- **Shows:** "Your plan is in network. Most patients pay $0 to $40 a visit." Self-pay sees the cash price instead. Labelled "Demo: coverage check simulated"
- **Questions so far:** 5
- **Events:** `portal.coverage.shown` with insured or self-pay

### 4. What's going on? (AI)
- **Asks:** one question in the patient's own words, typed or spoken. Uses the intake's conversation engine. Plain form if the AI is down
- **Replaces:** the conditions and needs pages
- **Questions so far:** 6
- **Events:** page view on /portal/join/conditions (keeps Legion's milestone); `portal.concern.submitted` with typed, spoken or form

### 5. Here's what I understood (AI)
- **Shows:** what the AI understood, as chips the patient can remove or add to, in the patient's language, with the standard English label stored behind each. "The AI only restates what you said. It doesn't diagnose."
- **Questions so far:** 7
- **Events:** page view on /portal/join/needs (keeps Legion's milestone); `portal.concern.confirmed` with whether it was corrected

### 6. Your provider
- **Shows:** one recommended made-up provider first, on the first screen, with a reason from the patient's own words and plan ("Treats ADHD, takes your plan, available Thu"), and a few times. "See more providers" below. No loading box
- **Also:** a "Tell me if an earlier time opens" checkbox (M4), with a simulated notification
- **Fixes:** the 36.6% drop (a test, not a fact)
- **Questions so far:** 9 (a provider and a time)
- **Events:** page view on /portal/join/match; `portal.provider_selected` with whether it was the recommended one; `portal.provider.reservation.created`; `portal.earlier_time.requested`

### 7. What you'll pay
- **Shows:** estimated copay or cash price, charged after the visit, the cancellation policy, and "What if I cancel?" answered from fixed policy text, not AI. The policy terms in the prototype are made up and labelled
- **Questions so far:** 9
- **Events:** `portal.cost.viewed`; `portal.cost.cancel_policy_opened`

### 8. Your details
- **Asks:** name, email, phone. Notices for Terms, Privacy and AI use as links, plus one "I consent to treatment" checkbox (a proposed pattern; what's required is for Legion's counsel). Date of birth was already given; "How did you hear about us?" moves to after the first visit
- **Saves progress** to Supabase here, on the same device
- **Side path:** "This email already has an account" offers sign-in and keeps progress
- **Fixes:** the 20.4% drop (a test, not a fact)
- **Questions so far:** 13
- **Events:** page view on /portal/join/patient; `portal.onboarding.userCreated`, which links the session to the person

### 9. Hold your spot (card)
- **Shows:** "You won't be charged until after your visit." Card entry, labelled "Demo: payment simulated"
- **Questions so far:** 14
- **Events:** page view on /portal/join/payment; `portal.payment.method_added`

### 10. You're booked
- **Shows:** time, provider and video visit. Add to calendar; go to my visit page. The booking questions end here
- **Events:** `portal.appointment.confirmed`

## Part 2: Booked to first visit

### 11. Upcoming visit (portal)
- **Shows:** the visit, what to expect, reschedule, and the optional pre-visit check-in ("About 5 minutes"). A demo control skips ahead to 72 hours before
- **Events:** `portal.visit_page.viewed`

### 12. Check-in invite (preview)
- **Shows:** the email or text that invites the patient to the check-in, with the AI sentence: "We use AI to help with this check-in. You can talk to a person any time." Labelled "Demo: not actually sent"
- **Events:** `portal.intake.invited`

### 13. Pre-visit check-in (AI, built fully)
- **Shows:** a real AI conversation of 5 to 8 questions, typed or spoken, with follow-ups. Never advice or a diagnosis. "Skip, I'll cover it in my visit" is always there, and skipping never blocks the visit. Crisis words stop it and go to the crisis path. Plain form if the AI is down
- **Events:** `portal.intake.started`; `portal.intake.completed` with questions answered; `portal.intake.skipped`; `portal.intake.fallback_used`; AI cost per intake

### 14. Clinician view (AI summary)
- **Shows:** main concern, history, medications and goal, for the clinician to review, with the full conversation next to it. The summary uses only what the patient said. "AI summary for clinician review. Not a diagnosis."
- **Where the data lives:** in the patient's browser, so this view works on the same device. "Load a sample conversation" shows a clearly labelled made-up example for anyone who opens it without doing an intake
- **Events:** `portal.intake.summary_viewed`

### 15. Reminders and join (preview)
- **Shows:** 24-hour and 1-hour reminders with reschedule and a one-tap join. Previews, not sent
- **Events:** `portal.reminder.previewed`; `portal.visit.joined`

### 16. Visit completed (demo control)
- **Shows:** "Mark visit completed" and "Mark no-show", labelled as demo only. NPS is asked later in the portal, not here
- **Events:** `portal.visit.completed` with whether the intake was done (the north-star event); `portal.visit.no_show`

## Side paths

- **Screened out kindly:** from step 2 (under 18, outside Texas, Medicaid or Medicare, or a hospital stay in the past year). One calm screen with the right resources for the reason. Logs the reason, which the north star's denominator needs
- **Crisis path:** from step 2 ("Yes"), or in any free-text step when the word list or the AI flag catches it. Stops immediately and shows 988 and crisis resources and a person. The AI can only escalate, never decide it's fine to continue. The patient continues only after confirming they're safe, labelled "Confirm with Legion's clinical team"
- **AI down or wrong:** steps 4, 5 and 13 fall back to a plain form. Corrections and fallback use are tracked
- **Email already has an account:** from step 8. Offer sign-in and keep progress
- **Talk to a person:** the help link on every screen. Logs `portal.help.clicked` with the screen

## Open questions

- **The virtual-care question** is dropped. The start screen says "All visits are by video" instead, labelled "Confirm with Legion" in case they use the answer for something
- **The hospital-stay question** stays, labelled "Confirm with Legion's clinical team"
- **Event names** above are proposals in Legion's portal.* style, fixed in the build brief
- **Spanish-speaking patients:** chips show in the patient's language (step 5). Confirm with Legion whether they support Spanish-speaking patients
