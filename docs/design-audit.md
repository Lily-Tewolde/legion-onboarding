# Design audit: PR 23

What this checks: PR 23 ("Apply the design pass to every screen", head `7df2605`) against the design pass checklist in `docs/build-brief.md` (section 4) and Claude Design's handoff (`Main.dc.html` and `Style-Components.dc.html`), with the copy checked against `docs/copy-draft.md`.

How: Playwright on the PR 23 Vercel preview, at 390 x 700 and 1440 x 900, with made-up details only. On each screen I measured the page height, anything below the fold, tap targets under 44px, text that wraps or gets cut off, text under 16px and sideways scroll, and ran axe (WCAG 2.1 A and AA). I stopped short of typing a card number on the hosted site. Nothing is fixed here; this is the list.

Most important first.

## Fix before merging

1. **Clinician view, desktop:** after switching to it from "Demo controls", the page doesn't respond to clicks until it's reloaded. "Load a sample check-in" can't be clicked, because the page itself sits on top of the button. I reproduced it twice, and a reload fixes it. This breaks step 7 of the happy path on desktop.
2. **Details, 390 x 700:** the page is 865px tall (969px with errors). Only the name field shows above the pinned Continue; email, phone and the consent box are below it. With "There's already an account with this email.", the pinned footer grows to three lines ("Sign in to continue", "Use a different email" and the demo line), the phone field is cut in half, the consent box is hidden, and the email address is cut off at the right edge.
3. **Details and payment, both sizes:** the terms and privacy notice is on payment, right before "Book my visit". The copy draft (PR 24) puts the notice and the consent at the end of details, before the details are saved. The "Read the consent" link from the copy draft isn't on details either.
4. **Confirm ("Here's what we understood"), 390 x 700:** the page is 742px tall, and "This only repeats what you told us. It isn't a diagnosis." sits behind the pinned buttons. This was flagged in Claude Design's final round.
5. **Insurance with the plan list open, 390 x 700:** the page is 816px tall, and Medicaid, Medicare and "I don't see my plan" are below the pinned Continue. Those are the screen-out options. Check again after PR 26, which adds logos to the same list.
6. **Payment, 390 x 700:** with errors the page is 748px tall. Each error wraps to two or three lines, which pushes ZIP and the terms notice down. With the visit summary open it's 848px, and the date shows twice.
7. **Desktop path panel:** "[A short quote from a real Legion patient] Placeholder: Legion to supply" shows on every panel screen. It needs a real quote, or to come off, before the submission.
8. **Demo sheet, phone:** it stays open after "Mark visit completed" and sits on top of the rating sheet.
9. **Crisis screen from "What's going on?", 390 x 700:** with the extra line "We want to make sure you're okay." the page is 731px tall, so it scrolls. The call buttons and "I'm safe right now" stay in view, but the demo line drops below.

## Should fix

10. **Demo controls, phone:** on the portal, "Demo" sits top right beside the heading. On the clinician view, it's bottom left. The checklist says one place, clear of the tab bar and the heading.
11. **Clinician view, both sizes:** the patient's "Talk to a person" link is in the header.
12. **Tap targets under 44px:** "Demo: skip to 72 hours" is 36px tall (both sizes). "Show all" in the inbox is 24px tall. The Q1 and Q3 badges on the clinician view are 33 x 32 and 36 x 32.
13. **"You're booked" and the desktop visit page:** the Google, Apple and Outlook buttons are image placeholders with no visible name, so they read as blank boxes.
14. **Headings:** on phones the h1 is 26px on most screens but 22px on the proof moment, and insurance and safety have no h1. On desktop, details' h1 is "Your visit" at 18px, smaller than the section headings under it, and payment's h1 is 24px against 32px everywhere else.
15. **Desktop widths:** the flow and portal column is 600px, the clinician view is 760px, and details is a form plus a side card. On details, the side card runs 7px past the header's right edge (1327px against 1320px).
16. **Desktop cost lines:** "When you're charged" and "Estimated cost per visit" don't show anywhere on desktop. The panel only has "Typical cost: $0 to $40 a visit".
17. **"What's going on?", 390 x 700:** the page is 729px tall, so the "Not sure" chip sits under the pinned Continue.
18. **Safety with errors, 390 x 700:** 718px tall, and the second question's card is cut off. **Provider, 390 x 700:** 723px tall, and the provider card is cut off.
19. **Error messages are 14px** on every form. The 16px floor covers body text, and errors are what people most need to read.
20. **More providers, phone:** the reason line breaks so a line starts with "· available Tuesday".
21. **Visit page:** on desktop, "Optional: pre-visit check-in" wraps at the hyphen ("pre- / visit"). The checklist says no label wraps. On phones, "Optional" on the check-in milestone is plain text, not a tag.
22. **Clinician view, desktop:** "· Stopped" wraps onto its own line under the medication. "All answers" is centred while everything above it is left-aligned.
23. **Profile:** the phone number shows as "5125550177". Everywhere else it's formatted, like "(555) 010-0123".
24. **Demo sheet:** "Mark no-show" is an outlined button, not a text-style one under the primary. The sheet's bottom padding is tight.
25. **Rating, phone:** the 0 to 10 buttons sit in rows of 6 and 5.

