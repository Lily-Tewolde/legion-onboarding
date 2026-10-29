# Step 3 brainstorm (3c and 3d)

Ideas for each cliff and for booking to visit. "What I said" is from my Step 1 findings (`docs/step-1-findings.md`), the flow map or my Step 3 input; a dash means I haven't said anything yet. "Pushback" is Station B's challenge. Scores are proposed by Station B for me to adjust. Choosing the slice is my call in 3d.

## How the scores work

- **Impact:** how much it could raise first-visit completion. 1 low, 3 high
- **Confidence:** how much evidence backs it (data, the walk, research). 1 a guess, 3 strong
- **Ease:** effort in a 1 to 2 day build. 3 small, 2 medium, 1 large
- **Total** = impact + confidence + ease (out of 9)
- **Safety** is pass or fail, not scored. An idea that fails can't be built as described
- **AI does the work** is shown for context, not scored. The brief asks for onboarding rebuilt "in an AI-native world"

## Fit check to conditions (1,912 lost, part of it screening on purpose)

### F1. One calm, full-page fit check
Six quick questions on a full page, one consistent design, no celebration screen.
- **What I said:** survey should use the full page on desktop (finding 4); "I'd rethink this experience entirely" (finding 5); the "Yay! We're All Done!" screen wastes space (findings 7, 29)
- **Pushback:** part of this drop is people who should be screened out, and a nicer screen won't change that. We need a screen-out event with the reason to know how much of the 1,912 is recoverable

### F2. Kind screen-outs, with a crisis path
One clear resources view per reason. A self-harm answer goes straight to crisis resources and a person.
- **What I said:** the red card and resources block is poor UI (finding 6); the full resources page repeats the card, so pick one (finding 27)
- **Pushback:** this won't raise completion; it's the safety and fit guardrail. The routing has to be rule-based, never AI

### F3. Coverage first
Ask for insurance before conditions, so the patient learns they're covered after about 2 questions instead of 7.
- **What I said:** I answered 7 questions before learning I'm covered (flow map)
- **Pushback:** it asks for insurance details earlier, before trust is built (research, question 1). The Medicaid or Medicare fit question overlaps with insurance, so the two could merge. The link between late coverage and this drop is still a guess

### F3, reworked: a fit check that asks facts
Date of birth, state, and insurance plan (or self-pay), then one direct question: "Are you thinking about harming yourself or others?" Age, state and Medicaid or Medicare are worked out from the answers instead of asked as yes/no cards. Coverage shows right after, about 4 answers in instead of 7.
- **What I said:** rework F3 so the fit check asks facts instead of six yes/no questions, keeping the self-harm question as the only direct one (Rula pattern, research question 5)
- **Pushback:** it takes on F1 and most of F3, so they become one screen. Insurance comes early in the trust ladder, but Rula does the same and shows providers straight after. Two of today's six questions aren't covered by the facts: a hospital stay in the past year, and virtual care only. "Virtual only" didn't screen me out on the walk; the hospital-stay question may be a clinical screen, so dropping it is Legion's clinical call
- **Re-score:** impact 3 (the biggest drop by count, and coverage 3 answers sooner), confidence 2 (the walk and the Rula precedent; recovering the 1,912 is still a test), ease 3. **Total 8**

### F4. AI conversation for the fit check
- **What I said:** "AI could help here, but I'm worried it would make this step take longer. I want to check what's standard in the industry before changing it"
- **Pushback:** the research found chat preferred but the same speed or slower, on longer questionnaires than this one (research, question 2). The self-harm question can't depend on AI

## Match page to provider selected (1,104 lost, the biggest drop by rate)

### M1. One recommended provider first, with a short reason
For example: "Treats ADHD, takes your plan, available Thursday." Other providers sit behind "See more providers".
- **What I said:** "recommend one provider first, with a short reason why"; the "Highly recommended" provider wasn't first and its badge was easy to miss (finding 17)
- **Pushback:** the reason has to come from real data (conditions treated, plan, earliest time), not be written by AI. Some patients care about gender or language, so "See more" has to stay easy to find

### M2. Providers on the first screen, booking in one tap
No loading box, earliest time on each card, tap a time to book.
- **What I said:** had to scroll past the "Finding your perfect match" box (findings 14, 34); liked the About section and earliest time (finding 15); the calendar layout is odd (finding 35)
- **Pushback:** a layout fix backed by the walk, but no data says how much of the 1,104 it recovers

