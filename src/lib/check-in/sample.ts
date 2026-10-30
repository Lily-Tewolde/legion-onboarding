import { copy } from "@/copy";
import type { CheckInState } from "./stored";

// "Load a sample check-in" on the clinician view: a made-up check-in, written
// by hand (no AI call), labelled on screen as a sample. Not a real patient
const QUESTIONS = copy.checkIn.questions;

export const SAMPLE_CHECK_IN: CheckInState = {
  stage: "done",
  form: false,
  question: "",
  note: null,
  skipNoteShown: false,
  provider: "Alex Rivera, PMHNP",
  turns: [
    { id: "m1", question: QUESTIONS[0], answer: "Getting back on ADHD medication. I can't focus at work.", skipped: false },
    { id: "m2", question: QUESTIONS[1], answer: "Pretty stressed. I'm behind at work and it's getting to me.", skipped: false },
    {
      id: "m3",
      question: QUESTIONS[2],
      answer: "Adderall 20 mg in the morning. I stopped about a month ago when I ran out.",
      skipped: false,
    },
    {
      id: "m4",
      question: QUESTIONS[3],
      answer: "I saw a psychiatrist in college. The medication helped. Therapy didn't do much for me.",
      skipped: false,
    },
    { id: "m5", question: QUESTIONS[4], answer: "About 5 hours a night lately.", skipped: false },
    { id: "m6", question: QUESTIONS[5], answer: "No allergies. I have asthma.", skipped: false },
  ],
  flags: [],
  medicationsChanged: false,
  summary: {
    flags: [],
    main_concern: [{ quote: "Getting back on ADHD medication. I can't focus at work.", cites: ["m1"] }],
    whats_been_happening: [{ text: "Feeling pretty stressed; behind at work", cites: ["m2"] }],
    past_care: [{ text: "Saw a psychiatrist in college; medication helped, therapy didn't do much", cites: ["m4"] }],
    medications: [
      {
        name: "Adderall",
        name_as_said: "Adderall",
        dose: "20 mg",
        details: "in the morning; stopped about a month ago when they ran out",
        status: "stopped",
        status_as_said: "stopped",
        cites: ["m3"],
        question: null,
        confirmed_by_patient: false,
      },
    ],
    sleep: [{ text: "About 5 hours a night lately", cites: ["m5"] }],
    other_health: [{ text: "No allergies; has asthma", cites: ["m6"] }],
    goals: [{ text: "Get back on ADHD medication to focus at work", cites: ["m1"] }],
    unclear: [],
  },
};
