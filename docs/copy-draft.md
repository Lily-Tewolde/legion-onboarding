# Copy draft (for Lily to edit)

Every user-facing line for the build, screen by screen. Drafted to be calm, plain and easy to read for people up to 65: short sentences, everyday words, no jargon. Once edited, this becomes section 6 of the build brief.

Lines Lily already decided are marked **[decided]**. Lines that need close review are marked **[REVIEW]**. Lines to check with Legion are marked **[Confirm with Legion]** or **[Confirm with Legion's clinical team]**. Made-up numbers and prices are labelled on screen as demo. `{curly braces}` are filled in by the app.

Crisis resources use the wording from their own sources: the 988 Suicide & Crisis Lifeline ([988lifeline.org](https://988lifeline.org/)) and SAMHSA's National Helpline ([samhsa.gov](https://www.samhsa.gov/find-help/helplines/national-helpline)). No clinical claims.

## On every screen

- Banner: "Demo prototype: don't enter real information" **[decided]**
- Help link: "Talk to a person" **[decided]**
- Back: "Back"
- Loading: "One moment…"
- Something broke: "Something went wrong on our side. Please try again." Button: "Try again". Below: "If it keeps happening, talk to a person."

## Talk to a person (help panel)

- Title: "Talk to a person"
- "Call or text us at (555) 010-0123." Label: "Demo number"
- "Monday to Friday, 8 am to 6 pm Central." Label: "Demo hours"
- **[REVIEW]** "If you're in crisis, call or text 988 any time."
- Button: "Close"

## 1. Start

- Title: "Let's get you care"
- "Answer a few quick questions, and you'll see a provider who takes your plan. It takes a few minutes."
- "All visits are by video." **[decided]** **[Confirm with Legion]**
- AI notice box: "We use AI to help with some steps. You can talk to a person any time." **[decided]**
- Button: "Start"
- If progress is saved on this device: "Welcome back. Pick up where you left off." Button: "Continue"

## 2. A few quick facts

- Title: "A few quick facts"
- "This helps us make sure we're the right fit for you."
- Date of birth. Label: "Date of birth". Hint: "MM / DD / YYYY"
- State. Label: "Which state will you be in for your visits?"
- Payment. Label: "How will you pay?" Options: "With insurance", "Self-pay (no insurance)"
- Plan, if insured. Label: "Your insurance plan". Placeholder: "Choose your plan". Last option: "I don't see my plan"
- **[REVIEW]** Safety question: "Are you thinking about harming yourself or others?" Options: "No", "Yes". Hint: "If you answer yes, we'll show you how to get help right away."
- **[REVIEW]** **[Confirm with Legion's clinical team]** "Have you been in the hospital for mental health or substance use in the past year?" Options: "No", "Yes". Hint: "This helps us make sure we can offer the right level of care."
- Button: "Continue"
- Errors:
    - "Please enter your date of birth as MM / DD / YYYY."
    - "Please choose a state."
    - "Please choose how you'll pay."
    - "Please answer this question."

## Screen-outs **[REVIEW]**

Same layout for each. Every screen-out has "Answered by mistake? Go back" and the help link.

**Under 18**
- Title: "Let's find you the right care"
- "Our care is for adults 18 and older."
- "Talk with a parent, guardian or your doctor about next steps."
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

## Crisis screen **[REVIEW]**

Shown from the safety question, or when the word list or the AI flag catches something in a free-text step.

- Title: "Help is available right now"
- From a free-text step only: "We want to make sure you're okay."
- "If you're in immediate danger, call 911."
- "Call or text 988 to reach the 988 Suicide & Crisis Lifeline, any time. You can also chat at 988lifeline.org."
- "You can also talk to a person at Legion: (555) 010-0123." Label: "Demo number"
- Buttons: "Call 988", "Text 988", "Talk to a person"
- **[Confirm with Legion's clinical team]** To continue: checkbox "I'm safe right now and want to keep going", then button "Continue"

## 3. Coverage

**Insured**
- Title: "You're covered"
- "Your plan is in network. Most patients pay $0 to $40 a visit."
- "You'll see your full cost before you book."
- Label: "Demo: coverage check simulated"
- Button: "Continue"

**"I don't see my plan"**
- Title: "We couldn't find your plan"
- "You can continue as self-pay, or talk to a person to check your plan."
- Buttons: "Continue as self-pay", "Talk to a person"

**Self-pay**
- Title: "Self-pay"
- "Visits are $150 each, charged after your visit." Label: "Demo price"
- Button: "Continue"

## 4. What's going on?

- Title: "What's going on?"
- "Tell us in your own words. A sentence or two is enough."
- Placeholder: "For example: I was diagnosed with ADHD and my medication ran out."
- Buttons: "Speak instead" / "Type instead", "Continue"
- While listening: "Listening… Tap to stop."
- While reading: "Reading what you wrote…"
- If empty: "Please tell us a little about what's going on."
- Link: "Use a simple form instead"

**Form fallback (if the AI is down or the patient chooses it)**
- Note: "We're using a simple form for this step."
- "What would you like help with? Choose any that fit." Options to match Legion's conditions list **[Confirm with Legion]**, plus "Other" and "I'm not sure"
- "How can we help you?" Legion's three options: "I already have a diagnosis and need medication support", "I'm looking for a new diagnosis or medication", "I'm not sure, but I need help"

## 5. Here's what I understood

- Title: "Here's what I understood"
- "Remove anything that's wrong, or add anything I missed."
- Chip remove (for screen readers): "Remove {item}"
- Add: "+ Add"
- "This only repeats what you told us. It isn't a diagnosis."
- Buttons: "Looks right", "Start over"

## 6. Your provider

- Title: "Recommended for you"
- Reason: "Why {first name}: treats {concern} · takes your plan · available {day}"
- Label: "Demo: made-up provider"
- "Video visit · about 60 minutes" **[Confirm with Legion]**
- "Pick a time"
- Link: "See more providers"
- Checkbox: "Tell me if an earlier time opens"
- When checked: "We'll let you know if an earlier time opens." Label: "Demo: notification simulated"
- Button: "Book {day} at {time}"
- While loading: "Finding providers who take your plan…"
- If no times: "We don't have open times for your plan right now." Buttons: "Talk to a person", "Tell me when times open"

## 7. What you'll pay

- Title: "What you'll pay"
- Insured: "Estimated cost per visit: $0 to $40"
- Self-pay: "Cost per visit: $150" Label: "Demo price"
- "When you're charged: after your visit"
- "Cancel or reschedule 48 hours or more before: no charge"
- "Cancel within 48 hours, or miss the visit: $50 fee"
- Label: "Demo: example policy" **[Confirm with Legion]**
- Link: "What if I cancel?" Opens: "You can cancel or reschedule from your visit page. If it's 48 hours or more before your visit, there's no charge. If it's later, or you miss the visit, there's a $50 fee."
- Button: "Continue"

## 8. Your details

- Title: "Your details"
- "So your provider knows who you are, and we can send you your visit details."
- Fields: "First and last name", "Email", "Mobile phone"
- **[Confirm with Legion]** Notice: "By continuing, you agree to our Terms of Service and Privacy Policy. You can read our HIPAA Notice of Privacy Practices and how we use AI." (Each is a link. A proposed pattern; what's required is for Legion's counsel.)
- **[Confirm with Legion]** Checkbox: "I consent to treatment by Legion Health providers." Link: "Read the consent"
- Button: "Save and continue"
- After saving: "Saved. You can come back to this on this device."
- Errors:
    - "Please enter your first and last name."
    - "Please enter an email like name@example.com."
    - "Please enter a 10-digit US phone number."
    - "Please check the box to continue."
- Email already used: "There's already an account with this email." Buttons: "Sign in and pick up where you left off", "Use a different email". Label: "Demo: sign-in simulated"

## 9. Hold your spot

- Title: "Hold your spot"
- "We'll charge your card after your visit, not now."
- Fields: "Card number", "Expiry (MM/YY)", "Security code", "ZIP code"
- Label: "Demo: payment simulated. Use any made-up card number."
- Button: "Book my visit"
- Error: "We couldn't save this card. Please check the details and try again."

## 10. You're booked

- Title: "You're booked"
- "{Day}, {date} at {time} · {Provider} · Video visit"
- "We'll send you a reminder before your visit."
- Buttons: "Add to calendar", "Go to my visit page"

## 11. Your first visit

- Title: "Your first visit"
- "{Day}, {date} at {time} · {Provider} · Video visit"
- What to expect: "Your provider will ask about what's going on, your history and any medications. Plan for about 60 minutes somewhere quiet and private." **[Confirm with Legion]**
- Links: "Reschedule", "Cancel visit"
- Check-in card: "Optional: pre-visit check-in". "About 5 minutes. It helps your provider prepare. You can skip it."
- Before it opens: "Opens 72 hours before your visit."
- When open: button "Start check-in"
- Demo control: "Demo: skip to 72 hours before"

## 12. Check-in invite (preview)

- Label: "Preview: email and text, not sent"
- Email subject: "Your visit on {day}: a 5-minute check-in"
- Message: "Hi {first name}, your visit with {Provider} is on {day} at {time}. Want to save time in your visit? Do a 5-minute check-in: {link}. We use AI to help with some steps. You can talk to a person any time." **[decided]** (the AI sentence)

## 13. Pre-visit check-in

- Title: "Pre-visit check-in"
- "A few questions so your provider can prepare. Answer as much or as little as you like."
- **[Confirm with Legion's clinical team]** Starting questions (the AI asks short follow-ups, 5 to 8 in all):
    1. "What would you most like help with at your visit?"
    2. "What medications are you taking right now, including any you've stopped recently?"
    3. "Have you had mental health care before? What helped, and what didn't?"
    4. "How have you been sleeping lately?"
    5. "Is there anything else about your health your provider should know, like allergies or other conditions?"
- Placeholder: "Type your answer, or tap Speak"
- Buttons: "Speak", "Send", "Skip this question"
- Always visible: "Skip, I'll cover it in my visit"
- While the AI replies: "One moment…"
- Form fallback note: "We're using a simple form for the check-in."
- Done: "Thanks. Your provider will see your answers before your visit." Button: "Back to my visit page"

## 14. Clinician view

- Title: "Pre-visit summary for {Provider}"
- Label: "AI summary for clinician review. Not a diagnosis."
- Headings: "Main concern", "History", "Medications", "Goals for the visit", "Anything else"
- Side panel: "Full conversation"
- **[REVIEW]** If a safety flag was raised: "A safety flag was raised during the check-in. See the conversation."
- No check-in on this device: "No check-in on this device yet." Button: "Load a sample conversation"
- Sample label: "Sample: a made-up conversation for demo purposes"

## 15. Reminders and join (preview)

- Label: "Preview: not sent"
- 24 hours before: "Reminder: your visit with {Provider} is tomorrow at {time}. Need to change it? {link}"
- 1 hour before: "Your visit starts in 1 hour. Join here: {link}"
- Button: "Join visit"

## 16. Demo controls

- Title: "Demo controls"
- Buttons: "Mark visit completed", "Mark no-show"
- "Demo only. This records how the visit went, so the funnel runs from start to finish."
- After marking: "Visit marked completed (demo)" or "Visit marked as a no-show (demo)"