### M3. Full cost on the match page, in plain language
Copay estimate, cash price, late-cancellation fee and card requirement, with "What if I cancel?" answered.
- **What I said:** a plain-language cost summary where the patient can ask "what if I cancel?"; 20 questions before the full cost (flow map)
- **Pushback:** more text on a decision screen. Answers about money should come from fixed policy text, not AI, because a wrong answer about fees is costly

### M4. Keep "I'd like an earlier appointment"
- **What I said:** I liked it, and patients would want it (finding 18)
- **Pushback:** it helps time to care more than choosing a provider. In the prototype it would be a checkbox with a simulated notification

## Patient details to account created (360 lost)

### A1. Save progress at basic info, with a link to come back
The patient's progress saves when they give basic info. A sign-in link by email lets them pick up where they left off, then see upcoming appointments.
- **What I said:** create the profile at basic info, sign in with those details or an emailed link, then see pending and upcoming appointments (finding 8); "I'd send a magic link to the email at basic info" (finding 20); sign-in should be at the top (finding 32)
- **Pushback:** the email round trip mustn't block the patient from continuing. Sending real emails needs an email service we haven't set up. Largest build effort on this list

### A2. A shorter details page
Ask "How did you hear about us?" after the first visit, and show the three checkboxes as notices plus one consent.
- **What I said:** condense the three consent checkboxes, and check which are required (finding 19)
- **Pushback:** what's required is for Legion's counsel (research, question 4). The prototype can show the pattern, labelled as a proposal

### A3. "This email already has an account" offers sign-in
Instead of an error, offer a sign-in link and keep the patient's progress.
- **What I said:** I hit this and had to switch emails (walk)
- **Pushback:** small, and it depends on A1

## Conditions, needs and insurance (questions before value)

### X1. Describe it in your own words; AI reflects it back
The patient types or speaks what's going on. AI restates what it understood ("ADHD, already diagnosed, looking for medication support") and the patient confirms or corrects. Replaces the conditions and needs pages.
- **What I said:** "I like the patient describing what's going on and the AI reflecting back what it understood ... for the patient to confirm"
- **Pushback:** those two pages lose few sessions today (6.7% and 2.6%), so the completion impact is small. Chat can be slower (research, question 2). It needs a form fallback and correction tracking, and the AI only restates what the patient said, never diagnoses

### X2. Insurance card photo; AI reads the plan
The AI reads the plan from a photo and gives a copay estimate. The patient can still pick their plan instead.
- **What I said:** "snapping a photo of the insurance card so the AI reads the plan and gives a real copay estimate. If they don't have the card with them, they can still pick their plan or use the dropdown"
- **Pushback:** a real eligibility check isn't possible in the prototype, so the estimate is simulated and labelled. Only made-up cards can be used

## Booking to visit (not measured today)

### B1. Booking confirmed, then an upcoming-visit screen
Time, provider, add to calendar, reschedule and the join link, in the portal.
- **What I said:** see pending and upcoming appointments (finding 8); scope input: booking confirmed and an upcoming-visit screen
- **Pushback:** none major. It's what makes the funnel measurable past payment

### B2. AI pre-visit intake about 72 hours before
History, current medications and how they've been feeling, by voice or text, summarized for the clinician. Form fallback. A crisis disclosure stops the intake and goes to crisis resources and a person.
- **What I said:** "an AI pre-visit intake ... summarized for the clinician. It has to be seamless: either a conversation the patient can speak or type, or done around 72 hours before the visit, not during booking"
- **Pushback:** the biggest link to Yash's goal of fewer clinician minutes per patient. But a step before the visit that feels like homework could raise no-shows, so it has to be short. The summary is for the clinician to review, never a diagnosis

