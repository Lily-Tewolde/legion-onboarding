# Walkthrough script (draft)

About 5 minutes, never over 6. Six beats, each with what's on screen and what I say. At an easy pace the spoken part runs about 4:45, which leaves room for clicks. [fill in] marks what waits on the build.

Before recording: the desktop Step 1 clip shows my real details from 2:45 on (patient details and payment). Use the mobile clip for those moments, or blur them.

## 1. The problem, one number (0:00 to 0:30)

**On screen:** Legion's funnel, start to payment page, with 23.8% highlighted.

**Say:** "In Legion's last 30 days of data, 5,898 sessions start onboarding and 1,403 reach the payment page. That's 23.8%. And nothing after the payment page is measured, so no one knows how many of them actually get to a first visit, which is where onboarding ends. So I rebuilt it all the way to the first visit, and made sure we can measure it."

## 2. What I saw in the current flow (0:30 to 1:15)

**On screen:** Step 1 clips. Desktop fit check (0:04 to 1:05), the six identical cards. Desktop conditions (1:05), the expanding cards. Mobile match page (1:52 to 2:20), scrolling past the loading box. Mobile payment cost, or the desktop payment page with details blurred.

**Say:** "I walked it on desktop and on my phone. The fit check is six cards that all look the same, and the wrong answer turns the card red. The condition cards expand and push everything down. On the match page I scrolled past a loading box before I saw anyone. By the end, I'd answered 7 questions before I knew I was covered, 9 before I saw a provider, and 20 before I saw the full cost. The three biggest drops line up with that: the fit check, choosing a provider and creating an account."

## 3. My version, end to end (1:15 to 3:15)

**On screen:** the live prototype on a phone-size window, one take, the happy path. [fill in once built: confirm each screen below is live]

**Say, as each screen comes up:**

- **Let's get you care:** "Three quick steps: date of birth and Texas, insurance, then two direct safety questions. Pick a plan and you're covered right away, with how many Texas clinicians take it, the earliest visit and the typical cost. That's after 4 questions, not 7. The screen-outs are plain rules, not the AI."
- **What's going on?:** "Instead of the conditions and needs pages, one question in your own words. Tap, type or speak." Speak the sample answer.
- **Here's what we understood:** "The AI says it back as chips you can fix, and only asks what we don't know, like whether anxiety's been diagnosed. It never diagnoses."
- **Your provider:** "One recommended provider first, with the reason. Tap to see their times."
- **Book:** "The full cost and the cancellation policy come before the card, all on one page. You're not charged until after the visit."
- **Booked and the portal:** "Then the portal: your visit, your inbox and the check-in."
- **Pre-visit check-in:** "This is the part I built fully. About five minutes, one question at a time, typed or spoken, and you can skip it. It never blocks the visit."
- **Clinician view:** "The clinician gets a one-page summary that leads with what they'd scan first. Every line links back to what the patient said, and nothing is added."
- **Demo controls:** "Mark the visit completed, and that's the event the whole funnel ends on. Then NPS, only after the visit."
- **Safety, 10 seconds:** type "I don't want to be here anymore" into "What's going on?" and show the crisis screen. "A word list and a separate AI flag check every answer. Either one goes straight to 988 and a person."

## 4. The biggest decisions and tradeoffs (3:15 to 4:15)

**On screen:** `docs/decisions.md`, scrolling to each entry as I name it.

**Say:**

1. "First, AI where it does real work, not a chatbot on top of the old forms. I built the pre-visit check-in fully, because that's where AI takes on clinical data collection and can save clinician minutes. The booking screens are built simply, because their drops are mostly layout problems. The tradeoff is less polish on booking."
2. "Second, the rules decide eligibility, never the AI. The fit check asks facts, so coverage shows much earlier. The tradeoff: a typed date of birth can be mistyped, so the age rule is tested at its edges."
3. "Third, card at booking, charged after the visit. Every session that creates an account reaches the payment page, so there's no evidence payment is the drop, and a card protects against no-shows. Reserve-first is the first thing I'd test once payment is tracked."

## 5. How I'd measure it (4:15 to 4:45)

**On screen:** the north star from `docs/requirements.md`, then the test plan table.

**Say:** "The north star is first-visit completion within 30 days. The denominator is everyone who starts, minus people we screen out on purpose, and the screen-out rate sits next to it so over-screening can't hide. Guardrails are safety, no-shows, AI accuracy and cost. I'd run it 50/50 against the current flow. Reaching the payment page is the fastest early signal: a 3-point lift shows in about 34 days."

## 6. What's next (4:45 to 5:00)

**On screen:** `docs/next.md`.

**Say:** "Next, I'd roll the check-in out the way Legion rolls out Utah renewals, with clinicians checking the first 250 summaries. Then test reserve-first, and put the whole flow in the patient's language, not just the chips. Thanks for watching."
