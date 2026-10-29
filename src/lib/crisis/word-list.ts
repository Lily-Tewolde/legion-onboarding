// The first crisis layer: a fixed list of direct phrases, checked on the raw
// patient text before any model sees it. Plain code, so it can't be talked
// out of anything. It only catches direct wording; indirect wording ("I don't
// want to be here anymore") is what the separate AI flag is for.
//
// Phrases are whole phrases, not single words, so everyday figures of speech
// ("this ADHD is killing me", "I'd kill for a full night's sleep") don't match.
// English plus a few clear Spanish phrases (docs/evals.md, section 1).

export type CrisisKind =
  | "self_harm"
  | "harm_to_others"
  | "being_harmed"
  | "immediate_danger"
  | "past_risk";

type Phrase = { text: string; kind: CrisisKind };

const PHRASES: Phrase[] = [
  // Suicide and self-harm, English
  ...[
    "kill myself",
    "killing myself",
    "kill my self",
    "end my life",
    "ending my life",
    "end it all",
    "take my own life",
    "taking my own life",
    "suicide",
    "suicidal",
    "want to die",
    "wanna die",
    "wish i was dead",
    "wish i were dead",
    "better off dead",
    "dont want to live",
    "no reason to live",
    "hurt myself",
    "hurting myself",
    "harm myself",
    "harming myself",
    "self harm",
    "cut myself",
    "cutting myself",
  ].map((text): Phrase => ({ text, kind: "self_harm" })),

  // Suicide, Spanish
  ...[
    "no quiero vivir",
    "quiero morir",
    "quiero morirme",
    "me quiero morir",
    "me quiero matar",
    "matarme",
    "suicidarme",
    "suicidio",
    "quitarme la vida",
  ].map((text): Phrase => ({ text, kind: "self_harm" })),

  // Something already happening
  ...["overdosed", "took an overdose", "took too many pills"].map(
    (text): Phrase => ({ text, kind: "immediate_danger" }),
  ),

  // Harm to others
  ...[
    "kill someone",
    "kill somebody",
    "kill him",
    "kill her",
    "kill them",
    "hurt someone",
    "hurt somebody",
  ].map((text): Phrase => ({ text, kind: "harm_to_others" })),
];

export type WordListResult =
  | { hit: true; kind: CrisisKind; phrase: string }
  | { hit: false };

export function checkWordList(text: string): WordListResult {
  const normalised = ` ${normalise(text)} `;
  const match = PHRASES.find((phrase) =>
    normalised.includes(` ${phrase.text} `),
  );
  return match
    ? { hit: true, kind: match.kind, phrase: match.text }
    : { hit: false };
}

// Lowercase, no accents, no apostrophes ("don't" → "dont"), and every other
// non-letter as a space, so phrase matching works on whole words only
function normalise(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’‘`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
