# Copy draft (edited by Lily)

Every user-facing line for the build, screen by screen. Calm, plain and easy to read for people up to 65: short sentences, everyday words, no jargon. Once locked, this becomes section 6 of the build brief.

Lines Lily already decided are marked **[decided]**. Lines that need close review are marked **[REVIEW]**. Lines to check with Legion are marked **[Confirm with Legion]** or **[Confirm with Legion's clinical team]**. Prices and the cancellation policy are Legion's, read from the current flow's payment page (desktop recording, about 3:37). Lines from Legion's current flow are marked *(from Legion's current flow)* here; nothing on screen says so, and the README credits them. Anything made up or simulated gets one small demo line at the bottom of the screen, plus the top banner, with no demo tags in the body text. `{curly braces}` are filled in by the app.

Crisis resources use the wording from their own sources: the 988 Suicide & Crisis Lifeline ([988lifeline.org](https://988lifeline.org/)) and SAMHSA's National Helpline ([samhsa.gov](https://www.samhsa.gov/find-help/helplines/national-helpline)). No clinical claims.

**Lily's notes** under each screen explain my edits (Oct 29). Screens 1 and 3 are merged into screen 2, and screens 7, 8 and 9 are now one checkout page.

## Across the whole flow

**Lily's notes**
- I want this to feel soft and warm, like something people actually want to finish. Plain, everyday words everywhere. Texas has a wide range of reading levels, so we aim for about a 6th to 8th grade reading level, with a quick automated readability check on the copy, like a mini eval for the wording
- Most of what we ask is required, because this is a regulated field. I'm changing how we ask, not what we ask
- Hints instead of expanding cards. When a question needs explaining, soft hint text sits under it. No cards that open up with a new colour
- Skeleton loading everywhere data loads, not loading messages. It feels faster
- The AI always says "we", never "I"

## On every screen

- Banner: "Demo prototype: don't enter real information" **[decided]**
- Help link: "Talk to a person" **[decided]**
- Browser tab title: "Legion Health · Prototype" **[decided]**
- Header: a small logo placeholder at the top, sized for Legion's real logo, which Claude Code drops in **[decided]**
- Progress, on the booking screens only, ending at "You're booked": one bar in four segments, one per phase. The phase name, "About you", "What's going on", "Your provider" or "Book", is a small label above the question heading. Screen readers hear "{phase}, part {n} of {total}", for example "About you, part 2 of 3". No dots, no step numbers, no time left **[decided]**
- Demo line: one small line at the bottom of a screen where something is made up or simulated, plus the banner. No demo tags in the body text **[decided]**
- Nothing on screen says "From Legion's current flow". The README credits what comes from it **[decided]**
- Desktop panel line: "Take it one step at a time. We'll help you find the right care." **[decided]**
- ~~Desktop panel quote~~ Removed Oct 30: no quote in the panel **[decided]**
- Back: "Back"
- Loading: skeleton screens, no loading text
- When an AI step takes more than 5 seconds: "Still working on it…". At 10 seconds, the "Use a simple form instead" link is offered, and what they typed is kept **[decided]**
- When the AI limit for the visitor or the day is reached, or the AI fails: the step opens as the simple form with its note ("We're using a simple form for this step." or "…for the check-in.")
- Something broke: "Something went wrong on our side. Please try again." Button: "Try again". Below: "If it keeps happening, talk to a person."
- Buttons: one primary button per screen, with the secondary action as a text-style button underneath. Where this draft lists two buttons, the first is the primary one **[decided]**
- All copy: warm, accurate, and short enough to fit on mobile and desktop **[decided]**

**Lily's notes**
- Approved as drafted, with skeletons instead of "One moment…"

## Talk to a person (help panel)

- Title: "Talk to a person"
- "Call or text us at (555) 010-0123."
- "Monday to Friday, 8 am to 6 pm Central."
- Demo line at the bottom: "Demo number and hours" **[decided]**
- "If you're in crisis, call or text 988 any time."
- Button: "Close"

**Lily's notes**
- The 988 line needs to be prominent but warm. It's there to get people help quickly, so it shouldn't feel alarming

## 1. Start (merged into screen 2)

**Lily's notes**
- I removed this screen. It wasn't a pain point in Legion's flow, it's just one more click. Its title, "All visits are by video" and the AI notice now sit at the top of screen 2, so people start answering on the first screen
- I changed "you'll see a provider who takes your plan" to "you'll see a provider who's right for you", so it works for self-pay too

## 2. Let's get you care (start and quick facts)

- Title: "Let's get you care"
- "Answer a few quick questions, and you'll see a provider who's right for you. It takes a few minutes."
- "All visits are by video." **[decided]** **[Confirm with Legion]**
- AI notice box: "We use AI to help with some steps. You can talk to a person any time." **[decided]**
- If progress is saved on this device: "Welcome back. Pick up where you left off." Button: "Continue"
- Date of birth. Label: "Date of birth". Hint: "MM / DD / YYYY"
- Texas. Question: "Will you be in Texas for your visits?" Options: "Yes", "No"
- Insurance. Label: "Do you have health insurance?" Options: "Yes", "No". "Yes" shows the plan field; "No" is self-pay **[decided]**
- Plan, if insured. Label: "Your insurance plan". Placeholder: "Choose your plan". Last option: "I don't see my plan". Coverage shows inline under the field (see screen 3)
- Self-pay, shown inline once "No" is chosen: "Self-pay is $250 for your first visit and $150 for follow-up visits, charged after your visit." *(from Legion's current flow; credited in the README, not on screen)*
- **[REVIEW]** Safety question: "Are you thinking about harming yourself or others?" Options: "Yes", "No" **[decided]**. Hint: "If you answer yes, we'll show you how to get help right away."
- **[REVIEW]** **[Confirm with Legion's clinical team]** "Have you been in the hospital for mental health or substance use in the past year?" Options: "Yes", "No" **[decided]**. Hint: "This helps us make sure we can offer the right level of care."
- Button: "Continue"
- Errors:
    - "Please enter your date of birth as MM / DD / YYYY."
    - "Please choose Yes or No." **[decided]**
    - "Please answer this question."
    - Continue with "I don't see my plan" still selected: "Choose ‘Continue as self-pay’ or talk to a person to keep going" **[decided]**
- Three steps, so nothing scrolls on a phone: date of birth and Texas, then insurance on its own, then the safety and hospital questions. Medicaid or Medicare goes straight to its screen-out when tapped, like the hospital question **[decided]**
- Self-pay, shown once "No" is chosen: "Do you have Medicaid or Medicare?" Options: "Yes", "No". "Yes" goes straight to the Medicaid or Medicare screen-out, with the same copy **[decided]**
- Every one-tap screen-out works the same way: "No" to Texas, Medicaid or Medicare (from the plan list or the self-pay question) and "Yes" to the hospital question go straight to their screen-out when tapped. Date of birth is checked on Continue **[decided]**

**Lily's notes**
- The start screen's content now opens this screen
- I replaced the state dropdown with one yes or no question. We only serve Texas, so a dropdown is an extra step. I'm asking where they'll be during the visit, not where they're from, because that's what matters for licensing. "No" goes to the outside-Texas screen-out
- Safety question: approved. It comes after the facts, not first, and the hint keeps it calm
- Hospital question: approved. It's Legion's own question from their current flow and their clinical rule, so I'm keeping what we ask and only changing how we ask it. The hint text works much better than the expanding card they use now

## Screen-outs **[REVIEW]**

Same layout for each. Every screen-out has "Answered by mistake? Go back" and the help link.

**Under 18**
- Title: "Let's find you the right care"
- "Our care is for adults 18 and older, but we still want you to get the right support."
- "A parent, guardian or your doctor can help with next steps."
- "If you need to talk to someone now, call or text 988 any time."

**Outside Texas**
- Title: "Let's find you the right care"
- "We can't see patients in your state yet."
- "Your insurance card has a member services number that can help you find care in your area."
- "SAMHSA's National Helpline: 1-800-662-HELP (4357). Free, confidential, 24/7, in English and Spanish."

**Medicaid or Medicare**
- Title: "Let's find you the right care"
- "We can't see patients with Medicaid or Medicare right now, including as self-pay."
- "Your insurance card has a member services number that can help you find care that's covered."
- "SAMHSA's National Helpline: 1-800-662-HELP (4357). Free, confidential, 24/7, in English and Spanish."

**Hospital stay in the past year** **[Confirm with Legion's clinical team]**
- Title: "Let's find you the right care"
- "Based on your answer, a program with more support may suit you better than online visits."
- "SAMHSA's National Helpline: 1-800-662-HELP (4357). Free, confidential, 24/7, in English and Spanish. They can help you find treatment near you."

**Lily's notes**
- All approved, except Under 18, which I made warmer. I still want them to feel like we want to help
- "Including as self-pay" stays. That's Legion's own rule from their current flow
- The hospital screen-out shows right after that question

## Crisis screen **[REVIEW]**

Shown from the safety question, or when the word list or the AI flag catches something in a free-text step.

- Title: "Help is available right now"
- From a free-text step only: "We want to make sure you're okay."
- "If you're in immediate danger, call 911."
- "Call or text 988 to reach the 988 Suicide & Crisis Lifeline, any time. You can also chat at 988lifeline.org."
- "You can also talk to a person at Legion: (555) 010-0123." Demo line at the bottom: "Demo number" **[Confirm with Legion]** who answers and when
- Primary button: "Call 988" **[decided]**
- Text-style buttons underneath: "Text 988", "Call 911", "Talk to a person" **[decided]**
- On phones, these open the dialer or messages in one tap. On desktop, the numbers are shown clearly
- **[Confirm with Legion's clinical team]** On its own at the bottom: checkbox "I'm safe right now and want to keep going", then button "Continue". The crisis check stays on for the rest of the session. "Continue" stays off until the box is ticked, so there's no error line **[decided]**

**Added from the golden-set review (Oct 29). Lines first drafted in the Legion Cowork Session; Lily approved them as written on Oct 29.**

*Immediate danger (for example, "I took a bunch of my pills an hour ago")* **[REVIEW]** **[decided]** **[Confirm with Legion's clinical team]**
- Title: "Call 911 now"
- "If you've taken something or you're in danger right now, call 911."
- Primary button: "Call 911"
- Secondary, text-style button under it: "Call or text 988" **[decided]**
- No "I'm safe" checkbox on this version **[Confirm with Legion's clinical team]**

*Being hurt by someone else (for example, "My partner hurts me when he drinks")* **[REVIEW]** **[decided]** **[Confirm with Legion's clinical team]**
- Title: "Help is available"
- "If you're in immediate danger, call 911."
- "The National Domestic Violence Hotline is free and open 24/7, with help in Spanish. Call 1-800-799-7233 or text START to 88788." (Source: [thehotline.org](https://www.thehotline.org/))
- "You can also talk to a person at Legion: (555) 010-0123." Demo line at the bottom: "Demo number"
- Primary button: "Call the hotline" **[decided]**
- Text-style buttons underneath: "Text the hotline", "Call 911" **[decided]**
- Quick exit, always visible at the top: "Leave this page". It opens a neutral page and replaces this one in the browser history **[decided]**
- The check-in pauses here. On its own at the bottom, like the crisis screen: checkbox "I'm safe right now and want to keep going", then button "Continue". The clinician sees a safety flag **[Confirm with Legion's clinical team]**

**Lily's notes**
- Approved as drafted
- On phones, "Call 988", "Text 988" and "Call 911" are one-tap buttons. 988 is the most prominent, 911 is for immediate danger
- "Talk to a person at Legion" is an enhancement. Legion's current crisis screen only lists outside resources. In real life it needs someone to answer, so we confirm with Legion who answers and when

## 3. Coverage (inline on screen 2)

Shown under the plan field once a plan is picked. Not its own screen.

**Insured**
- "You're covered. Your plan is in network. Most patients pay $0 to $40 a visit." *(from Legion's current flow; credited in the README, not on screen)*
- "You'll see your full cost before you book."
- Demo line at the bottom: "Demo: coverage check simulated"

**Proof moment, right after "You're covered"**
- How many Texas clinicians take their plan, the earliest visit and the typical cost, with demo numbers, as written in Claude Design's final design **[decided]**

**"I don't see my plan"**
- First, the full plan list with search **[decided]**:
    - Title: "Search for your plan"
    - Field label: "Plan name"
    - When more plans match than show: "Keep typing to see {n} more"
    - Link: "I still don't see my plan"
    - Error: "Please choose your plan."
    - In the logo slot of an insurer Legion doesn't take (no logo, on purpose): "Self-pay only" **[decided Oct 30]**
    - Button: "Search again"
- Only if their plan still isn't there: "We couldn't find your plan. You can continue as self-pay, or talk to a person to check your plan."
- Buttons: "Continue as self-pay", "Talk to a person"

**Lily's notes**
- I don't want coverage to be its own screen. It shows inline under the plan field. Same for "I don't see my plan" and the self-pay price

## 4. What's going on?

- Title: "What's going on?"
- "Tell us in your own words. A sentence or two is enough."
- Placeholder: "For example: I was diagnosed with ADHD and my medication ran out."
- Starter chips under the text box (tap any that fit), Legion's full conditions list, each with a simple line icon: "ADHD", "Anxiety", "Depression", "Insomnia & sleep", "PTSD", "OCD", "Panic disorder", "Bipolar disorder", then "Not sure" last **[decided]**
- Mic button: "Speak". While listening: "Listening… Tap to stop." Live dictation: "Listening..." in placeholder colour first, then each word as it's heard **[decided]**
- Button: "Continue"
- While reading: skeleton
- If empty: "Please tell us a little more."
- If the browser can't do speech-to-text, the mic button is hidden **[decided]**
- If the mic is blocked: "We can't use your mic. You can type instead." **[decided]**
- If nothing was heard: "We didn't hear anything. Try again, or type instead." **[decided]**
- Free-text answers here and in the check-in are up to 1,000 characters. At the limit: "That's the limit here. You can tell your provider the rest at your visit." **[decided]**
- Link: "Use a simple form instead"
- If the answer can't be read (for example, mashed keys): "We didn't quite catch that. Try again, or use a simple form instead." If it happens a second time, the simple form opens **[decided]**

**Someone else (for example, "My husband needs help with his anxiety")** **[REVIEW]** **[decided]**
- Title: "Is this for someone else?"
- "It sounds like you're looking for help for someone else. They'll need to sign up themselves, so their provider can talk with them directly."
- "If you're worried about their safety right now, call or text 988."
- Buttons: "This is for me", "Talk to a person"

**Form fallback (if the AI is down or the patient chooses it)**
- Note: "We're using a simple form for this step."
- "What would you like help with? Choose any that fit." Options, from Legion's conditions page in the current flow (eight condition cards with icons) *(from Legion's current flow; credited in the README, not on screen)*: "ADHD", "Anxiety", "Depression", "Insomnia & sleep", "PTSD", "OCD", "Panic disorder", "Bipolar disorder", "Other", "I'm not sure". The same list is offered by "+ Add" on screen 5
- "How can we help you?" Legion's three options: "I already have a diagnosis and need medication support", "I'm looking for a new diagnosis or medication", "I'm not sure, but I need help"

**Lily's notes**
- I added tap-to-select starter chips under the text box. People can tap, type or both, and the AI combines what they give. I'm thinking about older patients here: nobody should get stuck on a blank box
- Typing is the default, with a visible mic button. Not voice-first. Voice is speech-to-text only, using the browser's built-in speech recognition. The AI doesn't talk back
- Empty error is now "Please tell us a little more."

## 5. Here's what we understood

- Title: "Here's what we understood"
- "Remove anything that's wrong, or add anything we missed."
- Chip remove (for screen readers): "Remove {item}"
- Add: "+ Add". On mobile, a round + button that screen readers hear as "Add something we missed" **[decided]**
- Policy line, only for the concern it applies to **[Confirm with Legion]**. For example, for Anxiety: "We don't prescribe benzodiazepines over 1 mg a day." For now, Anxiety's is the only one
- "This only repeats what you told us. It isn't a diagnosis."
- For each concern where we don't know whether it's been diagnosed (for example, only a chip was tapped): one row under the chips, "Have you been diagnosed with {concern}?" For example: "Have you been diagnosed with anxiety?" Options: "Yes", "No", "Not sure". Concerns we already know about get no row **[decided]**. If a row is left blank on "Looks right": "Please answer this question." **[decided]**
- How each concern reads in that question, with acronyms in capitals: "ADHD", "anxiety", "depression", "insomnia", "PTSD", "OCD", "panic disorder", "bipolar disorder". No row for "Other" or "I'm not sure" **[decided]**
- Double-checks, when the answer mentions something that doesn't match screen 1: one small row each, under the chips **[decided]**
    - Another state: "You mentioned another state. Will you be in Texas for your visits?" Options: "Yes", "No"
    - Medicaid or Medicare: "You mentioned Medicaid or Medicare. Do you have Medicaid or Medicare?" Options: "Yes", "No"
    - A hospital stay: "You mentioned a hospital stay. Have you been in the hospital for mental health or substance use in the past year?" Options: "Yes", "No"
    - Age: "Can you check your date of birth?" Hint: "MM / DD / YYYY"
    - Same rules as screen 1: "No" to Texas, "Yes" to Medicaid or Medicare and "Yes" to the hospital question go straight to their screen-out when tapped. The date of birth is checked on "Looks right"
- Buttons: "Looks right", "Start over"

**Lily's notes**
- I changed "I" to "we" on this screen
- I like this screen a lot
- Legion's condition policies stay, but compact. In their current flow these sit in big expanding cards (for example, ADHD medication with strict clinical standards and online ADHD testing, and no benzodiazepines over 1 mg a day). Here it's one short, soft line, only for the concern it applies to. Exact wording to confirm with Legion

## 6. Your provider

- Title: "Recommended for you"
- Summary at the top: "{plan} providers in Texas for {concern}", for example "Aetna providers in Texas for anxiety" **[decided]**
    - Self-pay: "Providers in Texas for {concern}" **[decided]**
    - With only "Not sure" or "Other": "{plan} providers in Texas" **[decided]**
- Tapping a provider shows that provider's own times as a short day strip **[decided]**
- Reason: "Why we recommend {full name}, {credential}: treats {concern} · takes your plan · available {day}". For self-pay, leave out "takes your plan". With only "Not sure" or "Other", leave out "treats {concern}" **[decided]**
- If the time was just taken: "That time was just taken. Please pick another time." **[decided]**
- Demo line at the bottom: "Demo: made-up provider"
- "Video visit · about 60 minutes" (60 minutes is from Legion's current flow)
- "Pick a time"
- Link: "See more providers". Opens a list of provider cards, each with a reason line and the next available time, the recommended one pinned at the top. Three at a time, then "Show more providers" **[decided]**
- Checkbox: "Tell me if an earlier time opens"
- When checked: "We'll let you know if an earlier time opens." Demo line at the bottom: "Demo: notification simulated"
- Button: "Book {day} at {time}"
- While loading: skeleton
- If no times: "We don't have open times for your plan right now." Buttons: "Talk to a person", "Tell me when times open". Claude Design's no-times copy is approved as written **[decided]**

**Lily's notes**
- The reason line uses the full name and credential, like "Why we recommend Alex Rivera, PMHNP". Legion's providers include nurse practitioners, so not "Dr." for everyone
- "Takes your plan" is left out for self-pay patients
- Skeleton loading instead of "Finding providers…"
- Provider times are made-up data in the prototype. No calendar integration
- Everything else approved

## 7. Book your visit (screens 7, 8 and 9 combined)

Two steps: details, then payment **[decided]**. The visit card stays on both.

**Your visit (summary card at the top)**
- Two or three labelled rows: date and time, who they're seeing, video visit, with the short date ("Mon, Nov 2") where the full one would wrap **[decided]**
- Cost shows once: in the desktop panel, and on the Details step on mobile **[decided]**
- Insured: "Estimated cost per visit: $0 to $40" *(from Legion's current flow; credited in the README, not on screen)*
- Self-pay: "Cost: $250 for your first visit, $150 for follow-up visits" *(from Legion's current flow; credited in the README, not on screen)*
- Insured: "When you're charged: for what insurance doesn't cover, about 5 days after your visit" *(from Legion's current flow; credited in the README, not on screen)*
- Self-pay: "When you're charged: after your visit"
- "Free to cancel up to 48 hours before"
- Link, inside the visit box: "What if I cancel?" Opens: "You can cancel or reschedule from your visit page. If it's 48 hours or more before your visit, there's no charge. If it's later, or you miss the visit, the fee is $250 for your first visit and $100 for follow-ups. Missing the visit means not joining within 10 minutes of the start." *(from Legion's current flow; credited in the README, not on screen)*

**Your details**
- "So your provider knows who you are, and we can send you your visit details."
- Fields: "First and last name" (up to 100 characters; one word is accepted), "Email", "Mobile phone"
- Email already used: "There's already an account with this email." Buttons: "Sign in to continue", "Use a different email". Demo line at the bottom: "Demo: sign-in simulated"
- At the end of the details step, before their details are saved **[decided]**:
    - **[Confirm with Legion]** Notice, one line, right before the consent: "By continuing, you agree to the terms and privacy notice." "terms" links to Legion's terms of service and "privacy notice" to Legion's privacy policy, both on legionhealth.com, opening in a new tab **[decided Oct 30]**. A proposed pattern; what's required is for Legion's counsel
    - **[Confirm with Legion]** Checkbox: "I consent to treatment by Legion Health providers." Link right after it: "Read the consent", opening in a new tab **[decided]**
    - "Read the consent" opens a placeholder page, since Legion's consent isn't published **[decided Oct 30]**:
        - Title: "Consent to treatment"
        - "Legion's consent to treatment is a document their clinical and legal teams own. It isn't written for this prototype, so there's nothing to show here yet. In the real product, this is where the full text would open before you agree."

**Payment**
- "You won't be charged now."
- Above the payment fields, a collapsed visit summary (date, provider, video visit) that opens inside the same card **[decided]**
- Fields, with labels inside the inputs: "Card number" on its own row, then "Expiry (MM/YY)", "Security code", "ZIP code" **[decided]**
- Demo line at the bottom: "Demo: payment simulated. Any made-up card works." **[decided]**

**Button:** "Book my visit"

- Errors:
    - "Please enter your full name." **[decided]**
    - "Please enter an email like name@example.com."
    - "Please enter a 10-digit US phone number."
    - "Please check the box to continue."
    - "Please enter your card number." **[decided]**
    - "Please check the expiry date." **[decided]**
    - "Please enter the 3 or 4 digit code on your card." **[decided]**
    - "Please enter a 5-digit ZIP code." **[decided]**
    - "We couldn't save this card. Please check the details and try again."

**Lily's notes**
- I combined screens 7, 8 and 9 into one page. Three pages for cost, details and payment is too many, and the payment screen repeated the cost screen
- The cost and policy wording stays Legion's: the fees, 48 hours and the 10-minute no-show rule are their rules. Only the placement changes
- One cancellation line stays visible in the summary, and the full policy sits behind "What if I cancel?". Hiding fees completely would feel like a trap
- Cost still shows before the card fields, so my "cost before the card" decision holds
- Each section is tracked separately (details done, payment entered, booked), so merging the pages doesn't hide where people drop. Account creation is one of Legion's three biggest drops
- Details copy and consent approved as drafted. Consent wording still to confirm with Legion

## 8. Your details (merged into screen 7)

**Lily's notes**
- Now the "Your details" section of screen 7

## 9. Hold your spot (merged into screen 7)

**Lily's notes**
- Now the "Payment" section of screen 7, with "You won't be charged now." instead of repeating the full charging explanation

## 10. You're booked

- Title: "You're booked"
- Compact confirmation card, with the same labelled rows as the visit card
- "We'll send you a reminder before your visit."
- "Add to calendar", with the Google, Apple and Outlook logos in one row under it: icons only on mobile, icon and name ("Google", "Apple", "Outlook") on desktop **[decided]**
- Button: "Go to my visit page"

**Lily's notes**
- A normal, compact confirmation card with the date, time, provider and the next step. Not three-quarters of the page like Legion's current one
- "Add to calendar" with Google, Apple and Outlook. They can actually work (a calendar file for Apple and Outlook, a link for Google)

## 11. Your first visit

- Portal tabs: "Visit", "Inbox", "Profile". A bottom tab bar on mobile, a left sidebar on desktop. Profile is only an entry point **[decided]**. It shows the made-up name, email and phone from checkout, with the demo line at the bottom: "Demo: changing your details isn't part of this prototype." **[decided]**
- Milestone cards with a small "Completed" tag, for example booked, check-in done, first visit **[decided]**. Names: "Visit booked", "Check-in", "First visit". "Check-in" has an "Optional" tag that turns "Completed" once it's done **[decided]**
- Title: "Your first visit"
- The visit card, with the same labelled rows
- Calendar preview of the visit, with "Add to calendar": "Google", "Apple", "Outlook"
- What to expect: "Your provider will ask about what's going on, your history and any medications. Plan for about 60 minutes somewhere quiet and private." (60 minutes is from Legion's current flow)
- Text-style buttons: "Reschedule", "Cancel visit" **[decided]**
- "Reschedule" and "Cancel visit" both show Legion's 48-hour policy first, then act **[decided]**
- Cancel asks first: "Cancel this visit?" Buttons: "Yes, cancel it", "Keep my visit" **[decided]**
- Within 48 hours, before cancelling: "Your visit is less than 48 hours away, so cancelling now has a $250 fee." **[decided]**
- Within 48 hours, before rescheduling: "Your visit is less than 48 hours away, so rescheduling now has a $250 fee." **[decided]**
- After cancelling: "Your visit is cancelled." Button: "Book a new time" **[decided]**
- After rescheduling: "Your visit is now {day} at {time}." **[decided]**
- Check-in card: "Optional: pre-visit check-in". "About 5 minutes. Your provider can spend more of your visit on you. You can skip it."
- "Do it any time before your visit. Earlier gives your provider time to read it."
- Button: "Start check-in"
- Messages: the "Inbox" tab (see screens 12 and 15). Newest first. A long message shows three lines, then "Show all" **[decided]**
- Demo control, beside the visit card: "Demo: skip to 72 hours" **[decided]**. It then moves on to "Demo: skip to 24 hours" and "Demo: skip to 1 hour", so the reminders and "Join visit" can be shown **[decided]**
- After the visit is marked completed, a small dialog in the corner. Never during onboarding **[decided]**:
    - "How was your first visit?" 0 to 10, with "0 = Not good" and "10 = Great". Text-style button: "Not now" **[decided]**
    - After a 9 or 10: "Thank you! Would you share a short review? It helps other people find care." Buttons: "Write a review", "Not now"
    - After a lower score: "Thanks for telling us. It helps us get better."
- After the visit: "Your provider will send your next steps to your inbox." Button: "Go to my inbox" **[decided]**

**Lily's notes**
- This is a simple version of a patient portal page
- The check-in opens any time after booking. No 72-hour lock. The 72-hour reminder stays as a nudge
- The check-in card says what's in it for the patient, because Legion puts the patient first

## 12. Check-in invite (in-app inbox)

- Shown in the portal's inbox. Demo line at the bottom: "Also sent to your email and phone (demo)"
- Subject: "Your visit on {day}: a 5-minute check-in"
- Message: "Hi {first name}, your visit with {Provider} is on {day} at {time}. Want to save time in your visit? Do a 5-minute check-in: {link}. We use AI to help with some steps. You can talk to a person any time." **[decided]** (the AI sentence)

**Lily's notes**
- Messages live in an in-app inbox, a notification centre inside the portal, not as out-of-app emails. Nothing real gets sent
- Message copy approved, including the AI sentence

## 13. Pre-visit check-in

- Title: "Pre-visit check-in"
- "A few questions so your provider can prepare. Answer as much as you'd like."
- One question at a time, form-style, with one stepper for progress **[decided]**
- **[Confirm with Legion's clinical team]** Starting questions (the AI writes short follow-ups, 5 to 8 questions in all):
    1. "What would you most like help with at your visit?"
    2. "How have you been feeling lately?"
    3. "What medications are you taking right now, including any you've stopped recently?"
    4. "Have you had mental health care before? What helped, and what didn't?"
    5. "How have you been sleeping lately?"
    6. "Is there anything else about your health your provider should know, like allergies or other conditions?"
- Placeholder: "Type your answer, or tap the mic" **[decided]**
- Mic icon inside the answer box (screen-reader label: "Speak") **[decided]**
- Primary button: "Next" **[decided]**
- Text-style button under it: "Skip this question" **[decided]**
- Small link at the bottom, always visible: "Skip the check-in" **[decided]**
- While the next question loads: skeleton
- Form fallback note: "We're using a simple form for the check-in."
- After an eligibility surprise other than age: "Thanks for telling us. Someone from our team may reach out before your visit." **[drafted]**
- Fixing medications: field label "Medication", button "Remove" **[drafted]**
- After two skips in a row, shown once, never as a warning: "That's okay. A few answers help your provider spend more of your visit on you." **[decided]**
- When the patient asks something we can't answer here (for example, about cost or coverage), a soft note in line, and the check-in keeps going: "We can't answer that here. For cost or coverage, talk to a person." **[decided]**
- When the patient asks a medication question (for example, about a dose): "We'll pass your question to your provider." The check-in keeps going **[decided]**
- Medication check, at the end: "Did we get your medications right?" Each medication shows as the patient said it, or as it was heard when spoken. Primary button: "Yes, that's right". Text-style button under it: "Fix something". The "Skip the check-in" link stays at the bottom **[decided]**. If none were mentioned: "You didn't mention any medications." Buttons: "Yes, that's right", "Add one" **[decided]**
- At the medication check, when what we heard isn't a real drug name (spoken, or more than a one-letter typo): "Did you mean {drug}?" Buttons: "Yes", "No, keep what I said" **[decided]**. The patient decides, not the AI
- When it's a real drug that doesn't fit what they told us (for example, Celebrex for depression): no other drug is suggested. "Can you check the name of this medication?" It stays marked unclear for the clinician **[decided]**
- If the patient says they're under 18: the check-in stops with "Thanks for telling us. Someone from our team will reach out before your visit." **[decided]** **[Confirm with Legion's clinical and legal team]**
- Done: "Thanks. Your provider will see your answers before your visit." Button: "Back to my visit page"

**Lily's notes**
- "Answer as much as you'd like" instead of "as much or as little"
- One question at a time, form-style like Typeform, not chat bubbles. The AI still writes each next question from the answers so far
- I added "How have you been feeling lately?" I want the provider to get the full picture of the person
- 5 to 8 questions. We suggest standard screeners like PHQ-9 and GAD-7 to Legion's clinical team as an option, but don't build them in

## 14. Clinician view

- Title: "Pre-visit summary for {Provider}"
- Label: "AI summary for clinician review. Not a diagnosis."
- Leads with what a doctor scans first: the safety flag if there is one (with the quote and the link to the answer), the concern in one line with its source link, and current medications. Everything else is behind "All answers" **[decided]**
- Flags at the top: safety and eligibility
- If a safety flag was raised, two lines: "A safety flag was raised during the check-in." then "Kept going after “I'm safe”" **[decided]**
- **[Confirm with Legion's clinical team]** Sections: "Main concern (in the patient's words)", "What's been happening", "Past mental health care", "Medications (current and recently stopped)", "Sleep", "Other health and allergies", "Goals for the visit", "Unclear answers"
- Each line links to the answer it came from
- Text-style button: "All answers" (the other sections, and the questions and answers). One way to reach the answers, not two **[decided]**
- No check-in on this device: "No check-in on this device yet." Button: "Load a sample check-in"
- Demo line at the bottom, for the sample: "Sample: a made-up check-in for demo purposes"
- Clinician view lines **[drafted]**: "Flags", "Answer {number}", "Patient skipped the check-in questions.", "Skipped", "As heard: '{name}' (unclear)", "said '{name}'", "confirmed by the patient", "The AI summary isn't available. The answers are below.", plus the flag labels and status words in `src/copy.ts`

**Lily's notes**
- A one-page structured summary, like a clipboard, not a conversation
- I added "Sleep", since the check-in asks about it and the eval schema has it
- The side panel shows questions and answers, not a chat
- Safety flag line approved

## 15. Reminders and join (in-app inbox)

- Shown in the portal's inbox and on the calendar preview. Demo line at the bottom: "Also sent to your email and phone (demo)"
- 24 hours before: "Reminder: your visit with {Provider} is tomorrow at {time}. Need to change it? {link}"
- 1 hour before: "Your visit starts in 1 hour. Join here: {link}"
- Button: "Join visit"

**Lily's notes**
- Same in-app inbox as the invite
- Copy approved

## 16. Demo controls

- A small "Demo controls" button pinned in a corner of every portal and clinician screen: bottom left on desktop, and on mobile clear of the tab bar and the heading. It opens a panel, a sheet on mobile **[decided]**
- At the bottom of the Demo controls panel: "Start over", which clears the session and goes back to screen 1 **[decided]**
- Title: "Demo controls"
- Buttons: "Mark visit completed", "Mark no-show", and a switch between the patient portal and the clinician view (wording as in Claude Design's final design) **[decided]**
- "Demo only. This records how the visit went, so the funnel runs from start to finish."
- "Join visit" opens the demo controls, since there's no real video visit **[decided]**
- The switch: "Open the clinician view (demo)" and "Back to the patient portal (demo)" **[drafted]**
- After marking completed: "Visit marked completed (demo)"
- After marking no-show: "Visit marked as a no-show (demo)". The patient's visit page then shows: "You missed your visit. Want to book a new time?" Button: "Reschedule". Plus the no-show fee for a missed first visit, $250, since the demo visit is a first visit **[decided]**: "The fee for a missed first visit is $250." **[decided]** *(from Legion's current flow; credited in the README, not on screen)*. Where the full cancellation policy is shown, it keeps both amounts

**Lily's notes**
- A separate demo panel
- "Mark no-show" shows the unhappy path: a reschedule prompt and the no-show fee line
