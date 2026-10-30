# My testing notes

Oct 30, 2026. My own hand pass through the prototype, on a phone and on desktop, in incognito, using made-up details.

This is the third of three checks on this build. The other two are `docs/design-audit.md` (an automated pass with Playwright and axe) and `docs/code-review.md` (a read-only code review in a separate session). I ran them separately and on purpose — I wanted to see whether they'd find the same things.

They didn't. The overlap was almost nothing, and that's the most useful thing I learned.

- The **automated pass** caught structure: page heights, tap targets, contrast, scroll, WCAG violations.
- The **code review** caught logic and safety: a quick-exit that left the patient's words one Back away, keyboard navigation that fired screen-outs, tracking that couldn't measure my own metric.
- **My pass** caught behaviour: a search that fought me, a safety button that was live before the safety checkbox, a mic field that jumbled its own placeholder.

The worst thing any of the three found was a safety screen whose Continue button worked before the "I'm safe right now" box was ticked. No automated check would ever flag it, because the button renders perfectly. It just shouldn't have been clickable yet.

---

## What I found, and what happened to it

### AI behaviour

**The crisis layer fires on things that aren't crises.** I said my friend was giving me my Adderall, and separately that someone close to me had passed away. Both went to the immediate-danger screen. Medication diversion isn't immediate danger and grief isn't self-harm.

This is the same family as a bug I'd already fixed in PR 18, where "No, just the Adderall." read as danger in 1 run of 3. That fix covered *naming* a medication. It didn't cover someone else supplying it, or someone else dying.

*Not fixed.* Tightening it means re-running the 70-case golden set and re-proving crisis at 100% across five runs. I wasn't going to ship a change to the crisis layer I hadn't re-proven. Written up in the README's known gaps.

**Crisis detection needs tiers, not a switch.** Related, and the more interesting version. The classifier was right that I was struggling — it was the *response* that was wrong. Bereavement doesn't need the same screen as immediate danger. What's missing is a quieter middle tier between carrying on and the full 988 treatment.

*Not fixed, deliberately.* This is the first thing I'd build next.

**Concern extraction missed two conditions I named outright.** I said "I feel anxious" and "I have PTSD" in a long answer that also mentioned ADHD, mood swings, feeling down and not sleeping. It came back with ADHD, Other, Depression, Sleep. My own prompt says anxious means Anxiety, and PTSD is a named label.

*Not fixed,* same reason — it's a prompt change, and adding the case without fixing it would turn my eval suite red.

**It didn't map "my mood goes up and down" to bipolar, and that's correct.** I checked the prompt and this is deliberate: anything that doesn't plainly mean one condition is labelled Other rather than guessed at. Mood swings is the worked example in the prompt itself. The description still reaches the clinician verbatim, because each concern carries the patient's own words.

I'd rather it refuse to guess than volunteer a serious diagnosis to someone who came here for help.

### Safety and flow

**Continue was live on the crisis screen before the "I'm safe right now" box was ticked.** That screen exists to slow someone down, and it wasn't. *Fixed.*

**The immediate-danger screen had no way back.** Ending the check-in there is my own logged decision and I stand by it when the trigger is right — but a classifier is sometimes wrong, and a screen you can't leave assumes it never is. The check-in's crisis screen already has a way back, so the pattern existed. *Fixed.*

**There was no way to restart the flow.** "Start over" only cleared my answers on the confirm screen, and Demo controls had time-skips but no reset. Once I'd booked I was stuck signed in. Anyone reviewing this would run it once and then want to run it again. *Fixed — Start over now sits in Demo controls.*

### The insurance search

Four separate faults in one component, all on the booking path: it filtered before I'd finished typing, clicking a result made it disappear, the search icon sat on top of the plan name, and picking a plan didn't fill the field. *Fixed as a whole rather than one symptom at a time.*

I also moved Medicaid, Medicare and "I don't see my plan" out of the list of accepted plans and into their own block underneath. They aren't plans — they're screen-outs, and they were sitting in a scrolling list where they could fall below the fold. Those are the options that route someone out honestly, so they shouldn't be the ones you have to scroll to find.

### The mic

The speech-to-text itself is accurate. The field around it isn't: it doesn't expand as the text grows, the placeholder doesn't hide once dictation starts so the two jumble together, the mic doesn't stop on silence, and I couldn't tell it was recording until words appeared.

This is the most visibly-AI part of the flow, so it's worth getting right.

### Motion

The whole screen travels on transitions where only the content should. Switching between portal tabs uses the same animation as moving forward through booking, which reads as hiccuping — nothing is advancing, so nothing should slide. The progress bar animated a correction instead of simply being in the right place.

The motion tokens are correct. Where they're applied is wrong.

*Not fixed today* — it touches every transition in the app and I wasn't going to make that change an hour before recording. It's the open pull request.

### Smaller

- The provider card photo was cropped on phones. *Fixed.*
- The check-in card changed height while the next question loaded, which read as a glitch. *Fixed.*
- A dropdown showed duplicated options, and going back at the end of the check-in behaved oddly. I saw each once and couldn't reproduce them. Written down rather than guessed at.

---

## What I'd do differently

I did my first pass against a build that was already being fixed, so I spent part of it re-finding things that were queued. The second pass, against merged code, was worth more in half the time.

I also tried to record my passes and lost both recordings at the five-minute mark, on two different devices. Dictating as I went turned out to be the thing that worked.
