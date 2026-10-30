// The medication check at the end of the check-in (golden-set I-07, I-08,
// I-13, I-14). Plain code with a list of known drugs, never the AI:
// - A known name (generic or brand, any case) is kept
// - Only a one-letter typo that matches exactly one known drug, with nothing
//   else close, is fixed ("Adderal" becomes Adderall)
// - Anything else isn't a known drug, so it's unclear. If one known drug is
//   clearly nearest, the patient is asked "Did you mean {drug}?" and decides
// - A real drug the AI marked as not fitting what they said it's for (Celebrex
//   for depression) gets "Can you check the name of this medication?", and no
//   other drug is suggested
// The list is common medications, for spelling only. It isn't medical advice
// and nothing here says what a drug is for

type Drug = { name: string; others?: string[]; mentalHealth: boolean };

const DRUGS: Drug[] = [
  { name: "Sertraline", others: ["Zoloft"], mentalHealth: true },
  { name: "Fluoxetine", others: ["Prozac"], mentalHealth: true },
  { name: "Escitalopram", others: ["Lexapro"], mentalHealth: true },
  { name: "Citalopram", others: ["Celexa"], mentalHealth: true },
  { name: "Paroxetine", others: ["Paxil"], mentalHealth: true },
  { name: "Venlafaxine", others: ["Effexor"], mentalHealth: true },
  { name: "Duloxetine", others: ["Cymbalta"], mentalHealth: true },
  { name: "Bupropion", others: ["Wellbutrin"], mentalHealth: true },
  { name: "Mirtazapine", others: ["Remeron"], mentalHealth: true },
  { name: "Trazodone", others: ["Desyrel"], mentalHealth: true },
  { name: "Quetiapine", others: ["Seroquel"], mentalHealth: true },
  { name: "Aripiprazole", others: ["Abilify"], mentalHealth: true },
  { name: "Olanzapine", others: ["Zyprexa"], mentalHealth: true },
  { name: "Risperidone", others: ["Risperdal"], mentalHealth: true },
  { name: "Lamotrigine", others: ["Lamictal"], mentalHealth: true },
  { name: "Lithium", mentalHealth: true },
  { name: "Buspirone", others: ["Buspar"], mentalHealth: true },
  { name: "Hydroxyzine", others: ["Vistaril", "Atarax"], mentalHealth: true },
  { name: "Alprazolam", others: ["Xanax"], mentalHealth: true },
  { name: "Clonazepam", others: ["Klonopin"], mentalHealth: true },
  { name: "Lorazepam", others: ["Ativan"], mentalHealth: true },
  { name: "Diazepam", others: ["Valium"], mentalHealth: true },
  { name: "Zolpidem", others: ["Ambien"], mentalHealth: true },
  { name: "Adderall", others: ["Amphetamine"], mentalHealth: true },
  { name: "Methylphenidate", others: ["Ritalin", "Concerta"], mentalHealth: true },
  { name: "Lisdexamfetamine", others: ["Vyvanse"], mentalHealth: true },
  { name: "Atomoxetine", others: ["Strattera"], mentalHealth: true },
  { name: "Guanfacine", others: ["Intuniv"], mentalHealth: true },
  { name: "Clonidine", mentalHealth: true },
  { name: "Prazosin", mentalHealth: true },
  { name: "Celecoxib", others: ["Celebrex"], mentalHealth: false },
  { name: "Ibuprofen", others: ["Advil", "Motrin"], mentalHealth: false },
  { name: "Acetaminophen", others: ["Tylenol"], mentalHealth: false },
  { name: "Albuterol", mentalHealth: false },
  { name: "Lisinopril", mentalHealth: false },
  { name: "Metformin", mentalHealth: false },
  { name: "Levothyroxine", others: ["Synthroid"], mentalHealth: false },
  { name: "Atorvastatin", others: ["Lipitor"], mentalHealth: false },
  { name: "Omeprazole", others: ["Prilosec"], mentalHealth: false },
  { name: "Propranolol", mentalHealth: false },
  { name: "Gabapentin", mentalHealth: false },
];

// Each spelling we know, pointing to the name we show (a brand name is shown
// as the patient would know it: "Celebrex", "Seroquel")
const SPELLINGS = DRUGS.flatMap((drug) =>
  [drug.name, ...(drug.others ?? [])].map((spelling) => ({ spelling, key: letters(spelling), drug })),
);

function letters(text: string): string {
  return text.toLowerCase().replace(/[^a-z]/g, "");
}

// Edits (insert, delete, change one letter) between two words
export function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

export type MedicationCheck =
  // A known drug, as said or after a one-letter fix
  | { kind: "known"; name: string; mentalHealth: boolean }
  // Not a known drug, but one is clearly nearest: "Did you mean {drug}?"
  | { kind: "did_you_mean"; suggestion: string }
  // Not a known drug, and nothing is clearly nearest
  | { kind: "unknown" };

export function checkMedicationName(nameAsSaid: string): MedicationCheck {
  const said = letters(nameAsSaid);
  if (!said) return { kind: "unknown" };

  const exact = SPELLINGS.find((entry) => entry.key === said);
  if (exact) return { kind: "known", name: exact.spelling, mentalHealth: exact.drug.mentalHealth };

  const ranked = SPELLINGS.map((entry) => ({ ...entry, distance: editDistance(said, entry.key) })).sort(
    (a, b) => a.distance - b.distance,
  );
  const [best] = ranked;
  const nextOtherDrug = ranked.find((entry) => entry.drug !== best.drug);

  // One letter off one drug, and no other drug within two letters
  if (best.distance === 1 && (!nextOtherDrug || nextOtherDrug.distance > 2)) {
    return { kind: "known", name: best.spelling, mentalHealth: best.drug.mentalHealth };
  }

  // Clearly nearest: close for its length, and no other drug as close
  const closeEnough = best.distance <= Math.max(2, Math.floor(best.key.length * 0.4));
  const clearlyNearest = !nextOtherDrug || nextOtherDrug.distance > best.distance;
  if (closeEnough && clearlyNearest) return { kind: "did_you_mean", suggestion: best.spelling };
  return { kind: "unknown" };
}