## Polish

26. **Confirm, desktop:** the "+ Add" pill is a little shorter than the chips beside it.
27. **"You're booked", desktop:** the photo crops the top of the person's head.
28. **Crisis screen, phone:** "I'm safe right now and want to keep going" wraps to two lines, and "Demo number" sits 8px from the bottom edge.
29. **Under 18 screen-out:** it says "call or text 988", but there's only a call link.
30. **Details after an error, phone:** the page scrolls to the error, and the progress row and Back scroll out of view.
31. **Back from payment to details:** the skeleton shimmer shows again while details reloads.

## Copy

32. **One concern, three names:** the starter chip says "Insomnia & sleep", the confirm chip says "Sleep" and the question says "Have you been diagnosed with insomnia?". The starter chip says "Not sure" and the simple form says "I'm not sure".
33. **In the build but not in the copy draft:** add these to the draft or confirm them.
    - Desktop panel: "Your path to care", "Born {year} · Texas · {plan}", "Typical cost: $0 to $40 a visit", "Earliest visit: {date}", "Your visit: {date}"
    - Proof moment: "Care that takes your plan", "Earliest visit, {day}", "What most patients pay a visit", "Demo: numbers are made up"
    - "What's going on?": "Or tap any that fit". Simple form: "Back to the first question"
    - Provider: "We'll let you know when times open.", "Next: {date} at {time}", "Days with open times", "Times on {day}"
    - "You're booked": "Add to Google Calendar", "Add to Apple Calendar", "Add to Outlook"
    - Check-in: "Send my answers", "Check-in, question {part} of {parts}"
    - Clinician view: "See answer {number}", "As needed", and the flag labels ("Safety: possible risk of self-harm", "Safety: possible risk of harm to others", "Safety: may be being hurt by someone else", "Safety: may be in immediate danger", "Safety: past risk mentioned", "Eligibility: says they're under 18", "Eligibility: may not be in Texas", "Eligibility: mentions Medicaid or Medicare", "Eligibility: mentions a recent hospital stay", "Eligibility: may be for someone else")
    - Portal: "Your milestones"
    - Placeholders PR 23 already names: "No messages yet." and "Demo: this would open Legion's review page."
    - The four photo descriptions for screen readers, which don't need to be in the draft
34. Every other string in `src/copy.ts` (382 checked) matches the copy draft.

## Worth a look (not design)

35. **`/design` and `/demo` are on the live link.** `/design` is a design reference page ("Not part of the patient flow"), with two h1s. Decide whether it stays in the submission.
36. **Email already used:** "Sign in to continue" with an account that already has a booked visit goes on to payment for a second booking.

## What passed

- **axe:** no WCAG 2.1 A or AA problems on any screen checked, at both sizes
- **Sideways scroll:** none at either size. **Inputs:** none under 16px
- **Desktop fit:** every flow, portal and clinician screen fits 900px, and every screen-out and crisis screen fits at both sizes
- **Motion:** the tokens match the spec exactly: 0.45s in, 0.28s out, 0.12s press, 60ms between cards, the no-bounce spring curve. Forward slides in, Back slides back, cards lift in. With Reduce Motion on, screen changes become 200ms fades, sheets fade, and the shimmer and progress rings stop
- **AI slow and failing:** "Still working on it…" after 5 seconds, "Use a simple form instead" after 10, and a failed AI step goes straight to the simple form
- **Crisis links:** "Call 988" (`tel:988`), "Text 988" (`sms:988`) and "Call 911" (`tel:911`) are real links. Being hurt has the hotline's call and text links, and "Leave this page" goes to google.com
- **Starter chips:** Legion's full list, "Not sure" last. The text box grows as you type
- **Demo controls, desktop:** pinned bottom left on every portal and clinician screen

## Not re-measured in this pass

The no-show visit page, no times (06c), the double-check on confirm (U05), the check-in's retry (U13), the cancel and reschedule sheets, and "Show more providers". PR 23 lists them as checked, and PR 25's test scripts cover them. I didn't put each screen side by side with its board; PR 23 says Claude Code did that at 390 x 844 and 1440 x 900.
