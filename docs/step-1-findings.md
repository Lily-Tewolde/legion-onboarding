# Step 1 findings: current Texas onboarding

I walked Legion's current onboarding by hand in incognito on Oct 28, 2026, as a prospective patient in Texas, on desktop and on my phone. These are my findings from reviewing the recordings.

## Recordings (no audio)

- **01 - Current flow - Desktop (Oct 28).mp4:** legionhealth.com through the payment page (3:46). Trimmed to start at the Legion homepage. My personal details on the patient-details page are blurred
- **02 - Current flow - Mobile (Oct 28).mp4:** legionhealth.com through the patient-details page, which I left blank (2:26)

## Where each page starts (approximate)

| Page | Desktop | Mobile |
|---|---|---|
| Homepage | 0:00 | 0:00 |
| Fit check (6 questions) | 0:04 | 0:08 |
| Conditions | 1:05 | 1:04 |
| Insurance | 1:35 | 1:28 |
| Needs | 2:15 | 1:40 |
| Provider match | 2:25 | 1:52 |
| Patient details | 2:45 | 2:20 |
| Payment | 3:17 | not reached |

## Deviation from the plan

On desktop I went past my planned stop point: I reserved a provider slot, entered my real details and created an account. I didn't add a card, and I let the booking timer run out. On mobile I tapped Book (which creates a reservation) and stopped on the patient-details page without entering anything.

## Findings

