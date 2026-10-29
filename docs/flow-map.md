# Flow map: current Texas onboarding

I walked the flow by hand on Oct 28, 2026, in incognito, as a prospective patient in Texas, on desktop and on my phone. Finding numbers refer to my Step 1 findings in `docs/step-1-findings.md`. The two screen recordings stay outside the repo. Times are approximate, from the page start times in the recordings.

"Questions so far" is the running total of questions asked up to and including that page.

## Across the whole flow

- The patient quote takes up half the page on every step, and keeps selling after someone has already clicked Get Started (findings 3, 4, 22). On mobile it showed large while loading, then switched to a smaller one (finding 23)
- Two different progress bar styles, so it doesn't feel like one experience (finding 9)
- Mobile is worse than desktop: more scrolling, more noise, and a lot of red and other alarming colours (findings 25, 28)
- Coming back: I landed in onboarding again as "Anonymous User", and Login on the homepage sent me back into onboarding (findings 1, 20). On mobile, "Already started your journey? Sign in" sits at the bottom of the conditions page (finding 32)

## 1. Start: /portal/join
- Sessions: 5,898 (100%)
- Time on page: desktop about 0:04, mobile about 0:08, including the homepage
- What it asks: nothing. The screen says it's setting up an anonymous session (findings 2, 30)
- Questions so far: 0
- Friction: the anonymous-session message is a little off-putting as the first thing a patient sees (finding 2)
- Could it screen me out: no
- AI opportunity: none noted

## 2. Fit check: /portal/join/fit
- Sessions: 5,490 (93.1% of previous). Lost 408 (6.9%)
- Time on page: desktop about 1:01, mobile about 0:56, including the "Yay! We're All Done!" screen
- What it asks: six questions, one card at a time: Texas, Medicaid or Medicare, self-harm risk, a hospital stay in the past year, 18 or older, and virtual only
- Questions so far: 6
- Friction: every card looks and behaves the same and the heading never changes (finding 5). Screen-out answers turn the card red and open a resources block; the UI is poor (finding 6). The celebration screen wastes space (findings 7, 29). On mobile: a bounce between slides, back navigation that moves between the bottom and the top, and a resources page that repeats the resources on the card (findings 24, 26, 27)
- Could it screen me out: yes. Several answers screen you out with resources (finding 6). Answering "No" to virtual care only didn't screen me out
- AI opportunity: AI could help here, but I'm worried it would make this step take longer. I want to check what's standard in the industry before changing it

## 3. Conditions: /portal/join/conditions
- Sessions: 3,578 (65.2% of previous). Lost 1,912 (34.8%), the biggest drop by count
- Which part of this drop is screening on purpose? Part of it, since several fit answers screen you out. I can't tell how much from the data
- Time on page: desktop about 0:30, mobile about 0:24
- What it asks: which conditions, from a list that includes "I'm not sure" and "Other"
- Questions so far: 7 (1 on this page)
- Friction: selecting a condition expands it into a card with extra info, which made me scroll, even on desktop (findings 10, 31). I could select every option at once, including "I'm not sure" and "Other" alongside specific conditions (finding 11)
- Could it screen me out: no, I didn't see a screen-out. I could pick "I'm not sure" and "Other"
- AI opportunity: I like the patient describing what's going on and the AI reflecting back what it understood ("ADHD, already diagnosed, looking for medication support") for the patient to confirm

## 4. Insurance: /portal/join/insurance
- Sessions: 3,338 (93.3%). Lost 240 (6.7%)
- Time on page: desktop about 0:40, mobile about 0:12
- What it asks: the insurance plan, from a grid of logos. "Other" opens a full dropdown of plans
- Questions so far: 8 (1 on this page)
- When do I learn what I'll pay: the coverage message and the "$0 to $40" estimate show at the top of this page, so I'd answered 7 questions before learning I'm covered. The late-cancellation fee, cash price and card requirement only show at payment
- Friction: the logo grid feels like picking your bank. It makes sense, but it could be smaller and more condensed. I liked seeing which plans are covered and what most patients pay (finding 12)
- Could it screen me out: unknown. There's a "None / No insurance" option, but I didn't test it
- AI opportunity: I like snapping a photo of the insurance card so the AI reads the plan and gives a real copay estimate. If they don't have the card with them, they can still pick their plan or use the dropdown

