# Pre-mortem (Step 3e)

It's three months from now and this failed. Why? Each failure has its fix and where the fix is decided. "Decided" means it's in `docs/decisions.md` or `docs/requirements.md`. "For the build brief" means the detail is settled there.

| # | How it failed | Fix | Status |
|---|---|---|---|
| 1 | A crisis message gets missed: a word list catches "suicide" but not "I don't want to be here anymore" | A word list plus an AI flag that can only escalate. Either one stops the conversation and shows crisis resources and a person immediately. The AI can never decide it's fine to continue. The patient continues only after confirming they're safe, labelled "Confirm with Legion's clinical team" | Decided |
| 2 | The AI says something clinical: an intake follow-up drifts into advice or a diagnosis | The AI never diagnoses or gives medical advice (requirements, guardrails). The build limits it to the intake's questions and checks its replies, with a test set of prompts that try to draw out advice | Decided; details for the build brief |
| 3 | The AI is slow or down, and the patient leaves before the fallback appears | Every AI step falls back to a plain form. The build sets how long to wait before switching | Decided; timeout for the build brief |
| 4 | The intake raises no-shows because it feels like homework | Optional, 5 to 8 questions, "Skip, I'll cover it in my visit" always there, and skipping never blocks the visit. No-show rate is a guardrail | Decided |
| 5 | A real person types real health details into the public prototype | One banner on every screen: "Demo prototype: don't enter real information". Free text stays out of Supabase | Decided |
| 6 | Anyone with the link calls the AI over and over and runs up costs | Rate-limit the AI route | Decided; limits for the build brief |
| 7 | The quick facts screen out the wrong person, for example a date-of-birth mistake makes someone look under 18 | Screen-outs are rules, not AI. The Step 5 test checklist covers each rule at its edges | Test checklist (Step 5) |
| 8 | The north star can't be calculated because an event doesn't fire or a session never links to the person | Every event checked two ways, on screen and in PostHog, before submission | Test checklist (Step 5) |
| 9 | A returning patient never sees the AI notice because they resume past the start screen | Accepted risk for now: the notice shows once, at the start | Decided; revisit trigger in the decision |
| 10 | The clinician summary states something the patient didn't say | The summary uses only what the patient said. The clinician view shows the full conversation next to it | Decided |