### B3. Reminders with the intake invite
Intake invite at about 72 hours (with the AI sentence), then reminders at 24 hours and 1 hour with the join link and one-tap reschedule.
- **What I said:** scope input: a reminder and join step; the AI sentence goes in the intake invite
- **Pushback:** simulated in the prototype (show the messages, don't send them). Real texts need SMS consent, which we haven't researched

### B4a. Card at booking, charged after the visit
The norm at Talkiatry and Headway. All three peers charge after the visit (research, question 3).
- **What I said:** —
- **Pushback:** keeps a payment step before booking, but protects against no-shows

### B4b. Book now, add the card 24 to 72 hours before or the booking is released
- **What I said:** "book now, add payment 24 to 72 hours before the visit or the booking is released" (finding 21)
- **Pushback:** removes a step before booking. Rula does something close: reserve first, add the card during registration within a deadline, or the slot is cancelled (research, questions 3 and 5). It loses some no-show protection and adds a reason to lose the booking. *(Corrected after question 5: the first version said no peer does this.)*

### B5. Demo control: simulate visit completed (and no-show)
- **What I said:** scope input: a simulated visit completed with a demo control
- **Pushback:** must be clearly labelled as a demo. Needed to show the metric end to end

## Scores (proposed)

| Idea | Impact | Confidence | Ease | Total | Safety | AI does the work |
|---|---|---|---|---|---|---|
| F1 Calm full-page fit check | 2 | 2 | 3 | 7 | Pass | No |
| F2 Kind screen-outs, crisis path | 1 | 3 | 3 | 7 | Pass, and required | No |
| F3 Coverage first | 2 | 1 | 3 | 6 | Pass | No |
| F3r Fit check that asks facts (reworked) | 3 | 2 | 3 | 8 | Pass, crisis question stays direct | No |
| F4 AI fit check | 1 | 2 | 2 | 5 | Pass only if screen-outs stay rule-based | Yes |
| M1 One recommended provider | 3 | 2 | 2 | 7 | Pass | Partly (ranking) |
| M2 Providers first, one-tap booking | 2 | 2 | 3 | 7 | Pass | No |
| M3 Full cost on the match page | 2 | 2 | 2 | 6 | Pass | No |
| M4 Earlier appointment | 1 | 2 | 3 | 6 | Pass | No |
| A1 Save progress, link to come back | 2 | 2 | 1 | 5 | Pass | No |
| A2 Shorter details page | 2 | 2 | 3 | 7 | Pass | No |
| A3 Sign-in instead of email error | 1 | 3 | 3 | 7 | Pass | No |
| X1 Describe it, AI reflects back | 1 | 1 | 2 | 4 | Pass with form fallback | Yes |
| X2 Insurance card photo | 1 | 1 | 2 | 4 | Pass with made-up cards only | Yes |
| B1 Booking confirmed, upcoming visit | 2 | 2 | 2 | 6 | Pass | No |
| B2 AI pre-visit intake | 2 | 2 | 1 | 5 | Pass only with the crisis path | Yes |
| B3 Reminders with intake invite | 2 | 2 | 3 | 7 | Pass | No |
| B4a Card at booking, charged after | 1 | 2 | 3 | 6 | Pass | No |
| B4b Card 24 to 72 hours before | 2 | 2 | 2 | 6 | Pass | No |
| B5 Demo control | — | — | 3 | — | Pass | No |

**Needed whatever we pick:** F2 (crisis path), B5 (demo control), the AI notice, the help link on every screen, a form fallback for any AI step, and screen-out events with the reason, which the north star's denominator depends on.

## What the scores show

- The top scores (7) are mostly small, evidence-backed fixes: F1, F2, M1, M2, A2, A3 and B3. M1 is the only idea scored 3 on impact, because it sits on the biggest drop by rate
- The ideas where AI does the work (F4, X1, X2, B2) score lowest on completion. X1 and X2 replace pages that lose few sessions today. B2 matters most for Yash's goal of fewer clinician minutes, which the completion score doesn't capture
- That's the tension for 3d: the brief asks for onboarding rebuilt for an AI-native world, and the data says the biggest wins are on the match page and in measuring booking to visit

## 3d: the slice I chose

Logged in `docs/decisions.md`, each with what was rejected. In short:

- **Built fully:** B2, the AI pre-visit intake, with a simple clinician view
- **Built simply:** F3 reworked (with F1 and F2), M1, M2, M3, A2, A3, B1, B3 as previews, and B5. Supabase saves progress on the same device
- **Light version:** X1, one "What's going on?" question on B2's conversation engine
- **Payment:** B4a. B4b goes in "what I'd do next"
- **Not built:** F4, X2, the email link from A1