| # | Page | Device | Time | What I found |
|---|---|---|---|---|
| 1 | Return visit | Desktop | | When I came back to the site, I landed in onboarding again as "Anonymous User". I couldn't find a way to log back in and pick up where I left off |
| 2 | Start / session | Desktop | ~0:02, ~1:04 | After I clicked in, the screen said it was setting up an (anonymous) session. It's okay, but a little off-putting as the first thing a patient sees |
| 3 | Testimonial panel | Desktop | from 0:04 | The patient quote takes up half the page on every step. It's too big, and it's in the wrong place: once someone clicks Get Started they're past consideration, so the flow shouldn't keep selling. The landing page should do that work. I want to check what's standard in health tech for reviews and social proof inside a signup flow |
| 4 | Fit check layout | Desktop | 0:04-1:00 | Half the screen goes to the quote and half to the survey. I think the survey should use the full page on desktop, keeping only the copy the patient actually needs |
| 5 | Fit check questions | Desktop | 0:04-1:00 | Six questions, one card at a time, and every one looks and behaves the same. The heading never changes. It feels rudimentary, not sleek. I'd rethink this experience entirely |
| 6 | Screen-out answers | Desktop | 0:04-1:00 | When I answered in a way that screens me out, the card turned red and opened a resources block. I understand the resources are needed, but the UI is poor. When I answered the other way, it turned green and slid on |
| 7 | "Yay! We're All Done!" | Desktop | ~1:00 | I don't like the celebration screen after the fit check. It wastes space and there's too much going on for what it says |
| 8 | Account model | Desktop | ~1:04, 2:45-3:46 | My guess is the anonymous session exists to save progress and make sign-up seamless, since basic info isn't asked until later. I'd create the profile at basic info, so the patient can sign in with those details or confirm through an emailed link, then see pending and upcoming appointments. Payment would then only secure the booking. Open question: what happens after payment, and when is the account actually created? I didn't check, since I stopped before adding a card |
| 9 | Progress bars | Desktop | 0:04-3:46 | I saw two different progress bar styles (the fit check's question bar and the 6-step bar after it). It doesn't feel like one seamless experience |
| 10 | Conditions | Desktop | 1:05-1:35 | When I selected a condition, it expanded into a card with extra info. The info may be needed, but the UI is poor and it made me scroll, even on desktop |
| 11 | Conditions | Desktop | 1:05-1:35 | I could select every option at once, including "I'm not sure" and "Other" alongside specific conditions. I'd lock those once specific ones are picked, or handle it another way (e.g. add more) |
| 12 | Insurance | Desktop | 1:35-2:15 | I'm indifferent here. The logo grid feels like picking your bank. It makes sense, but it could be smaller and more condensed. I liked that "Other" opens a full dropdown of plans, and that I could see which plans are covered and what most patients pay |
| 13 | Needs | Desktop | 2:15-2:25 | Choosing an option expanded it and added colour (blue, green). There's no need for this many colours |
| 14 | Matching | Desktop | 2:25-2:45 | The "Finding your perfect match" box takes up space and could be compressed. I had to scroll down just to see the providers |
| 15 | Provider card | Desktop | 2:25-2:45 | I liked the About section and the earliest available time, which is standard. The availability layout is good enough, but not the best |
| 16 | Provider card | Desktop | 2:25-2:45 | The condition chip colours on the provider card don't seem to match the conditions screen. I want to check this |
| 17 | Provider ranking | Desktop / Mobile | 2:25-2:45 | The "Highly recommended" provider isn't the first one shown, and the badge is small. I missed it on desktop and only saw it on mobile |
| 18 | Earlier appointment | Desktop | 2:25-2:45 | I liked "I'd like an earlier appointment if one becomes available", with auto-reschedule options and typed availability. It's something patients would want, and I would too |
| 19 | Patient details | Desktop | 2:45-3:17 | The fields are fine. There are three separate consent checkboxes, and I'd like to condense them. I need to check which consents are actually required, for Texas and for other US states as Legion expands. No legal claims until I've checked |
| 20 | Account created | Desktop | ~3:17 | I got an "Account created" message, but I couldn't sign in with it: Login on the homepage took me straight back into onboarding. I'd send a magic link to the email at basic info so the patient can finish their profile before payment |
| 21 | Payment | Desktop | 3:17-3:46 | Payment info is required to book. My question is whether it needs to be in onboarding at all. Idea: book now, add payment 24 to 72 hours before the visit or the booking is released. I want to research what other virtual care providers do (e.g. Maple in Canada, and US equivalents) |
| 22 | Complete your booking | Desktop | 3:30-3:46 | The "Your selected appointment" container is way too big, probably because the quote squeezes everything into half the page |
| 23 | Testimonial panel | Mobile | 0:08 | The quote showed large while loading, then switched to a smaller one once loaded. It makes no sense |
| 24 | Fit check | Mobile | 0:08-1:00 | I saw a bounce between question slides in the stepper, which causes a visible UI break |
| 25 | Overall | Mobile | throughout | It's worse than desktop: more scrolling and a lot of unnecessary noise. I couldn't tell where the questionnaire card starts and ends |
| 26 | Navigation | Mobile | 0:08-1:00 | Navigation sits at the bottom, so going back felt odd (maybe it relies on swipe). On the screen-out resources page the back button jumped to the top instead. It's inconsistent |
| 27 | Screen-out resources | Mobile | ~0:48-0:56 | The full "We want to help you" resources page repeats the resources already shown on the question card. I'd pick one, and show it more creatively on mobile |
| 28 | Colours | Mobile | throughout | I saw a lot of red and other alarming colours |
| 29 | "Yay! We're All Done!" | Mobile | ~1:00 | It takes up about two-thirds of the screen |
| 30 | Session | Mobile | ~1:04 | "Setting up / creating an anonymous session" showed again. Odd |
| 31 | Conditions | Mobile | 1:04-1:28 | I did a lot of scrolling through the expanding condition cards. There's no need to scroll through all of this |
| 32 | Returning patients | Mobile | 1:04-1:28 | "Already started your journey? Sign in" sits at the bottom of the page. I think it could be at the top |
| 33 | Needs | Mobile | 1:40-1:52 | Same expanding cards and colour as desktop |
| 34 | Matching | Mobile | 1:52-2:20 | The loading screen took up the whole page, then I had to scroll down to reach my matched providers. Too many friction points before I saw who I'd see |
| 35 | Availability | Mobile | 1:52-2:20 | The calendar and time-slot layout is odd; it doesn't need to be like that. I only noticed the "Highly recommended" badge here |

### My design principles for the rebuild

- Simple and sleek, very user-focused. Patients could be up to 65, so it has to work for older users too
- Follow Apple's interface guidelines and Atlassian's design rules
- Desktop gets the full page for the task, not a split screen

## AI opportunities (my take)

- **Fit check:** AI could help here, but I'm worried it would make this step take longer. I want to check what's standard in the industry before changing it
- **Conditions and needs:** I like the patient describing what's going on and the AI reflecting back what it understood ("ADHD, already diagnosed, looking for medication support") for the patient to confirm
- **Insurance:** I like snapping a photo of the insurance card so the AI reads the plan and gives a real copay estimate. If they don't have the card with them, they can still pick their plan or use the dropdown
- **Match:** recommend one provider first, with a short reason why
- **Payment:** a plain-language cost summary, where the patient can ask "what if I cancel?" instead of reading a wall of policy
- **Before the first visit:** an AI pre-visit intake (history, current medications, how they've been feeling), summarized for the clinician. It has to be seamless: either a conversation the patient can speak or type, or done around 72 hours before the visit, not during booking

**Question count:** I answered 20 questions before I saw the full cost, fees and the card requirement.