## 5. Needs: /portal/join/needs
- Sessions: 3,095 (92.7%). Lost 243 (7.3%)
- Time on page: desktop about 0:10, mobile about 0:12
- What it asks: "How can we help you?" with three options: "I already have a diagnosis and need medication support", "I'm looking for a new diagnosis or medication", and "I'm not sure, but I need help"
- Questions so far: 9 (1 on this page)
- Friction: choosing an option expands it and adds colour (blue, green). There's no need for this many colours (findings 13, 33)
- Could it screen me out: no
- AI opportunity: same as conditions. The patient describes what's going on and the AI reflects back what it understood, for the patient to confirm

## 6. Provider match: /portal/join/match
- Sessions: 3,013 (97.4%). Lost 82 (2.6%)
- Time on page: desktop about 0:20, mobile about 0:28
- How many providers, how soon available, how much choice: I see who I'd see for the first time after 9 questions. The earliest slot was 4 days out. The "Highly recommended" provider wasn't first, and its badge is small (finding 17)
- Questions so far: 11 (2 on this page: a provider and a time)
- Friction: the "Finding your perfect match" box takes up space, and I had to scroll to reach the providers (findings 14, 34). The condition chip colours on the provider card don't seem to match the conditions screen (finding 16). On mobile, the calendar and time-slot layout is odd (finding 35). I liked the About section, the earliest available time, and "I'd like an earlier appointment if one becomes available" (findings 15, 18)
- Could it screen me out: no
- AI opportunity: recommend one provider first, with a short reason why

## 7. Provider selected (same page)
- Sessions: 1,909 (63.4%). Lost 1,104 (36.6%), the biggest drop by rate
- Why would someone leave without picking: I had to scroll past the loading box to reach providers, and I missed the "Highly recommended" badge on desktop (findings 14, 17, 34). The full costs, including the late-cancellation fee, cash price and card requirement, only show at payment
- AI opportunity: recommend one provider first, with a short reason why

## 8 to 11. Reservation, patient details, account, payment
- Reservation created: 1,764 (92.4%). Lost 145
- Patient details: 1,763 (99.9%), automatic
- Account created: 1,403 (79.6%). Lost 360 (20.4%)
- Payment page: 1,403 (100%), automatic
- The plan was to stop before these. On desktop I went through to the payment page; on mobile I tapped Book, which creates a reservation, and stopped on the patient-details page (see B-log)
- What the patient-details page asks: six fields and three consent checkboxes on one page (finding 19)
- Questions so far (counting the patient-details page): 20 (9 on this page: six fields and three consents)
- Time on page: patient details about 0:32 on desktop. Payment about 0:29 on desktop, until the recording ends
- Questions answered before seeing the full cost, fees and card requirement (payment page): 20
- Friction: I hit "this email already has an account" and had to switch emails. I got an "Account created" message but couldn't sign in with it (finding 20). Payment info is required to book (finding 21). The "Your selected appointment" container is way too big (finding 22)
- AI opportunity: a plain-language cost summary, where the patient can ask "what if I cancel?" instead of reading a wall of policy

## After payment (not tracked at all)
- Payment success, booking confirmed, reminders, showing up, visit completed: no data
- I didn't add a card, so I didn't see what happens after payment, or when the account is actually created (finding 8)
- AI opportunity: an AI pre-visit intake (history, current medications, how they've been feeling), summarized for the clinician. It has to be seamless: either a conversation the patient can speak or type, or done around 72 hours before the visit, not during booking
