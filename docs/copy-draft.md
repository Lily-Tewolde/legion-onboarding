# Copy draft (edited by Lily)

Every user-facing line for the build, screen by screen. Calm, plain and easy to read for people up to 65: short sentences, everyday words, no jargon. Once locked, this becomes section 6 of the build brief.

Lines Lily already decided are marked **[decided]**. Lines that need close review are marked **[REVIEW]**. Lines to check with Legion are marked **[Confirm with Legion]** or **[Confirm with Legion's clinical team]**. Prices and the cancellation policy are Legion's, read from the current flow's payment page (desktop recording, about 3:37), and labelled "From Legion's current flow". Other made-up values are labelled on screen as demo. `{curly braces}` are filled in by the app.

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
- Back: "Back"
- Loading: skeleton screens, no loading text
- When an AI step takes more than 5 seconds: "Still working on it…". At 10 seconds, the "Use a simple form instead" link is offered, and what they typed is kept **[decided]**
- When the AI limit for the visitor or the day is reached, or the AI fails: the step opens as the simple form with its note ("We're using a simple form for this step." or "…for the check-in.")
- Something broke: "Something went wrong on our side. Please try again." Button: "Try again". Below: "If it keeps happening, talk to a person."

**Lily's notes**
- Approved as drafted, with skeletons instead of "One moment…"

## Talk to a person (help panel)

- Title: "Talk to a person"
- "Call or text us at (555) 010-0123." Label: "Demo number"
- "Monday to Friday, 8 am to 6 pm Central." Label: "Demo hours"
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
- Payment. Label: "How will you pay?" Options: "With insurance", "Self-pay (no insurance)"
- Plan, if insured. Label: "Your insurance plan". Placeholder: "Choose your plan". Last option: "I don't see my plan". Coverage shows inline under the field (see screen 3)
- Self-pay, shown inline once chosen: "Self-pay is $250 for your first visit and $150 for follow-up visits, charged after your visit." Label: "From Legion's current flow"
- **[REVIEW]** Safety question: "Are you thinking about harming yourself or others?" Options: "No", "Yes". Hint: "If you answer yes, we'll show you how to get help right away."
- **[REVIEW]** **[Confirm with Legion's clinical team]** "Have you been in the hospital for mental health or substance use in the past year?" Options: "No", "Yes". Hint: "This helps us make sure we can offer the right level of care."
- Button: "Continue"
- Errors:
    - "Please enter your date of birth as MM / DD / YYYY."
    - "Please choose how you'll pay."
    - "Please answer this question."

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
- "You can also talk to a person at Legion: (555) 010-0123." Label: "Demo number" **[Confirm with Legion]** who answers and when
- Buttons on phones (one tap opens the dialer or messages): "Call 988", "Text 988", "Call 911". On desktop: the numbers shown clearly
- Button: "Talk to a person"
- **[Confirm with Legion's clinical team]** To continue: checkbox "I'm safe right now and want to keep going", then button "Continue"

**Lily's notes**
- Approved as drafted
- On phones, "Call 988", "Text 988" and "Call 911" are one-tap buttons. 988 is the most prominent, 911 is for immediate danger
- "Talk to a person at Legion" is an enhancement. Legion's current crisis screen only lists outside resources. In real life it needs someone to answer, so we confirm with Legion who answers and when

## 3. Coverage (inline on screen 2)

Shown under the plan field once a plan is picked. Not its own screen.

**Insured**
- "You're covered. Your plan is in network. Most patients pay $0 to $40 a visit." Label: "From Legion's current flow"
- "You'll see your full cost before you book."
- Label: "Demo: coverage check simulated"

**"I don't see my plan"**
- "We couldn't find your plan. You can continue as self-pay, or talk to a person to check your plan."
- Buttons: "Continue as self-pay", "Talk to a person"

**Lily's notes**
- I don't want coverage to be its own screen. It shows inline under the plan field. Same for "I don't see my plan" and the self-pay price

## 4. What's going on?

- Title: "What's going on?"
- "Tell us in your own words. A sentence or two is enough."
- Placeholder: "For example: I was diagnosed with ADHD and my medication ran out."
- Starter chips under the text box (tap any that fit): "ADHD", "Anxiety", "Depression", "Sleep", "Not sure"
- Mic button: "Speak". While listening: "Listening… Tap to stop."
- Button: "Continue"
- While reading: skeleton
- If empty: "Please tell us a little more."
- Link: "Use a simple form instead"

**Form fallback (if the AI is down or the patient chooses it)**
- Note: "We're using a simple form for this step."
- "What would you like help with? Choose any that fit." Options to match Legion's conditions list **[Confirm with Legion]**, plus "Other" and "I'm not sure"
- "How can we help you?" Legion's three options: "I already have a diagnosis and need medication support", "I'm looking for a new diagnosis or medication", "I'm not sure, but I need help"

**Lily's notes**
- I added tap-to-select starter chips under the text box. People can tap, type or both, and the AI combines what they give. I'm thinking about older patients here: nobody should get stuck on a blank box
- Typing is the default, with a visible mic button. Not voice-first. Voice is speech-to-text only, using the browser's built-in speech recognition. The AI doesn't talk back
- Empty error is now "Please tell us a little more."

## 5. Here's what we understood

- Title: "Here's what we understood"
- "Remove anything that's wrong, or add anything we missed."
- Chip remove (for screen readers): "Remove {item}"
- Add: "+ Add"
- Policy line, only for the concern it applies to **[Confirm with Legion]**. For example, for Anxiety: "We don't prescribe benzodiazepines over 1 mg a day."
- "This only repeats what you told us. It isn't a diagnosis."
- Buttons: "Looks right", "Start over"

**Lily's notes**
- I changed "I" to "we" on this screen
- I like this screen a lot
- Legion's condition policies stay, but compact. In their current flow these sit in big expanding cards (for example, ADHD medication with strict clinical standards and online ADHD testing, and no benzodiazepines over 1 mg a day). Here it's one short, soft line, only for the concern it applies to. Exact wording to confirm with Legion

## 6. Your provider

- Title: "Recommended for you"
- Reason: "Why we recommend {full name}, {credential}: treats {concern} · takes your plan · available {day}". For self-pay, leave out "takes your plan"
- Label: "Demo: made-up provider"
- "Video visit · about 60 minutes" (60 minutes is from Legion's current flow)
- "Pick a time"
- Link: "See more providers"
- Checkbox: "Tell me if an earlier time opens"
- When checked: "We'll let you know if an earlier time opens." Label: "Demo: notification simulated"
- Button: "Book {day} at {time}"
- While loading: skeleton
- If no times: "We don't have open times for your plan right now." Buttons: "Talk to a person", "Tell me when times open"

**Lily's notes**
- The reason line uses the full name and credential, like "Why we recommend Alex Rivera, PMHNP". Legion's providers include nurse practitioners, so not "Dr." for everyone
- "Takes your plan" is left out for self-pay patients
- Skeleton loading instead of "Finding providers…"
- Provider times are made-up data in the prototype. No calendar integration
- Everything else approved

## 7. Book your visit (screens 7, 8 and 9 combined)

One page, like a one-page checkout when you shop online.

**Your visit (summary card at the top)**
- "{Day}, {date} at {time} · {Provider} · Video visit"
- Insured: "Estimated cost per visit: $0 to $40" Label: "From Legion's current flow"
- Self-pay: "Cost: $250 for your first visit, $150 for follow-up visits" Label: "From Legion's current flow"
- Insured: "When you're charged: for what insurance doesn't cover, about 5 days after your visit" Label: "From Legion's current flow"
- Self-pay: "When you're charged: after your visit"
- "Free to cancel up to 48 hours before"
- Link: "What if I cancel?" Opens: "You can cancel or reschedule from your visit page. If it's 48 hours or more before your visit, there's no charge. If it's later, or you miss the visit, the fee is $250 for your first visit and $100 for follow-ups. Missing the visit means not joining within 10 minutes of the start." Label: "From Legion's current flow"

**Your details**
- "So your provider knows who you are, and we can send you your visit details."
- Fields: "First and last name", "Email", "Mobile phone"
- **[Confirm with Legion]** Notice: "By continuing, you agree to our Terms of Service and Privacy Policy. You can read our HIPAA Notice of Privacy Practices and how we use AI." (Each is a link. A proposed pattern; what's required is for Legion's counsel.)
- **[Confirm with Legion]** Checkbox: "I consent to treatment by Legion Health providers." Link: "Read the consent"
- Email already used: "There's already an account with this email." Buttons: "Sign in and pick up where you left off", "Use a different email". Label: "Demo: sign-in simulated"

**Payment**
- "You won't be charged now."
- Fields: "Card number", "Expiry (MM/YY)", "Security code", "ZIP code"
- Label: "Demo: payment simulated. Use any made-up card number."

**Button:** "Book my visit"

- Errors:
    - "Please enter your first and last name."
    - "Please enter an email like name@example.com."
    - "Please enter a 10-digit US phone number."
    - "Please check the box to continue."
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
- Compact confirmation card: "{Day}, {date} at {time} · {Provider} · Video visit"
- "We'll send you a reminder before your visit."
- "Add to calendar": "Google", "Apple", "Outlook"
- Button: "Go to my visit page"

**Lily's notes**
- A normal, compact confirmation card with the date, time, provider and the next step. Not three-quarters of the page like Legion's current one
- "Add to calendar" with Google, Apple and Outlook. They can actually work (a calendar file for Apple and Outlook, a link for Google)

## 11. Your first visit

- Title: "Your first visit"
- "{Day}, {date} at {time} · {Provider} · Video visit"
- Calendar preview of the visit, with "Add to calendar": "Google", "Apple", "Outlook"
- What to expect: "Your provider will ask about what's going on, your history and any medications. Plan for about 60 minutes somewhere quiet and private." (60 minutes is from Legion's current flow)
- Links: "Reschedule", "Cancel visit"
- Check-in card: "Optional: pre-visit check-in". "About 5 minutes. Your provider can spend more of your visit on you. You can skip it."
- "Do it any time before your visit. Earlier gives your provider time to read it."
- Button: "Start check-in"
- Messages: "Inbox" (see screens 12 and 15)
- Demo control: "Demo: skip to 72 hours before"

**Lily's notes**
- This is a simple version of a patient portal page
- The check-in opens any time after booking. No 72-hour lock. The 72-hour reminder stays as a nudge
- The check-in card says what's in it for the patient, because Legion puts the patient first

## 12. Check-in invite (in-app inbox)

- Shown in the portal's inbox. Label: "Also sent to your email and phone (demo)"
- Subject: "Your visit on {day}: a 5-minute check-in"
- Message: "Hi {first name}, your visit with {Provider} is on {day} at {time}. Want to save time in your visit? Do a 5-minute check-in: {link}. We use AI to help with some steps. You can talk to a person any time." **[decided]** (the AI sentence)

**Lily's notes**
- Messages live in an in-app inbox, a notification centre inside the portal, not as out-of-app emails. Nothing real gets sent
- Message copy approved, including the AI sentence

## 13. Pre-visit check-in

- Title: "Pre-visit check-in"
- "A few questions so your provider can prepare. Answer as much as you'd like."
- One question at a time, form-style
- **[Confirm with Legion's clinical team]** Starting questions (the AI writes short follow-ups, 5 to 8 questions in all):
    1. "What would you most like help with at your visit?"
    2. "How have you been feeling lately?"
    3. "What medications are you taking right now, including any you've stopped recently?"
    4. "Have you had mental health care before? What helped, and what didn't?"
    5. "How have you been sleeping lately?"
    6. "Is there anything else about your health your provider should know, like allergies or other conditions?"
- Placeholder: "Type your answer, or tap Speak"
- Buttons: "Speak", "Next", "Skip this question"
- Always visible: "Skip, I'll cover it in my visit"
- While the next question loads: skeleton
- Form fallback note: "We're using a simple form for the check-in."
- Done: "Thanks. Your provider will see your answers before your visit." Button: "Back to my visit page"

**Lily's notes**
- "Answer as much as you'd like" instead of "as much or as little"
- One question at a time, form-style like Typeform, not chat bubbles. The AI still writes each next question from the answers so far
- I added "How have you been feeling lately?" I want the provider to get the full picture of the person
- 5 to 8 questions. We suggest standard screeners like PHQ-9 and GAD-7 to Legion's clinical team as an option, but don't build them in

## 14. Clinician view

- Title: "Pre-visit summary for {Provider}"
- Label: "AI summary for clinician review. Not a diagnosis."
- Flags at the top: safety and eligibility
- **[REVIEW]** If a safety flag was raised: "A safety flag was raised during the check-in. See the answers."
- **[Confirm with Legion's clinical team]** Sections: "Main concern (in the patient's words)", "What's been happening", "Past mental health care", "Medications (current and recently stopped)", "Sleep", "Other health and allergies", "Goals for the visit", "Unclear answers"
- Each line links to the answer it came from
- Side panel: "All answers" (questions and answers)
- No check-in on this device: "No check-in on this device yet." Button: "Load a sample check-in"
- Sample label: "Sample: a made-up check-in for demo purposes"

**Lily's notes**
- A one-page structured summary, like a clipboard, not a conversation
- I added "Sleep", since the check-in asks about it and the eval schema has it
- The side panel shows questions and answers, not a chat
- Safety flag line approved

## 15. Reminders and join (in-app inbox)

- Shown in the portal's inbox and on the calendar preview. Label: "Also sent to your email and phone (demo)"
- 24 hours before: "Reminder: your visit with {Provider} is tomorrow at {time}. Need to change it? {link}"
- 1 hour before: "Your visit starts in 1 hour. Join here: {link}"
- Button: "Join visit"

**Lily's notes**
- Same in-app inbox as the invite
- Copy approved

## 16. Demo controls

- Separate demo panel, not part of the clinician view
- Title: "Demo controls"
- Buttons: "Mark visit completed", "Mark no-show"
- "Demo only. This records how the visit went, so the funnel runs from start to finish."
- After marking completed: "Visit marked completed (demo)"
- After marking no-show: "Visit marked as a no-show (demo)". The patient's visit page then shows: "You missed your visit. Want to book a new time?" Button: "Reschedule". Plus the no-show fee line from Legion's current flow

**Lily's notes**
- A separate demo panel
- "Mark no-show" shows the unhappy path: a reschedule prompt and the no-show fee line
