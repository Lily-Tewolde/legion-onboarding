// Patient text is data, not instructions (docs/evals.md, section 3). It only
// ever goes in the user turn, wrapped in a tag with an ID. Any tag-like text
// the patient typed that could close or fake that wrapper is removed first
export function wrapPatientMessage(id: string, text: string): string {
  const cleaned = text.replace(/<\/?\s*patient_message[^>]*>/gi, "");
  return `<patient_message id="${id}">${cleaned}</patient_message>`;
}
